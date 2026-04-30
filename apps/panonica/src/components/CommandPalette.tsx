import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Command } from 'cmdk';
import {
  Activity,
  ArrowRight,
  Bookmark,
  ChevronRight,
  Clock,
  Compass,
  FileBarChart2,
  LandPlot,
  Layers,
  LineChart,
  Plug,
  Radar,
  Settings2,
  ShieldAlert,
  Sparkles,
  Sprout,
  SunMedium,
  Zap,
  Coins,
  FileText,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@paladian/ui';
import { useConfigStore } from '@/store/configStore';
import { useScenariosStore } from '@/store/scenariosStore';

type PaletteTone = 'pulse' | 'sun' | 'agri' | 'signal' | 'spark';

interface CommandEntry {
  id: string;
  label: string;
  icon: LucideIcon;
  keywords?: string;
  group: string;
  shortcut?: string;
  run: () => void;
  tone?: PaletteTone;
  summary?: string; // right-pane preview body
  tags?: string[]; // right-pane preview chips
}

/**
 * Global command palette · Cmd/Ctrl+K.
 *
 * Raycast-grade redesign (Wave 1 · Phase B):
 *   - Two-pane layout · left = list, right = live preview of highlighted command
 *   - Recent + Suggested sections pinned at top (recent persists per session)
 *   - Color-chip tone bars on each row
 *   - Natural-language fallback — type a sentence, AI Assist surface
 *   - Stagger animation on entry
 *   - Keyboard hints right-aligned · full kbd bar at footer
 */

/* ============================ STORAGE ============================= */

const RECENT_KEY = 'panonica.palette.recent.v2';
function readRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.sessionStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}
function pushRecent(id: string) {
  if (typeof window === 'undefined') return;
  const current = readRecent().filter((x) => x !== id);
  current.unshift(id);
  window.sessionStorage.setItem(RECENT_KEY, JSON.stringify(current.slice(0, 6)));
}

/** Context-aware suggested IDs based on current route. */
function suggestedIds(currentPath: string): string[] {
  if (currentPath.startsWith('/roi')) {
    return ['jump-montecarlo', 'jump-sensitivity', 'jump-exit', 'save-A', 'action-ai'];
  }
  if (currentPath.startsWith('/build')) {
    return ['action-pdf', 'action-deal-room', 'nav-configurator', 'action-mission'];
  }
  if (currentPath.startsWith('/grid')) return ['jump-queue', 'jump-code', 'nav-solar', 'action-ai'];
  if (currentPath.startsWith('/solar')) return ['jump-production', 'jump-tech', 'nav-grid'];
  if (currentPath.startsWith('/configurator')) {
    return ['save-A', 'save-B', 'save-C', 'nav-scenarios', 'action-ai'];
  }
  if (currentPath === '/' || currentPath.startsWith('/context')) {
    return ['nav-corridor', 'nav-land', 'action-mission', 'action-deal-room'];
  }
  if (currentPath.startsWith('/scenarios')) return ['save-A', 'save-B', 'save-C', 'nav-configurator'];
  if (currentPath.startsWith('/thesis')) return ['action-pdf', 'action-deal-room', 'action-ai'];
  return ['action-mission', 'action-deal-room', 'action-ai', 'nav-build'];
}

/* ============================ COMPONENT =========================== */

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [highlight, setHighlight] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  const setConfig = useConfigStore((s) => s.set);
  const setScenario = useConfigStore((s) => s.setScenario);
  const snapshot = useConfigStore((s) => s.snapshot);
  const save = useScenariosStore((s) => s.save);
  const scenarios = useScenariosStore((s) => s.scenarios);

  // Recent IDs snapshot · refreshed each time the palette opens
  const recentIds = useMemo(() => (open ? readRecent() : []), [open]);
  const suggested = useMemo(() => suggestedIds(location.pathname), [location.pathname, open]);

  // Global Cmd/Ctrl+K listener
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Reset state on open
  useEffect(() => {
    if (open) {
      setValue('');
      setHighlight('');
      // Focus after animation frame so it doesn't steal focus during opening animation
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const go = (path: string, entryId?: string) => {
    if (entryId) pushRecent(entryId);
    navigate(path);
    setOpen(false);
  };

  const fire = (fn: () => void, entryId: string) => {
    pushRecent(entryId);
    fn();
  };

  const fireAiAssist = () => {
    window.dispatchEvent(
      new CustomEvent('panonica:ai-open', { detail: { prompt: value } }),
    );
    setOpen(false);
  };

  /* =========================== ENTRIES =========================== */

  const entries: CommandEntry[] = [
    // NAVIGATION
    { id: 'nav-hero', group: 'Navigation', label: 'Hero', icon: Sparkles, keywords: 'intro start home film', run: () => go('/', 'nav-hero'), shortcut: '1', tone: 'pulse', summary: 'Panonica opening · ambient 3D scene · the film.', tags: ['intro', 'film', 'kopanica-beravci'] },
    { id: 'nav-context', group: 'Navigation', label: 'Context · the argument', icon: Compass, keywords: 'macro story slavonia net metering', run: () => go('/context', 'nav-context'), shortcut: '2', tone: 'pulse', summary: 'The macro case · why now · why Pannonia.', tags: ['thesis', 'macro'] },
    { id: 'nav-corridor', group: 'Navigation', label: 'Corridor · transport + borders', icon: Compass, keywords: 'corridor x vc sava bih export pan-european rail paladina 2023 deck business zone', run: () => go('/corridor', 'nav-corridor'), tone: 'signal', summary: 'Pan-European Corridor X + Vc · A3 exit + D7 + rail + Sava. The moat.', tags: ['A3', 'D7', 'MP13C', 'Sava'] },
    { id: 'nav-land', group: 'Navigation', label: 'Land · parcel + cadastral', icon: LandPlot, keywords: 'kopanica beravci velika 80 ha parcel soil hydrology', run: () => go('/land', 'nav-land'), shortcut: '3', tone: 'pulse', summary: '80.3 ha at Kopanica-Beravci · Fluvisol · flat plain · 45.1348°N 18.4130°E.', tags: ['80.3 ha', 'Fluvisol', 'II–III'] },
    { id: 'nav-solar', group: 'Navigation', label: 'Solar · irradiance + tech', icon: SunMedium, keywords: 'ghi irradiance panel monocrystalline bifacial topcon tracker', run: () => go('/solar', 'nav-solar'), shortcut: '4', tone: 'sun', summary: 'GHI 1,382 kWh/m²/yr · peak sun 4.9 h/day · tech comparison.', tags: ['GHI 1382', 'PSH 4.9'] },
    { id: 'nav-grid', group: 'Navigation', label: 'Grid · queue + compliance', icon: Plug, keywords: 'hops hep queue connection tso dso lvrt', run: () => go('/grid', 'nav-grid'), shortcut: '5', tone: 'signal', summary: 'HOPS queue #14 · TS Slavonski Brod 1 · 22.8 km · IEC 61850 compliant.', tags: ['#14/62', '22.8 km'] },
    { id: 'nav-agri', group: 'Navigation', label: 'Agriculture · sheep + AGV', icon: Sprout, keywords: 'sheep pramenka under-panel agros biodiversity', run: () => go('/agriculture', 'nav-agri'), shortcut: '6', tone: 'agri', summary: 'Dalmatian Pramenka sheep under-panel · CAP Pillar 2 ecoscheme eligible.', tags: ['96 head', '1.2/ha'] },
    { id: 'nav-configurator', group: 'Navigation', label: 'Configurator', icon: Settings2, keywords: 'capacity battery sliders module tracking', run: () => go('/configurator', 'nav-configurator'), shortcut: '7', tone: 'pulse', summary: 'Live sliders · capacity · battery · tracking · height · spacing.', tags: ['sliders', 'live'] },
    { id: 'nav-build', group: 'Navigation', label: 'Builder · EPC-grade (16 sections, 120 fields)', icon: Settings2, keywords: 'build builder project from scratch epc engineer polygon draw ide specification tender', run: () => go('/build', 'nav-build'), tone: 'sun', summary: 'Deep EPC spec builder · 16 sections · 120+ fields · polygon-draw · BoM.', tags: ['EPC', '16 sections', 'polygon'] },
    { id: 'nav-finance', group: 'Navigation', label: 'Finance · workbook', icon: Activity, keywords: 'irr capex roi model monte carlo debt', run: () => go('/roi', 'nav-finance'), shortcut: '8', tone: 'agri', summary: 'Investor-grade workbook · IRR · DSCR · Monte Carlo · sensitivity · exit.', tags: ['11.4% IRR', '7.4 yr'] },
    { id: 'nav-subsidies', group: 'Navigation', label: 'Subsidies', icon: Coins, keywords: 'fzoeu npoo hbor eu funding grants', run: () => go('/subsidies', 'nav-subsidies'), shortcut: '9', tone: 'sun', summary: 'FZOEU · NPOO · HBOR Zeleni · EIP-AGRI · stackable grant layers.', tags: ['€4.2M target'] },
    { id: 'nav-intel', group: 'Navigation', label: 'Intel · data feeds', icon: Radar, keywords: 'sources scraper supabase live news feeds', run: () => go('/intel', 'nav-intel'), tone: 'pulse', summary: 'Live intel · HROTE prices · HUPX · HOPS queue · FZOEU tracker.', tags: ['8 feeds'] },
    { id: 'nav-market', group: 'Navigation', label: 'Market Radar · competitive intel', icon: Radar, keywords: 'market competitive radar bubble chart comparison bidders rivals pool fzoeu 18 projects', run: () => go('/market', 'nav-market'), tone: 'pulse', summary: '18 Pannonian solar projects · bubble chart · strategic radar · FZOEU pool splitter · head-to-head.', tags: ['#7 of 18', 'bubble', 'FZOEU'] },
    { id: 'nav-offtake', group: 'Navigation', label: 'AI Offtake Corridor · PSOC situation room', icon: Radar, keywords: 'offtake ai corridor pantheon topusko data center hyperscaler cfe 24/7 carbon free buyer stack ppa azure microsoft ina ht hrote bih export taxonomy monte carlo', run: () => go('/offtake', 'nav-offtake'), tone: 'spark', summary: '6-buyer stack · Pantheon × Azure × HT × INA × HROTE × BiH · 24/7 CFE matching · Monte Carlo across Pantheon-cancel/partial/full × commodity × policy.', tags: ['Pantheon', '24/7 CFE', '1000 runs', 'wartime'] },
    { id: 'nav-thesis', group: 'Navigation', label: 'Thesis · PDF dossier', icon: FileBarChart2, keywords: 'pdf download generate dossier ivan', run: () => go('/thesis', 'nav-thesis'), tone: 'sun', summary: 'The leave-behind · 4-page branded PDF thesis for Ivan.', tags: ['PDF', '4-page'] },
    { id: 'nav-one-pager', group: 'Navigation', label: 'One-Pager · print-ready leave-behind', icon: FileText, keywords: 'one pager one-pager a4 print pdf png leave behind summary single page handout', run: () => go('/one-pager', 'nav-one-pager'), tone: 'sun', summary: 'Single A4 · every key number on one page · print · PDF · PNG · email.', tags: ['A4', 'print', 'PDF'] },
    { id: 'nav-scenarios', group: 'Navigation', label: 'Scenarios Lab · A/B/C', icon: Layers, keywords: 'compare snapshot abc differential', run: () => go('/scenarios', 'nav-scenarios'), tone: 'pulse', summary: 'Side-by-side scenario compare · A/B/C snapshots with delta highlights.', tags: ['A · B · C'] },
    { id: 'nav-risk', group: 'Navigation', label: 'Risk Center', icon: ShieldAlert, keywords: 'climate insurance force majeure rcp', run: () => go('/risk', 'nav-risk'), tone: 'spark', summary: 'Climate stress · RCP 4.5/8.5 · insurance · political · cyber.', tags: ['stress', 'RCP'] },
    { id: 'nav-timeline', group: 'Navigation', label: 'Time Machine · scrub Y0 → Y25', icon: Clock, keywords: 'timeline time machine year exit refi COD construction 25 scrub play pause', run: () => go('/timeline', 'nav-timeline'), tone: 'pulse', summary: 'Scrub 2026 → 2050 · construction · COD · refi · exit animated.', tags: ['2026 → 2050'] },

    // JUMP TO TABS
    { id: 'jump-montecarlo', group: 'Jump to tab', label: 'Finance → Monte Carlo rain', icon: LineChart, keywords: 'monte carlo 1000 runs fan chart p10 p50 p90 particles', run: () => { pushRecent('jump-montecarlo'); go('/roi'); setTimeout(() => window.dispatchEvent(new CustomEvent('panonica:finance-tab', { detail: 'montecarlo' })), 200); }, tone: 'agri', summary: '1,000 simulation particles rain into IRR buckets. P10/P50/P90 emerge.', tags: ['1000 runs', 'particles'] },
    { id: 'jump-sensitivity', group: 'Jump to tab', label: 'Finance → Sensitivity + Tornado', icon: LineChart, keywords: 'sensitivity tornado heatmap irr variables', run: () => { pushRecent('jump-sensitivity'); go('/roi'); setTimeout(() => window.dispatchEvent(new CustomEvent('panonica:finance-tab', { detail: 'sensitivity' })), 200); }, tone: 'agri', summary: 'Which variable moves IRR most. Price > yield > CAPEX > debt > OPEX.' },
    { id: 'jump-debt', group: 'Jump to tab', label: 'Finance → Debt sizing', icon: LineChart, keywords: 'debt dscr gearing leverage', run: () => { pushRecent('jump-debt'); go('/roi'); setTimeout(() => window.dispatchEvent(new CustomEvent('panonica:finance-tab', { detail: 'debt' })), 200); }, tone: 'pulse', summary: 'Senior + mezzanine + equity stack · DSCR sensitivity · refi scenario.' },
    { id: 'jump-exit', group: 'Jump to tab', label: 'Finance → Exit (Y10 DCF)', icon: LineChart, keywords: 'exit mom cap rate kupari comparison year 10', run: () => { pushRecent('jump-exit'); go('/roi'); setTimeout(() => window.dispatchEvent(new CustomEvent('panonica:finance-tab', { detail: 'exit' })), 200); }, tone: 'sun', summary: 'Year-10 DCF exit · €30M EV · 9.5× Kupari paper.', tags: ['€30M EV', '9.5×'] },
    { id: 'jump-queue', group: 'Jump to tab', label: 'Grid → Queue · Kopanica-Beravci #14', icon: Plug, keywords: 'hep queue 14 62 projects', run: () => { pushRecent('jump-queue'); go('/grid'); setTimeout(() => window.dispatchEvent(new CustomEvent('panonica:grid-tab', { detail: 'queue' })), 200); }, tone: 'pulse', summary: 'HEP queue · position 14 of 62 · promoting to #8 by Oct 2026.', tags: ['#14/62'] },
    { id: 'jump-code', group: 'Jump to tab', label: 'Grid → Grid code compliance', icon: Plug, keywords: 'lvrt hvrt pq envelope iec 61850', run: () => { pushRecent('jump-code'); go('/grid'); setTimeout(() => window.dispatchEvent(new CustomEvent('panonica:grid-tab', { detail: 'code' })), 200); }, tone: 'signal', summary: 'LVRT / HVRT / PQ envelope / frequency-response · IEC 61850 compliant.' },
    { id: 'jump-production', group: 'Jump to tab', label: 'Solar → Production + degradation', icon: SunMedium, keywords: 'degradation p50 p90 nrel performance ratio', run: () => { pushRecent('jump-production'); go('/solar'); setTimeout(() => window.dispatchEvent(new CustomEvent('panonica:solar-tab', { detail: 'production' })), 200); }, tone: 'sun', summary: 'NREL PVWatts-style production model · first-year 1% · annual 0.4% decay.' },
    { id: 'jump-tech', group: 'Jump to tab', label: 'Solar → Tech comparison + trackers', icon: SunMedium, keywords: 'panel technology hjt topcon ibc tracker uplift', run: () => { pushRecent('jump-tech'); go('/solar'); setTimeout(() => window.dispatchEvent(new CustomEvent('panonica:solar-tab', { detail: 'tech' })), 200); }, tone: 'sun', summary: 'HJT vs TOPCon vs IBC · fixed vs 1-axis tracker uplift · ROI delta.' },

    // SCENARIOS
    ...(['A', 'B', 'C'] as const).map((slot) => ({
      id: `save-${slot}`,
      group: 'Scenarios',
      label: scenarios[slot] ? `Overwrite Scenario ${slot} (${scenarios[slot]!.name})` : `Save current config as Scenario ${slot}`,
      icon: Bookmark,
      keywords: `save snapshot slot ${slot}`,
      run: () => {
        pushRecent(`save-${slot}`);
        const defaultName = `Snapshot ${slot} · ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
        save(slot, defaultName, snapshot());
        setOpen(false);
      },
      tone: 'pulse' as const,
      summary: scenarios[slot] ? `Slot ${slot} has: "${scenarios[slot]!.name}" · will be overwritten.` : `Slot ${slot} is empty · will capture current configurator state.`,
      tags: [`slot ${slot}`],
    })),

    // QUICK CONFIG
    { id: 'config-pure', group: 'Quick config', label: 'Load scenario: Pure PV', icon: Zap, keywords: 'pure pv 52 mw no battery', run: () => fire(() => { setScenario('pure-pv'); go('/configurator', 'config-pure'); }, 'config-pure'), tone: 'signal', summary: 'Pure photovoltaic · 52 MW · no agri · no battery.', tags: ['52 MW'] },
    { id: 'config-sheep', group: 'Quick config', label: 'Load scenario: Agri-PV + Sheep', icon: Sprout, keywords: 'agri sheep 30 mw', run: () => fire(() => { setScenario('agri-sheep'); go('/configurator', 'config-sheep'); }, 'config-sheep'), tone: 'agri', summary: 'Phase 1 · 30 MW · Pramenka sheep · 4.2 m panels · 8.5 m rows.', tags: ['30 MW', 'sheep'] },
    { id: 'config-crops', group: 'Quick config', label: 'Load scenario: Agri-PV + Soy', icon: Sprout, keywords: 'agri soy 42 mw crops', run: () => fire(() => { setScenario('agri-crops'); go('/configurator', 'config-crops'); }, 'config-crops'), tone: 'agri', summary: 'Agri-PV · 42 MW · under-panel soy · EIP-AGRI operational.', tags: ['42 MW', 'soy'] },
    { id: 'config-25mw', group: 'Quick config', label: 'Set capacity → 25 MW (conservative)', icon: Settings2, keywords: '25 mw capacity conservative', run: () => fire(() => { setConfig('capacityMW', 25); go('/configurator', 'config-25mw'); }, 'config-25mw'), tone: 'pulse', summary: 'Conservative base case · under queue cap · buffer for derate.' },
    { id: 'config-30mw', group: 'Quick config', label: 'Set capacity → 30 MW (queue-approved)', icon: Settings2, keywords: '30 mw kopanica-beravci queue approved', run: () => fire(() => { setConfig('capacityMW', 30); go('/configurator', 'config-30mw'); }, 'config-30mw'), tone: 'pulse', summary: 'Exactly matches HOPS queue allocation. Phase 1 sweet spot.', tags: ['queue match'] },
    { id: 'config-40mw', group: 'Quick config', label: 'Set capacity → 40 MW (stretch)', icon: Settings2, keywords: '40 mw max stretch phase 2', run: () => fire(() => { setConfig('capacityMW', 40); go('/configurator', 'config-40mw'); }, 'config-40mw'), tone: 'pulse', summary: 'Phase 2 stretch · needs queue upgrade or second connection.' },
    { id: 'config-battery-off', group: 'Quick config', label: 'Battery → 0 MWh (no storage)', icon: Settings2, keywords: 'battery 0 off no storage', run: () => fire(() => { setConfig('battery', 0); go('/configurator', 'config-battery-off'); }, 'config-battery-off'), tone: 'pulse', summary: 'No storage · straight PPA · lowest CAPEX.' },
    { id: 'config-battery-20', group: 'Quick config', label: 'Battery → 20 MWh (standard)', icon: Settings2, keywords: 'battery 20 mwh standard lfp', run: () => fire(() => { setConfig('battery', 20); go('/configurator', 'config-battery-20'); }, 'config-battery-20'), tone: 'pulse', summary: 'LFP 20 MWh / 10 MW · arbitrage + frequency response revenue.' },
    { id: 'config-tracking-fixed', group: 'Quick config', label: 'Tracking → Fixed (cheap)', icon: Settings2, keywords: 'tracking fixed cheap lowest capex', run: () => fire(() => { setConfig('tracking', 'fixed'); go('/configurator', 'config-tracking-fixed'); }, 'config-tracking-fixed'), tone: 'pulse', summary: 'Fixed mount · lowest CAPEX · simplest O&M · loses 8% yield.' },
    { id: 'config-tracking-1axis', group: 'Quick config', label: 'Tracking → 1-axis (+8% yield)', icon: Settings2, keywords: 'tracking 1-axis tracker yield uplift', run: () => fire(() => { setConfig('tracking', '1-axis'); go('/configurator', 'config-tracking-1axis'); }, 'config-tracking-1axis'), tone: 'pulse', summary: 'Single-axis tracker · +8% yield · +€80k/MW CAPEX.', tags: ['+8%'] },

    // SYSTEM ACTIONS
    { id: 'action-pdf', group: 'Actions', label: 'Generate thesis PDF', icon: FileText, keywords: 'pdf download dossier ivan export', run: () => { pushRecent('action-pdf'); go('/thesis'); setTimeout(() => window.dispatchEvent(new CustomEvent('panonica:thesis-generate')), 300); }, tone: 'sun', summary: 'Render the investor-grade 4-page PDF · branded · downloaded instantly.', tags: ['PDF', 'branded'] },
    { id: 'action-ai', group: 'Actions', label: 'Ask Panonica AI…', icon: Sparkles, keywords: 'ai assistant chat question natural language', run: fireAiAssist, tone: 'pulse', summary: 'Pass your query to the AI drawer · 15+ pattern-matched answers.', tags: ['AI', 'chat'] },
    { id: 'action-speaker', group: 'Actions', label: 'Toggle Speaker Mode', icon: Activity, keywords: 'speaker notes demo mode presentation', run: () => { pushRecent('action-speaker'); window.dispatchEvent(new CustomEvent('panonica:speaker-toggle')); setOpen(false); }, tone: 'agri', summary: 'Per-route demo-script overlay · visible only to presenter.', tags: ['demo notes'] },
    { id: 'action-mission', group: 'Actions', label: 'Mission Control · fullscreen cockpit', icon: Sparkles, keywords: 'mission control fullscreen metrics wall command center dashboard opener closer wow psoc', run: () => { pushRecent('action-mission'); window.dispatchEvent(new CustomEvent('panonica:mission-control-toggle')); setOpen(false); }, tone: 'pulse', shortcut: '⇧⌘F', summary: 'Fullscreen ops cockpit · live metrics · DNA glyph · particle field.', tags: ['HUD', 'cockpit'] },
    { id: 'action-deal-room', group: 'Actions', label: 'Generate Deal Room link → share', icon: Sparkles, keywords: 'deal room share link url qr code send ivan email', run: () => { pushRecent('action-deal-room'); window.dispatchEvent(new CustomEvent('panonica:deal-room-generate')); setOpen(false); }, tone: 'agri', summary: 'Encode full state into URL · produce QR · copy / email / open.', tags: ['QR', 'share', 'ivan'] },
    { id: 'action-tour', group: 'Actions', label: 'Start Guided Tour · short (9-step · ~3 min)', icon: Sparkles, keywords: 'tour guided demo walkthrough auto play narration film scripted short', run: () => { pushRecent('action-tour'); window.dispatchEvent(new CustomEvent('panonica:guided-tour-toggle', { detail: 'short' })); setOpen(false); }, tone: 'sun', shortcut: 'T', summary: '9-step auto-advancing demo · ~2:40 · caption drawer + progress bar. SPACE pauses, ←/→ steps, ESC ends.', tags: ['9 steps', '~3 min', 'scripted'] },
    { id: 'action-tour-deep', group: 'Actions', label: 'Start Guided Tour · deep dive (15-step · ~9 min)', icon: Sparkles, keywords: 'tour guided demo deep dive walkthrough long thorough full', run: () => { pushRecent('action-tour-deep'); window.dispatchEvent(new CustomEvent('panonica:guided-tour-toggle', { detail: 'long' })); setOpen(false); }, tone: 'sun', shortcut: '⇧T', summary: '15-step investor-and-analyst deep-dive tour · ~9 min · covers all 14 routes in depth. Switch tracks mid-tour from the drawer.', tags: ['15 steps', '~9 min', 'deep dive'] },
    { id: 'action-negotiation', group: 'Actions', label: 'Open Negotiation Mode · live sliders', icon: Sparkles, keywords: 'negotiation deal price equity stake coinvestment live sliders handshake counter accept decline fair market comp', run: () => { pushRecent('action-negotiation'); window.dispatchEvent(new CustomEvent('panonica:negotiation-toggle')); setOpen(false); }, tone: 'agri', shortcut: 'N', summary: '3 sliders (price / equity / co-invest) recompute investor IRR, Paladina cash-out, fairness vs comps in real time. Accept / counter / decline.', tags: ['live', 'deal', 'sliders'] },
  ];

  const entriesById = useMemo(() => new Map(entries.map((e) => [e.id, e])), [entries]);

  /* ======================== SECTION ORDER ======================== */

  const recentEntries = recentIds
    .map((id) => entriesById.get(id))
    .filter((e): e is CommandEntry => Boolean(e));
  const suggestedEntries = suggested
    .map((id) => entriesById.get(id))
    .filter((e): e is CommandEntry => Boolean(e))
    .filter((e) => !recentIds.includes(e.id)); // de-dupe

  const mainGroups: string[] = [
    'Navigation',
    'Jump to tab',
    'Scenarios',
    'Quick config',
    'Actions',
  ];

  /* ============================ PREVIEW ============================ */

  const highlightEntry = useMemo(() => {
    if (!highlight) return undefined;
    // Find entry whose cmdk "value" string includes our highlight
    return entries.find((e) => {
      const v = `${e.label} ${e.keywords ?? ''}`;
      return v === highlight || v.trim() === highlight.trim();
    });
  }, [highlight, entries]);

  /* ============================ RENDER ============================ */

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[190] flex items-start justify-center pt-[10vh]"
          onClick={() => setOpen(false)}
          style={{ background: 'rgba(10, 10, 11, 0.78)', backdropFilter: 'blur(14px)' }}
        >
          <motion.div
            initial={{ y: -8, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -4, scale: 0.99, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="overflow-hidden rounded-2xl border border-pulse/30 bg-surface/95 shadow-2xl backdrop-blur-2xl"
            style={{
              width: 'min(980px, 94vw)',
              boxShadow:
                '0 40px 120px -20px rgba(124, 92, 255, 0.4), 0 8px 24px -8px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(250, 250, 250, 0.05)',
            }}
          >
            <Command
              loop
              label="Panonica command palette"
              value={highlight}
              onValueChange={setHighlight}
              shouldFilter
            >
              {/* TOP · search */}
              <div className="flex items-center gap-3 border-b border-border bg-canvas/60 px-5 py-3.5">
                <Sparkles className="h-4 w-4 text-pulse animate-pulse-dot" strokeWidth={1.8} />
                <Command.Input
                  ref={inputRef as any}
                  autoFocus
                  value={value}
                  onValueChange={setValue}
                  placeholder="Jump anywhere · configure · save scenario · ask AI…"
                  className="flex-1 border-0 bg-transparent font-mono text-[13px] tracking-wide text-text-primary outline-none placeholder:text-text-muted"
                />
                <kbd className="rounded border border-border-bright bg-surface px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                  esc
                </kbd>
              </div>

              {/* BODY · 2-pane */}
              <div className="flex" style={{ minHeight: 440, maxHeight: '60vh' }}>
                {/* LEFT · list */}
                <Command.List className="flex-1 overflow-y-auto border-r border-border px-2 py-2">
                  <Command.Empty className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                    <Sparkles className="h-5 w-5 text-text-muted" strokeWidth={1.5} />
                    <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">
                      no match
                    </span>
                    <span className="font-mono text-[10px] text-text-muted">
                      try{' '}
                      <span className="text-pulse">"monte carlo"</span>,{' '}
                      <span className="text-agri">"30 mw"</span>, or{' '}
                      <span className="text-sun">"deal room"</span>
                    </span>
                    <button
                      onClick={fireAiAssist}
                      className="mt-2 inline-flex items-center gap-2 rounded-md border border-pulse/40 bg-pulse/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-pulse transition-colors hover:bg-pulse/20"
                    >
                      <Sparkles className="h-3 w-3" strokeWidth={1.8} />
                      ask panonica AI
                      <ArrowRight className="h-3 w-3" strokeWidth={1.8} />
                    </button>
                  </Command.Empty>

                  {/* RECENT */}
                  {recentEntries.length > 0 && (
                    <PaletteGroup heading="Recent" icon={Clock}>
                      {recentEntries.map((e, i) => (
                        <PaletteItem key={e.id} entry={e} delay={i} />
                      ))}
                    </PaletteGroup>
                  )}

                  {/* SUGGESTED */}
                  {suggestedEntries.length > 0 && (
                    <PaletteGroup heading={`Suggested · ${pathLabel(location.pathname)}`} icon={Sparkles}>
                      {suggestedEntries.map((e, i) => (
                        <PaletteItem key={e.id} entry={e} delay={i} />
                      ))}
                    </PaletteGroup>
                  )}

                  {/* MAIN GROUPS */}
                  {mainGroups.map((groupName) => {
                    const rows = entries.filter((e) => e.group === groupName);
                    if (!rows.length) return null;
                    return (
                      <PaletteGroup key={groupName} heading={groupName}>
                        {rows.map((e, i) => (
                          <PaletteItem key={e.id} entry={e} delay={i} />
                        ))}
                      </PaletteGroup>
                    );
                  })}
                </Command.List>

                {/* RIGHT · live preview */}
                <div className="hidden w-[320px] flex-col bg-canvas/35 md:flex">
                  <CommandPreview entry={highlightEntry} />
                </div>
              </div>

              {/* BOTTOM · kbd bar */}
              <div className="flex items-center justify-between border-t border-border bg-canvas/60 px-5 py-2.5 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <kbd className="rounded border border-border-bright bg-surface px-1 py-0.5">↑↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1.5">
                    <kbd className="rounded border border-border-bright bg-surface px-1 py-0.5">↵</kbd>
                    run
                  </span>
                  <span className="flex items-center gap-1.5">
                    <kbd className="rounded border border-border-bright bg-surface px-1 py-0.5">esc</kbd>
                    close
                  </span>
                  <span className="flex items-center gap-1.5 text-pulse">
                    <Sparkles className="h-3 w-3" strokeWidth={1.8} />
                    natural-language fallback → AI
                  </span>
                </div>
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded border border-border-bright bg-surface px-1 py-0.5">⌘K</kbd>
                  <span>toggle anywhere</span>
                </span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ======================== SUB-COMPONENTS ======================== */

function PaletteGroup({
  heading,
  icon: Icon,
  children,
}: {
  heading: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-1.5 px-3 pb-1 pt-3 font-mono text-[9px] uppercase tracking-[0.26em] text-text-muted">
        {Icon && <Icon className="h-3 w-3 text-text-muted" strokeWidth={1.8} />}
        <span>{heading}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function PaletteItem({ entry, delay }: { entry: CommandEntry; delay: number }) {
  const Icon = entry.icon;
  const tone = entry.tone ?? 'pulse';
  const barCls: Record<PaletteTone, string> = {
    pulse: 'bg-pulse',
    sun: 'bg-sun',
    agri: 'bg-agri',
    signal: 'bg-signal',
    spark: 'bg-spark',
  };
  const iconCls: Record<PaletteTone, string> = {
    pulse: 'text-pulse',
    sun: 'text-sun',
    agri: 'text-agri',
    signal: 'text-signal',
    spark: 'text-spark',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(0.22, delay * 0.015) }}
    >
      <Command.Item
        value={`${entry.label} ${entry.keywords ?? ''}`}
        onSelect={entry.run}
        className={cn(
          'group relative flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 font-mono text-[12px] transition-colors',
          'data-[selected=true]:bg-pulse/12 data-[selected=true]:ring-1 data-[selected=true]:ring-pulse/30',
        )}
      >
        {/* Color chip · 2px left bar */}
        <span
          className={cn(
            'absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full opacity-40 transition-opacity group-data-[selected=true]:opacity-100',
            barCls[tone],
          )}
        />
        <Icon
          className={cn('ml-1 h-3.5 w-3.5 shrink-0 transition-colors', iconCls[tone])}
          strokeWidth={1.8}
        />
        <span className="flex-1 text-text-primary group-data-[selected=true]:text-pulse">
          {entry.label}
        </span>
        {entry.shortcut && (
          <kbd className="rounded border border-border-bright bg-canvas px-1.5 py-0.5 text-[9px] uppercase tracking-[0.22em] text-text-muted group-data-[selected=true]:text-pulse">
            {entry.shortcut}
          </kbd>
        )}
        <ChevronRight
          className="h-3 w-3 text-text-muted opacity-0 transition-opacity group-data-[selected=true]:opacity-70"
          strokeWidth={1.8}
        />
      </Command.Item>
    </motion.div>
  );
}

function CommandPreview({ entry }: { entry?: CommandEntry }) {
  if (!entry) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <Sparkles className="h-7 w-7 text-text-muted/50" strokeWidth={1.2} />
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          highlight a command to preview
        </span>
        <span className="font-mono text-[10px] text-text-muted/70">
          use ↑↓ · or hover any row
        </span>
      </div>
    );
  }
  const Icon = entry.icon;
  const tone = entry.tone ?? 'pulse';
  const toneBlock: Record<PaletteTone, string> = {
    pulse: 'border-pulse/40 bg-pulse/10 text-pulse',
    sun: 'border-sun/40 bg-sun/10 text-sun',
    agri: 'border-agri/40 bg-agri/10 text-agri',
    signal: 'border-signal/40 bg-signal/10 text-signal',
    spark: 'border-spark/40 bg-spark/10 text-spark',
  };

  return (
    <div className="flex h-full flex-col gap-3 p-5">
      <div className={cn('flex items-start gap-3 rounded-lg border p-3', toneBlock[tone])}>
        <Icon className="h-6 w-6 shrink-0" strokeWidth={1.4} />
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[9px] uppercase tracking-[0.24em] opacity-80">
            {entry.group}
          </span>
          <span className="font-display text-[14px] uppercase leading-tight tracking-tech-tight">
            {entry.label}
          </span>
        </div>
      </div>

      {entry.summary && (
        <p className="font-mono text-[11px] leading-relaxed text-text-secondary">
          {entry.summary}
        </p>
      )}

      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entry.tags.map((t) => (
            <span
              key={t}
              className="rounded-sm border border-border bg-surface/70 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-text-secondary"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex flex-col gap-2">
        {entry.shortcut && (
          <div className="flex items-center justify-between rounded-md border border-border-bright bg-canvas/60 px-3 py-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              shortcut
            </span>
            <kbd className="rounded border border-border-bright bg-surface px-2 py-0.5 font-mono text-[11px] text-text-primary">
              {entry.shortcut}
            </kbd>
          </div>
        )}
        <div className="flex items-center justify-between rounded-md border border-pulse/40 bg-pulse/10 px-3 py-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-pulse">
            run
          </span>
          <kbd className="rounded border border-pulse/40 bg-pulse/10 px-2 py-0.5 font-mono text-[11px] text-pulse">
            ↵ enter
          </kbd>
        </div>
      </div>
    </div>
  );
}

function pathLabel(p: string): string {
  if (p === '/') return 'hero';
  const seg = p.split('/').filter(Boolean)[0] ?? 'panonica';
  return seg;
}
