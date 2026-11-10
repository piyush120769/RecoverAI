from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Payment, PaymentSimulation, AuditLog
from app.schemas.payments import PaymentRetryRequest, PaymentSimulationResponse
from app.services.payment_simulator import simulate_payment_retry, PaymentSimulatorError

router = APIRouter(
    prefix="/api/payments",
    tags=["Payment Simulator"]
)


@router.post("/{payment_id}/retry", response_model=PaymentSimulationResponse)
def retry_failed_payment(
    payment_id: int,
    payload: PaymentRetryRequest,
    db: Session = Depends(get_db)
):
    """
    Execute a safe, deterministic simulated payment retry with idempotency key protection.
    Fintech Rule: Only updates payment status to 'recovered' upon verified simulator success.
    """
    try:
        result = simulate_payment_retry(
            db=db,
            payment_id=payment_id,
            idempotency_key=payload.idempotency_key,
            force_outcome=payload.force_outcome
        )
        return result
    except PaymentSimulatorError as pe:
        raise HTTPException(
            status_code=pe.status_code,
            detail=pe.message
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal simulator error: {str(e)}"
        )


@router.get("/{payment_id}/simulations")
def get_payment_simulations(
    payment_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve audit trail and history of simulated retry attempts for a payment.
    """
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    sims = (
        db.query(PaymentSimulation)
        .filter(PaymentSimulation.payment_id == payment_id)
        .order_by(PaymentSimulation.id.desc())
        .all()
    )

    audits = (
        db.query(AuditLog)
        .filter(AuditLog.payment_id == payment_id)
        .order_by(AuditLog.id.desc())
        .all()
    )

    return {
        "payment_id": payment.id,
        "customer_id": payment.customer_id,
        "invoice_id": payment.invoice_id,
        "amount": payment.amount,
        "current_status": payment.status,
        "simulations": [
            {
                "id": s.id,
                "idempotency_key": s.idempotency_key,
                "status": s.status,
                "transaction_reference": s.transaction_reference,
                "failure_reason": s.failure_reason,
                "is_simulated": bool(s.is_simulated),
                "timestamp": s.created_at
            }
            for s in sims
        ],
        "audit_trail": [
            {
                "id": a.id,
                "event_type": a.event_type,
                "details": a.details,
                "timestamp": a.timestamp
            }
            for a in audits
        ]
    }

