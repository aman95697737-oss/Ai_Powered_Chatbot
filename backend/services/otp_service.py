import random
import logging
from datetime import datetime, timedelta, timezone
from backend.database.mongodb import db_manager
from backend.utils.security import hash_otp, verify_otp_hash

logger = logging.getLogger("UniAssistAI.OtpService")

OTP_EXPIRY_MINUTES = 5
MAX_OTP_ATTEMPTS = 5

class OtpService:
    @staticmethod
    def generate_otp() -> str:
        """Generate a random 6-digit numeric OTP."""
        return f"{random.randint(100000, 999999)}"

    async def create_otp(self, email: str, purpose: str) -> str:
        """
        Generate, hash, and store OTP in otp_verifications collection.
        Invalidates any previous active OTP for the same email and purpose.
        Returns the plaintext OTP to be sent via email.
        """
        email_clean = email.strip().lower()
        otp_code = self.generate_otp()
        hashed = hash_otp(otp_code)
        
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(minutes=OTP_EXPIRY_MINUTES)

        collection = db_manager.otp_verifications

        # Invalidate/delete any previous OTPs for this email and purpose
        await collection.delete_many({
            "email": email_clean,
            "purpose": purpose
        })

        # Insert new verification record
        doc = {
            "email": email_clean,
            "otp_hash": hashed,
            "purpose": purpose,
            "expires_at": expires_at,
            "attempts": 0,
            "created_at": now
        }
        await collection.insert_one(doc)
        logger.info(f"Stored hashed OTP for {email_clean} (purpose: {purpose}, expires: {expires_at})")
        return otp_code

    async def verify_otp(self, email: str, otp_code: str, purpose: str) -> tuple[bool, str]:
        """
        Verify submitted OTP against database record.
        Returns (success: bool, message: str).
        """
        email_clean = email.strip().lower()
        clean_otp = otp_code.strip()
        collection = db_manager.otp_verifications

        record = await collection.find_one({
            "email": email_clean,
            "purpose": purpose
        })

        if not record:
            return False, "No active verification code found for this email. Please request a new code."

        now = datetime.now(timezone.utc)
        expires_at = record.get("expires_at")
        
        # Handle string or datetime for expires_at
        if isinstance(expires_at, str):
            try:
                expires_at = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
            except Exception:
                pass
        
        if expires_at and expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if expires_at and now > expires_at:
            await collection.delete_one({"_id": record["_id"]})
            return False, "Verification code has expired. Please request a new code."

        attempts = record.get("attempts", 0)
        if attempts >= MAX_OTP_ATTEMPTS:
            await collection.delete_one({"_id": record["_id"]})
            return False, "Maximum verification attempts exceeded. Please request a new code."

        # Check bcrypt hash match
        is_valid = verify_otp_hash(clean_otp, record["otp_hash"])
        if not is_valid:
            new_attempts = attempts + 1
            await collection.update_one(
                {"_id": record["_id"]},
                {"$set": {"attempts": new_attempts}}
            )
            remaining = MAX_OTP_ATTEMPTS - new_attempts
            if remaining <= 0:
                await collection.delete_one({"_id": record["_id"]})
                return False, "Invalid code. Maximum attempts exceeded. Please request a new code."
            return False, f"Invalid verification code. {remaining} attempt(s) remaining."

        # OTP is valid! Remove OTP record to prevent reuse
        await collection.delete_one({"_id": record["_id"]})
        return True, "Verification code confirmed successfully."


otp_service = OtpService()
