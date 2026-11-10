from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class ChatMessageItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    payment_id: Optional[int] = None
    sender: str
    message: str
    intent: Optional[str] = None
    action_taken: Optional[str] = None
    confidence: float = 1.0
    timestamp: str


class ChatHistoryResponse(BaseModel):
    customer_id: int
    customer_name: str
    company: Optional[str] = None
    payment_id: Optional[int] = None
    invoice_id: Optional[str] = None
    amount: Optional[float] = None
    currency: str = "INR"
    failure_reason: Optional[str] = None
    payment_status: str
    consent_status: str
    messages: List[ChatMessageItem]
    suggested_actions: List[str] = Field(
        default_factory=lambda: [
            "Retry Payment",
            "Request Payment Link",
            "Schedule Callback",
            "Opt Out",
            "Talk to Human"
        ]
    )


class SendMessageRequest(BaseModel):
    message: str = Field(..., description="Message text from the customer or selected quick action")
    intent: Optional[str] = Field(None, description="Optional explicit intent identifier")
    idempotency_key: Optional[str] = Field(None, description="Optional idempotency key for payment retry actions")
    force_outcome: Optional[str] = Field(None, description="Optional simulator override: 'success' or 'failure'")


class SendMessageResponse(BaseModel):
    reply: str
    intent: str
    action_taken: Optional[str] = None
    confidence: float = 1.0
    payment_status: str
    consent_status: str
    transaction_reference: Optional[str] = None
    payment_link: Optional[str] = None
    message_id: int
    timestamp: str
    suggested_actions: List[str]
