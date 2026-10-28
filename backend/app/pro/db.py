from __future__ import annotations

import datetime
import hashlib
import hmac
import logging
import secrets
import sqlite3
import uuid
from contextlib import contextmanager
from typing import Generator

from .config import DB_PATH

logger = logging.getLogger(__name__)


def hash_password(password: str) -> str:
    """Hash a password using PBKDF2-HMAC-SHA256 with a 16-byte random salt."""
    salt = secrets.token_bytes(16)
    iterations = 100_000
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return f"pbkdf2_sha256${iterations}${salt.hex()}${dk.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the stored PBKDF2 hash."""
    try:
        parts = hashed_password.split("$")
        if len(parts) == 4 and parts[0] == "pbkdf2_sha256":
            iterations = int(parts[1])
            salt = bytes.fromhex(parts[2])
            expected_dk = bytes.fromhex(parts[3])
            actual_dk = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, iterations)
            return hmac.compare_digest(actual_dk, expected_dk)
    except Exception as exc:
        logger.warning("Error verifying password: %r", exc)
        return False
    return False


@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    """Yield a SQLite connection in WAL mode with row_factory=sqlite3.Row."""
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False, timeout=10.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    """Initialize database tables and seed default admin and student accounts."""
    with get_db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                display_name TEXT,
                hashed_password TEXT NOT NULL,
                avatar_url TEXT,
                role TEXT DEFAULT 'user',
                is_active INTEGER DEFAULT 1,
                is_admin INTEGER DEFAULT 0,
                is_pro INTEGER DEFAULT 1,
                is_paid_subscriber INTEGER DEFAULT 1,
                plan_id TEXT DEFAULT 'pro',
                plan TEXT DEFAULT 'pro',
                subscription_status TEXT DEFAULT 'active',
                subscription_period_end TEXT DEFAULT '2099-12-31T23:59:59Z',
                created_at TEXT,
                updated_at TEXT
            )
            """
        )

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                slug TEXT NOT NULL,
                description TEXT,
                is_public INTEGER DEFAULT 1,
                visibility TEXT DEFAULT 'public',
                board_type TEXT DEFAULT 'arduino-uno',
                components_json TEXT DEFAULT '[]',
                wires_json TEXT DEFAULT '[]',
                boards_json TEXT DEFAULT '[]',
                libraries_json TEXT DEFAULT '[]',
                files_json TEXT DEFAULT '[]',
                code TEXT DEFAULT '',
                created_at TEXT,
                updated_at TEXT,
                UNIQUE(user_id, slug),
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )

        # Seed default Admin account
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        admin_row = conn.execute("SELECT id FROM users WHERE username = 'admin' OR email = 'admin@velxio.local'").fetchone()
        if not admin_row:
            admin_id = str(uuid.uuid4())
            admin_hash = hash_password("admin123")
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
                    admin_id,
                    "admin",
                    "admin@velxio.local",
                    "Quản Trị Viên Velxio",
                    admin_hash,
                    "admin",
                    1,
                    1,
                    1,
                    1,
                    "pro",
                    "pro",
                    "active",
                    "2099-12-31T23:59:59Z",
                    now,
                    now,
                ),
            )
            logger.info("Seeded default Admin account: admin@velxio.local")

        # Seed default Student demo account
        student_row = conn.execute("SELECT id FROM users WHERE username = 'hocsinh' OR email = 'hocsinh@velxio.local'").fetchone()
        if not student_row:
            student_id = str(uuid.uuid4())
            student_hash = hash_password("hocsinh123")
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
                    student_id,
                    "hocsinh",
                    "hocsinh@velxio.local",
                    "Học Sinh Demo",
                    student_hash,
                    "student",
                    1,
                    0,
                    1,
                    1,
                    "pro",
                    "pro",
                    "active",
                    "2099-12-31T23:59:59Z",
                    now,
                    now,
                ),
            )
            logger.info("Seeded default Student demo account: hocsinh@velxio.local")
