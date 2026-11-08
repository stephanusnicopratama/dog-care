# Dog Care

Cozy 3D dog care game (v1) from the product PRD. React + Vite + React Three Fiber + Zustand.

## Run

```bash
cd dog-care
npm install
npm run dev
```

## Build

```bash
npm run build
```

Static output in `dist/` (suitable for GitHub Pages with `base: './'`).

## Features (v1)

- One dog, fenced yard, orbit camera
- Six needs with timed drain (4s real time = 1 in-game minute)
- Actions: feed, water, play, pet, bathe, sleep (UI + clickable props)
- `localStorage` save on action complete and when the tab hides
- Rename, coat swatches, size; mood from lowest need; happy-day counter

Tune drains and action recovery in `src/config/simulation.ts`.

## Live demo

After deploy: https://stephanusnicopratama.github.io/dog-care/
