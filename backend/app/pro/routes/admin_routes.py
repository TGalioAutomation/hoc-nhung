from __future__ import annotations

import datetime
import re
import sqlite3
import uuid
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from ..auth import require_user, user_to_dict
from ..db import get_db, hash_password

router = APIRouter(prefix="/api/admin", tags=["admin"])

USERNAME_REGEX = re.compile(r"^[a-z0-9_-]{3,30}$")


class AdminCreateUserRequest(BaseModel):
    username: str
    email: str
    password: str
    display_name: Optional[str] = None
    role: Optional[str] = "user"
    is_admin: Optional[bool] = False
    is_active: Optional[bool] = True
    is_pro: Optional[bool] = True
    plan: Optional[str] = "pro"


class AdminUpdateUserRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    display_name: Optional[str] = None
    role: Optional[str] = None
    is_admin: Optional[bool] = None
    is_active: Optional[bool] = None
    is_pro: Optional[bool] = None
    plan: Optional[str] = None


class AdminResetPasswordRequest(BaseModel):
    new_password: str


async def check_admin_access(current_user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    """Ensure caller is authenticated and possesses verified admin privileges."""
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required.",
        )
    return current_user


@router.get("/users")
async def list_users(admin: dict[str, Any] = Depends(check_admin_access)):
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM users ORDER BY created_at ASC").fetchall()
        return [user_to_dict(r) for r in rows]


@router.post("/users", status_code=status.HTTP_201_CREATED)
async def create_user(req: AdminCreateUserRequest, admin: dict[str, Any] = Depends(check_admin_access)):
    username = req.username.strip().lower()
    if not USERNAME_REGEX.match(username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username must be 3-30 lowercase characters with only letters, numbers, hyphens, and underscores.",
        )
    if len(req.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters.",
        )

    user_id = str(uuid.uuid4())
    hashed_pwd = hash_password(req.password)
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    display_name = req.display_name.strip() if req.display_name else username
    role = req.role if req.role else ("admin" if req.is_admin else "user")

    with get_db() as conn:
        existing = conn.execute(
            "SELECT username, email FROM users WHERE username = ? OR email = ?",
            (username, req.email.lower()),
        ).fetchone()
        if existing:
            if existing["username"].lower() == username:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username is already taken.")
            else:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered.")

        conn.execute(
            """
            INSERT INTO users (
                id, username, email, display_name, hashed_password,
                role, is_active, is_admin, is_pro, is_paid_subscriber,
                plan_id, plan, subscription_status, subscription_period_end,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                username,
                req.email.lower(),
                display_name,
                hashed_pwd,
                role,
                1 if req.is_active is not False else 0,
                1 if req.is_admin else 0,
                1,
                1,
                req.plan or "pro",
                req.plan or "pro",
                "active",
                "2099-12-31T23:59:59Z",
                now,
                now,
            ),
        )
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()

    return user_to_dict(row)


@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    req: AdminUpdateUserRequest,
    admin: dict[str, Any] = Depends(check_admin_access),
):
    with get_db() as conn:
        existing = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not existing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        # Prevent removing last admin
        if req.is_admin is False and bool(existing["is_admin"]):
            admin_count = conn.execute("SELECT count(*) as count FROM users WHERE is_admin = 1 AND is_active = 1").fetchone()["count"]
            if admin_count <= 1:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot demote the last remaining active administrator.")

        updates = []
        params = []

        if req.username is not None:
            uname = req.username.strip().lower()
            if not USERNAME_REGEX.match(uname):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid username format.")
            updates.append("username = ?")
            params.append(uname)

        if req.email is not None:
            updates.append("email = ?")
            params.append(req.email.lower())

        if req.display_name is not None:
            updates.append("display_name = ?")
            params.append(req.display_name.strip())

        if req.role is not None:
            updates.append("role = ?")
            params.append(req.role.strip())

        if req.is_admin is not None:
            updates.append("is_admin = ?")
            params.append(1 if req.is_admin else 0)

        if req.is_active is not None:
            # Prevent deactivating last admin
            if req.is_active is False and bool(existing["is_admin"]):
                admin_count = conn.execute("SELECT count(*) as count FROM users WHERE is_admin = 1 AND is_active = 1").fetchone()["count"]
                if admin_count <= 1:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot deactivate the last remaining administrator.")
            updates.append("is_active = ?")
            params.append(1 if req.is_active else 0)

        if req.is_pro is not None:
            updates.append("is_pro = ?")
            params.append(1 if req.is_pro else 0)

        if req.plan is not None:
            updates.append("plan = ?")
            params.append(req.plan)
            updates.append("plan_id = ?")
            params.append(req.plan)

        if not updates:
            return user_to_dict(existing)

        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        updates.append("updated_at = ?")
        params.append(now)
        params.append(user_id)

        try:
            conn.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = ?", params)
            updated_row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        except sqlite3.IntegrityError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username or email already in use.")

    return user_to_dict(updated_row)


@router.post("/users/{user_id}/reset-password")
async def admin_reset_password(
    user_id: str,
    req: AdminResetPasswordRequest,
    admin: dict[str, Any] = Depends(check_admin_access),
):
    if len(req.new_password) < 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 6 characters.")

    with get_db() as conn:
        existing = conn.execute("SELECT id FROM users WHERE id = ?", (user_id,)).fetchone()
        if not existing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        hashed_pwd = hash_password(req.new_password)
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        conn.execute("UPDATE users SET hashed_password = ?, updated_at = ? WHERE id = ?", (hashed_pwd, now, user_id))

    return {"ok": True, "message": "Password reset successfully."}


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin: dict[str, Any] = Depends(check_admin_access)):
    with get_db() as conn:
        existing = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not existing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        # Prevent deleting the last administrator
        if bool(existing["is_admin"]):
            admin_count = conn.execute("SELECT count(*) as count FROM users WHERE is_admin = 1").fetchone()["count"]
            if admin_count <= 1:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete the last remaining administrator.")

        conn.execute("DELETE FROM users WHERE id = ?", (user_id,)).fetchone()

    return {"ok": True, "message": "User deleted successfully."}
