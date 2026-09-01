# Demo Login

Use these on the normal `/login` form:

- **Email:** `demo@hopelessopus.test`
- **Password:** `demo1234`

Entering these exact credentials short-circuits the login form **before** it
calls the backend — no server or database needed. It starts a local session
(story progress, minigame scores, points all kept in `localStorage`) so you
can walk the entire flow — login → story → all 20 minigames — with the
backend switched off.

## Guest access (no credentials needed)

The login page also has a **PLAY AS GUEST** button. It works the same way:
100% client-side, no network call, drops you straight into `/play`.

## What stays backend-only

Registration, the live Leaderboard, and Profile still talk to the real
server/Mongo — guest and demo progress is local to your browser only and
won't show up there. See [README.md](README.md) for running the full backend.
