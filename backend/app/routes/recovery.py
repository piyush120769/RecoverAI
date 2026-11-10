from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Customer, Payment
from app.services.decision_engine import evaluate_recovery
from app.schemas.recovery import RecoveryDecisionResponse

router = APIRouter(
    prefix="/api/recovery",
    tags=["Recovery"]
)


@router.get("/decision/{payment_id}", response_model=RecoveryDecisionResponse)
def get_recovery_decision(
    payment_id: int,
    db: Session = Depends(get_db)
):
    # Find payment
    payment = (
        db.query(Payment)
        .filter(Payment.id == payment_id)
        .first()
    )

    if payment is None:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    # Find associated customer
    customer = (
        db.query(Customer)
        .filter(Customer.id == payment.customer_id)
        .first()
    )

    if customer is None:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    # Evaluate recovery decision using service layer logic
    decision = evaluate_recovery(customer, payment)

    return {
        "customer_id": customer.id,
        "customer_name": customer.name,
        "payment_id": payment.id,
        "amount": payment.amount,
        "currency": payment.currency or "INR",
        "failure_reason": payment.failure_reason,
        "payment_status": payment.status,
        "consent_status": customer.consent_status,
        "decision": decision
    }
