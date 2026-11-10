
def evaluate_recovery(customer, payment):
    """
    Decide the safest next recovery action for a customer payment.
    This function does not place calls or process payments.
    """

    consent = (customer.consent_status or "").strip().lower()
    payment_status = (payment.status or "").strip().lower()
    failure_reason = (payment.failure_reason or "").strip().lower()

    # Rule 1: Never contact customers who opted out
    if consent == "opted_out":
        return {
            "eligible_for_outreach": False,
            "recommended_action": "suppress",
            "reason": "Customer has opted out of recovery calls.",
            "requires_customer_confirmation": False
        }

    # Rule 2: Consent must be approved
    if consent != "approved":
        return {
            "eligible_for_outreach": False,
            "recommended_action": "require_consent",
            "reason": "Customer consent is not approved.",
            "requires_customer_confirmation": True
        }

    # Rule 3: Do not recover an already recovered payment
    if payment_status == "recovered":
        return {
            "eligible_for_outreach": False,
            "recommended_action": "no_action",
            "reason": "Payment has already been recovered.",
            "requires_customer_confirmation": False
        }

    # Rule 4: Only failed payments enter recovery
    if payment_status != "failed":
        return {
            "eligible_for_outreach": False,
            "recommended_action": "no_action",
            "reason": "Payment is not currently in failed status.",
            "requires_customer_confirmation": False
        }

    # Rule 5: Recommend an action based on failure reason
    if failure_reason == "payment timeout":
        action = "offer_retry"
        reason = "Payment timed out. Offer the customer a retry."

    elif failure_reason in [
        "insufficient funds",
        "card expired",
        "bank declined"
    ]:
        action = "offer_payment_link"
        reason = "Offer a secure payment link to complete payment."

    elif failure_reason == "mandate inactive":
        action = "human_escalation"
        reason = "Inactive mandate requires customer assistance."

    else:
        action = "human_escalation"
        reason = "Unknown failure reason requires manual review."

    return {
        "eligible_for_outreach": True,
        "recommended_action": action,
        "reason": reason,
        "requires_customer_confirmation": True
    }
