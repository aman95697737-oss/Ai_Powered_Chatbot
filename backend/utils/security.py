import bcrypt

def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against its bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False

def hash_otp(otp: str) -> str:
    """Hash an OTP code using bcrypt."""
    salt = bcrypt.gensalt(rounds=10)
    hashed = bcrypt.hashpw(otp.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_otp_hash(plain_otp: str, hashed_otp: str) -> bool:
    """Verify a submitted OTP against its bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_otp.strip().encode("utf-8"),
            hashed_otp.encode("utf-8")
        )
    except Exception:
        return False
