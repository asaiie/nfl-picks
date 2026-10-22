# NFL Picks

Six-person NFL picks for **nfl.amitsai.com**, starting Week 7 of the 2026 regular season. Vanilla JavaScript, Cloudflare Worker static assets, and a dedicated D1 database. Accounts (alphabetical): Abhay, Amit (admin), Kartik, Nikhil, Shahzad, Supreet. Same trusted-group first-login password setup as the NBA site; claim only your own name. Guests can read picks and accuracy; mutations require sign-in.

## Local development

```sh
npm install
npm run db:local
npm run dev
```

Local commands explicitly use `wrangler.local.jsonc` and isolated `.wrangler/` data. They never use production D1. `npm test` uses disposable Python SQLite databases and requires Python 3. `npm run build` copies only browser assets to `public/`; raw feeds and server sources are not published.

## Deployment

```sh
npx wrangler login
npm run db:remote
npm run deploy
```

Worker: `nfl-picks`. D1 binding: `DB`. Database ID: `974da02b-257a-4a1a-8bf8-e32e5987d278`. The custom domain is declared in Wrangler, which manages DNS and TLS. There are **no cron triggers or automatic results jobs**. Wrangler runs the asset build during deployment. For Workers Builds, deploy with `npx wrangler deploy`.

Initialize schema and schedule before deploying a fresh database. All SQL files are repeatable and preserve existing accounts, picks, results and schedule edits. No fixture passwords are deployed. Claim Amit first after launch. To recover the admin account, use the D1 console to clear user 1's password and delete their sessions, then claim it immediately.

## Rules

- Weekly navigation (7–18), no calendar picker. All dates and times use America/New_York, including daylight-saving changes.
- Each pick saves separately. The server derives the author from the session. Picks lock at the actual kickoff, enforced by a conditional SQL write. Known past kickoffs stay permanently locked when an admin changes the time later.
- Unconfirmed/TBD times have no selectable picks until Admin confirms the date/time. Postponed and canceled games are also closed.
- All finalized, non-tied regular-season games from Week 7 onward count toward accuracy. Missing picks count as incorrect. Ties are excluded for everyone. Changing a final score recalculates accuracy directly, preserving picks.
- A correct finalized pick has bright green fill and ✓. Incorrect and missing picks use muted text and ×. Ties have neutral styling. Final scores replace the kickoff label.
- NFC champion, AFC champion and Super Bowl champion picks remain editable, show update dates, and do not affect game accuracy. Conference validation runs on the server.
- Bracket is visibly locked. There are no bracket mutation endpoints.
- Only Amit can enter final scores, edit schedule/status, enter championship outcomes, and reset other users' passwords. Password reset revokes sessions and preserves picks. Result winners are derived from validated integer scores (including 0 and ties).

## Schedule and assets

`data/week-7.json` through `week-18.json` are snapshots of ESPN's public 2026 regular-season scoreboard fetched October 21, 2026, using `dates=2026&seasontype=2&week=N&limit=1000`. The import validates year, season type, week, IDs, teams, timestamps and duplicate team appearances. It includes **179 games**, 14 in Week 7, with **24 TBD kickoffs** at import time. Neutral-site designated home teams follow the feed. Results in the feed are not imported.

Regenerate the migration from saved snapshots with `node scripts/import-schedule.mjs`. This adds missing games without overwriting existing ones. Schedule changes, flex scheduling and final results must be entered manually in Admin; no background feed requests occur. Raw snapshots retain provenance but are excluded from browser assets.

Team logos are self-hosted copies from the ESPN team logo URLs in the schedule feed. Team trademarks belong to their respective owners. Space Grotesk and JetBrains Mono are self-hosted variable fonts under the SIL Open Font License; license files are in `assets/fonts/`.

## Security and validation

Salted PBKDF2-SHA256 passwords, random hashed session tokens, host-only HttpOnly/Secure/SameSite cookies, same-origin mutation checks, and per-IP/account login throttling. Separate cookie name and D1 database from the NBA app. Public account responses exclude password hashes and session data. CSP limits assets and requests to the same origin, and pages are marked noindex.

Tests exercise real SQLite queries for identity isolation, authentication, CSRF, kickoff/TBD locks, permanent locks after rescheduling, manual finals, ties, shutouts, corrections, invalid scores, championship validation, account resets, repeatable schedule imports and Week 7 scoring.
