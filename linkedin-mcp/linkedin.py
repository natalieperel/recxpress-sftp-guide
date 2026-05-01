"""LinkedIn API client with OAuth 2.0 token refresh."""

import json
import os
import time
from pathlib import Path
from urllib.parse import quote

import httpx
from dotenv import load_dotenv

load_dotenv()

API_BASE = "https://api.linkedin.com/v2"
_TOKEN_CACHE = Path(os.path.expanduser("~/.linkedin-mcp/token.json"))


class _Tokens:
    def __init__(self):
        self.access_token: str = os.getenv("LINKEDIN_ACCESS_TOKEN", "")
        self.refresh_token: str = os.getenv("LINKEDIN_REFRESH_TOKEN", "")
        self.client_id: str = os.getenv("LINKEDIN_CLIENT_ID", "")
        self.client_secret: str = os.getenv("LINKEDIN_CLIENT_SECRET", "")
        self._load_cache()

    def _load_cache(self):
        if _TOKEN_CACHE.exists():
            try:
                data = json.loads(_TOKEN_CACHE.read_text())
                if data.get("expires_at", 0) > time.time() + 300:
                    self.access_token = data["access_token"]
            except Exception:
                pass

    def save(self, access_token: str, expires_in: int):
        _TOKEN_CACHE.parent.mkdir(parents=True, exist_ok=True)
        _TOKEN_CACHE.write_text(json.dumps({
            "access_token": access_token,
            "expires_at": time.time() + expires_in,
        }))
        self.access_token = access_token

    async def refresh(self) -> bool:
        if not (self.refresh_token and self.client_id and self.client_secret):
            return False
        async with httpx.AsyncClient() as http:
            resp = await http.post(
                "https://www.linkedin.com/oauth/v2/accessToken",
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": self.refresh_token,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                },
            )
            if resp.status_code == 200:
                d = resp.json()
                self.save(d["access_token"], d.get("expires_in", 5_183_944))
                return True
        return False


_tokens = _Tokens()
_ORG_ID = os.getenv("LINKEDIN_ORGANIZATION_ID", "")


def org_urn() -> str:
    return f"urn:li:organization:{_ORG_ID}"


def _headers() -> dict:
    return {
        "Authorization": f"Bearer {_tokens.access_token}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
        "LinkedIn-Version": "202304",
    }


async def _api(method: str, endpoint: str, _retry: bool = True, **kwargs) -> dict:
    url = f"{API_BASE}{endpoint}"
    async with httpx.AsyncClient(timeout=30) as http:
        resp = await http.request(method, url, headers=_headers(), **kwargs)

    if resp.status_code == 401 and _retry:
        if await _tokens.refresh():
            return await _api(method, endpoint, _retry=False, **kwargs)
        raise RuntimeError(
            "Authentication failed. Provide a valid LINKEDIN_ACCESS_TOKEN or LINKEDIN_REFRESH_TOKEN."
        )
    if resp.status_code >= 400:
        raise RuntimeError(f"LinkedIn API {resp.status_code}: {resp.text[:500]}")

    if resp.content:
        return resp.json()
    # POST 201 responses return the new resource ID in a header
    return {"id": resp.headers.get("X-RestLi-Id", resp.headers.get("location", ""))}


# ── Posts ──────────────────────────────────────────────────────────────────────

async def create_text_post(text: str, visibility: str = "PUBLIC") -> dict:
    return await _api("POST", "/ugcPosts", json={
        "author": org_urn(),
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {"text": text},
                "shareMediaCategory": "NONE",
            }
        },
        "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": visibility},
    })


async def create_article_post(
    text: str, url: str, title: str = "", description: str = "", visibility: str = "PUBLIC"
) -> dict:
    media: dict = {"status": "READY", "originalUrl": url}
    if title:
        media["title"] = {"text": title}
    if description:
        media["description"] = {"text": description}
    return await _api("POST", "/ugcPosts", json={
        "author": org_urn(),
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {"text": text},
                "shareMediaCategory": "ARTICLE",
                "media": [media],
            }
        },
        "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": visibility},
    })


async def get_company_posts(count: int = 10) -> dict:
    return await _api(
        "GET",
        f"/ugcPosts?q=authors&authors=List({quote(org_urn())})"
        f"&count={count}&sortBy=LAST_MODIFIED",
    )


async def delete_post(post_urn: str) -> None:
    await _api("DELETE", f"/ugcPosts/{quote(post_urn, safe='')}")


async def get_post_analytics(post_urn: str) -> dict:
    return await _api(
        "GET",
        f"/organizationalEntityShareStatistics?q=organizationalEntity"
        f"&organizationalEntity={quote(org_urn(), safe='')}"
        f"&shares=List({quote(post_urn, safe='')})",
    )


# ── Engagement ─────────────────────────────────────────────────────────────────

async def comment_on_post(post_urn: str, text: str) -> dict:
    return await _api(
        "POST", f"/socialActions/{quote(post_urn, safe='')}/comments",
        json={"actor": org_urn(), "message": {"text": text}},
    )


async def reply_to_comment(post_urn: str, comment_urn: str, text: str) -> dict:
    return await _api(
        "POST",
        f"/socialActions/{quote(post_urn, safe='')}"
        f"/comments/{quote(comment_urn, safe='')}/comments",
        json={"actor": org_urn(), "message": {"text": text}},
    )


async def get_post_comments(post_urn: str) -> dict:
    return await _api("GET", f"/socialActions/{quote(post_urn, safe='')}/comments")


async def like_post(post_urn: str) -> dict:
    return await _api(
        "POST", f"/socialActions/{quote(post_urn, safe='')}/likes",
        json={"actor": org_urn()},
    )


# ── Followers ──────────────────────────────────────────────────────────────────

async def get_follower_stats() -> dict:
    return await _api(
        "GET",
        f"/organizationFollowerStatistics?q=organizationId"
        f"&organizationId={quote(org_urn(), safe='')}",
    )


async def get_followers(count: int = 25, start: int = 0) -> dict:
    return await _api(
        "GET",
        f"/followers?q=organizationFollowers"
        f"&organizationId={quote(org_urn(), safe='')}"
        f"&count={count}&start={start}",
    )


# ── Discovery ─────────────────────────────────────────────────────────────────

async def get_company_info() -> dict:
    return await _api("GET", f"/organizations/{_ORG_ID}")


async def search_hashtag(keyword: str) -> dict:
    return await _api(
        "GET", f"/hashtags?q=hashtag&keyword={quote(keyword)}&projection=(hashtag~)"
    )


async def get_hashtag_posts(hashtag_urn: str, count: int = 10) -> dict:
    return await _api(
        "GET", f"/shares?q=hashtag&hashtag={quote(hashtag_urn, safe='')}&count={count}"
    )
