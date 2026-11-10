import hmac
import hashlib
import json
import pytest
from starlette.testclient import TestClient

from app.main import app
from app.config import settings
from app.services.vapi_service import vapi_service

client = TestClient(app)


# ============================================================================
# 1. Settings & Credential Masking Security Tests
# ============================================================================
def test_settings_loading_and_safe_masking():
    # Key must be present
    assert settings.has_vapi_key is True
    
    # Raw key must NOT be leaked in masked representation
    masked = settings.masked_vapi_key
    assert "..." in masked
    assert settings.VAPI_API_KEY != masked
    assert masked.startswith("e6dc8fd0")
    assert masked.endswith("4807")

    # Unconfigured variables must return safe string descriptions
    assert settings.has_assistant_id is False
    assert settings.masked_assistant_id == "not_configured"
    assert settings.has_phone_number_id is False
    assert settings.masked_phone_number_id == "not_configured"


# ============================================================================
# 2. Vapi Connection Verification Endpoint Tests
# ============================================================================
def test_vapi_verify_endpoint_structure():
    response = client.get("/api/vapi/verify")
    assert response.status_code == 200
    data = response.json()

    # Must confirm live authentication with Vapi
    assert data["authenticated"] is True
    assert data["status"] == "connected"
    assert data["auth_type"] == "public_key"
    assert data["subscription_active"] is True
    assert data["concurrency_limit"] == 4

    # Security check: Never expose raw secret
    assert data["key_masked"] == settings.masked_vapi_key
    assert settings.VAPI_API_KEY not in json.dumps(data)

    # Capabilities check
    capabilities = data["capabilities"]
    assert capabilities["browser_web_call_ready"] is True
    assert capabilities["outbound_pstn_phone_ready"] is False
    assert capabilities["simulated_voice_fallback"] is True

    # Assistant & Phone number check
    assert data["assistant"]["configured"] is False
    assert data["assistant"]["mode"] == "dynamic_synthesis"
    assert data["phone_number"]["configured"] is False


def test_vapi_status_endpoint():
    response = client.get("/api/vapi/status")
    assert response.status_code == 200
    data = response.json()
    assert data["provider"] == "Vapi AI Voice"
    assert data["key_configured"] is True
    assert "compliance_policies" in data
    assert len(data["compliance_policies"]) == 4
    # Must not contain raw secret
    assert settings.VAPI_API_KEY not in json.dumps(data)


# ============================================================================
# 3. Assistant Prompt & Compliance Rules Tests
# ============================================================================
def test_assistant_prompt_synthesis_compliance():
    cfg = vapi_service.get_assistant_configuration(
        customer_name="Sarah Jenkins",
        company="Acme Analytics",
        amount=14500.0,
        failure_reason="Insufficient Funds",
        invoice_id="INV-2026-8912"
    )

    # Assistant configuration integrity
    assert "RecoverAI-Agent-INV-2026-8912" in cfg["name"]
    assert "firstMessage" in cfg
    assert "₹14,500.00" in cfg["firstMessage"]
    assert "Aria" in cfg["firstMessage"]

    # Compliance rules in prompt
    system_prompt = cfg["model"]["messages"][0]["content"]
    assert "AI payment recovery assistant" in system_prompt
    assert "NEVER ask for or collect credit card numbers, CVV" in system_prompt
    assert "Offer these 5 choices only" in system_prompt


# ============================================================================
# 4. Webhook Ingestion & Signature Verification Tests
# ============================================================================
def test_webhook_ingestion_valid_payload():
    payload = {
        "message": {
            "type": "end-of-call-report",
            "transcript": "Hello Aria, funds are available now. Please retry the charge right away.",
            "call": {
                "id": "call_vapi_test_01",
                "duration": 48
            }
        }
    }
    response = client.post("/api/vapi/webhook", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "received"
    assert data["event_type"] == "end-of-call-report"
    assert data["recognized_outcome"] == "Retry requested"
    assert data["confidence"] == 96.0


def test_webhook_signature_verification_enforcement(monkeypatch):
    # Temporarily set a webhook secret to test signature verification
    secret = "secret_webhook_test_key_12345"
    monkeypatch.setattr(settings, "VAPI_WEBHOOK_SECRET", secret)

    payload = {"message": {"type": "status-update"}}
    raw_body = json.dumps(payload).encode("utf-8")

    # 1. Missing signature should return 401
    r_missing = client.post(
        "/api/vapi/webhook",
        content=raw_body,
        headers={"Content-Type": "application/json"}
    )
    assert r_missing.status_code == 401

    # 2. Invalid signature should return 401
    r_invalid = client.post(
        "/api/vapi/webhook",
        content=raw_body,
        headers={
            "Content-Type": "application/json",
            "x-vapi-signature": "invalid_signature_hex"
        }
    )
    assert r_invalid.status_code == 401

    # 3. Valid HMAC-SHA256 signature should return 200
    valid_signature = hmac.new(
        secret.encode("utf-8"),
        raw_body,
        hashlib.sha256
    ).hexdigest()

    r_valid = client.post(
        "/api/vapi/webhook",
        content=raw_body,
        headers={
            "Content-Type": "application/json",
            "x-vapi-signature": valid_signature
        }
    )
    assert r_valid.status_code == 200
    assert r_valid.json()["status"] == "received"

