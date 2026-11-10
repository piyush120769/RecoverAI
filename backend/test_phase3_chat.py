import uuid
import pytest
from starlette.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import Customer, Payment, ChatMessage, PaymentSimulation, AuditLog

client = TestClient(app)


# Restore baseline database state after each test so all tests remain isolated and idempotent
@pytest.fixture(autouse=True)
def preserve_baseline_db_state():
    yield
    db = SessionLocal()
    try:
        # Restore customer consent baselines
        db.query(Customer).filter(Customer.id != 6).update({"consent_status": "approved"})
        db.query(Customer).filter(Customer.id == 6).update({"consent_status": "opted_out"})

        # Restore baseline payment statuses
        db.query(Payment).filter(Payment.id.in_([1, 2, 3, 5, 6, 8, 10])).update({"status": "failed"})
        db.query(Payment).filter(Payment.id.in_([4, 7, 9])).update({"status": "recovered"})

        # Clean test records created during test execution
        db.query(PaymentSimulation).delete()
        db.query(ChatMessage).delete()
        db.query(AuditLog).delete()

        db.commit()
    finally:
        db.close()


# ============================================================================
# 1. Chat Session Initialization & Transparent Introduction
# ============================================================================
def test_chat_initialization_transparent_intro():
    """Verify AI transparently introduces itself with invoice details and 5 actions."""
    response = client.get("/api/chat/1")
    assert response.status_code == 200
    data = response.json()

    assert data["customer_id"] == 1
    assert data["customer_name"] == "Sarah Jenkins"
    assert data["invoice_id"] == "INV-2026-8912"
    assert data["amount"] == 14500.0
    assert len(data["messages"]) >= 1

    first_msg = data["messages"][0]
    assert first_msg["sender"] == "ai"
    # Transparent AI intro checks
    assert "automated AI recovery assistant" in first_msg["message"]
    assert "INV-2026-8912" in first_msg["message"]
    assert "₹14,500.00" in first_msg["message"]
    assert "Insufficient Funds" in first_msg["message"]

    # Must suggest the 5 core actions
    assert "Retry Payment" in data["suggested_actions"]
    assert "Request Payment Link" in data["suggested_actions"]
    assert "Schedule Callback" in data["suggested_actions"]
    assert "Opt Out" in data["suggested_actions"]
    assert "Talk to Human" in data["suggested_actions"]


def test_chat_identifier_resolution():
    """Verify string customer identifiers like 'CUST-1001' resolve correctly."""
    response = client.get("/api/chat/CUST-1001")
    assert response.status_code == 200
    data = response.json()
    assert data["customer_id"] == 1
    assert data["customer_name"] == "Sarah Jenkins"


def test_chat_invalid_customer():
    """Verify 404 for nonexistent customer."""
    response = client.get("/api/chat/99999")
    assert response.status_code == 404


# ============================================================================
# 2. Handling All 5 Customer Actions & Intents
# ============================================================================
def test_action_1_retry_payment_success():
    """Action 1: Customer authorizes payment retry -> Verified simulator success."""
    key = f"key-retry-{uuid.uuid4().hex}"
    payload = {
        "message": "Please retry the payment now",
        "intent": "retry_payment",
        "idempotency_key": key,
        "force_outcome": "success"
    }
    response = client.post("/api/chat/1/message", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["intent"] == "retry_payment"
    assert data["action_taken"] == "payment_retried_success"
    assert data["payment_status"] == "recovered"
    assert data["transaction_reference"] is not None
    assert "verified and settled successfully" in data["reply"]


def test_action_2_request_payment_link():
    """Action 2: Customer requests a secure payment link."""
    payload = {
        "message": "Send me a payment link please",
        "intent": "request_link"
    }
    response = client.post("/api/chat/2/message", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["intent"] == "request_link"
    assert data["action_taken"] == "link_dispatched"
    assert data["payment_link"] is not None
    assert "pay.recoverai.io" in data["payment_link"]
    assert "INV-2026-8920" in data["reply"]


def test_action_3_schedule_callback():
    """Action 3: Customer requests a scheduled callback."""
    payload = {
        "message": "I'm busy right now, please schedule a callback tomorrow",
        "intent": "schedule_callback"
    }
    response = client.post("/api/chat/3/message", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["intent"] == "schedule_callback"
    assert data["action_taken"] == "callback_scheduled"
    assert "callback has been scheduled" in data["reply"].lower()


def test_action_4_opt_out_compliance():
    """Action 4: Customer opts out -> Enforces Do Not Contact and suppresses outreach."""
    # Customer 5 opts out
    payload = {
        "message": "Please opt me out and stop messaging me",
        "intent": "opt_out"
    }
    response = client.post("/api/chat/5/message", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["intent"] == "opt_out"
    assert data["action_taken"] == "opted_out"
    assert data["consent_status"] == "opted_out"
    assert "Do Not Contact" in data["reply"]

    # Verify subsequent messages recognize opt-out suppression
    followup = client.post("/api/chat/5/message", json={"message": "Can you retry now?"})
    assert followup.status_code == 200
    followup_data = followup.json()
    assert followup_data["action_taken"] == "suppressed_opted_out"
    assert "Opted Out" in followup_data["reply"]


def test_action_5_talk_to_human():
    """Action 5: Customer requests escalation to a human representative."""
    payload = {
        "message": "I need to talk to a human agent right now",
        "intent": "talk_to_human"
    }
    response = client.post("/api/chat/7/message", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["intent"] == "talk_to_human"
    assert data["action_taken"] == "escalated_to_human"
    assert "senior billing specialist" in data["reply"].lower()


# ============================================================================
# 3. Security: Zero Credit Card / CVV / OTP Storage
# ============================================================================
def test_security_credit_card_and_cvv_rejection():
    """Chat assistant must reject credit card numbers and CVV with security warning."""
    payload = {
        "message": "My card number is 4111 2222 3333 4444 and CVV is 123",
    }
    response = client.post("/api/chat/8/message", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["intent"] == "security_warning"
    assert data["action_taken"] == "sensitive_data_blocked"
    assert "Security Notice" in data["reply"]
    assert "PCI-DSS" in data["reply"]


# ============================================================================
# 4. Payment Simulator & Idempotency Verification
# ============================================================================
def test_payment_simulator_endpoint_success():
    """Verify POST /api/payments/{id}/retry endpoint works with simulator."""
    key = f"key-sim-{uuid.uuid4().hex}"
    response = client.post("/api/payments/8/retry", json={
        "idempotency_key": key,
        "force_outcome": "success"
    })
    assert response.status_code == 200
    data = response.json()

    assert data["success"] is True
    assert data["status"] == "success"
    assert data["payment_status"] == "recovered"
    assert data["is_simulated"] is True
    assert data["is_duplicate"] is False
    assert data["transaction_reference"].startswith("SIM-TXN-")


def test_payment_simulator_idempotency_protection():
    """Resending same idempotency key must return cached duplicate without double processing."""
    key = f"key-dup-{uuid.uuid4().hex}"

    # First attempt
    res1 = client.post("/api/payments/10/retry", json={
        "idempotency_key": key,
        "force_outcome": "success"
    })
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["is_duplicate"] is False
    txn1 = data1["transaction_reference"]

    # Second identical attempt
    res2 = client.post("/api/payments/10/retry", json={
        "idempotency_key": key,
        "force_outcome": "success"
    })
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["is_duplicate"] is True
    assert data2["transaction_reference"] == txn1
    assert "Idempotent response" in data2["message"]


def test_payment_simulator_rejects_opted_out_customer():
    """Customer 6 is opted out in recoverai.db; retries must be rejected."""
    key = f"key-optout-{uuid.uuid4().hex}"
    response = client.post("/api/payments/6/retry", json={
        "idempotency_key": key
    })
    assert response.status_code == 403
    assert "opted out" in response.json()["detail"].lower()


def test_payment_simulator_rejects_already_recovered():
    """Payment 4 is already 'recovered' in recoverai.db; retries must be rejected."""
    key = f"key-recovered-{uuid.uuid4().hex}"
    response = client.post("/api/payments/4/retry", json={
        "idempotency_key": key
    })
    assert response.status_code == 400
    assert "already been recovered" in response.json()["detail"].lower()


# ============================================================================
# 5. Audit Trail & Persistence Verification
# ============================================================================
def test_simulations_and_audit_trail_endpoint():
    """Verify simulation history and audit trail can be queried for a payment."""
    key = f"key-trail-{uuid.uuid4().hex}"
    client.post("/api/payments/8/retry", json={
        "idempotency_key": key,
        "force_outcome": "success"
    })

    response = client.get("/api/payments/8/simulations")
    assert response.status_code == 200
    data = response.json()

    assert data["payment_id"] == 8
    assert "simulations" in data
    assert "audit_trail" in data
    assert len(data["simulations"]) >= 1


def test_chat_persistence_across_requests():
    """Verify customer and AI messages persist in SQLite across multiple requests."""
    client.post("/api/chat/3/message", json={"message": "What is the invoice amount?"})
    client.post("/api/chat/3/message", json={"message": "Can you send link?", "intent": "request_link"})

    history_res = client.get("/api/chat/3")
    assert history_res.status_code == 200
    history_data = history_res.json()

    messages = history_data["messages"]
    assert len(messages) >= 3  # intro + customer msgs + ai replies
    assert any("What is the invoice amount?" in m["message"] for m in messages)
    assert any("pay.recoverai.io" in m["message"] for m in messages)
