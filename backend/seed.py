
from app.database import SessionLocal
from app.models import Customer, Payment


customers_data = [
    {
        "name": "Sarah Jenkins",
        "company": "Acme Analytics",
        "email": "sarah@acme.example",
        "phone": None,
        "consent_status": "approved",
        "amount": 14500,
        "failure_reason": "Insufficient Funds",
        "status": "failed",
        "invoice_id": "INV-2026-8912"
    },
    {
        "name": "Marcus Chen",
        "company": "CloudVanguard Inc.",
        "email": "marcus@cloudvanguard.example",
        "phone": None,
        "consent_status": "approved",
        "amount": 38900,
        "failure_reason": "Mandate Inactive",
        "status": "failed",
        "invoice_id": "INV-2026-8920"
    },
    {
        "name": "Elena Rostova",
        "company": "Hyperion Dynamics",
        "email": "elena@hyperion.example",
        "phone": None,
        "consent_status": "approved",
        "amount": 8200,
        "failure_reason": "Bank Declined",
        "status": "failed",
        "invoice_id": "INV-2026-8933"
    },
    {
        "name": "David Kim",
        "company": "Nexus Health Systems",
        "email": "david@nexus.example",
        "phone": None,
        "consent_status": "approved",
        "amount": 21500,
        "failure_reason": "Payment Timeout",
        "status": "recovered",
        "invoice_id": "INV-2026-8890"
    },
    {
        "name": "Priya Patel",
        "company": "FinEdge Systems",
        "email": "priya@finedge.example",
        "phone": None,
        "consent_status": "approved",
        "amount": 42000,
        "failure_reason": "Insufficient Funds",
        "status": "failed",
        "invoice_id": "INV-2026-8919"
    },
    {
        "name": "Thomas Wright",
        "company": "BlueRock Media",
        "email": "thomas@bluerock.example",
        "phone": None,
        "consent_status": "opted_out",
        "amount": 6500,
        "failure_reason": "Card Expired",
        "status": "failed",
        "invoice_id": "INV-2026-8898"
    },
    {
        "name": "Amanda Vance",
        "company": "Solace AI Labs",
        "email": "amanda@solace.example",
        "phone": None,
        "consent_status": "approved",
        "amount": 51000,
        "failure_reason": "Bank Declined",
        "status": "recovered",
        "invoice_id": "INV-2026-8871"
    },
    {
        "name": "Julian Thorne",
        "company": "Stratum Logistics",
        "email": "julian@stratum.example",
        "phone": None,
        "consent_status": "approved",
        "amount": 19800,
        "failure_reason": "Mandate Inactive",
        "status": "failed",
        "invoice_id": "INV-2026-8941"
    },
    {
        "name": "Rachel Green",
        "company": "Vertex Design Studio",
        "email": "rachel@vertex.example",
        "phone": None,
        "consent_status": "approved",
        "amount": 9400,
        "failure_reason": "Payment Timeout",
        "status": "recovered",
        "invoice_id": "INV-2026-8894"
    },
    {
        "name": "Carlos Mendez",
        "company": "Pulse Growth Media",
        "email": "carlos@pulse.example",
        "phone": None,
        "consent_status": "approved",
        "amount": 32000,
        "failure_reason": "Insufficient Funds",
        "status": "failed",
        "invoice_id": "INV-2026-8955"
    }
]


db = SessionLocal()

try:
    # Avoid inserting duplicate demo records
    if db.query(Customer).first():
        print("Database already contains customer records.")
    else:
        for item in customers_data:

            customer = Customer(
                name=item["name"],
                company=item["company"],
                email=item["email"],
                phone=item["phone"],
                consent_status=item["consent_status"]
            )

            db.add(customer)
            db.flush()

            payment = Payment(
                customer_id=customer.id,
                amount=item["amount"],
                currency="INR",
                failure_reason=item["failure_reason"],
                status=item["status"],
                invoice_id=item["invoice_id"]
            )

            db.add(payment)

        db.commit()
        print("Successfully inserted 10 demo customers!")

    print("Total customers:", db.query(Customer).count())
    print("Total payments:", db.query(Payment).count())

finally:
    db.close()
