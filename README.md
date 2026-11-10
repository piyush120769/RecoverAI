# RecoverAI — AI-Powered Autopay Recovery Platform

> **Razorpay FDE Assignment Submission**  
> An enterprise-grade, **chat-first** autonomous autopay recovery platform built with FastAPI, SQLite, and React (Vite + Tailwind CSS).

---

## 🌟 Executive Summary

RecoverAI transforms recurring subscription and B2B SaaS invoice payment failures into successful recoveries through an intelligent, transparent **AI Recovery Assistant**. 

Rather than relying on intrusive outbound calling, RecoverAI operates as a **Chat-First** platform where customers interact directly with an AI assistant that explains payment failures transparently, validates recovery eligibility via a deterministic Decision Engine, and safely executes idempotent payment retries or dispatches secure tokenized payment links.

---

## 🚀 Key Features & Capabilities

### 1. 🤖 AI Recovery Assistant (Chat-First)
- **Transparent AI Identity**: Transparently introduces itself as an automated AI assistant on behalf of the merchant, citing the specific customer name, company, invoice ID, failed amount (in INR ₹), and bank failure code.
- **5 Core Recovery Actions**:
  1. 🔄 **Retry Payment**: Safely triggers simulated payment retries verified by the payment simulator.
  2. 🔗 **Request Payment Link**: Generates a 256-bit encrypted checkout portal link for card/UPI/netbanking updates.
  3. 📞 **Schedule Callback**: Books a follow-up call with customer operations during business hours.
  4. 🚫 **Opt Out (DNC)**: Enforces Do Not Contact compliance, updating customer consent in real time and suppressing future outreach.
  5. 👤 **Talk to Human**: Instantly escalates to a senior billing specialist.
- **🛡️ PCI-DSS Zero-Card-Data Guard**: Detects raw credit card numbers (13–19 digits), CVVs, and OTPs. Blocks storage and instructs the customer to use tokenized payment links.

### 2. 🧠 Backend Decision Engine
- **Single Source of Truth**: Evaluates consent, payment status, and failure reasons before authorizing any recovery touchpoint.
- **Safe Guardrails**:
  - Rejects attempts on already recovered payments (`400 Bad Request`).
  - Blocks recovery actions for opted-out customers (`403 Forbidden`).
  - Recommends tailored strategies (e.g., instant retry for network timeouts, secure link for card expired / insufficient funds, human escalation for mandate issues).

### 3. 💳 Idempotent Payment Simulator
- **Fintech Precision**: Payments are marked as `recovered` **only** upon verified simulator confirmation.
- **Idempotency Protection**: Every retry requires an `idempotency_key`. Duplicate requests return the original transaction record (`is_duplicate: true`) without double processing.
- **Deterministic Outcomes**: Supports deterministic success and failure simulation.

### 4. 📊 Real-Time Operations Dashboard
- **Executive KPIs**: Failed Autopay Cohort, Amount at Risk, Total Recovered Amount, and Real-Time Recovery Rate.
- **Customer Recovery Drawer**: Slide-over panel featuring the live interactive AI Recovery Chatbox, customer profile, and audit trail.
- **Real-Time State Synchronization**: Live updates to KPIs and customer status when a payment is settled or opted out via chat.

---

## 🏗️ Project Architecture

```
RecoverAI/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── customers.py        # Customer retrieval endpoints
│   │   │   ├── recovery.py         # Decision engine evaluation routes
│   │   │   ├── chat.py             # Chat persistence & message exchange
│   │   │   ├── payments.py         # Payment retry simulator & audit routes
│   │   │   └── vapi.py             # Telephony status & webhook verification
│   │   ├── services/
│   │   │   ├── decision_engine.py  # Recovery policy evaluation logic
│   │   │   ├── chat_engine.py      # AI assistant intent parsing & dialogue
│   │   │   ├── payment_simulator.py# Deterministic retry & idempotency engine
│   │   │   └── vapi_service.py     # Voice integration service layer
│   │   ├── schemas/                # Strongly typed Pydantic models
│   │   ├── config.py               # Safe environment configuration
│   │   ├── database.py             # SQLite engine & session management
│   │   ├── models.py               # SQLAlchemy models (Customer, Payment, ChatMessage, etc.)
│   │   └── main.py                 # FastAPI application entrypoint
│   ├── recoverai.db                # SQLite database (10 seed customers & payments)
│   ├── requirements.txt            # Python dependencies
│   ├── test_phase1.py              # Phase 1 backend test suite
│   ├── test_phase2_vapi.py         # Phase 2 credentials & webhook verification suite
│   └── test_phase3_chat.py         # Phase 3 chat-first & simulator test suite
└── dashboard/                      # React frontend application
    ├── src/
    │   ├── components/
    │   │   ├── chat/
    │   │   │   └── AiRecoveryChatbox.jsx # Embedded AI chat interface
    │   │   ├── customers/
    │   │   │   ├── CustomersView.jsx     # Customers table with spacing system
    │   │   │   └── CustomerDetailPanel.jsx# Slide-over customer profile & chat
    │   │   ├── overview/                 # KPI cards & analytics breakdown
    │   │   └── common/                   # Reusable badges, modals, slide-overs
    │   ├── context/
    │   │   └── RecoveryContext.jsx       # Global state management
    │   └── App.jsx
    ├── package.json
    └── vite.config.js
```

---

## ⚙️ Setup & Local Run Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# (Optional) Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Seed database if starting fresh:
python seed.py

# Start backend server
python -m uvicorn app.main:app --reload --port 8000
```
Backend API docs will be accessible at: `http://localhost:8000/docs`

### 2. Frontend Dashboard Setup
```bash
# In a new terminal, navigate to dashboard directory
cd dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```
Dashboard will be accessible at: `http://localhost:5173`

---

## 🧪 Testing & Verification

The test suite covers:
- Transparent AI introduction and customer identifier resolution.
- All 5 customer chat intents (*Retry Payment*, *Payment Link*, *Schedule Callback*, *Opt Out*, *Talk to Human*).
- Idempotency key protection and double-recovery rejection.
- Zero-card-data compliance and sensitive data blocking.
- Audit trail and conversation persistence in SQLite.

```bash
# Run all automated tests
pytest backend/test_phase1.py backend/test_phase2_vapi.py backend/test_phase3_chat.py -v
```
**Result**: `38 passed in 2.42s`

```bash
# Verify frontend production build
cd dashboard
npm run build
```
**Result**: `✓ built in 6.55s (0 errors)`

---

## 🔒 Security & Compliance

- **Zero Card Data Storage**: Full adherence to PCI-DSS by preventing collection of card numbers, CVVs, and OTPs in chat.
- **Idempotency Guarantee**: Eliminates duplicate charges through server-side idempotency keys.
- **Do Not Contact (DNC) Registry**: Immediate suppression of outreach for opted-out accounts.
- **Safe Credential Management**: Masks all API keys in logs and API responses.
