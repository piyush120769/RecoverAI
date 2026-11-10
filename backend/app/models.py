
from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    company = Column(String)
    email = Column(String, unique=True)
    phone = Column(String)
    consent_status = Column(String, default="approved")

    payments = relationship("Payment", back_populates="customer")
    calls = relationship("Call", back_populates="customer")
    chat_messages = relationship("ChatMessage", back_populates="customer", cascade="all, delete-orphan")
    simulations = relationship("PaymentSimulation", back_populates="customer")
    audit_logs = relationship("AuditLog", back_populates="customer")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))

    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    failure_reason = Column(String)
    status = Column(String, default="failed")
    invoice_id = Column(String, unique=True)

    customer = relationship("Customer", back_populates="payments")
    simulations = relationship("PaymentSimulation", back_populates="payment")
    chat_messages = relationship("ChatMessage", back_populates="payment")


class Call(Base):
    __tablename__ = "calls"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))

    status = Column(String, default="pending")
    outcome = Column(String)
    transcript = Column(String)
    confidence = Column(Float)

    customer = relationship("Customer", back_populates="calls")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=True, index=True)

    sender = Column(String, nullable=False)  # 'ai' | 'customer' | 'system'
    message = Column(String, nullable=False)
    intent = Column(String, nullable=True)  # 'retry_payment', 'request_link', 'schedule_callback', 'opt_out', 'talk_to_human', 'inquiry', 'greeting'
    action_taken = Column(String, nullable=True)  # 'payment_retried_success', 'payment_retried_failed', 'link_dispatched', 'callback_scheduled', 'opted_out', 'escalated_to_human'
    confidence = Column(Float, default=1.0)
    timestamp = Column(String, nullable=False)

    customer = relationship("Customer", back_populates="chat_messages")
    payment = relationship("Payment", back_populates="chat_messages")


class PaymentSimulation(Base):
    __tablename__ = "payment_simulations"

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)

    idempotency_key = Column(String, unique=True, index=True, nullable=False)
    attempted_amount = Column(Float, nullable=False)
    status = Column(String, nullable=False)  # 'success', 'failed', 'rejected'
    failure_reason = Column(String, nullable=True)
    transaction_reference = Column(String, nullable=False)
    is_simulated = Column(Integer, default=1)
    created_at = Column(String, nullable=False)

    customer = relationship("Customer", back_populates="simulations")
    payment = relationship("Payment", back_populates="simulations")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=True, index=True)

    event_type = Column(String, nullable=False)
    details = Column(String, nullable=False)
    timestamp = Column(String, nullable=False)

    customer = relationship("Customer", back_populates="audit_logs")

