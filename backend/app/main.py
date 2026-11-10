from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app import models
from app.routes.customers import router as customers_router
from app.routes.recovery import router as recovery_router
from app.routes.vapi import router as vapi_router
from app.routes.chat import router as chat_router
from app.routes.payments import router as payments_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="RecoverAI",
    description="AI-Powered Autopay Recovery Platform",
    version="1.0.0"
)

# Enable CORS for frontend dashboard integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(customers_router)
app.include_router(recovery_router)
app.include_router(vapi_router)
app.include_router(chat_router)
app.include_router(payments_router)


@app.get("/")
def home():
    return {
        "message": "Welcome to RecoverAI",
        "status": "Running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "database": "connected"
    }
