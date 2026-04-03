# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm install          # install dependencies
npm run dev          # dev server with hot reload
npm run build        # type-check + production build (dist/)
npm run lint         # oxlint + eslint (both with --fix)
npm run format       # oxfmt formatter on src/
npm run deploy       # build + CDK deploy to AWS
```

There are no tests. Type-checking runs as part of `npm run build` via `vue-tsc --build`.

## Architecture

This is a Vue 3 SPA styled as a **retro platformer game** — the resume content is presented as interactive game sections rather than a traditional page.

### Frontend (`src/`)

- **`GameCanvas.vue`** — the core component. Owns the game loop, physics state, and camera. The physics body is a **plain JS object** (not reactive/Pinia) to avoid Vue Proxy overhead on every tick.
- **`components/game/`** — game engine split into focused modules:
  - `levelData.ts` — world constants (canvas size, gravity, speed) and level layout (platforms, ladders, zones)
  - `physics.ts` — collision resolution, gravity, ladder detection
  - `renderer.ts` — all canvas drawing (background, platforms, character, HUD, scanlines)
  - `useInput.ts` — keyboard input via a `Set<string>` of held keys
  - `useGameLoop.ts` — `requestAnimationFrame` loop with delta time
  - `VirtualControls.vue` — touch/mobile on-screen buttons
- **`stores/game.ts`** — Pinia store with a single concern: which resume section overlay is open (`activeSection`, `overlayVisible`)
- **`components/resume/`** — overlay components for each section (About, Experience, Education, Skills) plus `SectionOverlay.vue` which switches between them
- **`logger.ts`** — fires fire-and-forget POST events to a Lambda Function URL when a page view or section open occurs. Supports `?ref=` and `?company=` query params for tracking.
- **`router/index.ts`** — Vue Router (single route: `/` → `HomeView`)

The game loop: `useGameLoop` calls `tick(dt)` each frame → input is read → physics updated → zone detection → if Enter pressed near a zone, `gameStore.openSection(id)` → overlay renders over the canvas.

### Infrastructure (`infra/`)

AWS CDK stack (`ResumeStack`):
- S3 bucket (private) + CloudFront distribution with OAC
- Route 53 A/AAAA/CNAME records pointing to CloudFront
- ACM certificate (DNS-validated, us-east-1)
- DynamoDB table `resume-visits` for visit logs
- Lambda function (`infra/lambda/log-visit`) with a Function URL — called by `src/logger.ts`

Deploy: `npm run deploy` (root) runs `vite build` then `npx cdk deploy` from `infra/`. Requires AWS credentials in the environment.

### Tooling notes

- Vue 3 **beta** (Vapor renderer) — uses `npm overrides` to pin all `@vue/*` packages to beta
- Linting: oxlint runs first, then eslint (configured in `eslint.config.ts`); both auto-fix
- Formatter: oxfmt (not prettier)
- `@` path alias resolves to `src/`
