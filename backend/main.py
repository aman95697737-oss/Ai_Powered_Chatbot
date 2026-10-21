import logging
import os
import sys
from pathlib import Path

# Add project root and backend directory to sys.path
_current_dir = Path(__file__).resolve().parent
_root_dir = _current_dir.parent
if str(_root_dir) not in sys.path:
    sys.path.insert(0, str(_root_dir))
if str(_current_dir) not in sys.path:
    sys.path.insert(0, str(_current_dir))

# Ensure 'backend' is recognized in sys.modules even if deployed from within backend/
if "backend" not in sys.modules:
    import types
    _pkg = types.ModuleType("backend")
    _pkg.__path__ = [str(_current_dir)]
    _pkg.__file__ = str(_current_dir / "__init__.py")
    sys.modules["backend"] = _pkg

from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.chat import router as chat_router
from backend.routes.faq import router as faq_router
from backend.routes.auth import router as auth_router
from backend.services.ai_service import ai_service
from backend.services.dataset_service import dataset_service
from backend.database.mongodb import db_manager
from backend.models.schemas import HealthResponse

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("UniAssistAI")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("==================================================")
    logger.info("Starting UniAssist AI - University Student Support")
    logger.info(f"Dataset loaded with {len(dataset_service.faqs)} FAQs")
    status = ai_service.get_status()
    logger.info(f"AI Service configured: {status['api_configured']} (Model: {status['model']}, Mock: {status['use_mock_ai']})")
    
    # Initialize MongoDB connection
    await db_manager.connect()
    
    logger.info("==================================================")
    yield
    # Cleanup on shutdown
    await db_manager.close()
    logger.info("Shutting down UniAssist AI backend.")


app = FastAPI(
    title="AI Powered Chatbot for University Student Support",
    description="Full-stack AI assistant with JWT authentication, Email OTP, and automatic fallback to local university FAQ knowledge base",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Configuration - allow frontend clients to interact with API and send HTTP-only cookies
frontend_url = os.getenv("FRONTEND_URL")
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]
if frontend_url and frontend_url not in allowed_origins:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?|https://.*\.vercel\.app|https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(faq_router)


@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    ai_status = "configured" if ai_service.api_key else ("mock_active" if ai_service.use_mock_ai else "fallback_only")
    return HealthResponse(
        status="healthy",
        dataset_entries=len(dataset_service.faqs),
        ai_status=ai_status,
        simulate_ai_failure=ai_service.simulate_failure
    )


@app.get("/", tags=["Root"])
async def root():
    return {
        "project": "AI Powered Chatbot for University Student Support",
        "status": "online",
        "docs_url": "/docs",
        "auth_endpoints": {
            "register": "POST /api/auth/register",
            "verify_register_otp": "POST /api/auth/verify-register-otp",
            "login": "POST /api/auth/login",
            "verify_login_otp": "POST /api/auth/verify-login-otp",
            "logout": "POST /api/auth/logout",
            "me": "GET /api/auth/me",
            "forgot_password": "POST /api/auth/forgot-password",
            "verify_forgot_password_otp": "POST /api/auth/verify-forgot-password-otp",
            "reset_password": "POST /api/auth/reset-password",
            "resend_otp": "POST /api/auth/resend-otp"
        },
        "chat_endpoints": {
            "chat": "POST /api/chat",
            "history": "GET /api/chat/history",
            "health": "GET /api/health",
            "faqs": "GET /api/faqs",
            "categories": "GET /api/categories"
        }
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    app_target = "backend.main:app" if Path("backend").exists() else "main:app"
    uvicorn.run(app_target, host="0.0.0.0", port=port, reload=True)
