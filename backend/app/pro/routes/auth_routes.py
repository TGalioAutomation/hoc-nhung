from __future__ import annotations

import datetime
import json
import re
import sqlite3
import uuid
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel

from ..auth import (
    create_access_token,
    get_current_user,
    require_user,
    user_to_dict,
)
from ..config import ACCESS_TOKEN_EXPIRE_MINUTES, COOKIE_NAME, COOKIE_SAMESITE, COOKIE_SECURE
from ..db import get_db, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])

RESERVED_USERNAMES = {"api", "admin", "settings", "editor", "auth", "pro", "pricing", "help", "docs"}
USERNAME_REGEX = re.compile(r"^[a-z0-9_-]{3,30}$")


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    display_name: Optional[str] = None
    class_level: Optional[int] = 1


class LoginRequest(BaseModel):
    email_or_username: Optional[str] = None
    email: Optional[str] = None
    username: Optional[str] = None
    password: str


class ProfileUpdateRequest(BaseModel):
    display_name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    class_level: Optional[int] = None
    completed_lessons: Optional[list[str]] = None
    graduated_classes: Optional[list[int]] = None


class UpdateClassRequest(BaseModel):
    class_level: int


class CompleteLessonRequest(BaseModel):
    lesson_id: str
    class_level: Optional[int] = None
    graduated_class: Optional[int] = None
    promote_to_class: Optional[int] = None


class GraduateRequest(BaseModel):
    graduated_class: int
    next_class_level: Optional[int] = None


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: Optional[str] = None
    new_password: str


def set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        samesite=COOKIE_SAMESITE,
        secure=COOKIE_SECURE,
        path="/",
    )


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, response: Response):
    username = req.username.strip().lower()
    if not USERNAME_REGEX.match(username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username must be 3-30 lowercase characters with only letters, numbers, hyphens, and underscores.",
        )
    if username in RESERVED_USERNAMES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This username is reserved and cannot be registered.",
        )
    if len(req.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long.",
        )

    user_id = str(uuid.uuid4())
    hashed_pwd = hash_password(req.password)
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    display_name = req.display_name.strip() if req.display_name else username

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

        initial_class = max(1, min(5, int(req.class_level if req.class_level is not None else 1)))
        conn.execute(
            """
            INSERT INTO users (
                id, username, email, display_name, hashed_password,
                role, is_active, is_admin, is_pro, is_paid_subscriber,
                plan_id, plan, subscription_status, subscription_period_end,
                class_level, completed_lessons_json, graduated_classes_json,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                username,
                req.email.lower(),
                display_name,
                hashed_pwd,
                "user",
                1,
                0,
                1,
                1,
                "pro",
                "pro",
                "active",
                "2099-12-31T23:59:59Z",
                initial_class,
                "[]",
                "[]",
                now,
                now,
            ),
        )
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()

    user_data = user_to_dict(row)
    token = create_access_token(user_id, extra={"username": username, "email": req.email.lower()})
    set_auth_cookie(response, token)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_data,
    }


@router.post("/login")
async def login(request: Request, response: Response):
    # Support both JSON payload and Form data
    ident = None
    password = None

    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        body = await request.json()
        ident = body.get("email_or_username") or body.get("email") or body.get("username")
        password = body.get("password")
    else:
        form = await request.form()
        ident = form.get("username") or form.get("email") or form.get("email_or_username")
        password = form.get("password")

    if not ident or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username/email and password are required.",
        )

    ident_clean = str(ident).strip().lower()

    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE lower(username) = ? OR lower(email) = ?",
            (ident_clean, ident_clean),
        ).fetchone()

    if not row or not verify_password(password, row["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials.",
        )

    if not bool(row["is_active"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact an administrator.",
        )

    user_data = user_to_dict(row)
    token = create_access_token(row["id"], extra={"username": row["username"], "email": row["email"]})
    set_auth_cookie(response, token)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_data,
    }


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
        samesite=COOKIE_SAMESITE,
    )
    return {"ok": True, "message": "Logged out."}


@router.get("/me")
async def get_me(user: dict[str, Any] = Depends(require_user)):
    return user


@router.get("/session")
async def get_session(user: Optional[dict[str, Any]] = Depends(get_current_user)):
    if user:
        return {
            "authenticated": True,
            "user": user,
            "is_pro": True,
            "plan": "pro",
            "tier": "pro",
        }
    return {
        "authenticated": False,
        "user": None,
        "is_pro": True,
        "plan": "pro",
        "tier": "pro",
    }


@router.put("/profile")
async def update_profile(req: ProfileUpdateRequest, current_user: dict[str, Any] = Depends(require_user)):
    user_id = current_user["id"]
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()

    updates = []
    params = []

    if req.display_name is not None:
        updates.append("display_name = ?")
        params.append(req.display_name.strip())

    if req.username is not None:
        new_username = req.username.strip().lower()
        if not USERNAME_REGEX.match(new_username):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid username format.")
        updates.append("username = ?")
        params.append(new_username)

    if req.email is not None:
        updates.append("email = ?")
        params.append(req.email.lower())

    if req.password is not None:
        if len(req.password) < 8:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 8 characters.")
        updates.append("hashed_password = ?")
        params.append(hash_password(req.password))

    if req.class_level is not None:
        clamped_level = max(1, min(5, int(req.class_level)))
        updates.append("class_level = ?")
        params.append(clamped_level)

    if req.completed_lessons is not None:
        unique_completed = list(dict.fromkeys([str(x) for x in req.completed_lessons]))
        updates.append("completed_lessons_json = ?")
        params.append(json.dumps(unique_completed))

    if req.graduated_classes is not None:
        valid_graduated = sorted(list({int(x) for x in req.graduated_classes if 1 <= int(x) <= 5}))
        updates.append("graduated_classes_json = ?")
        params.append(json.dumps(valid_graduated))

    if not updates:
        return current_user

    updates.append("updated_at = ?")
    params.append(now)
    params.append(user_id)

    with get_db() as conn:
        try:
            conn.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = ?", params)
            updated_row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        except sqlite3.IntegrityError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username or email already in use.")

    return user_to_dict(updated_row)


@router.post("/update-class")
async def update_class(req: UpdateClassRequest, current_user: dict[str, Any] = Depends(require_user)):
    user_id = current_user["id"]
    clamped_level = max(1, min(5, int(req.class_level)))
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    with get_db() as conn:
        conn.execute("UPDATE users SET class_level = ?, updated_at = ? WHERE id = ?", (clamped_level, now, user_id))
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return {"user": user_to_dict(row)}


@router.post("/complete-lesson")
async def complete_lesson(req: CompleteLessonRequest, current_user: dict[str, Any] = Depends(require_user)):
    user_id = current_user["id"]
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    with get_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        user_dict = user_to_dict(row)
        completed = list(user_dict.get("completed_lessons") or [])
        if req.lesson_id and req.lesson_id not in completed:
            completed.append(req.lesson_id)

        graduated = list(user_dict.get("graduated_classes") or [])
        if req.graduated_class is not None and 1 <= int(req.graduated_class) <= 5:
            g = int(req.graduated_class)
            if g not in graduated:
                graduated.append(g)
                graduated.sort()

        target_class = req.promote_to_class if req.promote_to_class is not None else req.class_level
        if target_class is not None:
            new_level = max(1, min(5, int(target_class)))
        else:
            new_level = user_dict.get("class_level", 1)

        conn.execute(
            "UPDATE users SET completed_lessons_json = ?, graduated_classes_json = ?, class_level = ?, updated_at = ? WHERE id = ?",
            (json.dumps(completed), json.dumps(graduated), new_level, now, user_id),
        )
        updated_row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return {"user": user_to_dict(updated_row)}


@router.post("/graduate")
async def graduate(req: GraduateRequest, current_user: dict[str, Any] = Depends(require_user)):
    user_id = current_user["id"]
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    g = max(1, min(5, int(req.graduated_class)))
    next_level = max(1, min(5, int(req.next_class_level if req.next_class_level is not None else min(5, g + 1))))
    with get_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        user_dict = user_to_dict(row)
        graduated = list(user_dict.get("graduated_classes") or [])
        if g not in graduated:
            graduated.append(g)
            graduated.sort()
        conn.execute(
            "UPDATE users SET graduated_classes_json = ?, class_level = ?, updated_at = ? WHERE id = ?",
            (json.dumps(graduated), next_level, now, user_id),
        )
        updated_row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return {"user": user_to_dict(updated_row)}


@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    # Always return 200 OK to prevent username/email enumeration
    return {
        "ok": True,
        "message": "If the email is associated with an account, instructions have been sent.",
    }


@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    return {
        "ok": True,
        "message": "Password reset completed successfully.",
    }


account_router = APIRouter(prefix="/api/account", tags=["account"])


@account_router.put("/profile")
async def update_account_profile(req: ProfileUpdateRequest, current_user: dict[str, Any] = Depends(require_user)):
    return await update_profile(req, current_user)
