# Percent Quest

A lightweight, frontend-only flashcard game for practicing **percentage-area
estimation**. An image is shown (shuffled and randomly rotated); you estimate what
percent of it is shaded, then get instant feedback and an end-of-session summary.
Results are saved locally in your browser.

Built with **React + TypeScript + Vite**, deployed automatically to **GitHub Pages**.

---

## Tech stack & architecture

| Layer | Choice | Notes |
| --- | --- | --- |
| UI | React 19 + TypeScript | Strict TS throughout. |
| Build | Vite | `base` set for GitHub Pages project sites. |
| Game state | `useReducer` finite state machine | `idle -> playing -> feedback -> results`. |
| Animation | Framer Motion + CSS | Screen transitions, spring feedback, count-up. |
| Styling | CSS Modules + design tokens | Tokens in `src/styles/tokens.css`. |
| Data | Static `src/data/images.json` | `{ id, src, correctPct }`. |
| Storage | `localStorage` behind a `SessionStore` interface | Swappable for IndexedDB / cloud. |
| Tests | Vitest + Testing Library | Pure logic + hook + component tests. |

**Design principle:** game logic (`src/game/*`) is pure — no React, no DOM — so it is
fully unit-tested and reusable. UI depends on it and on swappable data/storage modules,
so future features (characters, sound, leaderboard, cloud sync, multiple datasets) are
additive rather than rewrites.

```
src/
  game/        pure logic: types, reducer, scoring, random, messages
  config/      gameConfig.ts (tolerance, rotations, session length — no magic numbers)
  storage/     SessionStore interface + localStorage implementation
  hooks/       useGame (binds reducer + storage), useCountUp
  screens/     Start / Game / Feedback / Results
  components/  ImageCard, PercentInput, ProgressBar, Button, StatTile
  data/        images.json
scripts/       generate-images.mjs (placeholder dataset generator)
```

---

## Local development

```bash
npm install
npm run dev        # start dev server
npm test           # run unit + integration tests
npm run build      # production build to dist/
npm run preview    # serve the production build locally
npm run lint       # oxlint
```

> The dev server serves under the base path (`/percent-quest/`). Vite prints the
> exact local URL on start.

---

## Images

The sample images are **generated placeholders** and treated as build artifacts:
`scripts/generate-images.mjs` writes `public/images/*.svg` and `src/data/images.json`.
Generation runs automatically before `dev`, `test`, and `build` (via the `pre*`
npm scripts), so a fresh clone just works — no committed image files. Tweak the
count/targets in the generator, or run it manually with `npm run generate:images`.

Each manifest entry has the shape:

```json
{ "id": "img-01", "src": "images/img-01.svg", "correctPct": 37.5 }
```

- `src` is **relative to `public/`** (the app prefixes the base URL automatically).
- `correctPct` is the true shaded percentage (0–100).

### Using a real dataset

To ship real images instead of generated ones:

1. Remove the `pre*` generation scripts from `package.json` (and, if you like, the
   generator + its CI step).
2. Un-ignore `public/images/` and `src/data/images.json` in `.gitignore`.
3. Add your image files to `public/images/` and list them in `src/data/images.json`
   with their true percentages. No app code changes are needed.

## Tuning the game

Edit `src/config/gameConfig.ts`:

- `tolerance` — the ±% window that counts as correct (default `5`).
- `rotations` — allowed display rotations (default `[0, 90, 180, 270]`).
- `sessionLength` — `null` = every image each game; a number caps rounds per session.

## Swapping storage

`src/storage/sessionStore.ts` defines the `SessionStore` interface. `useGame` depends
only on that interface, so to move to IndexedDB or a backend, implement the interface
and pass it in — no component changes.

---

## Deployment (GitHub Pages, automatic)

Pushing to `main` triggers `.github/workflows/deploy.yml`, which tests, builds, and
publishes `dist/` to GitHub Pages.

**One-time setup:** in the repo, go to **Settings -> Pages -> Build and deployment ->
Source** and select **GitHub Actions** (the workflow also attempts to enable this
automatically on first run).

> **Base path:** `vite.config.ts` sets `base` to `/percent-quest/` to match the repo
> name. If you rename the repo, update `base` (or set the `BASE_PATH` env var at build
> time, e.g. `BASE_PATH=/` for a user/root site).
