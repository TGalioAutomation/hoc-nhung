from __future__ import annotations

import os
from pathlib import Path

# Data directory path with fallbacks
raw_data_dir = os.environ.get("DATA_DIR", "/app/data")
data_dir_candidate = Path(raw_data_dir)
try:
    data_dir_candidate.mkdir(parents=True, exist_ok=True)
    DATA_DIR = data_dir_candidate
except Exception:
    DATA_DIR = Path("./data")
    DATA_DIR.mkdir(parents=True, exist_ok=True)

PROJECTS_DIR = DATA_DIR / "projects"
PROJECTS_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = DATA_DIR / "velxio_accounts.db"

# Secret Key resolution
SECRET_KEY = os.environ.get("SECRET_KEY")
if not SECRET_KEY:
    secret_file = DATA_DIR / ".secret_key"
    if secret_file.exists():
        try:
            SECRET_KEY = secret_file.read_text().strip()
        except Exception:
            SECRET_KEY = None
    if not SECRET_KEY:
        import secrets
        SECRET_KEY = secrets.token_urlsafe(48)
        try:
            secret_file.write_text(SECRET_KEY)
        except Exception:
            pass

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))  # 7 days
COOKIE_NAME = "access_token"
COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "false").lower() in ("true", "1")
COOKIE_SAMESITE = "lax"
