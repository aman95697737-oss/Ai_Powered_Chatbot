from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full Name of the student")
    email: str = Field(..., description="Valid university or personal email")
    password: str = Field(..., min_length=6, max_length=100, description="Password with minimum 6 characters")
    confirm_password: str = Field(..., min_length=6, max_length=100)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Full Name cannot be empty")
        return v

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v or "." not in v:
            raise ValueError("Please provide a valid email address")
        return v

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Confirm password does not match password")
        return v

class VerifyRegisterOtpRequest(BaseModel):
    email: str
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit verification OTP")

class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def clean_email(cls, v: str) -> str:
        return v.strip().lower()

class VerifyLoginOtpRequest(BaseModel):
    email: str
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit verification OTP")

class ForgotPasswordRequest(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def clean_email(cls, v: str) -> str:
        return v.strip().lower()

class VerifyForgotPasswordOtpRequest(BaseModel):
    email: str
    otp: str = Field(..., min_length=6, max_length=6)

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=6, max_length=100)
    confirm_password: str = Field(..., min_length=6, max_length=100)

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if "new_password" in info.data and v != info.data["new_password"]:
            raise ValueError("Confirm password does not match new password")
        return v

class ResendOtpRequest(BaseModel):
    email: str
    purpose: str = Field(default="register", description="'register', 'login', or 'forgot_password'")

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    is_verified: bool
    created_at: Optional[str] = None

class AuthResponse(BaseModel):
    success: bool
    message: str
    requires_otp: Optional[bool] = None
    email: Optional[str] = None
    purpose: Optional[str] = None
    user: Optional[UserResponse] = None
    token: Optional[str] = None
    dev_otp: Optional[str] = None

class MeResponse(BaseModel):
    authenticated: bool
    user: Optional[UserResponse] = None

class ChatHistoryItem(BaseModel):
    id: str
    question: str
    answer: str
    timestamp: str
    category: Optional[str] = None
    source: Optional[str] = None
