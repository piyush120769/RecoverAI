import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from the backend directory
ENV_FILE = Path(__file__).resolve().parent.parent / ".env"
if ENV_FILE.exists():
    load_dotenv(dotenv_path=ENV_FILE)
else:
    load_dotenv()


class Settings:
    # Vapi Keys and Identifiers
    VAPI_API_KEY: str = os.getenv("VAPI_API_KEY", "").strip()
    VAPI_BASE_URL: str = os.getenv("VAPI_BASE_URL", "https://api.vapi.ai").strip().rstrip("/")
    VAPI_ASSISTANT_ID: str = os.getenv("VAPI_ASSISTANT_ID", "").strip()
    VAPI_PHONE_NUMBER_ID: str = os.getenv("VAPI_PHONE_NUMBER_ID", "").strip()
    VAPI_WEBHOOK_SECRET: str = os.getenv("VAPI_WEBHOOK_SECRET", "").strip()

    # Server & Environment Settings
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development").strip()
    PORT: int = int(os.getenv("PORT", 8000))
    HOST: str = os.getenv("HOST", "127.0.0.1").strip()

    @property
    def has_vapi_key(self) -> bool:
        return bool(self.VAPI_API_KEY and not self.VAPI_API_KEY.startswith("your_"))

    @property
    def has_assistant_id(self) -> bool:
        return bool(self.VAPI_ASSISTANT_ID and not self.VAPI_ASSISTANT_ID.startswith("your_"))

    @property
    def has_phone_number_id(self) -> bool:
        return bool(self.VAPI_PHONE_NUMBER_ID and not self.VAPI_PHONE_NUMBER_ID.startswith("your_"))

    @property
    def has_webhook_secret(self) -> bool:
        return bool(self.VAPI_WEBHOOK_SECRET and not self.VAPI_WEBHOOK_SECRET.startswith("your_"))

    @property
    def masked_vapi_key(self) -> str:
        if not self.has_vapi_key:
            return "not_configured"
        if len(self.VAPI_API_KEY) <= 10:
            return "configured_short"
        return f"{self.VAPI_API_KEY[:8]}...{self.VAPI_API_KEY[-4:]}"

    @property
    def masked_assistant_id(self) -> str:
        if not self.has_assistant_id:
            return "not_configured"
        if len(self.VAPI_ASSISTANT_ID) <= 10:
            return "configured"
        return f"{self.VAPI_ASSISTANT_ID[:6]}...{self.VAPI_ASSISTANT_ID[-4:]}"

    @property
    def masked_phone_number_id(self) -> str:
        if not self.has_phone_number_id:
            return "not_configured"
        if len(self.VAPI_PHONE_NUMBER_ID) <= 10:
            return "configured"
        return f"{self.VAPI_PHONE_NUMBER_ID[:6]}...{self.VAPI_PHONE_NUMBER_ID[-4:]}"


settings = Settings()
