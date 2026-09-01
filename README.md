# Hopeless Opus

A visual-novel style event site with 20 embedded minigames, built as a React (Vite)
client + Express/MongoDB server.

## Running it from an IDE (VS Code, WebStorm, etc.)

You need two terminals open in the IDE — one for the server, one for the client.
Open the folder `hopeless-opus-main` as your project root, then use the IDE's
integrated terminal (`` Ctrl+` `` in VS Code) for both.

### 1. Server

```bash
cd server
npm install
```

Create a `server/.env` file (it isn't committed) with:

```
PORT=5000
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<any random string>
```

You need a MongoDB instance (local `mongod`, or a free MongoDB Atlas cluster) —
`MONGO_URI` points at it. Then start the server:

```bash
npm run dev
```

Runs on `http://localhost:5000`.

### 2. Client

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Vite prints a local URL (`http://localhost:5173` by default) — open that in a
browser. `client/.env` already points it at `http://localhost:5000/api`.

### 3. Play without a backend at all

If you just want to try the game (story + all 20 minigames) without setting up
Mongo, skip the server entirely and open the client. On the login page:

- Click **PLAY AS GUEST**, or
- Log in with the dummy credentials in [DEMO_CREDENTIALS.md](DEMO_CREDENTIALS.md)

Both run fully client-side (local story data + local scoring, saved to
`localStorage`) — no server or database required. Everything outside the actual
game (Profile, the live Leaderboard) still needs the backend, since it reads
real registered teams from Mongo.

## Project layout

- `client/` — React + Vite frontend (`src/pages`, `src/components`,
  `src/Minigames` for the 20 minigame components)
- `server/` — Express API (`controllers/`, `routes/`, `models/`)
- `docker-compose.yml` — containerized setup for client + server + nginx, if you'd
  rather run it via Docker than an IDE terminal
