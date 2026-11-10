from typing import Optional
from pydantic import BaseModel, Field


class RecoveryDecisionResult(BaseModel):
    eligible_for_outreach: bool = Field(..., description="Whether automated outreach is permitted")
    recommended_action: str = Field(..., description="Action selected by decision engine (e.g. offer_retry, offer_payment_link, human_escalation, suppress, no_action)")
    reason: str = Field(..., description="Explanation of why this action was recommended")
    requires_customer_confirmation: bool = Field(..., description="Whether customer confirmation is required")


class RecoveryDecisionResponse(BaseModel):
    customer_id: int
    customer_name: str
    payment_id: int
    amount: float
    currency: str = "INR"
    failure_reason: Optional[str] = None
    payment_status: str
    consent_status: str
    decision: RecoveryDecisionResult

    model_config = {
        "from_attributes": True
    }

