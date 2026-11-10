"""
Vapi Voice Agent Routes
Endpoints for connection verification, status diagnostics, and webhook event handling.
"""

from fastapi import APIRouter, Request, HTTPException, Header, status
from typing import Optional, Dict, Any

from app.config import settings
from app.services.vapi_service import vapi_service

router = APIRouter(
    prefix="/api/vapi",
    tags=["Vapi Voice Integration"]
)


@router.get("/verify")
async def verify_vapi_connection() -> Dict[str, Any]:
    """
    Safe backend-only connection verification endpoint.
    Performs live authentication ping to Vapi API without initiating any outbound calls.
    Never exposes API keys, assistant secrets, or private credentials.
    """
    # 1. Live authentication check against Vapi
    auth_check = await vapi_service.verify_connection()

    # 2. Assistant ID evaluation
    assistant_status = {
        "configured": settings.has_assistant_id,
        "assistant_id_masked": settings.masked_assistant_id,
        "mode": "preconfigured_id" if settings.has_assistant_id else "dynamic_synthesis",
        "description": "Pre-created Vapi Assistant" if settings.has_assistant_id else "RecoverAI dynamically synthesizes Aria recovery persona"
    }

    # 3. Phone Number ID evaluation (for PSTN outbound phone calls)
    phone_status = {
        "configured": settings.has_phone_number_id,
        "phone_number_id_masked": settings.masked_phone_number_id,
        "description": "Registered Twilio/Vonage phone number ID in Vapi" if settings.has_phone_number_id else "Unconfigured (Required for live outbound cellular dialing)"
    }

    # 4. Webhook and signature security evaluation
    webhook_status = {
        "endpoint": "/api/vapi/webhook",
        "signature_verification": "enforced" if settings.has_webhook_secret else "ready_unrestricted",
        "secret_configured": settings.has_webhook_secret
    }

    is_authenticated = auth_check.get("authenticated", False)
    web_call_ready = auth_check.get("web_call_ready", False)
    outbound_pstn_ready = is_authenticated and settings.has_phone_number_id

    # 5. Clear operational summary
    if is_authenticated and outbound_pstn_ready:
        operational_summary = "Fully Operational: Live telephony and WebRTC voice calls authorized."
    elif is_authenticated:
        operational_summary = "Authenticated (Web Call Ready): Live WebRTC browser voice calls authorized. Outbound cellular phone calls require a Vapi Phone Number ID."
    else:
        operational_summary = "Unauthenticated: Vapi API key validation failed or is missing."

    return {
        "status": "connected" if is_authenticated else "authentication_failed",
        "authenticated": is_authenticated,
        "auth_type": auth_check.get("auth_type", "unknown"),
        "key_configured": settings.has_vapi_key,
        "key_masked": settings.masked_vapi_key,
        "base_url": settings.VAPI_BASE_URL,
        "subscription_active": auth_check.get("subscription_active", False),
        "concurrency_limit": auth_check.get("concurrency_limit", 0),
        "remaining_concurrent_calls": auth_check.get("remaining_concurrent_calls", 0),
        "assistant": assistant_status,
        "phone_number": phone_status,
        "webhook": webhook_status,
        "capabilities": {
            "browser_web_call_ready": web_call_ready,
            "outbound_pstn_phone_ready": outbound_pstn_ready,
            "simulated_voice_fallback": True
        },
        "operational_summary": operational_summary
    }


@router.get("/status")
def get_vapi_status() -> Dict[str, Any]:
    """
    Lightweight health and status diagnostic summary.
    """
    return {
        "provider": "Vapi AI Voice",
        "key_configured": settings.has_vapi_key,
        "key_preview": settings.masked_vapi_key,
        "assistant_id_configured": settings.has_assistant_id,
        "phone_number_configured": settings.has_phone_number_id,
        "webhook_secret_configured": settings.has_webhook_secret,
        "voice_agent_persona": "Aria (Professional & Empathetic)",
        "compliance_policies": [
            "Transparent AI disclosure",
            "PCI-DSS protected (no CVV/card collection)",
            "5-choice intent classification (Retry, Link, Callback, Opt-Out, Human)",
            "Automated TCPA / DNC suppression"
        ]
    }


@router.post("/webhook")
async def handle_vapi_webhook(
    request: Request,
    x_vapi_signature: Optional[str] = Header(None)
) -> Dict[str, Any]:
    """
    Receive and process asynchronous webhook updates from Vapi.
    Validates HMAC signature if VAPI_WEBHOOK_SECRET is configured.
    """
    raw_body = await request.body()

    # Validate HMAC signature if configured
    if not vapi_service.verify_webhook_signature(raw_body, x_vapi_signature):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook signature"
        )

    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Malformed JSON payload"
        )

    # Process and sanitize webhook event
    event_type = payload.get("message", {}).get("type") or payload.get("type", "unknown")
    parsed_data = vapi_service.parse_webhook_payload(payload)

    return {
        "status": "received",
        "event_type": event_type,
        "provider_call_id": parsed_data.get("provider_call_id"),
        "recognized_outcome": parsed_data.get("outcome"),
        "confidence": parsed_data.get("confidence")
    }

