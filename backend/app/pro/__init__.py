from __future__ import annotations

import logging
from typing import Any, Optional

from fastapi import FastAPI, Request

from .auth import decode_access_token, extract_token_from_request
from .db import init_db
from .routes.admin_routes import router as admin_router
from .routes.auth_routes import account_router, router as auth_router
from .routes.project_routes import router as project_router
from .routes.pro_routes import router as pro_router

logger = logging.getLogger(__name__)


def register_pro(app: FastAPI) -> None:
    """Register the Velxio Pro backend overlay into the FastAPI application."""
    logger.info("Initializing Velxio Pro overlay with Universal Pro Unlock...")

    # 1. Initialize database & seed default accounts
    try:
        init_db()
    except Exception as exc:
        logger.exception("Failed to initialize Pro database on startup: %r", exc)

    # 2. Mount API Routers
    app.include_router(auth_router)
    app.include_router(account_router)
    app.include_router(admin_router)
    app.include_router(project_router)
    app.include_router(pro_router)

    # 3. Register Extension Hooks
    try:
        from app.core.hooks import (
            register_compile_priority,
            register_get_current_user_id,
            register_iot_gateway_gate,
            register_lifespan_startup,
        )

        async def get_current_user_id_hook(request: Request) -> Optional[str]:
            token = extract_token_from_request(request)
            if not token:
                return None
            payload = decode_access_token(token)
            return payload.get("sub") if payload else None

        register_get_current_user_id(get_current_user_id_hook)

        async def compile_priority_hook(user_id: Optional[str] = None, request: Any = None) -> dict[str, Any]:
            # Always priority 0 (high) and tier 'pro'
            return {"priority": 0, "tier": "pro", "cpu_nice": -10}

        register_compile_priority(compile_priority_hook)

        async def iot_gateway_gate_hook(request: Request) -> Optional[dict[str, Any]]:
            # Return None to allow all IoT gateway traffic without 402 payment required
            return None

        register_iot_gateway_gate(iot_gateway_gate_hook)

        async def lifespan_startup_hook() -> None:
            init_db()

        register_lifespan_startup(lifespan_startup_hook)
        logger.info("Registered app.core.hooks extension hooks successfully.")
    except Exception as exc:
        logger.warning("Could not register app.core.hooks: %r", exc)

    # 4. Register Board Access Gate (Universal Unlock for STM32 and Raspberry Pi QEMU)
    try:
        from app.services.board_access import register_board_access_gate

        async def board_access_gate_hook(websocket: object, board_kind: str) -> bool:
            # Always return True to allow all boards
            return True

        register_board_access_gate(board_access_gate_hook)
        logger.info("Registered board_access_gate allowing all Pro boards.")
    except Exception as exc:
        logger.warning("Could not register board_access_gate: %r", exc)

    logger.info("Velxio Pro overlay registered successfully!")
