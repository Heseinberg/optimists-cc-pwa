# Cowork handoff prompt — Optimists CC app

Paste everything below into Cowork as your first message, in a session pointed at
a folder containing the unzipped contents of `optimists-cc-pwa.zip` (attached alongside
this file). Cowork should treat that folder as the project workspace.

---

## Project

A mobile-installable PWA (Progressive Web App) for **Optimists Cricket Club**
(optimists.cc), a cricket club in Walferdange, Luxembourg. It mirrors the club
website's navigation — News, Fixtures, Teams, Honours, More — as a native-feeling
app that installs to a phone home screen.

**Files in this folder:**
- `index.html` — the entire app (single file, ~625 lines): HTML shell, CSS design
  system (green/parchment/leather cricket-pavilion palette, Fraunces + IBM Plex Sans
  fonts), and vanilla JS that renders all tabs from inline data objects
  (`TEAMS`, `NEWS`, `FIXTURES`, `SQUADS`, `HONOURS`, `AVERAGES`, `MORE_PAGES`)
- `manifest.json` — PWA manifest (icons, theme colors, standalone display)
- `sw.js` — service worker; cache-first for the app shell so it works offline once
  installed (cache version currently `optimists-cc-v2` — bump this on any content change
  so returning users get the refresh)
- `icon-192.png`, `icon-512.png`, `icon-512-maskable.png` — generated app icons
  (cricket ball + "OCC" monogram on pitch green)

**How it's deployed:** static hosting only (no backend). Previously deployed via
Netlify Drop (drag the unzipped folder onto app.netlify.com/drop) — do the same
after any update, or use whatever static host Cowork has access to.

## What's already done

- Real (not placeholder) content pulled from optimists.cc's **public** pages:
  news stories, fixtures for 7 of 9 teams, team squads (captain/vice-captain/players)
  and all-time win/loss history for 6 teams, the full honours board (multiple award
  categories back to the 1980s), club history/committee/membership/location pages
  built as in-app drill-down pages (see `MORE_PAGES` in the JS), and a gallery listing.
- Real **2026-season batting/bowling averages** for the 1st XI (LCF League) and BCF
  1st XI (BCF League), obtained by driving the site's dropdown filters directly with
  Claude in Chrome (`form_input` on the `<select>`, not just reading the page) — a
  plain fetch can't do this because the site is ASP.NET WebForms and the dropdowns
  are pure `__doPostBack` JS with no URL/query-string override.
- **League tables are confirmed genuinely empty** on the site for every team — not a
  UI limitation. Verified by actually opening the season dropdown: it only ever
  offers "2011", and the page states no table was added. Don't spend time trying to
  extract these; there's nothing there.
- The Stats page (`/stats/default.aspx`) also returns zero results on a full search
  with every filter open — confirmed empty, not just unpopulated for a default filter.
- Teamsheets/match-day selections and player availability are genuinely behind
  member login (`Viewing of team selections is restricted to logged in members`) —
  can't be pulled without the user's own credentials entered directly into the site
  (never via Claude).

## Site structure reference (optimists.cc, powered by Hitssports)

Base pattern: `https://www.optimists.cc/{section}/teamid_{id}/{slug}.aspx`

Team IDs:
| Team | teamid |
|---|---|
| Optimists (Friendly) | 4063 |
| OCC (LCF - Outdoor) 1st XI | 4070 |
| OCC (LCF - Outdoor) 2nd XI | 18597 |
| OCC (BCF) 1st XI | 4068 |
| OCC (LCF - Indoor) 1st XI | 19465 |
| OCC (LCF - Indoor) 2nd XI | 19466 |
| Optimists Maidens (OMCC) | 4110 |
| Optimists (Other) | 19423 |
| Optimists U13s - Defunct | 4069 |

Sections: `news`, `fixtures`, `teamsheet` (login-gated), `team` (squad + history),
`averages` (dropdown-gated), `leaguetables` (empty, don't bother), `stats` (empty),
`honours`, `history`, `gallery`, `location`, `contact`, `events`.

Fixture iCal export (genuinely live-syncing, no scraping needed):
`https://www.optimists.cc/fixtures/teamid_{id}/seasonid_19380/default.aspx?ical=true`
(`seasonid_19380` = 2026 season; confirmed to work across at least teams 4070 and 4068)

Averages competition `typeid` values (needed to pre-select via `form_input` or a
direct `<select>` value — a page fetch alone can't select these):
`BCF T20 Tournament=10081, Friendly=5990, LCF League=5993, Juniors=6022,
BCF League=5992, LCF Development League=19175, LCF T20 Cup=19727, LCF T10=20054`
Season `19380` = 2026 (season IDs decrement roughly chronologically if you need
older years — e.g. `19089`=2025, `18841`=2024).

Official app note: the site links to an existing **Hitssports mobile app**
(`com.hitssports.mobile` on Play Store / App Store ID `1506680713`) that likely
already supports Optimists CC with real login and live sync — worth the user
checking before investing further in a custom app.

## Suggested next steps for Cowork

Pick whichever the user actually wants — don't assume all of these:

1. **Fill remaining averages gaps**: LCF Indoor 1st XI, Maidens, and Other teams
   haven't had their averages checked for 2026 LCF/relevant competitions (some may
   be genuinely empty given their fixture lists were empty too — verify, don't assume).
2. **Automate the iCal → in-app refresh loop**: write a small script (could run in
   Cowork on a schedule, or be triggered manually) that re-fetches the iCal feeds
   and news list, regenerates the `FIXTURES`/`NEWS` JS objects in `index.html`, and
   redeploys — this is the closest thing to real "daily sync" achievable without a
   backend server.
3. **Redeploy**: after any content change, re-zip the folder and redeploy to Netlify
   (or wherever Cowork has hosting access) — remember to bump the `CACHE` version
   string in `sw.js` first or returning installed users won't see the update.
4. **Expo/React Native version**: was offered earlier as a bonus path to an actual
   App Store listing but never built — still on the table if the user wants a real
   native app rather than an installable web app.

## Constraints to respect

- Never attempt to log into optimists.cc with the user's credentials — that's
  member-only data (teamsheets/availability) and logging in on their behalf isn't
  something Claude should do even with credentials offered in chat.
- Don't fabricate league table or stats data — it's confirmed empty; show that
  honestly in the UI rather than inventing numbers.
- Keep the single-file `index.html` self-contained (no external JS framework) unless
  the user explicitly asks to restructure it — it was deliberately built dependency-free
  so it works as a static PWA with no build step.
