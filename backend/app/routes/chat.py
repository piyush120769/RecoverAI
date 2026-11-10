from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Customer, Payment, ChatMessage
from app.schemas.chat import (
    ChatHistoryResponse,
    SendMessageRequest,
    SendMessageResponse,
    ChatMessageItem
)
from app.services.chat_engine import (
    resolve_customer_and_payment,
    initialize_chat_history_if_empty,
    process_customer_message,
    SUGGESTED_ACTIONS
)

router = APIRouter(
    prefix="/api/chat",
    tags=["AI Recovery Chat"]
)


@router.get("/{customer_id}", response_model=ChatHistoryResponse)
def get_chat_history(
    customer_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve or initialize the persisted chat recovery conversation for a customer.
    Supports integer IDs and string identifiers like 'CUST-1001'.
    """
    customer, payment = resolve_customer_and_payment(db, customer_id)
    if not customer:
        raise HTTPException(
            status_code=404,
            detail=f"Customer '{customer_id}' not found."
        )

    # Initialize introductory message if no conversation exists yet
    messages = initialize_chat_history_if_empty(db, customer, payment)

    return {
        "customer_id": customer.id,
        "customer_name": customer.name,
        "company": customer.company,
        "payment_id": payment.id if payment else None,
        "invoice_id": payment.invoice_id if payment else None,
        "amount": payment.amount if payment else None,
        "currency": payment.currency if payment else "INR",
        "failure_reason": payment.failure_reason if payment else None,
        "payment_status": payment.status if payment else "unknown",
        "consent_status": customer.consent_status,
        "messages": [
            ChatMessageItem(
                id=m.id,
                customer_id=m.customer_id,
                payment_id=m.payment_id,
                sender=m.sender,
                message=m.message,
                intent=m.intent,
                action_taken=m.action_taken,
                confidence=m.confidence or 1.0,
                timestamp=m.timestamp
            )
            for m in messages
        ],
        "suggested_actions": SUGGESTED_ACTIONS
    }


@router.post("/{customer_id}/message", response_model=SendMessageResponse)
def send_message_to_chat(
    customer_id: str,
    payload: SendMessageRequest,
    db: Session = Depends(get_db)
):
    """
    Send a message or action to the AI Recovery Chat assistant.
    Executes decision engine validations, deterministic payment simulator (if retry requested),
    records conversation in SQLite, and returns structured AI reply.
    """
    customer, _ = resolve_customer_and_payment(db, customer_id)
    if not customer:
        raise HTTPException(
            status_code=404,
            detail=f"Customer '{customer_id}' not found."
        )

    try:
        response_data = process_customer_message(
            db=db,
            customer_id=customer.id,
            user_message=payload.message,
            explicit_intent=payload.intent,
            idempotency_key=payload.idempotency_key,
            force_outcome=payload.force_outcome
        )
        return response_data
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing recovery chat message: {str(e)}"
        )


@router.delete("/{customer_id}/history")
def reset_chat_history(
    customer_id: str,
    db: Session = Depends(get_db)
):
    """
    Helper endpoint to reset conversation history for testing purposes.
    Preserves customer and payment records.
    """
    customer, payment = resolve_customer_and_payment(db, customer_id)
    if not customer:
        raise HTTPException(
            status_code=404,
            detail=f"Customer '{customer_id}' not found."
        )

    db.query(ChatMessage).filter(ChatMessage.customer_id == customer.id).delete()
    db.commit()

    # Re-initialize transparent intro
    messages = initialize_chat_history_if_empty(db, customer, payment)
    return {
        "status": "success",
        "message": f"Chat history reset for customer {customer.name}.",
        "new_message_count": len(messages)
    }

