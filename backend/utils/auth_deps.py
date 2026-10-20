import os
import logging
from typing import Optional
from fastapi import Request, HTTPException, status, Depends
from backend.utils.jwt import decode_access_token
from backend.database.mongodb import db_manager

logger = logging.getLogger("UniAssistAI.AuthDeps")

async def get_optional_current_user(request: Request) -> Optional[dict]:
    """
    Extract current authenticated user if token is present in cookie or Authorization header.
    Returns None if unauthenticated.
    """
    token = None
    
    # 1. Prefer HTTP-only secure cookie
    if "access_token" in request.cookies:
        token = request.cookies.get("access_token")
    
    # 2. Check Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        return None

    payload = decode_access_token(token)
    if not payload:
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    users_col = db_manager.users
    user = await users_col.find_one({"_id": user_id})
    if not user:
        # Check by stringified _id or email
        user = await users_col.find_one({"email": payload.get("email")})

    if not user:
        return None

    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "is_verified": user.get("is_verified", True),
        "created_at": str(user.get("created_at", ""))
    }


async def get_current_user(user: Optional[dict] = Depends(get_optional_current_user)) -> dict:
    """
    Dependency requiring an authenticated user.
    Raises HTTP 401 if missing or invalid.
    """
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in to access this resource.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return user
