from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Customer, Payment
from app.schemas.customer import CustomerListResponse, CustomerSchema

router = APIRouter(
    prefix="/api/customers",
    tags=["Customers"]
)


# API 1: Get all customers
@router.get("/", response_model=CustomerListResponse)
def get_customers(db: Session = Depends(get_db)):
    customers = db.query(Customer).all()
    result = []

    for customer in customers:
        customer_payments = (
            db.query(Payment)
            .filter(Payment.customer_id == customer.id)
            .all()
        )

        payments = [
            {
                "id": payment.id,
                "amount": payment.amount,
                "currency": payment.currency or "INR",
                "failure_reason": payment.failure_reason,
                "status": payment.status,
                "invoice_id": payment.invoice_id
            }
            for payment in customer_payments
        ]

        result.append({
            "id": customer.id,
            "name": customer.name,
            "company": customer.company,
            "email": customer.email,
            "phone": customer.phone,
            "consent_status": customer.consent_status,
            "payments": payments
        })

    return {
        "total": len(result),
        "customers": result
    }


# API 2: Get a specific customer
@router.get("/{customer_id}", response_model=CustomerSchema)
def get_customer_details(
    customer_id: int,
    db: Session = Depends(get_db)
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if customer is None:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    payments = (
        db.query(Payment)
        .filter(Payment.customer_id == customer_id)
        .all()
    )

    return {
        "id": customer.id,
        "name": customer.name,
        "company": customer.company,
        "email": customer.email,
        "phone": customer.phone,
        "consent_status": customer.consent_status,
        "payments": [
            {
                "id": payment.id,
                "amount": payment.amount,
                "currency": payment.currency or "INR",
                "failure_reason": payment.failure_reason,
                "status": payment.status,
                "invoice_id": payment.invoice_id
            }
            for payment in payments
        ]
    }
