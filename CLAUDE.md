# LinkedIn Automation — Instructions for Claude

All marketing reference material lives in `/Users/rosebonica/linkedin/`.
Read those files before drafting any post or comment.

---

## Daily post run (triggered at 09:00 UTC)

1. Read `/Users/rosebonica/linkedin/brand-voice.md` — never deviate from this.
2. Read `/Users/rosebonica/linkedin/post-calendar.md` — find today's pillar based on the day of the week.
3. Read `/Users/rosebonica/linkedin/topics.md` — pick a specific topic from that pillar.
4. Draft a post. Check it fits the brand voice. Max 3000 characters.
5. Publish immediately with `create_text_post`.
   If the post naturally references a URL, use `create_article_post` instead.
6. Log the result (post URN) to stdout.

---

## Engagement run (triggered at 09:30 UTC and 15:00 UTC)

### Find and engage with industry content
1. Read `/Users/rosebonica/linkedin/topics.md` for the hashtag list.
2. Pick 3 hashtags relevant to today's post pillar.
3. For each hashtag, call `search_hashtag_posts` (count: 5).
4. Like the top 2 posts per hashtag that are genuinely relevant.
5. Leave a thoughtful comment on 1 post per hashtag — add a real insight, not filler.

### Respond to followers
6. Call `get_company_posts` to get the 5 most recent company posts.
7. For each post, call `get_post_comments`.
8. For any comment that has no company reply yet, reply warmly and helpfully using `reply_to_comment`.

---

## Rules
- Never post the same topic two days in a row.
- Never comment with generic phrases ("Great post!", "So true!", "Well said!").
- Never engage with posts that are political, controversial, or off-brand.
- If the LinkedIn API returns an error, log it clearly and stop — do not retry blindly.
- Visibility is always PUBLIC unless told otherwise.
