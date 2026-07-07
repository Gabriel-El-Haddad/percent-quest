# Percent Quest — V2 Brief

Two parts: **(1)** the polished feedback (the vision), and **(2)** a self-contained
prompt to paste into a fresh implementing agent.

---

## Section 1 — Polished feedback (V2 vision)

**1. A knight companion (narrator + guide)**
- A little knight accompanies the player and **progresses through the game** as a
  quest — advancing along a path/track as images are completed.
- **All on-screen copy is delivered by the knight** through a speech bubble:
  typewriter text reveal + a mouth-movement animation while he "talks."
- The knight **gives the instructions, reacts to each answer** (cheers hits,
  encourages misses) and drops short in-character **quips**.
- Keep text **short and punchy**, in the voice of the story.

**2. Look & feel**
- Make the whole thing more interesting and visually appealing / game-like.
- **Bug:** on the results screen the "best guess" element blows up / breaks the page
  layout — make it robust so it can't overflow.

**3. Input & responsiveness**
- **Drop the open text field.** On mobile the keyboard pops up and shifts the page.
  Use the **slider as the only input**, and show the chosen percentage as a **large
  read-only number**.
- Ensure the page is **fully responsive on mobile, tablet, and desktop.**

**4. Ops**
- Confirmed: **merging to `main` auto-deploys to GitHub Pages.**

---

## Section 2 — Agent prompt (paste this to the implementing agent)

You are implementing **V2 of "Percent Quest"**, a React + TypeScript + Vite game
already built and deployed. Work in the existing repo — reuse its patterns, don't
rewrite the engine.

### Repo / stack
- Local: `~/Desktop/GITHUB/percentage-game` · Remote: `Gabriel-El-Haddad/percent-quest`
  (public) · Live: `https://gabriel-el-haddad.github.io/percent-quest/`.
- React 19, TypeScript (strict), Vite (`base: '/percent-quest/'`), CSS Modules +
  design tokens (`src/styles/tokens.css`), **Framer Motion**, Vitest + Testing
  Library. Commands: `npm test`, `npm run dev`, `npm run build`, `npm run lint`.
- Architecture: **pure game logic in `src/game/*`** (no React) — a phase state machine
  `idle→playing→feedback→results` in `src/game/reducer.ts` (leave its logic intact);
  copy lives in `src/game/messages.ts`; the `useGame` hook binds it in
  `src/hooks/useGame.ts`; screens in `src/screens/*`; reusable UI in
  `src/components/*`; tunables in `src/config/gameConfig.ts`. Images are generated
  build artifacts (`scripts/generate-images.mjs`, run via `pre*` npm scripts) — don't
  commit them.

### Build these features

1. **Knight character system (code-drawn SVG — no external asset files, must work
   offline).**
   - New `src/components/Knight.tsx`: an SVG knight with animation **states** driven by
     props: `idle` (gentle bob), `talking` (mouth open/close loop), `happy` (cheer on a
     hit), `encouraging` (on a miss). Animate with Framer Motion / CSS; the mouth is an
     SVG element toggled / `scaleY`-animated while talking.
   - Respect `prefers-reduced-motion` (the project already zeroes durations globally;
     also make the typewriter show full text instantly under reduced motion).

2. **Dialogue system.** New `src/components/DialogueBox.tsx`: a speech bubble with a
   **typewriter reveal**; while text is still typing, the knight is in `talking` state
   (drive via a callback / shared state), then settles to `idle`/`happy`/`encouraging`.
   Keep lines **short and punchy**.
   - **Route ALL player-facing copy through the knight.** Extend `src/game/messages.ts`
     (keep it pure and unit-tested) to return short in-character lines for:
     intro/instructions, correct (within ±`gameConfig.tolerance`), close miss, far
     miss, and each results tier. Replace the raw text currently rendered in
     `StartScreen`, `FeedbackScreen`, and `ResultsScreen` with knight dialogue.

3. **Quest progress.** The knight visibly **advances** as the player completes images —
   a path/trail tied to `position`/`total` from `useGame` (the hook already exposes
   these). Reuse/repurpose `ProgressBar` or add a small trail.

4. **Slider-only input.** Rewrite `src/components/PercentInput.tsx`: **remove the
   `<input type="number">`**. Keep the range slider as the sole control and show the
   current value as a **large read-only number** (e.g. `48%`). Submit via the existing
   button (not the keyboard). Accessibility: `aria-label` on the slider,
   `aria-live="polite"` on the number. Verify on a phone that **no keyboard appears and
   the page does not jump.** `GameScreen.tsx` still owns the value state.

5. **Fix the results-screen layout bug.** On `src/screens/ResultsScreen.tsx` /
   `ResultsScreen.module.css`, the "best guess" tile/hint overflows / breaks the layout
   at some widths. Reproduce and fix so nothing overflows (this is a **bug fix**, not a
   celebration effect). Constrain long hint text; keep the stat grid intact.

6. **Full responsiveness (mobile / tablet / desktop).** Audit every
   `src/**/*.module.css`. No horizontal scroll and no clipped/overflowing content at
   **360px, 768px, 1024px, 1440px**. The card `min-height: 520px` in `App.module.css`
   likely needs to relax on short viewports; the knight + dialogue must fit alongside
   the image card without crowding on small screens.

### Constraints
- Self-contained: no external images/fonts/scripts/network (matches the strict static
  deploy). Knight art is SVG/CSS only.
- Don't change the pure game engine's behavior; the character/dialogue are a
  presentation layer reacting to `phase` and `lastResult`.
- Keep copy short and punchy; keep TS strict and `npm run lint` clean.

### Tests (must stay green + extend)
- Existing tests in `src/**/*.test.ts(x)` — update the ones that assert the old UI
  (e.g. `App.test.tsx` looks for a number field labeled "your estimate" and the word
  "correct"; those change). Add tests for: slider-driven input + read-only number,
  `messages.ts` returning the new dialogue lines, and the knight/dialogue rendering per
  phase. Run `npm test` and `npm run build` — both must pass.

### Deploy
- Pushing to `main` auto-deploys via `.github/workflows/deploy.yml`. No infra changes
  needed. (This environment has no local `gh`/git auth — if you can't `git push`, hand
  the commit back to the user or push via the GitHub API.)

### Acceptance criteria
- Knight present across start/game/feedback/results; mouth animates while dialogue
  types; reacts (happy/encouraging) to results.
- 100% of player-facing copy comes through the dialogue bubble; short & punchy.
- Input is slider-only; a large read-only number shows the value; on mobile no keyboard
  appears and the page doesn't jump.
- Results screen has zero overflow/broken layout at all tested widths.
- No horizontal scroll from 360–1440px.
- `npm test` and `npm run build` pass; lint clean.
