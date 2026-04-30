/**
 * Speaker Mode · per-route demo notes shown to Tomo only.
 * Press P to toggle the overlay.
 *
 * Tone: crisp, action-oriented, investor-facing.
 * Target: 3-5 bullets per route, each <120 chars.
 */

export interface SpeakerNote {
  path: string;
  title: string;
  narrator: string[];       // what Tomo says aloud
  do: string[];             // physical actions (click, scroll, point)
  watch: string[];          // what to monitor in Ivan's reaction
  timeBudgetSec: number;    // target time on this screen
}

export const speakerNotes: SpeakerNote[] = [
  {
    path: '/',
    title: 'Hero · don\'t explain yet',
    narrator: [
      '(silence — let the coordinate typewriter play)',
      '"This is Kopanica-Beravci. Eighty hectares. We pulled it in as a test case."',
    ],
    do: [
      'Laptop facing him, Panonica on /',
      'Click once to trigger the reveal',
      'Let the parcel boundary draw — don\'t narrate over it',
    ],
    watch: [
      'Leans in → proceed to Context',
      'Reaches for laptop → let him',
    ],
    timeBudgetSec: 40,
  },
  {
    path: '/context',
    title: 'Context · the argument',
    narrator: [
      '"On January 1st of this year, Croatian rooftop solar economics died."',
      '"Utility-scale and agrivoltaic became the only serious plays."',
      '"Your 80 hectares sit inside a 2,500 MW window that closes in 28 months."',
      'Pause on the punchline · let him read it himself',
    ],
    do: [
      'Scroll slowly through each section',
      'Linger on the Ribić Breg card — that\'s his peer',
      'Pause before the punchline',
    ],
    watch: [
      '"€30M" reaction → proceed to Land',
      'Questions about OIEH → acknowledge, redirect to Configurator',
    ],
    timeBudgetSec: 90,
  },
  {
    path: '/corridor',
    title: 'Corridor · the logistics play',
    narrator: [
      '"Your own 2023 deck leads with this — corridors X and Vc cross here."',
      '"70 MW in your plan. 30 in the HOPS queue. 40 MW unlocked in phase 2."',
      '"Eleven km to BiH. Cross-border spread is eight euros per megawatt-hour during peak."',
    ],
    do: [
      'Scroll through the 3 maps (regional / European / zone)',
      'Land on the 11 km BiH number · let him react',
      'Scroll to the Paladina 2023 quote at the bottom · that\'s HIS deck',
    ],
    watch: [
      '"Did you read my deck?" → Yes, all three versions + the 2020 teaser',
      '"Cross-border feasible?" → 62% of market-coupled days have positive spread',
    ],
    timeBudgetSec: 90,
  },
  {
    path: '/land',
    title: 'Land · the asset',
    narrator: [
      '"This is the parcel, satellite, live sun position."',
      '"Viability score is 87 out of 100. Soil and grid access are the binding axes."',
      '(If he hovers a sub-parcel) "Fifty-one real cadastral lots inside · k.č.br. 3418–3506."',
    ],
    do: [
      'Switch the map layer between satellite / cadastral / soil / slope',
      'Scroll to the viability breakdown · don\'t dwell',
      'Skip regulatory unless he asks',
    ],
    watch: [
      'Questions about UPU? → pending, May 20 consultation',
      'Soil questions? → Fluvisol · Sava valley alluvium · II–III class · pile-ready',
    ],
    timeBudgetSec: 45,
  },
  {
    path: '/solar',
    title: 'Solar · production',
    narrator: [
      '"Annual irradiance is 1,382 kWh/m². That\'s better than Munich, worse than Rome."',
      '"Panel tech comparison is in the Tech tab if he pushes."',
    ],
    do: [
      'Show the hero number · the monthly bars · the benchmark list',
      'Only open Production/Variability/Tech if asked',
    ],
    watch: [
      'Benchmark question → show Tech tab',
      'Degradation question → open Production tab',
    ],
    timeBudgetSec: 30,
  },
  {
    path: '/grid',
    title: 'Grid · the bottleneck',
    narrator: [
      '"2,500 MW free in the corridor. Kopanica-Beravci is queue position #14."',
      '"Queue velocity says we land connection Q3 2027. The Gantt aligns."',
    ],
    do: [
      'Show the dual hero',
      'Tab to Queue · show #14 highlighted',
      'Skip Grid Code / Curtailment unless he\'s engineering-minded',
    ],
    watch: [
      'Engineering questions → Connection tab has the single-line',
      'Timeline questions → Intel has the queue tracker',
    ],
    timeBudgetSec: 35,
  },
  {
    path: '/agriculture',
    title: 'Agriculture · the hidden moat',
    narrator: [
      '"Sheep + panels is not a gimmick. It preserves the land classification and stacks CAP payments."',
      '"And here\'s the companion product — Agros Flock Monitor. Live LoRa telemetry."',
    ],
    do: [
      'Show the 6 system cards',
      'Scroll to Agros · let him see the app chrome',
      'If he touches the sheep calculator → let him',
    ],
    watch: [
      'Engagement with Agros = upsell signal for Aurion',
      'Questions about co-op = bring up Pramenka Slavonia',
    ],
    timeBudgetSec: 60,
  },
  {
    path: '/build',
    title: 'Builder · the engineering tool',
    narrator: [
      '"This is where we design the whole project from scratch — sixteen sections, 120+ inputs, everything an EPC would touch."',
      '"Every edit recomputes the BoM, IRR, DSCR, and compliance rollup on the right."',
      '"And yes — draw the polygon on the map. Area auto-updates."',
    ],
    do: [
      'Open Site · drop the polygon on the parcel',
      'Jump to Generation · change panel make',
      'Watch the right panel tick',
      'Click Export spec PDF · that\'s an engineering-tender document',
    ],
    watch: [
      'Engineer-minded questions → this is where they land',
      'Health score reaction → signals they care about clashes',
    ],
    timeBudgetSec: 120,
  },
  {
    path: '/configurator',
    title: 'Configurator · THE moment',
    narrator: [
      '"Everything is live. Move a slider, the BOM updates, compliance re-checks, financial model rebuilds."',
      '(shut up when he grabs the mouse)',
    ],
    do: [
      'Open the sections that matter (Scenario / Mounting / Storage)',
      'Let him drag a slider · stop narrating',
      'Point at BOM total + compliance pass count as he moves',
      '(If he asks AI) press ⌘K → Ask Panonica AI',
    ],
    watch: [
      'He grabs the mouse = you\'ve won',
      'He saves a scenario A/B/C = MEGA win',
    ],
    timeBudgetSec: 180,
  },
  {
    path: '/roi',
    title: 'Finance · the numbers',
    narrator: [
      '"Seven tabs. Monte Carlo is 1,000 runs. Tornado shows what moves IRR most."',
      '"7.8× equity multiple at year 10. Kupari 10% is 9.5× smaller."',
    ],
    do: [
      'Land on Overview · show the curves',
      'Tab to Tornado if he asks "what matters most?"',
      'Tab to Exit to show the Kupari comparison',
    ],
    watch: [
      'Price sensitivity questions → Tornado',
      'Exit strategy questions → Exit tab + MoM multiple',
    ],
    timeBudgetSec: 60,
  },
  {
    path: '/scenarios',
    title: 'Scenarios Lab · his doing',
    narrator: [
      '"These three are the scenarios you snapshotted."',
      '"Deltas are vs Scenario A. Green = better, red = worse."',
    ],
    do: [
      '(Only open if he saved scenarios in Configurator)',
      'Point at the DNA glyphs — each config has a unique signature',
    ],
    watch: [
      '"Can I save another one?" → yes, go back to Configurator',
      '"Can I share this?" → deal-room link in roadmap',
    ],
    timeBudgetSec: 30,
  },
  {
    path: '/risk',
    title: 'Risk Center · honesty',
    narrator: [
      '"This is the stress test. Current climate, full insurance, baseline political."',
      '"Move any dial — IRR recomputes live."',
      '"Three risks dominate: NPOO denial, electricity price, UPU delay."',
    ],
    do: [
      'Show the IRR dashboard at the top',
      'Move one political slider (FZOEU denial) · watch the delta',
      'Toggle insurance off to show the bleed',
    ],
    watch: [
      'Risk questions → this is the right screen',
      'Insurance questions → premium breakdown is in-panel',
    ],
    timeBudgetSec: 60,
  },
  {
    path: '/subsidies',
    title: 'Subsidies · the stack',
    narrator: [
      '"Six programs. Stackable. FZOEU + NPOO + HBOR covers 75% of CAPEX."',
      '"Non-dilutive. No equity given up."',
    ],
    do: [
      'Show the top bar · show the 6 cards',
      'Toggle programs on/off · the bar animates',
    ],
    watch: [
      '"Which is easiest?" → FZOEU, open now',
      '"Which is biggest?" → NPOO C1.2.R1-I1',
    ],
    timeBudgetSec: 30,
  },
  {
    path: '/intel',
    title: 'Intel · the forever product',
    narrator: [
      '"Panonica doesn\'t stop when the deal closes. Twelve sources, fifteen-minute poll cadence."',
      '"Critical thresholds page the operator. Friday digest summarizes everything."',
    ],
    do: [
      'Show the source grid',
      'Point at the activity feed · point at the architecture diagram',
    ],
    watch: [
      'Upsell moment: "this is the product behind the deck"',
      'API questions → Supabase · FiWare · IEC 61850 on Agros side',
    ],
    timeBudgetSec: 40,
  },
  {
    path: '/thesis',
    title: 'Thesis · the artifact',
    narrator: [
      '"The last thing this does is generate a dossier."',
      '"You could send this to a lawyer or a bank tomorrow."',
      '(click GENERATE PDF · shut up · let the scan-lines play)',
      '"It\'s a real PDF. Four pages. Your deal DNA is on the cover."',
    ],
    do: [
      'Click GENERATE PDF',
      'Let the animation complete',
      'Show the DOWNLOAD button glow',
      'Optionally download it · name appears in top toast',
    ],
    watch: [
      '"Can I actually have it?" → yes, click download',
      '"Who\'s on the distribution list?" → configurable post-pitch',
    ],
    timeBudgetSec: 45,
  },
];

export function noteForPath(path: string): SpeakerNote | null {
  return speakerNotes.find((n) => n.path === path) ?? null;
}

export const keymapEntries = [
  { key: '1', label: 'Context' },
  { key: '2', label: 'Land' },
  { key: '3', label: 'Solar' },
  { key: '4', label: 'Grid' },
  { key: '5', label: 'Agriculture' },
  { key: '6', label: 'Configurator' },
  { key: '7', label: 'Finance' },
  { key: '8', label: 'Scenarios' },
  { key: '9', label: 'Risk' },
  { key: '0', label: 'Hero' },
  { key: '⌘K', label: 'Command palette · Corridor + more' },
  { key: 'P', label: 'Speaker mode' },
  { key: '?', label: 'This keymap' },
  { key: 'Esc', label: 'Close overlays' },
];
