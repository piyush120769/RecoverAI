from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class PaymentSchema(BaseModel):
    id: int
    amount: float
    currency: str = "INR"
    failure_reason: Optional[str] = None
    status: str
    invoice_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CustomerSchema(BaseModel):
    id: int
    name: str
    company: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    consent_status: str = "approved"
    payments: List[PaymentSchema] = []

    model_config = ConfigDict(from_attributes=True)


class CustomerListResponse(BaseModel):
    total: int
    customers: List[CustomerSchema]

