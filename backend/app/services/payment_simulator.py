import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from app.models import Customer, Payment, PaymentSimulation, AuditLog


class PaymentSimulatorError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def simulate_payment_retry(
    db: Session,
    payment_id: int,
    idempotency_key: str,
    force_outcome: Optional[str] = None
) -> Dict[str, Any]:
    """
    Execute a safe, deterministic simulated payment retry.
    
    Strict Fintech & Razorpay Assignment Rules:
    1. Idempotency protection: Rejects duplicate processing for the same idempotency key.
    2. Zero unauthorized changes: Only updates payment.status to 'recovered' upon verified simulator success.
    3. Respects customer consent: Blocks retries for opted-out customers.
    4. Guards already recovered payments: Prevents double-charging/double-recovery.
    5. Comprehensive audit trail: Records all attempts in PaymentSimulation and AuditLog.
    """
    now_iso = datetime.now().isoformat()

    # 1. Idempotency Check: Have we already processed this key?
    existing_sim = (
        db.query(PaymentSimulation)
        .filter(PaymentSimulation.idempotency_key == idempotency_key)
        .first()
    )
    if existing_sim:
        payment = db.query(Payment).filter(Payment.id == existing_sim.payment_id).first()
        return {
            "success": existing_sim.status == "success",
            "status": existing_sim.status,
            "payment_id": existing_sim.payment_id,
            "customer_id": existing_sim.customer_id,
            "amount": existing_sim.attempted_amount,
            "currency": payment.currency if payment else "INR",
            "transaction_reference": existing_sim.transaction_reference,
            "idempotency_key": existing_sim.idempotency_key,
            "is_simulated": True,
            "is_duplicate": True,
            "payment_status": payment.status if payment else "unknown",
            "message": f"Idempotent response: Retry with key '{idempotency_key}' was previously processed.",
            "failure_reason": existing_sim.failure_reason,
            "timestamp": existing_sim.created_at
        }

    # 2. Fetch payment record
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise PaymentSimulatorError(f"Payment with ID {payment_id} not found.", status_code=404)

    # 3. Fetch associated customer record
    customer = db.query(Customer).filter(Customer.id == payment.customer_id).first()
    if not customer:
        raise PaymentSimulatorError(f"Customer associated with payment {payment_id} not found.", status_code=404)

    # 4. Consent and Opt-Out Enforcement
    customer_consent = (customer.consent_status or "").strip().lower()
    if customer_consent == "opted_out":
        raise PaymentSimulatorError(
            "Payment retry rejected: Customer has opted out of recovery actions.",
            status_code=403
        )

    # 5. Recovery State Validation
    current_status = (payment.status or "").strip().lower()
    if current_status == "recovered":
        raise PaymentSimulatorError(
            "Payment retry rejected: Payment has already been recovered.",
            status_code=400
        )

    if current_status != "failed":
        raise PaymentSimulatorError(
            f"Payment retry rejected: Payment status is '{payment.status}', not 'failed'.",
            status_code=400
        )

    # 6. Deterministic Simulation Evaluation
    # If caller provided explicit override ('success' or 'failure')
    failure_reason_str = (payment.failure_reason or "").strip().lower()
    
    if force_outcome:
        override = force_outcome.strip().lower()
        if override == "success":
            outcome = "success"
            sim_failure_reason = None
        else:
            outcome = "failed"
            sim_failure_reason = "Simulated bank decline: forced test failure"
    else:
        # Realistic deterministic business rules:
        # - Payment Timeout: Network glitch resolved -> Success
        # - Insufficient Funds: Customer authorized retry -> Success
        # - Card Expired: Cannot be resolved by simple retry -> Failed
        # - Mandate Inactive: Needs new mandate/link -> Failed
        # - Bank Declined: Generic bank decline -> Failed
        if failure_reason_str == "payment timeout":
            outcome = "success"
            sim_failure_reason = None
        elif failure_reason_str == "insufficient funds":
            outcome = "success"
            sim_failure_reason = None
        elif failure_reason_str in ["card expired", "mandate inactive", "bank declined"]:
            outcome = "failed"
            sim_failure_reason = f"Simulated retry rejected: '{payment.failure_reason}' requires payment link or card update."
        else:
            outcome = "failed"
            sim_failure_reason = f"Simulated retry unresolved: {payment.failure_reason}"

    txn_ref = f"SIM-TXN-{uuid.uuid4().hex[:10].upper()}"

    # 7. Update trusted payment state ONLY if verified success
    if outcome == "success":
        payment.status = "recovered"
        sim_message = f"Payment simulator verified: ₹{payment.amount:,.2f} settled successfully via simulated retry."
    else:
        # Keep status as 'failed'
        sim_message = f"Payment simulator retry failed: {sim_failure_reason}"

    # 8. Record simulation in database
    sim_record = PaymentSimulation(
        payment_id=payment.id,
        customer_id=customer.id,
        idempotency_key=idempotency_key,
        attempted_amount=payment.amount,
        status=outcome,
        failure_reason=sim_failure_reason,
        transaction_reference=txn_ref,
        is_simulated=1,
        created_at=now_iso
    )
    db.add(sim_record)

    # 9. Record in Audit Log
    audit = AuditLog(
        customer_id=customer.id,
        payment_id=payment.id,
        event_type="payment_retry_success" if outcome == "success" else "payment_retry_failed",
        details=f"Simulator retry [{outcome.upper()}]: Txn {txn_ref}, Amount ₹{payment.amount}, Reason: {sim_failure_reason or 'Settled'}",
        timestamp=now_iso
    )
    db.add(audit)

    db.commit()
    db.refresh(payment)

    return {
        "success": outcome == "success",
        "status": outcome,
        "payment_id": payment.id,
        "customer_id": customer.id,
        "amount": payment.amount,
        "currency": payment.currency or "INR",
        "transaction_reference": txn_ref,
        "idempotency_key": idempotency_key,
        "is_simulated": True,
        "is_duplicate": False,
        "payment_status": payment.status,
        "message": sim_message,
        "failure_reason": sim_failure_reason,
        "timestamp": now_iso
    }

