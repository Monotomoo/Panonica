# Paladian Pitch Prototypes

Two Antigravity-studio prototypes built for the Ivan Paladina pitch (Sunday 2026-04-19).

- **Panonica** — Pannonian solar intelligence. Beravci hero. 8 screens.
- **Concessio** — Public-procurement intelligence. Editorial dossier layout. Search Kupari → see his full saga.

Both share DNA: dark canvas (`#0A0A0B`), Pulse/Spark/Signal/Sun/Agri accent system, Space Grotesk display + JetBrains Mono numerics + Instrument Serif for Concessio editorial.

## Run the demos

```bash
# From the project root:
npm install      # only needed once
npm run panonica  # localhost:3000
npm run concessio # localhost:3001
```

Open each in its own browser window (full-screen, F11). Demo runs locally — no Vercel / network required.

## Demo choreography — Day 1 (Panonica)

Follow `C:\Users\Tomo\Desktop\00_STRATEGY.md` for the full meeting flow. Condensed:

1. **Laptop facing him. Panonica loaded on `/`.** Don't explain anything yet.
2. Click once. Let the coordinate typewriter play. *Don't talk.*
3. Parcel appears. Say: _"This is Beravci. Eighty hectares. We pulled it in as a test case."_
4. **Walk him through:** Land → Solar → Grid → Configurator. Let him touch the sliders. That's THE moment.
5. **On ROI:** stay quiet while he plays with the toggles. The subsidy-stacking moment sells itself.
6. **Thesis page:** _"The last thing this does is generate a dossier you could send to a lawyer or a bank tomorrow."_ Click GENERATE PDF. Let the animation play.
7. Shut up. Total demo time: 6–8 min.

## Demo choreography — Day 2 (Concessio)

1. **Laptop facing him. Concessio loaded on `/`.**
2. Press `/` or click the search box. Type "Kupari" slowly.
3. Hit enter. Land on the dossier. _"This is what we could build at market scale — for any deal, any operator, anyone."_
4. **Scroll the timeline.** Click any milestone. Let the drawer open.
5. **Scroll to the entity graph.** Hover his name. Let the relationships light up.
6. Click his node → entity profile loads. _"This is what your public record looks like through a clean, factual lens. This exists already — we just surfaced it."_
7. Shut up. Total demo time: 4–6 min.

## What NOT to do (from the strategy doc)

- Don't apologize for prototype state. The visuals sell themselves.
- Don't explain the stack unless asked. He doesn't care about React.
- Don't mention Russian connections / criminal case / IGH history *on Panonica*. Concessio handles them factually — not tabloid.
- Don't show both demos in one session unless he asks for it.

## File map

```
Paladian Projects V0.1/
├── packages/ui/          ← @paladian/ui shared design system
│   └── src/
│       ├── tokens.ts     colors, fonts, easing, durations
│       ├── fonts.css     CSS vars (mirrors tokens) + globals
│       └── components/   NumberTicker, TextScramble, Typewriter,
│                         DataPanel, Citation, StatusBar, SideNav, Shell
├── apps/panonica/        ← http://localhost:3000
│   └── src/
│       ├── routes/       hero, land, solar, grid, configurator,
│       │                 roi, subsidies, thesis (8 routes)
│       ├── components/   ParcelMap, IsoFarm
│       └── mock/         parcel, solar, grid, configs, subsidies, timeline
├── apps/concessio/       ← http://localhost:3001
│   └── src/
│       ├── routes/       home, search, deal/[slug], entity/[slug]
│       └── mock/         entities, kupariDeal, deals, news
└── tailwind.preset.cjs   shared Tailwind theme
```

## Mock data sources

All facts are from the briefs in `C:\Users\Tomo\Desktop\01_PANONICA.md`, `02_AURION.md`, `03_CONCESSIO.md` and his public record. Nothing invented, nothing invented, nothing guessed. If you want to adjust a number, mock files live in each app's `src/mock/` — update once, both UI and derived metrics refresh.

## Not done yet

- **Aurion** — the middle pitch (portfolio command center) is deferred per your ABCD scope decision. Resume by scaffolding `apps/aurion/` alongside, reusing `@paladian/ui`, and lifting mock data from `02_AURION.md`.
- **Vercel deploys** — local laptop is the primary demo source. If you want URLs Monday to share with Paladina post-pitch, run `vercel` inside each app dir (pk token for Mapbox already client-side safe).
- **Mapbox token** — client-embedded (`pk.eyJ...`) is a public key, safe for demos. Regenerate after the pitch if you want to rotate it out of the git history.

## Known rough edges

- Concessio entity graph is a hand-placed SVG layout (not React Flow) for pitch-day predictability. If you want pan/zoom, swap to `@xyflow/react` — the dep is installed.
- Panonica satellite PNGs are pre-fetched from Mapbox (2.7MB in `apps/panonica/public/imagery/`). Replace with sharper crops if you want.
- Both apps are desktop-only (1280+ width). Don't resize the browser window during demo.

Built with Claude Code Max 5x · Opus 4.7 · 2026-04-17 → 2026-04-18.
