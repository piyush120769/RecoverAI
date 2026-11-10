
from app.database import SessionLocal
from app.models import Customer, Payment
from app.services.decision_engine import evaluate_recovery


db = SessionLocal()

try:
    customers = db.query(Customer).all()

    print("\n===== RECOVERAI DECISION ENGINE =====\n")

    for customer in customers:

        payments = (
            db.query(Payment)
            .filter(Payment.customer_id == customer.id)
            .all()
        )

        for payment in payments:

            decision = evaluate_recovery(customer, payment)

            print("Customer:", customer.name)
            print("Failure:", payment.failure_reason)
            print("Payment Status:", payment.status)
            print("Consent:", customer.consent_status)
            print("Eligible:", decision["eligible_for_outreach"])
            print("Action:", decision["recommended_action"])
            print("Reason:", decision["reason"])
            print("-" * 45)

finally:
    db.close()
