# Make Aidesk easier to find, nicer to use, and stickier

Three tracks: **get found**, **feel great**, **come back**. Each item is scoped and independently shippable — you can approve all or cherry-pick.

---

## 1. Get found (SEO + shareability)

- **Public landing page at `/`** for signed-out visitors instead of a forced redirect to `/auth`. Crawlers currently see only the auth screen, so nothing indexes. Move the current dashboard to `/app` (authed) and build a marketing home with hero, tool showcase, testimonials-style benefits, and clear CTAs.
- **Per-route metadata** for `/email`, `/meetings`, `/tasks`, `/chat`, `/research`, `/insights` — unique `title`, `description`, `og:title`, `og:description`, `og:url`, canonical.
- **Generated OG image** (one polished share card) wired into the landing route's `og:image` / `twitter:image`.
- **`sitemap.xml` server route** listing public routes + `robots.txt` allowing crawl.
- **JSON-LD** `SoftwareApplication` on the landing page for rich results.

## 2. Feel great (UX polish)

- **Mobile navigation fix** — the current sidebar + top bar squeeze on 475px viewports (you're on one right now). Add a mobile drawer trigger and make the sidebar `offcanvas` on small screens; ensure header text truncates properly (grid + `min-w-0`).
- **Global command palette (⌘K)** to jump between tools, start a new chat, open recent threads, and switch settings — huge speed win for repeat users.
- **Empty states with 1-click starter prompts** in Email, Meetings, Tasks, Chat, Research (e.g., "Draft a follow-up after a demo", "Summarize a 30-min standup") so first-time users produce a result in one click.
- **Streaming responses** in Chat + Research (SSE) instead of waiting for the full reply — feels dramatically faster.
- **Copy / regenerate / export (markdown) actions** on every AI output, plus toast confirmation.
- **Keyboard shortcuts**: `⌘Enter` to submit, `⌘K` palette, `g e / g m / g t` to jump.
- **Skeleton loaders** on threads/insights instead of the pulsing gradient dot.
- **Dark mode wiring** — the setting exists but doesn't apply; hook `theme` into `<html class>` and persist.
- **Accessibility pass**: aria-labels on icon buttons, focus-visible rings, `h-dvh` for full-height mobile layouts.

## 3. Come back (engagement + retention)

- **Onboarding checklist** on first login ("Draft your first email", "Summarize a meeting", "Plan a goal") — completing it unlocks a "Pro tips" panel. Drives activation.
- **Recent activity + pinned threads** on the dashboard so returning users resume in one click.
- **Weekly digest email** (opt-in) — "You saved ~2.3 hours this week with Aidesk" using the existing insights data. Powered via the existing email connector or Lovable Cloud auth emails.
- **Prompt templates library** — curated, categorized starter prompts per tool; users can save their own. Massive stickiness lever.
- **Share a thread** — generate a read-only public link to a chat/research thread (new `shared_threads` table with a token, public route `/s/$token`).
- **Insights upgrades**: streak counter, tool-usage sparkline, time-saved goal, weekly comparison.
- **PWA manifest + install prompt** so users can add Aidesk to their home screen / dock.

---

## Suggested first slice (fastest impact, ~one build)

1. Public landing at `/` with per-route metadata, OG image, sitemap, robots.
2. Mobile nav fix + dark mode wiring.
3. Empty-state starter prompts across all 5 AI tools.
4. Copy / regenerate actions + streaming in Chat.
5. Onboarding checklist on dashboard.

Everything else can follow in later passes.

---

**Tell me which track (or which specific items) to build first**, or say "all of slice 1" and I'll ship it.
