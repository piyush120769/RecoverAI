from typing import Optional
from pydantic import BaseModel, Field


class PaymentRetryRequest(BaseModel):
    idempotency_key: str = Field(..., description="Unique key to prevent duplicate payment retries")
    force_outcome: Optional[str] = Field(None, description="Optional deterministic override: 'success' or 'failure'")


class PaymentSimulationResponse(BaseModel):
    success: bool
    status: str
    payment_id: int
    customer_id: int
    amount: float
    currency: str = "INR"
    transaction_reference: str
    idempotency_key: str
    is_simulated: bool = True
    is_duplicate: bool = False
    payment_status: str
    message: str
    failure_reason: Optional[str] = None
    timestamp: str

