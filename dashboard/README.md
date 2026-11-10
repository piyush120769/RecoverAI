# RecoverAI — Autopay Payment Recovery Dashboard

**RecoverAI** is a fintech SaaS dashboard for AI-powered autopay payment recovery. Built for enterprise recurring billing teams to monitor failed payments, automate compliant AI voice agent outreach, and verify recovered revenue via decision engine and payment gateway simulators.

---

## 🚀 Live Demo & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Running on http://localhost:5173/

# Build production bundle
npm run build
```

---

## 💡 The Core Workflow

RecoverAI enforces strict fintech payment recovery logic:

1. **Autopay Failure Ingestion:** Recurring ACH/card charge returns an error (e.g. `ERR_INSUFFICIENT_FUNDS`, `ERR_DO_NOT_HONOR`, `ERR_MANDATE_EXPIRED`, `ERR_GATEWAY_TIMEOUT`).
2. **Pre-Call Eligibility Check:** The policy engine checks grace period, invoice threshold, and TCPA/Do-Not-Call suppression lists.
3. **AI Voice Outreach:** The AI voice agent (Aria) calls the authorized contact, explains the failure, and inquires how they wish to proceed.
4. **Customer Choice:** Customer can:
   - Request immediate retry
   - Request secure payment link
   - Schedule callback
   - Decline / Opt-out
   - Request human assistance (billing disputes)
5. **Backend Decision Engine:** Analyzes intent and NLP confidence. Responses with confidence < 75% are auto-escalated to human account reps.
6. **Payment Simulator:** For authorized retries, the payment simulator runs an idempotency-safe test against banking rails.
7. **Verified Recovery Accounting:** **Only payments confirmed by the payment simulator are marked as recovered.** Pending links and callbacks are never prematurely counted as recovered.

---

## 🖥️ Screen Architecture

- **Overview:**
  - 4 Core KPIs: *Failed Payments*, *Amount at Risk*, *Amount Recovered (Verified)*, *Recovery Rate*.
  - Left Column: Recovery Performance Over Time (Area Chart).
  - Right Column: Compact Recovery Outcome Breakdown (5 verified categories).
  - Recent Recovery Activity Table + Direct action to start campaigns.
- **Customers:**
  - 10 fictional customers with realistic subscription pricing, error codes, and failure dates.
  - Interactive slide-over showing customer profile, failure code, timeline, call attempts, and manual actions.
- **Recovery Campaigns:**
  - Campaign summary bar (active campaigns, audience, calls completed, recovered revenue).
  - Functional "Create Campaign" modal with audience segmentation and AI persona selector.
- **Call History:**
  - Audit trail of AI voice agent interactions with duration, outcome, AI confidence score, and status.
  - Slide-over detail with verbatim conversation transcript, audio waveform player, and backend decision logs.
- **Analytics:**
  - Overall recovery rate, amount recovered, retry success rate.
  - Failure Reason vs Recovery comparison chart.
  - Error code policy matrix.
- **Settings:**
  - AI Voice agent persona selection, human escalation threshold slider.
  - Calling window hours, weekend policy toggle, DNC keyword auto-suppression.
- **Interactive Simulator:**
  - Accessible via the **"Test Voice Simulator"** button in sidebar or header.
  - Walks through the full 8-step workflow live.

