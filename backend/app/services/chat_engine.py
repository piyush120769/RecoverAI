import re
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session

from app.models import Customer, Payment, ChatMessage, AuditLog
from app.services.decision_engine import evaluate_recovery
from app.services.payment_simulator import simulate_payment_retry, PaymentSimulatorError

SUGGESTED_ACTIONS = [
    "Retry Payment",
    "Request Payment Link",
    "Schedule Callback",
    "Opt Out",
    "Talk to Human"
]


def resolve_customer_and_payment(
    db: Session,
    customer_identifier: Any
) -> Tuple[Optional[Customer], Optional[Payment]]:
    """
    Resolve customer and latest payment from numeric ID, 'CUST-XXXX' string, or invoice.
    """
    customer = None
    if isinstance(customer_identifier, int):
        customer = db.query(Customer).filter(Customer.id == customer_identifier).first()
    else:
        ident_str = str(customer_identifier).strip()
        if ident_str.isdigit():
            customer = db.query(Customer).filter(Customer.id == int(ident_str)).first()
        elif ident_str.upper().startswith("CUST-"):
            num_part = ident_str.split("-")[-1]
            if num_part.isdigit():
                val = int(num_part)
                # Try direct id
                customer = db.query(Customer).filter(Customer.id == val).first()
                if not customer and val > 1000:
                    # Offset for mock data CUST-1001 -> 1
                    customer = db.query(Customer).filter(Customer.id == (val - 1000)).first()

    if not customer:
        return None, None

    # Fetch latest or active payment for customer
    payment = (
        db.query(Payment)
        .filter(Payment.customer_id == customer.id)
        .order_by(Payment.id.desc())
        .first()
    )

    return customer, payment


def build_transparent_intro(customer: Customer, payment: Optional[Payment]) -> str:
    """
    Generate transparent AI introduction stating AI identity, failed invoice, amount, and reason.
    """
    if payment:
        amount_fmt = f"₹{payment.amount:,.2f}"
        reason = payment.failure_reason or "Unknown bank issue"
        invoice = payment.invoice_id or f"INV-PAY-{payment.id}"
        
        if payment.status == "recovered":
            status_note = "Our records indicate this payment has already been successfully recovered and settled."
        else:
            status_note = f"Our automated system detected that your scheduled autopay of {amount_fmt} encountered a payment issue: '{reason}'."

        return (
            f"Hello {customer.name}, I am RecoverAI's automated AI recovery assistant on behalf of {customer.company or 'your service provider'}. "
            f"I am reaching out regarding invoice {invoice}.\n\n"
            f"{status_note}\n\n"
            "I can assist you with the following secure actions:\n"
            "1. 🔄 Retry Payment\n"
            "2. 🔗 Request Payment Link\n"
            "3. 📞 Schedule Callback\n"
            "4. 🚫 Opt Out (Do Not Contact)\n"
            "5. 👤 Talk to Human\n\n"
            "How would you like to proceed?"
        )
    else:
        return (
            f"Hello {customer.name}, I am RecoverAI's automated AI recovery assistant. "
            "How can I assist you with your account and billing today?"
        )


def detect_sensitive_data(message: str) -> bool:
    """
    Detect if user input contains credit card numbers (13-19 digits) or CVV patterns.
    """
    # Check for 13 to 19 digit strings (with or without spaces/dashes)
    digits_only = re.sub(r"[\s-]", "", message)
    if re.search(r"\b\d{13,19}\b", digits_only):
        return True
    # Check for explicit CVV mention with numbers
    if re.search(r"\b(cvv|cvc|security code|otp)\b.*?(\b\d{3,6}\b)", message, re.IGNORECASE):
        return True
    return False


def classify_customer_intent(message: str, explicit_intent: Optional[str] = None) -> Tuple[str, float]:
    """
    Classify customer intent from text and optional explicit intent payload.
    Returns (intent_name, confidence).
    """
    if explicit_intent:
        normalized = explicit_intent.strip().lower()
        if normalized in [
            "retry_payment", "request_link", "schedule_callback", 
            "opt_out", "talk_to_human", "inquiry", "greeting"
        ]:
            return normalized, 1.0

    text = message.strip().lower()

    # 1. Opt Out
    if any(k in text for k in [
        "opt out", "stop", "unsubscribe", "do not call", "do not contact",
        "dnc", "leave me alone", "don't call", "remove me", "don't contact"
    ]):
        return "opt_out", 0.98

    # 2. Retry Payment
    if any(k in text for k in [
        "retry", "try again", "charge again", "pay now", "re-attempt",
        "retry payment", "run payment", "reprocess", "try payment again"
    ]):
        return "retry_payment", 0.95

    # 3. Request Link
    if any(k in text for k in [
        "link", "payment link", "send link", "pay online", "url",
        "checkout link", "secure link", "send me a link", "email link"
    ]):
        return "request_link", 0.95

    # 4. Schedule Callback
    if any(k in text for k in [
        "callback", "call me back", "call later", "call tomorrow",
        "schedule call", "busy right now", "speak later", "ring me later"
    ]):
        return "schedule_callback", 0.94

    # 5. Talk to Human
    if any(k in text for k in [
        "human", "agent", "representative", "person", "operator",
        "support", "talk to human", "speak with someone", "escalate",
        "manager", "customer service"
    ]):
        return "talk_to_human", 0.96

    # 6. Inquiries
    if any(k in text for k in [
        "why", "how much", "what is", "reason", "details", "invoice",
        "amount", "failed", "when", "help", "who are you"
    ]):
        return "inquiry", 0.88

    # 7. Greetings
    if any(k in text for k in ["hi", "hello", "hey", "good morning", "good evening"]):
        return "greeting", 0.90

    return "inquiry", 0.70


def initialize_chat_history_if_empty(
    db: Session,
    customer: Customer,
    payment: Optional[Payment]
) -> List[ChatMessage]:
    """
    Ensure the chat history has the transparent AI introduction message if empty.
    """
    existing_messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.customer_id == customer.id)
        .order_by(ChatMessage.id.asc())
        .all()
    )

    if not existing_messages:
        intro_text = build_transparent_intro(customer, payment)
        now_iso = datetime.now().isoformat()
        first_msg = ChatMessage(
            customer_id=customer.id,
            payment_id=payment.id if payment else None,
            sender="ai",
            message=intro_text,
            intent="intro",
            action_taken=None,
            confidence=1.0,
            timestamp=now_iso
        )
        db.add(first_msg)

        # Record audit log
        audit = AuditLog(
            customer_id=customer.id,
            payment_id=payment.id if payment else None,
            event_type="chat_session_initialized",
            details=f"AI transparent introduction generated for invoice {payment.invoice_id if payment else 'N/A'}",
            timestamp=now_iso
        )
        db.add(audit)
        db.commit()
        db.refresh(first_msg)
        return [first_msg]

    return existing_messages


def process_customer_message(
    db: Session,
    customer_id: int,
    user_message: str,
    explicit_intent: Optional[str] = None,
    idempotency_key: Optional[str] = None,
    force_outcome: Optional[str] = None
) -> Dict[str, Any]:
    """
    Process incoming message from customer, execute backend decision engine or payment simulator,
    persist conversation in SQLite, and return structured AI response.
    """
    now_iso = datetime.now().isoformat()

    # 1. Fetch customer & payment
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise ValueError(f"Customer {customer_id} not found.")

    payment = (
        db.query(Payment)
        .filter(Payment.customer_id == customer.id)
        .order_by(Payment.id.desc())
        .first()
    )

    # 2. Security Check: Block card details/CVV
    if detect_sensitive_data(user_message):
        warning_reply = (
            "⚠️ Security Notice: For your financial safety and strict PCI-DSS compliance, "
            "RecoverAI does not collect or store credit card numbers, CVVs, or OTPs in chat. "
            "If you need to update payment details, please choose 'Request Payment Link' to use "
            "our secure 256-bit encrypted checkout portal."
        )
        # Save customer message
        cust_msg = ChatMessage(
            customer_id=customer.id,
            payment_id=payment.id if payment else None,
            sender="customer",
            message="[Redacted sensitive card information]",
            intent="sensitive_data_blocked",
            action_taken=None,
            confidence=1.0,
            timestamp=now_iso
        )
        db.add(cust_msg)

        # Save AI warning
        ai_msg = ChatMessage(
            customer_id=customer.id,
            payment_id=payment.id if payment else None,
            sender="ai",
            message=warning_reply,
            intent="security_warning",
            action_taken="sensitive_data_blocked",
            confidence=1.0,
            timestamp=now_iso
        )
        db.add(ai_msg)
        db.commit()
        db.refresh(ai_msg)

        return {
            "reply": warning_reply,
            "intent": "security_warning",
            "action_taken": "sensitive_data_blocked",
            "confidence": 1.0,
            "payment_status": payment.status if payment else "unknown",
            "consent_status": customer.consent_status,
            "transaction_reference": None,
            "payment_link": None,
            "message_id": ai_msg.id,
            "timestamp": now_iso,
            "suggested_actions": SUGGESTED_ACTIONS
        }

    # 3. Classify intent
    intent, confidence = classify_customer_intent(user_message, explicit_intent)

    # 4. Save customer message to DB
    cust_msg = ChatMessage(
        customer_id=customer.id,
        payment_id=payment.id if payment else None,
        sender="customer",
        message=user_message,
        intent=intent,
        action_taken=None,
        confidence=confidence,
        timestamp=now_iso
    )
    db.add(cust_msg)
    db.commit()

    # 5. Evaluate response & actions based on decision engine & intent
    action_taken = None
    txn_ref = None
    pay_link = None
    reply_text = ""

    # Check Opt-Out Status First
    is_opted_out = (customer.consent_status or "").strip().lower() == "opted_out"

    if intent == "opt_out":
        customer.consent_status = "opted_out"
        action_taken = "opted_out"
        reply_text = (
            f"Understood, {customer.name}. Your preference has been immediately registered in our "
            "Do Not Contact compliance registry. All automated payment recovery outreach is now suppressed. "
            "If you ever wish to settle this invoice, you may contact our accounts team directly."
        )
        audit = AuditLog(
            customer_id=customer.id,
            payment_id=payment.id if payment else None,
            event_type="customer_opted_out",
            details="Customer opted out of recovery via chat assistant.",
            timestamp=now_iso
        )
        db.add(audit)

    elif is_opted_out and intent != "opt_out":
        # Customer is already opted out
        reply_text = (
            f"Your account is currently registered as Opted Out (Do Not Contact). "
            f"To protect your privacy and ensure compliance, automated actions are suspended. "
            f"If you would like to speak with our billing team, please choose 'Talk to Human'."
        )
        action_taken = "suppressed_opted_out"

    elif intent == "retry_payment":
        if not payment:
            reply_text = "I could not locate an active invoice to retry. Please contact human support."
            action_taken = "retry_rejected_no_payment"
        elif payment.status == "recovered":
            reply_text = (
                f"Invoice {payment.invoice_id} (₹{payment.amount:,.2f}) has already been successfully "
                "recovered and verified. No further payment attempt is necessary."
            )
            action_taken = "already_recovered"
        else:
            # Check decision engine eligibility
            decision = evaluate_recovery(customer, payment)
            if not decision["eligible_for_outreach"]:
                reply_text = f"Payment retry cannot be initiated at this time: {decision['reason']}"
                action_taken = "retry_declined_by_decision_engine"
            else:
                # Execute payment simulator
                sim_key = idempotency_key or f"chat-retry-{payment.id}-{uuid.uuid4().hex[:8]}"
                try:
                    sim_result = simulate_payment_retry(
                        db=db,
                        payment_id=payment.id,
                        idempotency_key=sim_key,
                        force_outcome=force_outcome
                    )
                    txn_ref = sim_result["transaction_reference"]

                    if sim_result["status"] == "success":
                        action_taken = "payment_retried_success"
                        reply_text = (
                            f"✅ Success! Your simulated payment retry of ₹{payment.amount:,.2f} for "
                            f"invoice {payment.invoice_id} has been verified and settled successfully.\n\n"
                            f"Transaction Reference: {txn_ref}\n"
                            "Your account status is now clear. Thank you!"
                        )
                    else:
                        action_taken = "payment_retried_failed"
                        reply_text = (
                            f"❌ The payment retry for invoice {payment.invoice_id} could not be completed: "
                            f"{sim_result['failure_reason']}.\n\n"
                            "Would you like me to generate a secure payment link or schedule a callback?"
                        )
                except PaymentSimulatorError as pe:
                    action_taken = "retry_error"
                    reply_text = f"Payment retry could not proceed: {pe.message}"

    elif intent == "request_link":
        if not payment:
            reply_text = "I could not locate an active invoice for this account."
        else:
            token = f"tok_sim_{payment.id}_{uuid.uuid4().hex[:6]}"
            pay_link = f"https://pay.recoverai.io/checkout/{payment.invoice_id}?token={token}"
            action_taken = "link_dispatched"
            reply_text = (
                f"Here is your secure, 256-bit encrypted payment link for invoice {payment.invoice_id} "
                f"(₹{payment.amount:,.2f}):\n\n"
                f"{pay_link}\n\n"
                "You can use this link to complete the payment using UPI, Credit/Debit Card, or NetBanking at your convenience."
            )
            audit = AuditLog(
                customer_id=customer.id,
                payment_id=payment.id,
                event_type="payment_link_generated",
                details=f"Secure link generated via chat: {pay_link}",
                timestamp=now_iso
            )
            db.add(audit)

    elif intent == "schedule_callback":
        action_taken = "callback_scheduled"
        phone_contact = customer.phone or "your phone number on file"
        reply_text = (
            f"📅 A callback has been scheduled for invoice {payment.invoice_id if payment else 'your account'}.\n"
            f"Our billing recovery team will reach out to you at {phone_contact} during regular business hours."
        )
        audit = AuditLog(
            customer_id=customer.id,
            payment_id=payment.id if payment else None,
            event_type="callback_scheduled",
            details=f"Customer requested callback for invoice {payment.invoice_id if payment else 'N/A'}",
            timestamp=now_iso
        )
        db.add(audit)

    elif intent == "talk_to_human":
        action_taken = "escalated_to_human"
        reply_text = (
            f"👤 I have connected your request to a senior billing specialist. "
            f"A representative from {customer.company or 'our support team'} will review your invoice "
            f"{payment.invoice_id if payment else ''} and reach out to you directly."
        )
        audit = AuditLog(
            customer_id=customer.id,
            payment_id=payment.id if payment else None,
            event_type="escalated_to_human",
            details="Customer requested escalation to a human representative in chat.",
            timestamp=now_iso
        )
        db.add(audit)

    elif intent == "greeting":
        amount_str = f"₹{payment.amount:,.2f}" if payment else "your pending amount"
        inv_str = payment.invoice_id if payment else "your invoice"
        reply_text = (
            f"Hello {customer.name}! How can I assist you with invoice {inv_str} ({amount_str}) today? "
            "You can choose one of the options below or type your question."
        )

    else:
        # Inquiry or question
        if payment:
            reply_text = (
                f"Regarding invoice {payment.invoice_id}:\n"
                f"• Amount Due: ₹{payment.amount:,.2f}\n"
                f"• Status: {payment.status.capitalize()}\n"
                f"• Recorded Reason: {payment.failure_reason}\n\n"
                "Would you like to retry the payment, receive a secure payment link, schedule a callback, or talk to an agent?"
            )
        else:
            reply_text = "I'm here to help with your billing. Would you like to speak with a human representative?"

    # 6. Save AI reply in DB
    ai_msg = ChatMessage(
        customer_id=customer.id,
        payment_id=payment.id if payment else None,
        sender="ai",
        message=reply_text,
        intent=intent,
        action_taken=action_taken,
        confidence=confidence,
        timestamp=datetime.now().isoformat()
    )
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)
    if payment:
        db.refresh(payment)
    db.refresh(customer)

    return {
        "reply": reply_text,
        "intent": intent,
        "action_taken": action_taken,
        "confidence": confidence,
        "payment_status": payment.status if payment else "unknown",
        "consent_status": customer.consent_status,
        "transaction_reference": txn_ref,
        "payment_link": pay_link,
        "message_id": ai_msg.id,
        "timestamp": ai_msg.timestamp,
        "suggested_actions": SUGGESTED_ACTIONS
    }

