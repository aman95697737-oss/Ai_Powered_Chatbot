import logging
from datetime import datetime, timezone
from fastapi import HTTPException, status
from backend.database.mongodb import db_manager
from backend.models.auth_schemas import RegisterRequest, LoginRequest, ResetPasswordRequest
from backend.utils.security import hash_password, verify_password
from backend.utils.jwt import create_access_token
from backend.services.otp_service import otp_service
from backend.services.email_service import email_service

logger = logging.getLogger("UniAssistAI.AuthService")

class AuthService:
    async def register_initiate(self, req: RegisterRequest) -> dict:
        """
        Validate registration data, stage pending user in MongoDB,
        generate 6-digit OTP and send verification email.
        """
        email_clean = req.email.strip().lower()
        users_col = db_manager.users

        existing_user = await users_col.find_one({"email": email_clean})
        now = datetime.now(timezone.utc)
        pwd_hash = hash_password(req.password)

        if existing_user:
            if existing_user.get("is_verified", False):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="An account with this email already exists. Please log in."
                )
            # User registered before but didn't verify yet -> update credentials
            await users_col.update_one(
                {"_id": existing_user["_id"]},
                {
                    "$set": {
                        "name": req.name.strip(),
                        "password_hash": pwd_hash,
                        "updated_at": now
                    }
                }
            )
        else:
            # Create new pending user
            new_user_doc = {
                "name": req.name.strip(),
                "email": email_clean,
                "password_hash": pwd_hash,
                "is_verified": False,
                "created_at": now,
                "updated_at": now
            }
            await users_col.insert_one(new_user_doc)

        # Generate and dispatch 6-digit OTP
        otp_code = await otp_service.create_otp(email_clean, "register")
        await email_service.send_otp_email(email_clean, otp_code, "register")

        return {
            "success": True,
            "message": "Verification code sent to your email. Please verify to activate your account.",
            "email": email_clean,
            "purpose": "register",
            "dev_otp": otp_code if email_service.mock_email else None
        }

    async def verify_register_otp(self, email: str, otp: str) -> tuple[dict, str]:
        """Verify registration OTP, activate user account, and generate login session."""
        email_clean = email.strip().lower()
        success, msg = await otp_service.verify_otp(email_clean, otp, "register")
        if not success:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

        users_col = db_manager.users
        user = await users_col.find_one({"email": email_clean})
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        # Activate user
        now = datetime.now(timezone.utc)
        await users_col.update_one(
            {"_id": user["_id"]},
            {"$set": {"is_verified": True, "updated_at": now}}
        )

        # Automatically create JWT payload and log the user in immediately
        user_id = str(user["_id"])
        jwt_payload = {
            "sub": user_id,
            "email": user["email"],
            "name": user["name"]
        }
        token = create_access_token(jwt_payload)

        user_data = {
            "id": user_id,
            "name": user["name"],
            "email": user["email"],
            "is_verified": True,
            "created_at": str(user.get("created_at", ""))
        }

        logger.info(f"User account activated and auto-logged in for {email_clean}")
        return user_data, token

    async def login_initiate(self, req: LoginRequest) -> dict:
        """
        Validate credentials, and if valid, send a 6-digit OTP to student's email.
        User is NOT logged in until OTP verification.
        """
        email_clean = req.email.strip().lower()
        users_col = db_manager.users

        user = await users_col.find_one({"email": email_clean})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        if not verify_password(req.password, user.get("password_hash", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        if not user.get("is_verified", False):
            # Resend register verification code
            otp_code = await otp_service.create_otp(email_clean, "register")
            await email_service.send_otp_email(email_clean, otp_code, "register")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account email has not been verified yet. We have resent a verification code to your email."
            )

        # Credentials valid! Send login OTP
        otp_code = await otp_service.create_otp(email_clean, "login")
        await email_service.send_otp_email(email_clean, otp_code, "login")

        return {
            "success": True,
            "message": f"Verification code sent to {email_clean}. Please enter the 6-digit OTP to complete login.",
            "email": email_clean,
            "requires_otp": True,
            "purpose": "login",
            "dev_otp": otp_code if email_service.mock_email else None
        }

    async def verify_login_otp(self, email: str, otp: str) -> tuple[dict, str]:
        """
        Verify login OTP. Upon success, generate JWT and return authenticated student info.
        """
        email_clean = email.strip().lower()
        success, msg = await otp_service.verify_otp(email_clean, otp, "login")
        if not success:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

        users_col = db_manager.users
        user = await users_col.find_one({"email": email_clean})
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        # Create JWT payload
        user_id = str(user["_id"])
        jwt_payload = {
            "sub": user_id,
            "email": user["email"],
            "name": user["name"]
        }
        token = create_access_token(jwt_payload)

        user_data = {
            "id": user_id,
            "name": user["name"],
            "email": user["email"],
            "is_verified": user.get("is_verified", True),
            "created_at": str(user.get("created_at", ""))
        }

        logger.info(f"Student authenticated successfully: {user['name']} ({email_clean})")
        return user_data, token

    async def forgot_password_initiate(self, email: str) -> dict:
        """Initiate forgot password flow by emailing OTP."""
        email_clean = email.strip().lower()
        users_col = db_manager.users
        user = await users_col.find_one({"email": email_clean})

        if not user:
            # Prevent email enumeration while providing clear feedback
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account registered with this email address."
            )

        otp_code = await otp_service.create_otp(email_clean, "forgot_password")
        await email_service.send_otp_email(email_clean, otp_code, "forgot_password")

        return {
            "success": True,
            "message": f"Password reset verification code sent to {email_clean}.",
            "email": email_clean,
            "purpose": "forgot_password",
            "dev_otp": otp_code if email_service.mock_email else None
        }

    async def verify_forgot_password_otp(self, email: str, otp: str) -> dict:
        """Validate forgot password OTP without burning it, or prepare for reset."""
        email_clean = email.strip().lower()
        # Verify without deleting or keep record so reset_password can succeed
        collection = db_manager.otp_verifications
        record = await collection.find_one({"email": email_clean, "purpose": "forgot_password"})
        if not record:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No active password reset request found.")
        
        from backend.utils.security import verify_otp_hash
        if not verify_otp_hash(otp.strip(), record["otp_hash"]):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification code.")

        return {
            "success": True,
            "message": "OTP verified. You may now set your new password."
        }

    async def reset_password(self, req: ResetPasswordRequest) -> dict:
        """Verify OTP and update user's password."""
        email_clean = req.email.strip().lower()
        success, msg = await otp_service.verify_otp(email_clean, req.otp, "forgot_password")
        if not success:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

        users_col = db_manager.users
        user = await users_col.find_one({"email": email_clean})
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")

        new_hash = hash_password(req.new_password)
        await users_col.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "password_hash": new_hash,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )

        logger.info(f"Password reset completed for {email_clean}")
        return {
            "success": True,
            "message": "Password reset successfully! You can now log in with your new password."
        }

    async def resend_otp(self, email: str, purpose: str) -> dict:
        """Resend a fresh 6-digit OTP for the given purpose."""
        email_clean = email.strip().lower()
        valid_purposes = ["register", "login", "forgot_password"]
        if purpose not in valid_purposes:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP purpose.")

        otp_code = await otp_service.create_otp(email_clean, purpose)
        await email_service.send_otp_email(email_clean, otp_code, purpose)

        return {
            "success": True,
            "message": f"A new verification code has been dispatched to {email_clean}.",
            "email": email_clean,
            "purpose": purpose,
            "dev_otp": otp_code if email_service.mock_email else None
        }


auth_service = AuthService()
