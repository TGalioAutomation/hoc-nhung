from __future__ import annotations

import datetime
import logging
from typing import Any, Optional

import jwt
from fastapi import HTTPException, Request, status

from .config import ACCESS_TOKEN_EXPIRE_MINUTES, COOKIE_NAME, SECRET_KEY
from .db import get_db

logger = logging.getLogger(__name__)


def create_access_token(user_id: str, extra: Optional[dict[str, Any]] = None) -> str:
    """Create a signed HS256 JWT access token."""
    now = datetime.datetime.now(datetime.timezone.utc)
    expire = now + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "exp": expire,
        "iat": now,
        "is_pro": True,
        "plan": "pro",
    }
    if extra:
        payload.update(extra)
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def decode_access_token(token: str) -> Optional[dict[str, Any]]:
    """Decode and validate a JWT access token. Returns payload dict or None."""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except (jwt.PyJWTError, Exception) as exc:
        logger.debug("Failed to decode token: %r", exc)
        return None


def user_to_dict(row: Any) -> dict[str, Any]:
    """Serialize a SQLite user row to a standard API dict with Universal Pro Unlock."""
    d = dict(row)
    d.pop("hashed_password", None)
    d["is_admin"] = bool(d.get("is_admin", 0))
    d["is_active"] = bool(d.get("is_active", 1))

    # Universal Pro Unlock Invariants
    d["is_pro"] = True
    d["is_paid_subscriber"] = True
    d["plan"] = "pro"
    d["plan_id"] = "pro"
    d["tier"] = "pro"
    d["subscription_status"] = "active"
    d["subscription_period_end"] = d.get("subscription_period_end") or "2099-12-31T23:59:59Z"
    return d


def extract_token_from_request(request: Request) -> Optional[str]:
    """Extract JWT token from Authorization header or HttpOnly cookie."""
    # 1. Check Authorization Bearer header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
        if token:
            return token

    # 2. Check Cookie
    cookie_token = request.cookies.get(COOKIE_NAME)
    if cookie_token:
        return cookie_token

    return None


async def get_current_user(request: Request) -> Optional[dict[str, Any]]:
    """Resolve current user from request without throwing (returns None for guests)."""
    token = extract_token_from_request(request)
    if not token:
        return None

    payload = decode_access_token(token)
    if not payload:
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    try:
        with get_db() as conn:
            row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
            if row and bool(row["is_active"]):
                return user_to_dict(row)
    except Exception as exc:
        logger.error("Database error during user resolution: %r", exc)

    return None


async def require_user(request: Request) -> dict[str, Any]:
    """Dependency that requires an authenticated, active user (raises 401)."""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def require_admin(request: Request) -> dict[str, Any]:
    """Dependency that requires an active admin user (raises 403)."""
    user = await require_user(request)
    if not user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return user
