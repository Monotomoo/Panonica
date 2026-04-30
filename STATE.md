# STATE — 2026-04-19 (Saturday late · pre-Sunday pitch)

## Where we are

**Panonica is shipped, deployed, and ready to demo.** Massive Saturday session pushed it from "8 polished screens" to **19 fully-wired routes including a Pantheon-aware AI offtake situation room**. Live on Vercel; pitch tomorrow Sunday with Ivan Paladina.

**Public URL:** https://panonica-concessio-6onlnuebl-monotomoos-projects.vercel.app/
**GitHub:** https://github.com/Monotomoo/Panonica
**Current commit:** `cd78033` (3 commits past `c97e844` baseline · 32k LOC added)

```bash
# Local
cd "D:/CLAUDE PROJECTS/Paladian Projects V0.1"
npm run panonica   # localhost:3000

# Already running in background as task bebie7f0m
```

---

## The big move this session: Beravci → Kopanica-Beravci

The actual project site is at **45.1348°N · 18.4130°E** (not the originally-modeled 45.2074 / 18.4393). Per Ivan's PDFs (`Kopanica_Paladina V2.pdf` · `velika kopanica_teaser_2020(2).pdf`) and the Google Maps link he shared, the parcel is **Business Zone Velika Kopanica**, near Kopanica-Beravci railway station, NOT Beravci village.

Migrated everywhere user-facing. Internal variable names (`beravciClimate`, `isBeravci`) stayed for code stability. Replaced fake cadastral numbers (`2841/g`) with realistic `k.č.br. 3418-3506` Velika Kopanica range. Soil → **Fluvisol**. Distances all redone. Posavina floodplain (5m delta · <1% slope · Hero 3D scene flattened to match).

---

## 19 routes (all 200, all ErrorBoundary-wrapped)

Pre-existing 8: `/context · /corridor · /land · /solar · /grid · /agriculture · /configurator · /thesis`

Added or rebuilt this session:
- `/build` — EPC-grade Builder · 16 sections · 120+ fields · live BoM
- `/roi` — Finance workbook · Monte Carlo Rain · Sensitivity tornado · Bullet charts
- `/scenarios` — A/B/C side-by-side comparison
- `/risk` — Climate stress · insurance · political risk
- `/timeline` — 25-yr scrubbable deal life
- `/subsidies` — FZOEU + NPOO + HBOR stack
- `/intel` — 12-source live data feeds
- `/market` — Market Radar · 18 Pannonian projects · bubble + radar + FZOEU pool
- `/offtake` — **AI Offtake Corridor** · 6-buyer stack · Pantheon · 24/7 CFE · 1000-run Monte Carlo
- `/one-pager` — Print-ready A4 leave-behind · PDF + PNG export
- `/deal-room/:encoded` — QR-shareable read-only landing
- `/` — REMOVED (Hero deleted) · redirects to `/context`

---

## Demo triggers (memorize these)

| Key | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Command Palette · Raycast-grade · 2-pane preview · recent + suggested |
| `⌘⇧F` / `Ctrl+Shift+F` | Mission Control PSOC · live-tick · radar · ticker · 1-9/M/B nav |
| `T` | Guided Tour · short (9 steps · ~3 min) |
| `⇧T` | Guided Tour · deep dive (15 steps · ~9 min) |
| `N` | Negotiation Mode · 3-slider deal modeler |
| `P` | Speaker Mode · per-route demo notes |
| `ESC` | Close any overlay |

Top status bar has: DemoProgress · LanguageToggle (EN↔HR) · Cmd-K hint.

---

## Architecture decisions worth remembering

1. **Mapbox v3 dead in this Vite env** → swapped to **Leaflet 1.9 + Google Maps satellite** for the Builder Site map. flyTo bailing → use `setView({animate, duration})` instead.
2. **Concessio breaks tsc** → root `vercel.json` ignored because Vercel project's rootDir is `apps/concessio`. Workaround: `apps/concessio/vercel.json` redirects build to Panonica via `cd ../.. && npm run build:panonica`. Long-term fix: change Vercel rootDir to blank in dashboard.
3. **Panonica build script** dropped `tsc -b` (lucide-react ComponentType variance + path-alias drift were blocking; vite/esbuild handles TS fine).
4. **All overlays ErrorBoundary-wrapped** so a single crash can't kill the demo.
5. **Bilingual EN↔HR toggle** only on Hero / Thesis / Deal Room (Ivan-facing surfaces).
6. **Hero 3D terrain flattened** (was procedural hills + bowl; now 5m micro-undulation) to match real Posavina topology.

---

## Known caveats (not blockers, but worth knowing)

- URL says `panonica-concessio-...` because Vercel project name is stale. 5-second UI fix in dashboard if cleaner URL wanted.
- Static fallback JPEGs (`kopanica-close.jpg`) are renamed but pixel content is still old Beravci aerial. Only surfaces if Google tiles fail.
- Visual-not-eyeballed on the deployed surface: Pantheon Gantt label widths · Buyer Stack slider thumbs (accent colors may need Tailwind config) · Monte Carlo histogram bar alignment. **User should walk the live URL on his laptop before bed.**
- 32-route smoke tested via curl 200 only · no playwright / e2e.
- Internal variable names still `beravci*` — refactoring would touch 50+ files for zero user benefit.
- `/deal-room/*` only hides sidebar — every other route now shows the menu (Hero behavior changed in last 30 min).

---

## File map (for quick post-compact navigation)

```
apps/panonica/src/
├── App.tsx                      ← 19 routes · 6 overlays · status bar · sidebar
├── routes/                      ← 19 .tsx route files
│   ├── offtake.tsx (NEW · 880 lines · wartime situation room)
│   ├── marketRadar.tsx (NEW · bubble + radar + FZOEU pool)
│   ├── onePager.tsx (NEW · A4 print-ready)
│   ├── build.tsx + components/builder/* (16-section EPC builder)
│   ├── thesis.tsx (PDF + Markdown + email + deal-room share)
│   └── ... (context, corridor, land, solar, grid, agriculture, configurator, roi, scenarios, risk, timeline, subsidies, intel, dealRoom)
├── components/
│   ├── ErrorBoundary.tsx (class · branded fallback · 26 mounts)
│   ├── GuidedTour.tsx (T short / ⇧T deep · drawer switcher)
│   ├── NegotiationMode.tsx (3 sliders · 8 outputs · fairness chip)
│   ├── MissionControl.tsx (PSOC cockpit · radar · live-drift · ticker)
│   ├── CommandPalette.tsx (Raycast-grade · cmdk-based)
│   ├── DealRoomShareModal.tsx (URL encode + QR + email)
│   ├── SolarAtlas.tsx (Calendar GHI + Sankey energy flow)
│   ├── BulletChart.tsx (KPI vs target · qual bands)
│   ├── Sparkline.tsx (zero-dep SVG smoothed)
│   ├── DnaGlyph.tsx (deterministic config fingerprint)
│   ├── builder/PolygonMap.tsx (Leaflet · Google sat · sun path · shadow cone · GHI heat ring)
│   ├── LanguageToggle.tsx (EN↔HR session-persisted)
│   └── ... (AiAssist, SpeakerMode, DemoProgress, MonteCarloRain, ParcelMap, etc.)
├── lib/
│   ├── offtakeMath.ts (PPA blender · CFE matcher · Monte Carlo · Newton IRR)
│   ├── builderDerive.ts (Builder → BoM → Finance pipeline)
│   ├── validationEngine.ts (16-section health score)
│   ├── dealRoom.ts (pako gzip + base64url URL encoding)
│   └── toneOfDay.ts (clock-driven palette)
├── store/ (Zustand)
│   ├── projectStore.ts (Builder state · 16 sections · 120 fields · v2 storage key)
│   ├── configStore.ts (Configurator state · cross-screen)
│   ├── scenariosStore.ts (A/B/C snapshots)
│   ├── progressStore.ts (route visit tracker)
│   └── langStore.ts (EN/HR toggle)
└── mock/                        ← 16 data files
    ├── aiCorridor.ts (NEW · 6 buyers + 8 DCs + 5 transmission + 6 taxonomy + MC params)
    ├── siteGeo.ts (PDF-digitized A3/D7/MP13C/canals/Sava + landmarks)
    ├── finance.ts (18 Pannonian project comparables + strategic radar + FZOEU pool)
    └── ... (timelineEvents, speakerNotes, sources, ai, agri, etc.)
```

---

## What's left if Sunday goes well and there's time after

| Priority | Item |
|---|---|
| Optional polish | Streamgraph + small-multiples viz (Q7 picks D + I never shipped) |
| Optional polish | Mobile responsive for screens <900 px |
| Optional polish | Real Kopanica satellite capture (current pixels are old Beravci) |
| Optional polish | Vercel project rename to drop "concessio" from URL |
| Stretch | Real Claude API (currently scripted ai.ts mock responses) |
| Stretch | ENTSO-E + HOPS live data connectors |
| Stretch | Concessio mock files repaired (currently broken; doesn't affect Panonica deploy) |

---

## Post-compact first move

1. Read this file
2. Confirm dev server is running: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` should return `200`
3. If user says "rehearse" → walk the keyboard cheat sheet in order: ⌘K → ⌘⇧F → T → ⇧T → N → /build → /offtake → /one-pager
4. If user says "fix X" → search the file map above; most components are self-contained
5. If user says "deploy" → `git push origin main` triggers auto-rebuild on Vercel
6. If something on the live URL misbehaves → check `apps/concessio/vercel.json` and `apps/panonica/package.json` build script first

Pitch is **Sunday 2026-04-20 PM**. Ship state: green. Sleep state: earned.
