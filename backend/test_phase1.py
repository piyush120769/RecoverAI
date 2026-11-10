import pytest
from starlette.testclient import TestClient
from app.main import app
from app.services.decision_engine import evaluate_recovery

client = TestClient(app)


class MockCustomer:
    def __init__(self, name="Test Customer", consent_status="approved"):
        self.name = name
        self.consent_status = consent_status


class MockPayment:
    def __init__(self, failure_reason="Insufficient Funds", status="failed"):
        self.failure_reason = failure_reason
        self.status = status


# ============================================================================
# 1. Root & Health Endpoint Tests
# ============================================================================
def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Running"
    assert "RecoverAI" in data["message"]


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"


# ============================================================================
# 2. Customer API Tests
# ============================================================================
def test_get_all_customers():
    response = client.get("/api/customers/")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 10
    assert len(data["customers"]) == 10
    
    first = data["customers"][0]
    assert "id" in first
    assert "name" in first
    assert "payments" in first
    assert len(first["payments"]) >= 1


def test_get_customer_by_id_valid():
    response = client.get("/api/customers/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["name"] == "Sarah Jenkins"
    assert data["company"] == "Acme Analytics"
    assert data["consent_status"] == "approved"
    assert len(data["payments"]) == 1
    assert data["payments"][0]["invoice_id"] == "INV-2026-8912"


def test_get_customer_by_id_invalid():
    response = client.get("/api/customers/9999")
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Customer not found"


# ============================================================================
# 3. Recovery Decision API Tests (Database Driven)
# ============================================================================
def test_recovery_decision_eligible_failed_payment():
    # Payment 1: Sarah Jenkins, Insufficient Funds, Failed, Approved
    response = client.get("/api/recovery/decision/1")
    assert response.status_code == 200
    data = response.json()
    assert data["customer_id"] == 1
    assert data["customer_name"] == "Sarah Jenkins"
    assert data["payment_id"] == 1
    assert data["amount"] == 14500.0
    assert data["currency"] == "INR"
    assert data["payment_status"] == "failed"
    assert data["consent_status"] == "approved"
    
    decision = data["decision"]
    assert decision["eligible_for_outreach"] is True
    assert decision["recommended_action"] == "offer_payment_link"
    assert decision["requires_customer_confirmation"] is True


def test_recovery_decision_opted_out_customer():
    # Payment 6: Thomas Wright, Card Expired, Failed, Opted Out
    response = client.get("/api/recovery/decision/6")
    assert response.status_code == 200
    data = response.json()
    assert data["customer_name"] == "Thomas Wright"
    assert data["consent_status"] == "opted_out"
    
    decision = data["decision"]
    assert decision["eligible_for_outreach"] is False
    assert decision["recommended_action"] == "suppress"
    assert "opted out" in decision["reason"].lower()


def test_recovery_decision_already_recovered_payment():
    # Payment 4: David Kim, Payment Timeout, Recovered, Approved
    response = client.get("/api/recovery/decision/4")
    assert response.status_code == 200
    data = response.json()
    assert data["customer_name"] == "David Kim"
    assert data["payment_status"] == "recovered"
    
    decision = data["decision"]
    assert decision["eligible_for_outreach"] is False
    assert decision["recommended_action"] == "no_action"
    assert "already been recovered" in decision["reason"].lower()


def test_recovery_decision_invalid_payment_id():
    response = client.get("/api/recovery/decision/9999")
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Payment not found"


# ============================================================================
# 4. Decision Engine Service Layer Unit Tests (Edge Cases & Policy Rules)
# ============================================================================
def test_decision_engine_payment_timeout():
    c = MockCustomer(consent_status="approved")
    p = MockPayment(failure_reason="Payment Timeout", status="failed")
    decision = evaluate_recovery(c, p)
    assert decision["eligible_for_outreach"] is True
    assert decision["recommended_action"] == "offer_retry"


def test_decision_engine_insufficient_funds():
    c = MockCustomer(consent_status="approved")
    p = MockPayment(failure_reason="Insufficient Funds", status="failed")
    decision = evaluate_recovery(c, p)
    assert decision["eligible_for_outreach"] is True
    assert decision["recommended_action"] == "offer_payment_link"


def test_decision_engine_card_expired():
    c = MockCustomer(consent_status="approved")
    p = MockPayment(failure_reason="Card Expired", status="failed")
    decision = evaluate_recovery(c, p)
    assert decision["eligible_for_outreach"] is True
    assert decision["recommended_action"] == "offer_payment_link"


def test_decision_engine_bank_declined():
    c = MockCustomer(consent_status="approved")
    p = MockPayment(failure_reason="Bank Declined", status="failed")
    decision = evaluate_recovery(c, p)
    assert decision["eligible_for_outreach"] is True
    assert decision["recommended_action"] == "offer_payment_link"


def test_decision_engine_mandate_inactive():
    c = MockCustomer(consent_status="approved")
    p = MockPayment(failure_reason="Mandate Inactive", status="failed")
    decision = evaluate_recovery(c, p)
    assert decision["eligible_for_outreach"] is True
    assert decision["recommended_action"] == "human_escalation"


def test_decision_engine_unknown_failure():
    c = MockCustomer(consent_status="approved")
    p = MockPayment(failure_reason="Unknown Network Error", status="failed")
    decision = evaluate_recovery(c, p)
    assert decision["eligible_for_outreach"] is True
    assert decision["recommended_action"] == "human_escalation"


def test_decision_engine_pending_consent():
    c = MockCustomer(consent_status="pending")
    p = MockPayment(failure_reason="Insufficient Funds", status="failed")
    decision = evaluate_recovery(c, p)
    assert decision["eligible_for_outreach"] is False
    assert decision["recommended_action"] == "require_consent"


def test_decision_engine_non_failed_payment_status():
    c = MockCustomer(consent_status="approved")
    p = MockPayment(failure_reason="None", status="processing")
    decision = evaluate_recovery(c, p)
    assert decision["eligible_for_outreach"] is False
    assert decision["recommended_action"] == "no_action"

