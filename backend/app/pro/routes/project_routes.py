from __future__ import annotations

import datetime
import json
import logging
import re
import shutil
import uuid
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel

from ..auth import get_current_user
from ..config import PROJECTS_DIR
from ..db import get_db

logger = logging.getLogger(__name__)

router = APIRouter(tags=["projects"])


class SketchFile(BaseModel):
    name: str
    content: str


class FileGroup(BaseModel):
    groupId: str
    files: list[SketchFile] = []


class ProjectCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    is_public: Optional[bool] = True
    visibility: Optional[str] = "public"
    board_type: Optional[str] = "arduino-uno"
    age_group: Optional[str] = "all"
    tags: Optional[list[str]] = None
    tags_json: Optional[str] = "[]"
    components_json: Optional[str] = "[]"
    wires_json: Optional[str] = "[]"
    boards_json: Optional[str] = "[]"
    libraries_json: Optional[str] = "[]"
    files: Optional[list[SketchFile]] = None
    file_groups: Optional[list[FileGroup]] = None
    code: Optional[str] = ""


class ProjectUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None
    visibility: Optional[str] = None
    board_type: Optional[str] = None
    age_group: Optional[str] = None
    tags: Optional[list[str]] = None
    tags_json: Optional[str] = None
    components_json: Optional[str] = None
    wires_json: Optional[str] = None
    boards_json: Optional[str] = None
    libraries_json: Optional[str] = None
    files: Optional[list[SketchFile]] = None
    file_groups: Optional[list[FileGroup]] = None
    code: Optional[str] = None


class ProjectForkRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None
    visibility: Optional[str] = None


def slugify(text: str) -> str:
    """Convert text to URL-friendly lowercase slug."""
    s = text.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_-]+", "-", s)
    s = s.strip("-")
    return s or "project"


def save_project_files_to_disk(project_id: str, files: list[SketchFile], file_groups: list[FileGroup]) -> None:
    """Save project sketch files to physical storage on disk."""
    pdir = PROJECTS_DIR / project_id
    pdir.mkdir(parents=True, exist_ok=True)

    # Save legacy flat files
    for f in files:
        safe_name = Path(f.name).name
        target = pdir / safe_name
        target.write_text(f.content, encoding="utf-8")

    # Save multi-board group files
    for g in file_groups:
        safe_group_id = re.sub(r"[^a-zA-Z0-9_-]", "", g.groupId) or "default"
        gdir = (pdir / safe_group_id).resolve()
        if not gdir.is_relative_to(pdir.resolve()):
            continue
        gdir.mkdir(parents=True, exist_ok=True)
        for gf in g.files:
            safe_name = Path(gf.name).name
            target = (gdir / safe_name).resolve()
            if target.is_relative_to(gdir):
                target.write_text(gf.content, encoding="utf-8")


def format_project_response(row: Any, owner_username: str) -> dict[str, Any]:
    """Format project database row into standard ProjectResponse."""
    d = dict(row)

    # Parse files
    files = []
    if d.get("files_json"):
        try:
            files = json.loads(d["files_json"])
        except Exception:
            files = []

    file_groups = []
    if d.get("file_groups_json"):
        try:
            file_groups = json.loads(d["file_groups_json"])
        except Exception:
            file_groups = []

    # Parse tags
    tags = []
    if d.get("tags_json"):
        try:
            tags = json.loads(d["tags_json"])
        except Exception:
            tags = []

    return {
        "id": d["id"],
        "name": d["name"],
        "slug": d["slug"],
        "description": d.get("description"),
        "is_public": bool(d.get("is_public", 1)),
        "visibility": d.get("visibility") or ("public" if d.get("is_public") else "private"),
        "board_type": d.get("board_type") or "arduino-uno",
        "age_group": d.get("age_group") or "all",
        "likes_count": int(d.get("likes_count") or 0),
        "forks_count": int(d.get("forks_count") or 0),
        "tags": tags,
        "forked_from_id": d.get("forked_from_id"),
        "files": files,
        "file_groups": file_groups,
        "code": d.get("code") or "",
        "components_json": d.get("components_json") or "[]",
        "wires_json": d.get("wires_json") or "[]",
        "boards_json": d.get("boards_json") or "[]",
        "libraries_json": d.get("libraries_json") or "[]",
        "owner_username": owner_username,
        "owner_display_name": d.get("owner_display_name") or owner_username,
        "owner_avatar_url": d.get("owner_avatar_url"),
        "created_at": d.get("created_at"),
        "updated_at": d.get("updated_at"),
    }


# Path helper
from pathlib import Path


@router.get("/api/projects/me")
async def get_my_projects(user: Optional[dict[str, Any]] = Depends(get_current_user)):
    user_id = user["id"] if user else None
    with get_db() as conn:
        if user_id:
            rows = conn.execute(
                """
                SELECT p.*, u.username as owner_username
                FROM projects p
                JOIN users u ON p.user_id = u.id
                WHERE p.user_id = ?
                ORDER BY p.updated_at DESC
                """,
                (user_id,),
            ).fetchall()
        else:
            # Guest or demo fallback: return all recent public projects
            rows = conn.execute(
                """
                SELECT p.*, u.username as owner_username
                FROM projects p
                JOIN users u ON p.user_id = u.id
                ORDER BY p.updated_at DESC
                LIMIT 50
                """
            ).fetchall()

        return [format_project_response(r, r["owner_username"]) for r in rows]


@router.post("/api/projects/", status_code=status.HTTP_201_CREATED)
async def create_project(req: ProjectCreateRequest, user: Optional[dict[str, Any]] = Depends(get_current_user)):
    with get_db() as conn:
        # Resolve owner user_id (fallback to admin if anonymous)
        if user:
            user_id = user["id"]
            owner_username = user["username"]
        else:
            admin_row = conn.execute("SELECT id, username FROM users WHERE is_admin = 1 LIMIT 1").fetchone()
            user_id = admin_row["id"]
            owner_username = admin_row["username"]

        base_slug = slugify(req.name)
        slug = base_slug
        counter = 2
        while conn.execute("SELECT id FROM projects WHERE user_id = ? AND slug = ?", (user_id, slug)).fetchone():
            slug = f"{base_slug}-{counter}"
            counter += 1

        project_id = str(uuid.uuid4())
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        files_list = [f.model_dump() for f in (req.files or [])]
        groups_list = [g.model_dump() for g in (req.file_groups or [])]

        files_json = json.dumps(files_list)
        file_groups_json = json.dumps(groups_list)

        tags_json = req.tags_json or "[]"
        if req.tags is not None:
            tags_json = json.dumps(req.tags)
        age_group = (req.age_group or "all").lower()

        conn.execute(
            """
            INSERT INTO projects (
                id, user_id, name, slug, description, is_public, visibility,
                board_type, age_group, likes_count, forks_count, tags_json,
                components_json, wires_json, boards_json, libraries_json,
                files_json, code, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                project_id,
                user_id,
                req.name,
                slug,
                req.description,
                1 if req.is_public is not False else 0,
                req.visibility or "public",
                req.board_type or "arduino-uno",
                age_group,
                0,
                0,
                tags_json,
                req.components_json or "[]",
                req.wires_json or "[]",
                req.boards_json or "[]",
                req.libraries_json or "[]",
                files_json,
                req.code or "",
                now,
                now,
            ),
        )

        row = conn.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()

    # Save physical files to disk
    try:
        save_project_files_to_disk(project_id, req.files or [], req.file_groups or [])
    except Exception:
        pass

    return format_project_response(row, owner_username)


@router.get("/api/projects/public")
async def get_public_projects(
    request: Request,
    age_group: Optional[str] = None,
    board_type: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = "trending",
    limit: int = 50,
    offset: int = 0,
    user: Optional[dict[str, Any]] = Depends(get_current_user),
):
    """Query public projects with filtering by age group, board type, full-text search, and sorting."""
    with get_db() as conn:
        where_clauses = ["(p.is_public = 1 OR p.visibility = 'public')"]
        params: list[Any] = []

        if age_group and age_group.strip() and age_group.strip().lower() != "all":
            clean_age = age_group.strip().lower()
            where_clauses.append("(lower(p.age_group) = ? OR p.age_group = 'all')")
            params.append(clean_age)

        if board_type and board_type.strip() and board_type.strip().lower() != "all":
            clean_board = board_type.strip().lower()
            where_clauses.append("lower(p.board_type) = ?")
            params.append(clean_board)

        if search and search.strip():
            term = f"%{search.strip().lower()}%"
            where_clauses.append(
                "(lower(p.name) LIKE ? OR lower(coalesce(p.description, '')) LIKE ? OR lower(coalesce(p.tags_json, '')) LIKE ? OR lower(u.username) LIKE ? OR lower(coalesce(u.display_name, '')) LIKE ?)"
            )
            params.extend([term, term, term, term, term])

        where_sql = " AND ".join(where_clauses)

        # Count total matching rows
        count_query = f"""
            SELECT COUNT(*) as total
            FROM projects p
            JOIN users u ON p.user_id = u.id
            WHERE {where_sql}
        """
        count_row = conn.execute(count_query, params).fetchone()
        total = count_row["total"] if count_row else 0

        # Sort order
        if sort == "most_liked":
            order_sql = "p.likes_count DESC, p.updated_at DESC"
        elif sort == "newest":
            order_sql = "p.created_at DESC"
        elif sort == "most_forked":
            order_sql = "p.forks_count DESC, p.updated_at DESC"
        else:  # trending
            order_sql = "(p.likes_count * 2 + p.forks_count) DESC, p.updated_at DESC"

        # Query items
        data_params = list(params)
        data_params.extend([max(1, min(limit, 100)), max(0, offset)])
        data_query = f"""
            SELECT p.*, u.username as owner_username, u.display_name as owner_display_name, u.avatar_url as owner_avatar_url
            FROM projects p
            JOIN users u ON p.user_id = u.id
            WHERE {where_sql}
            ORDER BY {order_sql}
            LIMIT ? OFFSET ?
        """
        rows = conn.execute(data_query, data_params).fetchall()

        # Check likes for current user or guest
        liked_project_ids: set[str] = set()
        user_id = user["id"] if user else None
        if not user_id:
            guest_id = request.headers.get("x-guest-id") or (request.client.host if request.client else None)
            if guest_id:
                user_id = f"guest:{guest_id}"

        if user_id and rows:
            project_ids = [r["id"] for r in rows]
            placeholders = ",".join("?" for _ in project_ids)
            like_rows = conn.execute(
                f"SELECT project_id FROM project_likes WHERE user_id = ? AND project_id IN ({placeholders})",
                [user_id] + project_ids,
            ).fetchall()
            liked_project_ids = {r["project_id"] for r in like_rows}

        items = []
        for r in rows:
            item = format_project_response(r, r["owner_username"])
            item["has_liked"] = r["id"] in liked_project_ids
            items.append(item)

        return {"items": items, "total": total}


@router.get("/api/projects/{project_id}")
async def get_project_by_id(project_id: str, user: Optional[dict[str, Any]] = Depends(get_current_user)):
    with get_db() as conn:
        row = conn.execute(
            """
            SELECT p.*, u.username as owner_username
            FROM projects p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
            """,
            (project_id,),
        ).fetchone()

        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

        is_owner = user and user["id"] == row["user_id"]
        is_admin = user and user.get("is_admin")
        is_public = bool(row["is_public"])

        if not is_public and not is_owner and not is_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access to private project denied.")

        return format_project_response(row, row["owner_username"])


@router.put("/api/projects/{project_id}")
async def update_project(
    project_id: str,
    req: ProjectUpdateRequest,
    user: Optional[dict[str, Any]] = Depends(get_current_user),
):
    with get_db() as conn:
        existing = conn.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
        if not existing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

        if user:
            is_owner = user["id"] == existing["user_id"]
            is_admin = user.get("is_admin")
            if not is_owner and not is_admin:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only project owner may modify this project.")

        updates = []
        params = []

        if req.name is not None:
            updates.append("name = ?")
            params.append(req.name)

        if req.description is not None:
            updates.append("description = ?")
            params.append(req.description)

        if req.is_public is not None:
            updates.append("is_public = ?")
            params.append(1 if req.is_public else 0)

        if req.visibility is not None:
            updates.append("visibility = ?")
            params.append(req.visibility)

        if req.board_type is not None:
            updates.append("board_type = ?")
            params.append(req.board_type)

        if req.age_group is not None:
            updates.append("age_group = ?")
            params.append(req.age_group.lower())

        if req.tags is not None:
            updates.append("tags_json = ?")
            params.append(json.dumps(req.tags))
        elif req.tags_json is not None:
            updates.append("tags_json = ?")
            params.append(req.tags_json)

        if req.components_json is not None:
            updates.append("components_json = ?")
            params.append(req.components_json)

        if req.wires_json is not None:
            updates.append("wires_json = ?")
            params.append(req.wires_json)

        if req.boards_json is not None:
            updates.append("boards_json = ?")
            params.append(req.boards_json)

        if req.libraries_json is not None:
            updates.append("libraries_json = ?")
            params.append(req.libraries_json)

        if req.files is not None:
            files_list = [f.model_dump() for f in req.files]
            updates.append("files_json = ?")
            params.append(json.dumps(files_list))

        if req.code is not None:
            updates.append("code = ?")
            params.append(req.code)

        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        updates.append("updated_at = ?")
        params.append(now)

        params.append(project_id)
        conn.execute(f"UPDATE projects SET {', '.join(updates)} WHERE id = ?", params)

        updated_row = conn.execute(
            """
            SELECT p.*, u.username as owner_username
            FROM projects p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
            """,
            (project_id,),
        ).fetchone()

    # Save to disk if files updated
    if req.files is not None or req.file_groups is not None:
        try:
            save_project_files_to_disk(project_id, req.files or [], req.file_groups or [])
        except Exception:
            pass

    return format_project_response(updated_row, updated_row["owner_username"])


@router.delete("/api/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: str, user: Optional[dict[str, Any]] = Depends(get_current_user)):
    with get_db() as conn:
        existing = conn.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
        if not existing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

        if user:
            is_owner = user["id"] == existing["user_id"]
            is_admin = user.get("is_admin")
            if not is_owner and not is_admin:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only project owner may delete this project.")

        conn.execute("DELETE FROM projects WHERE id = ?", (project_id,))

    # Remove physical directory
    pdir = PROJECTS_DIR / project_id
    if pdir.exists():
        shutil.rmtree(pdir, ignore_errors=True)

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/api/user/{username}")
async def get_user_projects(username: str, user: Optional[dict[str, Any]] = Depends(get_current_user)):
    with get_db() as conn:
        target_user = conn.execute("SELECT id, username FROM users WHERE lower(username) = ?", (username.lower(),)).fetchone()
        if not target_user:
            return []

        is_self = user and user["id"] == target_user["id"]
        is_admin = user and user.get("is_admin")

        if is_self or is_admin:
            rows = conn.execute(
                "SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC",
                (target_user["id"],),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM projects WHERE user_id = ? AND is_public = 1 ORDER BY updated_at DESC",
                (target_user["id"],),
            ).fetchall()

        return [format_project_response(r, target_user["username"]) for r in rows]


@router.get("/api/user/{username}/{slug}")
async def get_user_project_by_slug(username: str, slug: str, user: Optional[dict[str, Any]] = Depends(get_current_user)):
    with get_db() as conn:
        target_user = conn.execute("SELECT id, username FROM users WHERE lower(username) = ?", (username.lower(),)).fetchone()
        if not target_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        row = conn.execute(
            "SELECT * FROM projects WHERE user_id = ? AND slug = ?",
            (target_user["id"], slug),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

        is_self = user and user["id"] == target_user["id"]
        is_admin = user and user.get("is_admin")
        if not bool(row["is_public"]) and not is_self and not is_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access to private project denied.")

        return format_project_response(row, target_user["username"])


@router.post("/api/projects/{project_id}/like")
async def toggle_project_like(
    project_id: str,
    request: Request,
    user: Optional[dict[str, Any]] = Depends(get_current_user),
):
    """Toggle like on a project. Returns updated like status and count."""
    with get_db() as conn:
        proj = conn.execute("SELECT id, likes_count FROM projects WHERE id = ?", (project_id,)).fetchone()
        if not proj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

        if user:
            user_id = user["id"]
        else:
            guest_id = request.headers.get("x-guest-id") or (request.client.host if request.client else "guest")
            user_id = f"guest:{guest_id}"

        existing_like = conn.execute(
            "SELECT 1 FROM project_likes WHERE project_id = ? AND user_id = ?",
            (project_id, user_id),
        ).fetchone()

        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        if existing_like:
            conn.execute(
                "DELETE FROM project_likes WHERE project_id = ? AND user_id = ?",
                (project_id, user_id),
            )
            conn.execute(
                "UPDATE projects SET likes_count = MAX(0, likes_count - 1), updated_at = updated_at WHERE id = ?",
                (project_id,),
            )
            liked = False
        else:
            conn.execute(
                "INSERT INTO project_likes (project_id, user_id, created_at) VALUES (?, ?, ?)",
                (project_id, user_id, now),
            )
            conn.execute(
                "UPDATE projects SET likes_count = likes_count + 1, updated_at = updated_at WHERE id = ?",
                (project_id,),
            )
            liked = True

        updated_row = conn.execute("SELECT likes_count FROM projects WHERE id = ?", (project_id,)).fetchone()
        current_likes = int(updated_row["likes_count"]) if updated_row else 0

        return {"liked": liked, "likes_count": current_likes}


@router.post("/api/projects/{project_id}/fork")
@router.post("/api/projects/{project_id}/duplicate")
async def fork_project(
    project_id: str,
    req: Optional[ProjectForkRequest] = None,
    user: Optional[dict[str, Any]] = Depends(get_current_user),
):
    """Clone/Fork a project (remix). Supports authenticated users and guest users."""
    with get_db() as conn:
        source = conn.execute(
            """
            SELECT p.*, u.username as owner_username, u.display_name as owner_display_name
            FROM projects p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
            """,
            (project_id,),
        ).fetchone()

        if not source:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

        is_owner = user and user["id"] == source["user_id"]
        is_admin = user and user.get("is_admin")
        is_public = bool(source["is_public"]) or (source["visibility"] == "public")

        if not is_public and not is_owner and not is_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access to private project denied.")

        # Increment forks_count on the source project
        conn.execute(
            "UPDATE projects SET forks_count = forks_count + 1 WHERE id = ?",
            (project_id,),
        )

        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        cloned_name = (req.name.strip() if req and req.name and req.name.strip() else f"{source['name']} (Bản Remix)")

        if user:
            target_user_id = user["id"]
            owner_username = user["username"]

            base_slug = slugify(cloned_name)
            slug = base_slug
            counter = 2
            while conn.execute("SELECT id FROM projects WHERE user_id = ? AND slug = ?", (target_user_id, slug)).fetchone():
                slug = f"{base_slug}-{counter}"
                counter += 1

            new_project_id = str(uuid.uuid4())
            new_is_public = req.is_public if (req and req.is_public is not None) else source["is_public"]
            new_visibility = req.visibility if (req and req.visibility) else source["visibility"]
            new_description = req.description if (req and req.description is not None) else source["description"]

            conn.execute(
                """
                INSERT INTO projects (
                    id, user_id, name, slug, description, is_public, visibility,
                    board_type, age_group, likes_count, forks_count, tags_json,
                    forked_from_id, components_json, wires_json, boards_json,
                    libraries_json, files_json, code, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    new_project_id,
                    target_user_id,
                    cloned_name,
                    slug,
                    new_description,
                    1 if new_is_public else 0,
                    new_visibility or "public",
                    source["board_type"],
                    source["age_group"] or "all",
                    0,  # fresh likes count
                    0,  # fresh forks count
                    source["tags_json"] or "[]",
                    project_id,  # forked_from_id
                    source["components_json"] or "[]",
                    source["wires_json"] or "[]",
                    source["boards_json"] or "[]",
                    source["libraries_json"] or "[]",
                    source["files_json"] or "[]",
                    source["code"] or "",
                    now,
                    now,
                ),
            )

            # Copy physical files on disk if present
            src_dir = PROJECTS_DIR / project_id
            dst_dir = PROJECTS_DIR / new_project_id
            if src_dir.exists():
                try:
                    shutil.copytree(src_dir, dst_dir)
                except Exception as exc:
                    logger.warning("Could not copy project files from %s to %s: %r", src_dir, dst_dir, exc)

            new_row = conn.execute(
                """
                SELECT p.*, u.username as owner_username, u.display_name as owner_display_name, u.avatar_url as owner_avatar_url
                FROM projects p
                JOIN users u ON p.user_id = u.id
                WHERE p.id = ?
                """,
                (new_project_id,),
            ).fetchone()

            response_data = format_project_response(new_row, owner_username)
            response_data["success"] = True
            response_data["project"] = dict(response_data)
            return response_data

        else:
            # Guest fork: returns full project structure for in-memory / frontend remixing
            response_data = format_project_response(source, source["owner_username"])
            response_data["id"] = str(uuid.uuid4())
            response_data["name"] = cloned_name
            response_data["slug"] = slugify(cloned_name)
            response_data["forked_from_id"] = project_id
            response_data["likes_count"] = 0
            response_data["forks_count"] = 0
            response_data["created_at"] = now
            response_data["updated_at"] = now
            response_data["success"] = True
            response_data["project"] = dict(response_data)
            return response_data

