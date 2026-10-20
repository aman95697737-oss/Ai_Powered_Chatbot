import os
import logging
from fastapi import APIRouter, Response, Request, Depends, HTTPException, status
from backend.models.auth_schemas import (
    RegisterRequest,
    VerifyRegisterOtpRequest,
    LoginRequest,
    VerifyLoginOtpRequest,
    ForgotPasswordRequest,
    VerifyForgotPasswordOtpRequest,
    ResetPasswordRequest,
    ResendOtpRequest,
    AuthResponse,
    MeResponse,
    UserResponse
)
from backend.services.auth_service import auth_service
from backend.utils.auth_deps import get_optional_current_user, get_current_user

logger = logging.getLogger("UniAssistAI.AuthRouter")

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() in ("true", "1")
COOKIE_MAX_AGE = int(os.getenv("JWT_EXPIRATION_HOURS", "24")) * 3600

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def register(req: RegisterRequest):
    """Register student details and dispatch 6-digit OTP verification code."""
    res = await auth_service.register_initiate(req)
    return AuthResponse(
        success=True,
        message=res["message"],
        requires_otp=True,
        email=res["email"],
        purpose="register",
        dev_otp=res.get("dev_otp")
    )

@router.post("/verify-register-otp", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def verify_register_otp(req: VerifyRegisterOtpRequest, response: Response):
    """
    Verify registration OTP, activate student account, issue secure session cookie,
    and automatically log in without requiring a separate login step.
    """
    user_data, token = await auth_service.verify_register_otp(req.email, req.otp)

    # Set secure HTTP-only cookie for immediate session access
    response.set_cookie(
        key="access_token",
        value=token,
        max_age=COOKIE_MAX_AGE,
        httponly=True,
        samesite="lax",
        secure=COOKIE_SECURE,
        path="/"
    )

    user_resp = UserResponse(
        id=user_data["id"],
        name=user_data["name"],
        email=user_data["email"],
        is_verified=user_data["is_verified"],
        created_at=user_data.get("created_at")
    )

    return AuthResponse(
        success=True,
        message=f"Welcome to UniAssist AI, {user_data['name']}! Your account is verified and you are now logged in.",
        requires_otp=False,
        email=req.email,
        user=user_resp,
        token=token
    )

@router.post("/login", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def login(req: LoginRequest):
    """Validate credentials and dispatch login OTP. Requires OTP before session creation."""
    res = await auth_service.login_initiate(req)
    return AuthResponse(
        success=True,
        message=res["message"],
        requires_otp=True,
        email=res["email"],
        purpose="login",
        dev_otp=res.get("dev_otp")
    )

@router.post("/verify-login-otp", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def verify_login_otp(req: VerifyLoginOtpRequest, response: Response):
    """
    Verify login OTP, issue secure HTTP-only JWT cookie, and return authenticated student info.
    """
    user_data, token = await auth_service.verify_login_otp(req.email, req.otp)

    # Set secure HTTP-only cookie
    response.set_cookie(
        key="access_token",
        value=token,
        max_age=COOKIE_MAX_AGE,
        httponly=True,
        samesite="lax",
        secure=COOKIE_SECURE,
        path="/"
    )

    user_resp = UserResponse(
        id=user_data["id"],
        name=user_data["name"],
        email=user_data["email"],
        is_verified=user_data["is_verified"],
        created_at=user_data.get("created_at")
    )

    return AuthResponse(
        success=True,
        message=f"Welcome back, {user_data['name']}! Login successful.",
        requires_otp=False,
        user=user_resp,
        token=token
    )

@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(response: Response):
    """Clear authentication cookie and invalidate session."""
    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=True,
        samesite="lax"
    )
    return {
        "success": True,
        "message": "Logged out successfully."
    }

@router.get("/me", response_model=MeResponse, status_code=status.HTTP_200_OK)
async def get_current_user_profile(user: dict = Depends(get_optional_current_user)):
    """Retrieve current authenticated user session."""
    if not user:
        return MeResponse(authenticated=False, user=None)
    
    return MeResponse(
        authenticated=True,
        user=UserResponse(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            is_verified=user["is_verified"],
            created_at=user.get("created_at")
        )
    )

@router.post("/forgot-password", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def forgot_password(req: ForgotPasswordRequest):
    """Initiate password recovery flow and send OTP code."""
    res = await auth_service.forgot_password_initiate(req.email)
    return AuthResponse(
        success=True,
        message=res["message"],
        requires_otp=True,
        email=res["email"],
        purpose="forgot_password",
        dev_otp=res.get("dev_otp")
    )

@router.post("/verify-forgot-password-otp", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def verify_forgot_password_otp(req: VerifyForgotPasswordOtpRequest):
    """Verify password reset OTP."""
    res = await auth_service.verify_forgot_password_otp(req.email, req.otp)
    return AuthResponse(
        success=True,
        message=res["message"],
        requires_otp=False,
        email=req.email
    )

@router.post("/reset-password", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def reset_password(req: ResetPasswordRequest):
    """Verify OTP and update user's password."""
    res = await auth_service.reset_password(req)
    return AuthResponse(
        success=True,
        message=res["message"],
        requires_otp=False,
        email=req.email
    )

@router.post("/resend-otp", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def resend_otp(req: ResendOtpRequest):
    """Resend a fresh OTP for registration, login, or forgot-password."""
    res = await auth_service.resend_otp(req.email, req.purpose)
    return AuthResponse(
        success=True,
        message=res["message"],
        requires_otp=True,
        email=res["email"],
        purpose=req.purpose,
        dev_otp=res.get("dev_otp")
    )
