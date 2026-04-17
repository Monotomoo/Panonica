# STATE — 2026-04-18 (Saturday morning)

## Where we are

Both prototypes shipped last night. Panonica landed strong — "genius" per Tomo. Concessio works but Panonica is the focus for Saturday's full push.

Three commits on `main`:
- `aa4d5bb` checkpoint: monorepo scaffold + Panonica hero
- `b093c07` Panonica: all 8 screens complete
- `5064217` Concessio: full scaffold + 4 routes + README
- Plus one uncommitted fix: `packages/ui/src/fonts.css` nested `*/` in a comment block was killing PostCSS. Resolved; both apps now 200 across every route.

## How to run

```bash
cd "D:/CLAUDE PROJECTS/Paladian Projects V0.1"
npm run panonica   # localhost:3000
npm run concessio  # localhost:3001
```

Both dev servers should auto-HMR on edits. Shared `@paladian/ui` imports transpile through Vite — no build step needed for the UI package.

## What "go max on Panonica" means tonight

Tomo said "work to the max on Panonica." Priorities in order:

1. **Polish pass on the 8 screens, screen-by-screen.** I built them blind. Likely targets:
   - Hero timing (currently 2600/2300/2400ms per phase — may feel slow/fast on his screen)
   - Configurator slider responsiveness (derived numbers tween smoothly, but check for lag on his laptop)
   - Typography weight/tracking consistency across display blocks
   - Hover glow consistency (some CTAs have `shadow-glow-pulse`, others don't)
   - Right-align of every numeric table column (spot-check)
   - Framer Motion AnimatePresence route transitions (may need tuning)

2. **Bigger enhancements — pick from this list with Tomo:**
   - Swap Land map to live Mapbox GL JS (token in `apps/panonica/src/routes/land.tsx` references static PNG now)
   - Add a "replay intro" button somewhere hidden so Hero can replay mid-demo without reload (`sessionStorage.removeItem('panonica.intro-played')`)
   - Concessio-style entity graph on Panonica Thesis page (show project stakeholders visually)
   - Real SVG cadastral overlay on the ParcelMap (not the 8-vertex approximation)
   - Animated sun-arc that tracks the current hour of day on Land + Solar
   - "Export dossier" flow that actually generates a real PDF via a client-side lib (optional — the animation-only version is pitch-safe)
   - Scroll-snapping between screens so the whole app feels like a deck
   - Sound cues on key transitions (subtle — opt-in toggle)
   - Per-screen keyboard shortcuts (1–8 jumps routes, `/` global search, esc back)
   - Add an "ETA to construction" countdown that references the real timeline

3. **Stretch — after core polish:**
   - Vercel deploy Panonica (so he can share a URL)
   - Aurion scaffold (the portfolio command center from `02_AURION.md`) if time allows
   - Pre-flight offline test: fly-mode the laptop, verify every asset is cached

## Known rough edges (identified, not yet fixed)

- Preview screenshot tool (`mcp__Claude_Preview__preview_screenshot`) times out because of infinite animations (pulse-dot, cursor-blink, centroid pulse ring). Not a real issue — app renders fine in actual browsers.
- Concessio entity graph is hand-placed SVG (not `@xyflow/react`). Dep is installed; swap is a one-afternoon refactor.
- Mapbox token `pk.eyJ1IjoibW9ub3RvbW8i...` is embedded client-side. Safe for demo (public key), but Tomo may want to rotate after Sunday.
- Satellite PNGs are 764KB / 938KB / 1.1MB — fine for local demo, may want to optimize for Vercel.
- Windows line ending warnings on every git add (LF → CRLF). Benign.
- `font-display` uses the `font-display-editorial` class name in places but the preset only exposes `display-editorial` (kebab-case). Minor — check for any mismatches.

## Panonica file map (for quick navigation)

```
apps/panonica/
├── src/
│   ├── App.tsx                ← router + shell + sidebar nav
│   ├── main.tsx
│   ├── index.css              ← Tailwind entry, font imports, utility classes
│   ├── routes/
│   │   ├── hero.tsx           ← 3-phase cinematic reveal (coords → map → cards)
│   │   ├── land.tsx           ← split view, SVG parcel, 11-row data, 51 parcels
│   │   ├── solar.tsx          ← 1,382 kWh hero ticker, heatmap, monthly bars, benchmarks
│   │   ├── grid.tsx           ← dual hero (2500 MW · #14 queue), SVG diagram, stats
│   │   ├── configurator.tsx   ← THE interactive centerpiece — tabs, 6 sliders, IsoFarm, impact strip
│   │   ├── roi.tsx            ← Recharts area chart, 5 toggles, scenario cards
│   │   ├── subsidies.tsx      ← 6 program cards, live funding-stack calculator
│   │   └── thesis.tsx         ← PDF doc mockup + 2.2s compile animation + download toast
│   ├── components/
│   │   ├── ParcelMap.tsx      ← shared satellite+SVG component, used by Hero/Land/Solar
│   │   └── IsoFarm.tsx        ← configurator visualization — isometric panels + sheep/crops
│   └── mock/                   ← all data verbatim from brief (parcel, solar, grid, configs, subsidies, timeline)
└── public/
    └── imagery/
        ├── beravci-close.png  ← zoom 14.5 satellite of the plot
        ├── beravci-wide.png   ← zoom 10.5 regional view
        └── slavonia.png       ← zoom 7.5 Slavonia overview
```

## Shared UI the polish pass may touch

`packages/ui/src/components/`:
- `NumberTicker.tsx` — count-up with IntersectionObserver trigger. `triggerOnView={false}` for immediate tickers.
- `TextScramble.tsx` — Apple-style char cycle, used on Concessio, available for Panonica if needed
- `Typewriter.tsx` — char-by-char, used in Hero coords + Concessio home lines
- `DataPanel.tsx` — label/value rows, right-aligned mono, used on Land
- `Shell.tsx` + `StatusBar.tsx` + `SideNav.tsx` — persistent app shell

Tokens at `packages/ui/src/tokens.ts`, CSS vars at `packages/ui/src/fonts.css`, Tailwind preset at `tailwind.preset.cjs`.

## Strategy reminders (from 00_STRATEGY.md)

- Day-1 pitch is **Panonica only** — solar, Slavonia, the future. No mention of criminal case / Russian connections / IGH history.
- Demo time target: **6–8 minutes** then shut up.
- If he grabs the mouse during Configurator — you've won.
- Thesis "Generate PDF" is the curtain drop.

## Post-compact first move

Read this file. Then read `C:\Users\Tomo\Desktop\01_PANONICA.md` for the brief, and `C:\Users\Tomo\Desktop\00_STRATEGY.md` for the pitch choreography. Then ask Tomo which polish bucket to start on — or he'll tell you directly.
