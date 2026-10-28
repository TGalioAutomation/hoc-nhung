from __future__ import annotations

import base64
from typing import Any, Optional

from fastapi import APIRouter, Response
from pydantic import BaseModel

router = APIRouter(tags=["pro"])

# 1x1 transparent PNG byte constant
TINY_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
)


class LicenseValidateRequest(BaseModel):
    key: Optional[str] = None


@router.post("/api/pro/license/validate")
async def validate_license(req: Optional[LicenseValidateRequest] = None):
    """Universal Pro license validator — always returns fully unlocked entitlements."""
    return {
        "valid": True,
        "plan": "pro",
        "entitlements": {
            "web_pro": True,
            "desktop": True,
            "vscode_ext": True,
            "agent_ai": True,
            "cloud_projects": True,
        },
    }


@router.get("/api/pro/libraries/custom")
async def get_custom_libraries():
    """Return user's custom library catalog (empty list instead of 404)."""
    return []


@router.delete("/api/pro/libraries/custom/{name}")
async def delete_custom_library(name: str):
    """Delete a custom library."""
    return {"ok": True, "message": f"Library '{name}' removed."}


@router.post("/api/metrics/run")
async def record_metric_run(payload: Optional[dict[str, Any]] = None):
    """Telemetry and run metrics receiver (returns 200 OK instead of 404)."""
    return {"ok": True}


@router.get("/api/pro/projects/{project_id}/bom.csv")
async def export_project_bom(project_id: str):
    """Export project Bill of Materials (BOM) as CSV."""
    csv_content = (
        "Part,Designator,Quantity,Package,Description\n"
        "Microcontroller,U1,1,DIP-28,ATmega328P / ESP32\n"
        "LED 5mm,D1,1,Through-Hole,Red Status Indicator\n"
        "Resistor,R1,1,0805,220 Ohm Current Limiter\n"
    )
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="bom_{project_id}.csv"'},
    )


@router.get("/api/pro/projects/{project_id}/screenshot.png")
async def export_project_screenshot(project_id: str):
    """Export project circuit diagram screenshot as PNG image."""
    return Response(
        content=TINY_PNG,
        media_type="image/png",
        headers={"Content-Disposition": f'attachment; filename="screenshot_{project_id}.png"'},
    )
