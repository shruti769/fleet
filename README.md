# FleetSync Mobile Driver App

Expo SDK 57 build of the FleetSync driver app, ported from the Claude Design
prototype. It covers all **143 artboards** — 98 screens (`A1`–`A36`, `B1`–`B7`,
`C1`–`C4`) and 45 overlays — across the access, dashboard, fit-for-duty,
pre-start, run, job, delivery, fatigue, records, messaging, profile, register
and looking-for-work flows.

## Run

```sh
npm install
npm start
```

Then scan the QR code with **Expo Go** on a phone. The iOS simulator needs a
full Xcode install; `npm run web` works in a browser without one.

## Verification

```sh
npm run check                 # typecheck + artboard coverage
npx expo export --platform ios --output-dir /tmp/fleetsync-export
```

`check:spec` asserts every one of the 143 artboards has a component and is
exported from the screen registry.

## Structure

- `app/` — Expo Router routes. `app/s/[id].tsx` renders any artboard; ids travel
  with `.` written as `_`, so `A27.S1` is at `/s/A27_S1`.
- `src/proto/screens/` — one component per artboard, plus `overlays/`.
- `src/proto/components/` — `AppHeader` and `TabBar`, the two shared artboards.
- `src/proto/runtime/` — the prototype's state machine (`state.tsx`), its
  derived bindings (`vals.ts`), its fixed data (`data.ts`), and the overlay and
  toast host.
- `src/proto/theme/` — the eight prototype keyframes as Reanimated components,
  and the bundled photographs.
- `src/data/`, `src/services/` — SQLite migrations and the offline write queue.

## Regenerating from the prototype

`src/proto/screens/**` and `src/proto/components/generated/**` are generated —
edit the prototype, not these files. With the unpacked prototype bundle
available:

```sh
node tools/prototype/generate.mjs /path/to/unpacked-prototype
```

The converter lives in `tools/prototype/`: `parse.mjs` (HTML), `css.mjs`
(inline CSS to RN styles) and `emit.mjs` (elements to JSX). Every literal value
from the prototype is carried through unchanged. The deliberate exceptions are
the device chrome: the prototype drew its own status bar and home indicator, and
those become real safe-area insets here.
