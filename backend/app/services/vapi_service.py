"""
Vapi Voice Agent Service & Telephony Adapter
Manages outbound voice dialogues, assistant prompts, connection verification, and webhook event processing.
"""

import hmac
import hashlib
import json
import logging
from typing import Dict, Any, Optional
import httpx

from app.config import settings

logger = logging.getLogger("recoverai.vapi")


class VapiService:
    """
    Service wrapper for Vapi AI Voice integration.
    Supports live Vapi API verification, assistant prompt synthesis,
    webhook parsing, and safe fallback adapters.
    """

    def __init__(self):
        self.api_key = settings.VAPI_API_KEY
        self.base_url = settings.VAPI_BASE_URL.rstrip("/")
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "RecoverAI-Platform/1.0"
        }

    async def verify_connection(self) -> Dict[str, Any]:
        """
        Verify live connection and authentication with Vapi API without placing any outbound calls.
        Returns detailed check results while ensuring zero credentials or secrets are leaked.
        """
        if not settings.has_vapi_key:
            return {
                "authenticated": False,
                "status": "missing_credentials",
                "auth_type": "none",
                "error": "VAPI_API_KEY is not configured in backend/.env",
                "details": "Please add VAPI_API_KEY to your .env file."
            }

        url = f"{self.base_url}/call/web"
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                # Send an empty JSON probe to test authentication against Vapi API
                response = await client.post(
                    url,
                    headers=self.headers,
                    json={}
                )

                # If Vapi returns 400 with subscriptionLimits, the key is 100% authenticated
                if response.status_code == 400:
                    data = response.json()
                    limits = data.get("subscriptionLimits", {})
                    if "subscriptionLimits" in data:
                        return {
                            "authenticated": True,
                            "status": "authenticated",
                            "auth_type": "public_key",
                            "provider": "Vapi Live Cloud",
                            "subscription_active": not limits.get("concurrencyBlocked", False),
                            "concurrency_limit": limits.get("concurrencyLimit", 0),
                            "remaining_concurrent_calls": limits.get("remainingConcurrentCalls", 0),
                            "web_call_ready": True,
                            "message": "Vapi API key authenticated successfully. Ready for browser WebRTC voice sessions."
                        }
                    return {
                        "authenticated": False,
                        "status": "bad_request",
                        "auth_type": "unknown",
                        "error": data.get("message", "Unexpected response from Vapi")
                    }

                elif response.status_code in [200, 201]:
                    return {
                        "authenticated": True,
                        "status": "authenticated",
                        "auth_type": "public_key",
                        "provider": "Vapi Live Cloud",
                        "web_call_ready": True,
                        "message": "Vapi API key authenticated successfully."
                    }

                elif response.status_code == 401:
                    return {
                        "authenticated": False,
                        "status": "unauthorized",
                        "auth_type": "invalid_key",
                        "error": "Vapi returned 401 Unauthorized. Key is invalid or expired."
                    }

                elif response.status_code == 403:
                    return {
                        "authenticated": False,
                        "status": "forbidden",
                        "auth_type": "forbidden",
                        "error": "Vapi API returned 403 Forbidden. Check account permissions."
                    }

                else:
                    return {
                        "authenticated": False,
                        "status": "api_error",
                        "error": f"Vapi returned HTTP {response.status_code}"
                    }

        except httpx.RequestError as exc:
            return {
                "authenticated": False,
                "status": "connection_error",
                "error": f"Network error connecting to Vapi at {self.base_url}: {str(exc)}"
            }
        except Exception as e:
            return {
                "authenticated": False,
                "status": "unexpected_error",
                "error": str(e)
            }

    def verify_webhook_signature(self, raw_body: bytes, signature_header: Optional[str]) -> bool:
        """
        Verify HMAC-SHA256 signature for incoming Vapi webhooks.
        If no webhook secret is configured, returns True (unrestricted mode).
        If secret is configured, enforces cryptographic HMAC comparison.
        """
        if not settings.has_webhook_secret:
            return True

        if not signature_header:
            return False

        try:
            expected_signature = hmac.new(
                settings.VAPI_WEBHOOK_SECRET.encode("utf-8"),
                raw_body,
                hashlib.sha256
            ).hexdigest()
            return hmac.compare_digest(expected_signature, signature_header)
        except Exception as e:
            logger.error(f"Error validating webhook signature: {e}")
            return False

    def get_assistant_configuration(
        self,
        customer_name: str,
        company: str,
        amount: float,
        failure_reason: str,
        invoice_id: str,
        currency: str = "INR"
    ) -> Dict[str, Any]:
        """
        Generate standard Vapi assistant configuration conforming to RecoverAI guidelines:
        - Transparently identifies as an AI assistant.
        - Clearly explains the failed autopay and amount.
        - Provides 5 customer choice options without requesting sensitive credentials.
        """
        formatted_amount = f"₹{amount:,.2f}"

        system_prompt = (
            f"You are Aria, an AI payment recovery assistant calling from RecoverAI on behalf of {company}. "
            f"You are speaking with {customer_name}. "
            f"Your mission is to inform the customer about a failed recurring autopay payment of {formatted_amount} "
            f"(Invoice: {invoice_id}) due to '{failure_reason}', and help them choose how to resolve it.\n\n"
            "STRICT COMPLIANCE & SAFETY RULES:\n"
            "1. Transparently state that you are an AI assistant at the very beginning of the call.\n"
            "2. NEVER ask for or collect credit card numbers, CVV codes, bank PINs, passwords, or OTPs.\n"
            "3. Offer these 5 choices only:\n"
            "   a) Instant retry authorization (if funds are now available)\n"
            "   b) Send secure payment link via SMS/email\n"
            "   c) Schedule a callback at a preferred time\n"
            "   d) Decline / Opt-out (immediately respect Do-Not-Call requests and apologize for any inconvenience)\n"
            "   e) Escalate to a human account manager for billing disputes or complex issues\n"
            "4. Be empathetic, polite, concise, and professional.\n"
            "5. If customer expresses frustration or disputes charges, immediately offer human escalation.\n"
            "6. Once the customer specifies their preference, confirm their choice clearly before ending the call."
        )

        first_message = (
            f"Hello {customer_name}, this is Aria, an automated payment assistant calling from RecoverAI on behalf of {company}. "
            f"I'm reaching out because your recent recurring autopay payment of {formatted_amount} for invoice {invoice_id} "
            f"did not go through due to {failure_reason.lower()}. "
            f"Would you like me to run an instant retry right now, send you a secure payment link, schedule a callback, or connect you with a team member?"
        )

        return {
            "name": f"RecoverAI-Agent-{invoice_id}",
            "model": {
                "provider": "openai",
                "model": "gpt-4o-mini",
                "messages": [
                    {
                        "role": "system",
                        "content": system_prompt
                    }
                ]
            },
            "voice": {
                "provider": "11labs",
                "voiceId": "21m00Tcm4TlvDq8ikWAM"  # Professional female voice (Aria)
            },
            "firstMessage": first_message,
            "endCallMessage": "Thank you for your time. Have a wonderful day!",
            "recordingEnabled": True
        }

    def parse_webhook_payload(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse and sanitize incoming Vapi webhook payloads.
        Extracts transcript, customer intent, confidence, duration, and safety flags.
        """
        message = payload.get("message", {})
        call = message.get("call", {}) or payload.get("call", {})

        transcript = message.get("transcript") or call.get("transcript", "")
        duration_seconds = call.get("duration", 0)
        minutes = int(duration_seconds // 60)
        seconds = int(duration_seconds % 60)
        formatted_duration = f"{minutes}m {seconds:02d}s"

        analysis = message.get("analysis", {}) or call.get("analysis", {})
        structured_data = analysis.get("structuredData", {})

        raw_intent = structured_data.get("intent", "").lower()
        t_lower = transcript.lower()

        if "retry" in raw_intent or "retry" in t_lower:
            outcome = "Retry requested"
            confidence = 96.0
        elif "link" in raw_intent or "link" in t_lower or "card" in t_lower:
            outcome = "Payment link requested"
            confidence = 94.0
        elif "callback" in raw_intent or "call back" in t_lower or "tomorrow" in t_lower:
            outcome = "Callback requested"
            confidence = 91.0
        elif "dispute" in raw_intent or "human" in t_lower or "speak" in t_lower or "error" in t_lower:
            outcome = "Escalated to human"
            confidence = 62.0  # Under 75% threshold triggers safety handoff
        elif "opt" in raw_intent or "stop" in t_lower or "cancel" in t_lower or "do not call" in t_lower:
            outcome = "Declined"
            confidence = 99.0
        else:
            outcome = "Callback requested"
            confidence = 80.0

        return {
            "provider_call_id": call.get("id"),
            "status": "completed",
            "outcome": outcome,
            "transcript": transcript,
            "confidence": confidence,
            "duration": formatted_duration,
            "customer_phone": (call.get("customer") or {}).get("number")
        }


vapi_service = VapiService()
