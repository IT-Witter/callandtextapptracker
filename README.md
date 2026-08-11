# Witter — Call & Text Tracker

A phone-first web app for calling and texting the Witter Coin buyer list. Reads
and writes the **Master Phone Call List** table in the `whatnot username tracker`
Airtable base — Airtable stays the single source of truth.

Users: **Seth, Ben, Marley, Colton**. They enter a shared PIN, tap their name, and
work their queue.

> 📋 **[SOP.md](SOP.md)** — how to actually use the app day to day. Send that to
> the team; this README is the technical setup.

## Setup

```bash
npm install
```

Copy `.env.example` to `.env.local` and fill in three values:

| Variable | What it is |
| --- | --- |
| `AIRTABLE_TOKEN` | Airtable personal access token. Create at [airtable.com/create/tokens](https://airtable.com/create/tokens) with scopes `data.records:read`, `data.records:write`, `schema.bases:read`, and access to the `whatnot username tracker` base. |
| `APP_PIN` | The shared PIN the team types before picking their name. **Change this from the default.** |
| `SESSION_SECRET` | Random string that signs the session cookie. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm run typecheck
```

## Screens

- **`/login`** — PIN, then a big button per person. Session lasts 30 days.
- **`/`** (My Queue) — buyers assigned to you whose Airtable `Call Status` says
  "Call now", sorted Tier A → C, never-contacted first, then oldest call first.
- **`/buyers`** — the full list with search (name, username, phone) and filters
  for tier, owner, status and channel. This is where Seth looks people up.

## How logging works

Tapping **📞 Call** or **💬 Text** opens the phone's native dialer / SMS app via
`tel:` and `sms:` links, then opens a sheet to record the outcome. "Log a call" /
"Log a text" do the same without launching anything.

Saving writes in three places:

1. **`Touches` table** — one permanent row per call or text: buyer, type, who,
   when, outcome, notes. This is the real history.
2. **Buyer row mirror** — `Last Called` / `Called By` / `Times Called` (or the
   `Last Texted` / `Texted By` / `Times Texted` equivalents), plus `Last Outcome`.
   This keeps your existing `Next Eligible` and `Call Status` formulas working.
3. **`Call Notes`** — a dated entry prepended on top, e.g.
   `8/11/2026 (Seth) — Wants first look at Morgan dollars.`

Cadence is enforced by Airtable, not the app: Tier A = 30 days, B = 45, C = 60.
Once logged, a buyer flips to "Cooling down" and drops out of the queue. Marking
**Bad Number** or **Do Not Call** excludes them permanently.

## Phone numbers

The source data has mixed formats (`5137802507`, `978-771-9504`, `13147233332`,
`408 921 5791`). All are normalized to `+1XXXXXXXXXX` for dialing. Anything that
isn't a valid 10-digit US number renders with a **⚠ Check number** flag and
disabled Call/Text buttons rather than dialing something wrong.

## Deploying to Vercel

```bash
npm i -g vercel
vercel
```

Then add `AIRTABLE_TOKEN`, `APP_PIN` and `SESSION_SECRET` under
**Project → Settings → Environment Variables** and redeploy. Send the team the
URL and the PIN. On iPhone, Safari → Share → *Add to Home Screen* makes it feel
like an app.

## Security notes

- The Airtable token is server-side only; it never reaches the browser. All
  Airtable access goes through `/api/*` route handlers.
- The session cookie is `httpOnly` and HMAC-signed, so a user can't edit it in
  devtools to impersonate someone else. Forged cookies get a 401.
- This is a shared-PIN setup, not real per-user auth — anyone with the URL and
  the PIN sees customer phone numbers. Don't post the link publicly, and rotate
  `APP_PIN` if someone leaves.
