#!/usr/bin/env python3
"""LinkedIn MCP Server — connect Claude to your company LinkedIn page.

Tools:
  Posts      : create_text_post, create_article_post, get_company_posts,
               delete_post, get_post_analytics
  Engagement : comment_on_post, reply_to_comment, get_post_comments, like_post
  Discovery  : search_hashtag_posts, get_company_info
  Followers  : get_follower_stats, get_followers
  Scheduler  : schedule_post, list_scheduled_posts,
               cancel_scheduled_post, publish_due_posts

Setup: copy .env.example → .env, fill credentials, then:
  pip install -r requirements.txt
  python server.py
"""

import asyncio
import json
import sys
import os

# Resolve sibling modules when invoked from outside this directory
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import TextContent, Tool

import linkedin as li
import scheduler as sched

load_dotenv()

server = Server("linkedin-mcp")

# ── Tool definitions ───────────────────────────────────────────────────────────

TOOLS: list[Tool] = [
    # ── Posts ──
    Tool(
        name="create_text_post",
        description="Create a text post on the company LinkedIn page.",
        inputSchema={
            "type": "object",
            "properties": {
                "text": {
                    "type": "string",
                    "description": "Post content (max 3000 characters).",
                },
                "visibility": {
                    "type": "string",
                    "enum": ["PUBLIC", "LOGGED_IN"],
                    "default": "PUBLIC",
                    "description": "PUBLIC = visible to anyone; LOGGED_IN = LinkedIn members only.",
                },
            },
            "required": ["text"],
        },
    ),
    Tool(
        name="create_article_post",
        description="Create a company LinkedIn post that includes an article URL.",
        inputSchema={
            "type": "object",
            "properties": {
                "text": {"type": "string", "description": "Post commentary text."},
                "url": {"type": "string", "description": "URL to share."},
                "title": {"type": "string", "description": "Link/article title (optional)."},
                "description": {"type": "string", "description": "Link description (optional)."},
                "visibility": {
                    "type": "string",
                    "enum": ["PUBLIC", "LOGGED_IN"],
                    "default": "PUBLIC",
                },
            },
            "required": ["text", "url"],
        },
    ),
    Tool(
        name="get_company_posts",
        description="Get recent posts from the company LinkedIn page.",
        inputSchema={
            "type": "object",
            "properties": {
                "count": {
                    "type": "integer",
                    "default": 10,
                    "description": "Number of posts to retrieve (1–50).",
                },
            },
        },
    ),
    Tool(
        name="delete_post",
        description="Delete a post from the company LinkedIn page.",
        inputSchema={
            "type": "object",
            "properties": {
                "post_urn": {
                    "type": "string",
                    "description": "Post URN, e.g. urn:li:ugcPost:123456789.",
                },
            },
            "required": ["post_urn"],
        },
    ),
    Tool(
        name="get_post_analytics",
        description="Get impressions, clicks, and engagement stats for a company post.",
        inputSchema={
            "type": "object",
            "properties": {
                "post_urn": {"type": "string", "description": "Post URN."},
            },
            "required": ["post_urn"],
        },
    ),
    # ── Engagement ──
    Tool(
        name="comment_on_post",
        description="Add a comment to any LinkedIn post as the company.",
        inputSchema={
            "type": "object",
            "properties": {
                "post_urn": {"type": "string", "description": "Post URN to comment on."},
                "comment_text": {"type": "string", "description": "Comment text."},
            },
            "required": ["post_urn", "comment_text"],
        },
    ),
    Tool(
        name="reply_to_comment",
        description="Reply to a specific comment on a LinkedIn post as the company.",
        inputSchema={
            "type": "object",
            "properties": {
                "post_urn": {"type": "string", "description": "Post URN."},
                "comment_urn": {"type": "string", "description": "Comment URN to reply to."},
                "reply_text": {"type": "string", "description": "Reply text."},
            },
            "required": ["post_urn", "comment_urn", "reply_text"],
        },
    ),
    Tool(
        name="get_post_comments",
        description="Get all comments on a LinkedIn post.",
        inputSchema={
            "type": "object",
            "properties": {
                "post_urn": {"type": "string", "description": "Post URN."},
            },
            "required": ["post_urn"],
        },
    ),
    Tool(
        name="like_post",
        description="Like a LinkedIn post as the company.",
        inputSchema={
            "type": "object",
            "properties": {
                "post_urn": {"type": "string", "description": "Post URN to like."},
            },
            "required": ["post_urn"],
        },
    ),
    # ── Discovery ──
    Tool(
        name="search_hashtag_posts",
        description=(
            "Search LinkedIn for posts by hashtag to discover relevant industry content "
            "your company can engage with."
        ),
        inputSchema={
            "type": "object",
            "properties": {
                "hashtag": {
                    "type": "string",
                    "description": "Hashtag keyword without # (e.g. 'technology').",
                },
                "count": {
                    "type": "integer",
                    "default": 10,
                    "description": "Number of posts to retrieve.",
                },
            },
            "required": ["hashtag"],
        },
    ),
    Tool(
        name="get_company_info",
        description="Get public information about the company LinkedIn page.",
        inputSchema={"type": "object", "properties": {}},
    ),
    # ── Followers ──
    Tool(
        name="get_follower_stats",
        description="Get follower count, growth, and demographic breakdown for the company page.",
        inputSchema={"type": "object", "properties": {}},
    ),
    Tool(
        name="get_followers",
        description="Get a paginated list of company followers.",
        inputSchema={
            "type": "object",
            "properties": {
                "count": {
                    "type": "integer",
                    "default": 25,
                    "description": "Number of followers to retrieve (max 50).",
                },
                "start": {
                    "type": "integer",
                    "default": 0,
                    "description": "Pagination offset.",
                },
            },
        },
    ),
    # ── Scheduler ──
    Tool(
        name="schedule_post",
        description=(
            "Schedule a LinkedIn post for future publishing. "
            "Call publish_due_posts (via cron or on demand) to actually send it."
        ),
        inputSchema={
            "type": "object",
            "properties": {
                "text": {"type": "string", "description": "Post content."},
                "scheduled_time": {
                    "type": "string",
                    "description": "UTC datetime in ISO 8601 format, e.g. 2024-06-01T09:00:00Z.",
                },
                "url": {"type": "string", "description": "Optional article URL."},
                "title": {"type": "string", "description": "Optional link title."},
                "description": {"type": "string", "description": "Optional link description."},
                "visibility": {
                    "type": "string",
                    "enum": ["PUBLIC", "LOGGED_IN"],
                    "default": "PUBLIC",
                },
            },
            "required": ["text", "scheduled_time"],
        },
    ),
    Tool(
        name="list_scheduled_posts",
        description="List all pending scheduled LinkedIn posts.",
        inputSchema={"type": "object", "properties": {}},
    ),
    Tool(
        name="cancel_scheduled_post",
        description="Cancel a pending scheduled post by its ID.",
        inputSchema={
            "type": "object",
            "properties": {
                "post_id": {"type": "string", "description": "Scheduled post ID."},
            },
            "required": ["post_id"],
        },
    ),
    Tool(
        name="publish_due_posts",
        description=(
            "Publish all scheduled posts whose time has arrived. "
            "Wire this to a cron job (e.g. every 15 minutes) for true scheduling."
        ),
        inputSchema={"type": "object", "properties": {}},
    ),
]


# ── Helpers ────────────────────────────────────────────────────────────────────

def _ok(data) -> list[TextContent]:
    text = data if isinstance(data, str) else json.dumps(data, indent=2)
    return [TextContent(type="text", text=text)]


# ── Tool registry ──────────────────────────────────────────────────────────────

@server.list_tools()
async def list_tools() -> list[Tool]:
    return TOOLS


@server.call_tool()
async def call_tool(name: str, arguments: dict | None) -> list[TextContent]:
    args = arguments or {}
    try:
        match name:
            # ── Posts ──────────────────────────────────────────────────────────
            case "create_text_post":
                result = await li.create_text_post(
                    args["text"], args.get("visibility", "PUBLIC")
                )
                return _ok({"success": True, "post_urn": result.get("id"), "raw": result})

            case "create_article_post":
                result = await li.create_article_post(
                    args["text"],
                    args["url"],
                    args.get("title", ""),
                    args.get("description", ""),
                    args.get("visibility", "PUBLIC"),
                )
                return _ok({"success": True, "post_urn": result.get("id"), "raw": result})

            case "get_company_posts":
                return _ok(await li.get_company_posts(args.get("count", 10)))

            case "delete_post":
                await li.delete_post(args["post_urn"])
                return _ok("Post deleted successfully.")

            case "get_post_analytics":
                return _ok(await li.get_post_analytics(args["post_urn"]))

            # ── Engagement ─────────────────────────────────────────────────────
            case "comment_on_post":
                result = await li.comment_on_post(args["post_urn"], args["comment_text"])
                return _ok({"success": True, "comment": result})

            case "reply_to_comment":
                result = await li.reply_to_comment(
                    args["post_urn"], args["comment_urn"], args["reply_text"]
                )
                return _ok({"success": True, "reply": result})

            case "get_post_comments":
                return _ok(await li.get_post_comments(args["post_urn"]))

            case "like_post":
                result = await li.like_post(args["post_urn"])
                return _ok({"success": True, "raw": result})

            # ── Discovery ──────────────────────────────────────────────────────
            case "search_hashtag_posts":
                hashtag_data = await li.search_hashtag(args["hashtag"])
                elements = hashtag_data.get("elements", [])
                if not elements:
                    return _ok(f"No LinkedIn hashtag found for '{args['hashtag']}'.")
                elem = elements[0]
                urn = (
                    elem.get("$URN")
                    or elem.get("hashtag~", {}).get("$URN", "")
                    or elem.get("hashtag", "")
                )
                if not urn:
                    return _ok(hashtag_data)
                return _ok(await li.get_hashtag_posts(urn, args.get("count", 10)))

            case "get_company_info":
                return _ok(await li.get_company_info())

            # ── Followers ──────────────────────────────────────────────────────
            case "get_follower_stats":
                return _ok(await li.get_follower_stats())

            case "get_followers":
                return _ok(await li.get_followers(
                    args.get("count", 25), args.get("start", 0)
                ))

            # ── Scheduler ──────────────────────────────────────────────────────
            case "schedule_post":
                entry = sched.add(
                    args["text"],
                    args["scheduled_time"],
                    args.get("url", ""),
                    args.get("title", ""),
                    args.get("description", ""),
                    args.get("visibility", "PUBLIC"),
                )
                return _ok({"success": True, "scheduled_post": entry})

            case "list_scheduled_posts":
                pending = sched.list_pending()
                return _ok({"count": len(pending), "posts": pending})

            case "cancel_scheduled_post":
                if sched.cancel(args["post_id"]):
                    return _ok("Scheduled post cancelled.")
                return _ok(f"Post '{args['post_id']}' not found or already processed.")

            case "publish_due_posts":
                due = sched.due_now()
                if not due:
                    return _ok("No posts are due for publishing right now.")
                results = []
                for post in due:
                    try:
                        if post.get("url"):
                            r = await li.create_article_post(
                                post["text"], post["url"],
                                post.get("title", ""), post.get("description", ""),
                                post.get("visibility", "PUBLIC"),
                            )
                        else:
                            r = await li.create_text_post(
                                post["text"], post.get("visibility", "PUBLIC")
                            )
                        sched.mark_published(post["id"], r)
                        results.append({"id": post["id"], "status": "published", "urn": r.get("id")})
                    except Exception as exc:
                        results.append({"id": post["id"], "status": "failed", "error": str(exc)})

                published = sum(1 for r in results if r["status"] == "published")
                return _ok({
                    "published": published,
                    "failed": len(results) - published,
                    "results": results,
                })

            case _:
                return _ok(f"Unknown tool: {name}")

    except Exception as exc:
        return _ok(f"Error: {exc}")


# ── Entry point ────────────────────────────────────────────────────────────────

async def _publish_due_cli() -> None:
    """Standalone mode: publish due scheduled posts then exit (for cron use)."""
    due = sched.due_now()
    if not due:
        print("No posts due.")
        return
    for post in due:
        try:
            if post.get("url"):
                r = await li.create_article_post(
                    post["text"], post["url"],
                    post.get("title", ""), post.get("description", ""),
                    post.get("visibility", "PUBLIC"),
                )
            else:
                r = await li.create_text_post(
                    post["text"], post.get("visibility", "PUBLIC")
                )
            sched.mark_published(post["id"], r)
            print(f"Published: {post['id']} → {r.get('id', 'ok')}")
        except Exception as exc:
            print(f"Failed:    {post['id']} — {exc}", file=sys.stderr)


async def main():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options(),
        )


if __name__ == "__main__":
    if "--publish-due" in sys.argv:
        asyncio.run(_publish_due_cli())
    else:
        asyncio.run(main())
