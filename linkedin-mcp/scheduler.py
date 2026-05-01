"""File-based post scheduler stored at ~/.linkedin-mcp/scheduled_posts.json."""

import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

SCHEDULE_FILE = Path(
    os.getenv("LINKEDIN_SCHEDULE_FILE",
              os.path.expanduser("~/.linkedin-mcp/scheduled_posts.json"))
)


def _load() -> list:
    if not SCHEDULE_FILE.exists():
        return []
    return json.loads(SCHEDULE_FILE.read_text())


def _save(posts: list) -> None:
    SCHEDULE_FILE.parent.mkdir(parents=True, exist_ok=True)
    SCHEDULE_FILE.write_text(json.dumps(posts, indent=2))


def add(
    text: str,
    scheduled_time: str,
    url: str = "",
    title: str = "",
    description: str = "",
    visibility: str = "PUBLIC",
) -> dict:
    posts = _load()
    entry = {
        "id": str(uuid.uuid4()),
        "text": text,
        "url": url,
        "title": title,
        "description": description,
        "visibility": visibility,
        "scheduled_time": scheduled_time,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    posts.append(entry)
    _save(posts)
    return entry


def list_pending() -> list:
    return [p for p in _load() if p["status"] == "pending"]


def cancel(post_id: str) -> bool:
    posts = _load()
    for p in posts:
        if p["id"] == post_id and p["status"] == "pending":
            p["status"] = "cancelled"
            _save(posts)
            return True
    return False


def due_now() -> list:
    now = datetime.now(timezone.utc).isoformat()
    return [p for p in _load() if p["status"] == "pending" and p["scheduled_time"] <= now]


def mark_published(post_id: str, result: dict) -> None:
    posts = _load()
    for p in posts:
        if p["id"] == post_id:
            p["status"] = "published"
            p["published_result"] = result
            p["published_at"] = datetime.now(timezone.utc).isoformat()
    _save(posts)
