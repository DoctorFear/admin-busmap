<!--
Guidance for AI coding agents working on the Admin Busmap repository.
Keep this file concise and actionable. Update when project structure changes.
-->

# Copilot / AI Agent Instructions — admin-busmap

Summary
- This is a Next.js (App Router) TypeScript project with a separate Express backend inside `src/server` and a Python optimizer under `ssb-optimizer_python`.
- Frontend port: `3000` (Next dev). Backend port: `8888` (Express). Next proxies `/api/*` to `http://localhost:8888/api/*` (see `next.config.js`).

Quick start (dev)
- Install dependencies: `npm install` in repo root.
- Run frontend: `npm run dev` (Next on port 3000).
- Run backend: `npm run server` (runs `node src/server/server.js` on port 8888).
- When testing real-time features run both in separate terminals.

Architecture notes (big picture)
- Frontend: `src/app/` uses Next.js App Router. Each folder under `src/app` maps to a route (e.g. `src/app/track/page.tsx`).
- Reusable UI lives in `src/components/`. CSS Modules are used: component/page-level CSS files (no global CSS for most components).
- Mock data and helpers live in `src/lib/` (e.g. `data_schedule.ts`, `util.ts`). Many UI pages still consume mock data rather than backend APIs.
- Backend: `src/server/` is a plain Express app exposing REST endpoints under `/api/*`. Routes are in `src/server/routes`, controllers in `src/server/controllers`, models in `src/server/models` and socket logic in `src/server/sockets`.
- Real-time: Socket.IO is used. See `src/server/sockets/trackingSocket.js` and frontend socket usages. Key event names: drivers emit `busLocation`; server broadcasts `updateBusLocation`.
- External integrations: Google Maps (frontend) via `@react-google-maps/api` and Leaflet (`react-leaflet`) are used in different map components. Google API key is read from `process.env.NEXT_PUBLIC_GG_MAPS_KEY`.

Project-specific conventions
- File placement:
  - Add new API endpoints by creating a file under `src/server/routes` and mounting it in `src/server/server.js` (this project mounts many routes explicitly).
  - UI pages: add a folder in `src/app/<route>/` and export `page.tsx` (App Router conventions).
- CSS: prefer CSS Modules (per-page/module `.module.css`). Avoid global style collisions.
- TypeScript settings: `tsconfig.json` sets `strict: true` but also `allowJs: true`. Backend is JS and lives alongside TS frontend—don't convert JS server files unless necessary.

Environments and secrets
- Frontend: `NEXT_PUBLIC_GG_MAPS_KEY` must be present for Google Maps components to work. Use `.env.local` during development.
- Backend: database connection details are in `src/server/db.js` (MySQL via `mysql2`). Be careful when changing DB schemas.

Python optimizer
- A helper optimizer is in `ssb-optimizer_python`. It expects a Python virtual environment called `venv_ssb`. Typical steps:
  - `python3 -m venv venv_ssb` then `source venv_ssb/bin/activate` (Linux/macOS). Install `pip install -r requirements.txt` inside that folder.
  - Interactions with the Python service are proxied or tested via `src/server/routes/routePythonService.js`.

Developer workflows & tips
- To run both FE and BE during development: open two terminals, run `npm run dev` and `npm run server`.
- The Next config rewrites `/api/*` to the Express server — modifying API paths requires checking `next.config.js`.
- When changing socket messages, update both `src/server/sockets/trackingSocket.js` and the matching client code in components (search for `socket.on` / `socket.emit`).
- For map components, check `src/components/GoogleMapsProvider.tsx` — it wraps the app with `LoadScript` and relies on `NEXT_PUBLIC_GG_MAPS_KEY`.

What to watch for when editing
- Don't break the proxy: keep `/api/*` endpoints stable or update `next.config.js` accordingly.
- Backend is plain JS — type conversions or refactors may require careful testing (e.g. `req.body` shapes).
- Many pages still use mock data from `src/lib/` — when wiring to real APIs, replace mocks incrementally and verify UIs still work offline.

Examples (use these snippets as reference)
- Mounting a new API route (add to `src/server/server.js`):
  - `import myRoutes from './routes/myRoutes.js'`
  - `app.use('/api/my', myRoutes)`
- Google Maps env usage (frontend):
  - `const googleApiKey = process.env.NEXT_PUBLIC_GG_MAPS_KEY` in `src/components/GoogleMapsProvider.tsx`.

Where to look first when debugging
- UI routing / page-level bugs: `src/app/*/page.tsx` and component imports.
- API / DB issues: `src/server/server.js`, `src/server/db.js`, and `src/server/routes/*`.
- Real-time issues: `src/server/sockets/trackingSocket.js` and the front-end components that consume `updateBusLocation`.

If you need more
- Ask for examples of any route, a walkthrough wiring a mock → API → DB, or a small PR that ports one UI page from mock data to live API.

--
Updated by AI assistant: keep this file short and focused on actionable repo facts.
