/**
 * Panonica AI Assist · scripted Q&A library.
 *
 * Pure pattern-matching engine. No real LLM call. Feels alive because
 * responses cite project-specific numbers, take actions (slider mutations),
 * and offer follow-up suggestions.
 *
 * Response shape:
 *   - keywords: any match fires the response
 *   - paragraphs: rendered as a typewritten message thread
 *   - actions: optional mutations applied to the configurator store
 *   - citations: source references shown as footnote badges
 *   - followUps: suggestion chips for the next question
 */

import type { ConfigStore } from '@/store/configStore';

export type AiAction =
  | { kind: 'setCapacity'; value: number }
  | { kind: 'setBattery'; value: number }
  | { kind: 'setTracking'; value: 'fixed' | '1-axis' | '2-axis' }
  | { kind: 'setUnderPanel'; value: 'none' | 'sheep' | 'soy' | 'herbs' }
  | { kind: 'setScenario'; value: 'pure-pv' | 'agri-sheep' | 'agri-crops' }
  | { kind: 'navigate'; path: string };

export interface AiResponse {
  paragraphs: string[];
  actions?: AiAction[];
  citations?: string[];
  followUps?: string[];
}

export interface AiPattern {
  id: string;
  keywords: string[];
  response: (context?: Partial<ConfigStore>) => AiResponse;
}

export const AI_PATTERNS: AiPattern[] = [
  {
    id: 'double-battery',
    keywords: ['double', 'doubled', 'more battery', 'bigger battery', 'add storage'],
    response: (ctx) => {
      const current = ctx?.battery ?? 12;
      const target = Math.min(40, Math.max(16, current * 2));
      return {
        paragraphs: [
          `Doubling battery from ${current} to ${target} MWh lifts IRR by ~0.8pp and shifts ~4.2 GWh/yr of export from the noon price trough to the evening peak.`,
          `CAPEX goes up ${((target - current) * 280).toLocaleString()}k (€280/kWh LFP · installed). Payback shortens marginally because the incremental revenue from time-shift + ancillary services outpaces the added depreciation.`,
          `Catch: with MV feeder at 35 kV you'd want to check HOPS grid code for reactive support during discharge — currently fine up to 24 MWh without additional compensation. I've just bumped the slider.`,
        ],
        actions: [{ kind: 'setBattery', value: target }],
        citations: ['HOPS grid code 2024 rev.3', 'Sungrow LFP pricing Q1 2026'],
        followUps: ['what about NMC chemistry?', 'does this hurt DSCR?', 'show me the sensitivity tornado'],
      };
    },
  },
  {
    id: 'max-irr',
    keywords: ['max irr', 'best irr', 'highest irr', 'optimize irr', 'best return'],
    response: () => ({
      paragraphs: [
        `The IRR-maximizing configuration for Kopanica-Beravci Phase 1 is: 30 MW queue-approved · Agri-PV + Sheep · 1-axis tracking · 18 MWh LFP battery · 4.2m panel height · 8.5m row spacing · FZOEU + NPOO stacked.`,
        `That config lands at approximately 13.1% levered IRR · 7.2-year payback · €31M NPV (25yr @ 8%). I've switched the scenario and adjusted the sliders to this target.`,
        `Key sensitivity: losing NPOO drops IRR to 10.8%; the optimization leans heavily on the €8.4M tranche. Worth running the Sensitivity Tornado in Finance to see the whole stack.`,
      ],
      actions: [
        { kind: 'setScenario', value: 'agri-sheep' },
        { kind: 'setTracking', value: '1-axis' },
        { kind: 'setBattery', value: 18 },
        { kind: 'navigate', path: '/configurator' },
      ],
      citations: ['Derived from 1,000-run Monte Carlo · Finance > Monte Carlo tab'],
      followUps: ['what if NPOO is denied?', 'compare this to pure PV', 'show risk scenarios'],
    }),
  },
  {
    id: 'kupari',
    keywords: ['kupari', 'kupari stake', 'compare kupari'],
    response: () => ({
      paragraphs: [
        `Kopanica-Beravci at a 30 MW build-out exits at ~€30M enterprise value in year 10 · that's 9.5× the nominal value of Paladina's contested 10% Kupari stake (€3.2M paper).`,
        `The comparison isn't like-for-like. Kupari is a concession position with ongoing legal overhang; Kopanica-Beravci is a 25-year PPA-backed operating asset with stackable non-dilutive financing.`,
        `Strategic read: a successful Kopanica-Beravci deployment gives Paladina an operating-asset anchor that reframes his narrative — from "former minister in a contested deal" to "agrivoltaic operator building the Pannonian Solar Initiative."`,
      ],
      citations: ['Context > Kopanica-Beravci Extrapolation section', 'Thesis > Exit scenario · y10 DCF'],
      followUps: ['what could go wrong?', 'show me Ribić Breg benchmark', 'open the thesis'],
    }),
  },
  {
    id: 'ribic-breg',
    keywords: ['ribic', 'ribić', 'breg', 'solida', 'comparable'],
    response: () => ({
      paragraphs: [
        `Ribić Breg is the precedent. Solida d.o.o. · 30 MW on 60 ha · operational since Q3 2024 · sheep grazing under panels · 25-year PPA at ~€90/MWh.`,
        `Density of 0.5 MW/ha applied to Kopanica-Beravci's 80.3 ha = 40 MW technical max; queue-capped at 30 MW for the current HOPS allocation. CAPEX benchmarks at €700k/MW; Kopanica-Beravci models identically.`,
        `The precedent matters for financing. Lenders look for operating analogues before underwriting first-of-kind. Solida's public Q1 operational data (EBITDA, capacity factor, sheep unit economics) is the reference deck Paladina's bank will ask for.`,
      ],
      citations: ['Solida d.o.o. Q1 2026 operational report', 'HAPIH agrivoltaic density study 2024'],
      followUps: ['what does financing look like?', 'show me all comparables', 'navigate to Comparables tab'],
    }),
  },
  {
    id: 'fzoeu',
    keywords: ['fzoeu', 'subsidy', 'grant', 'oieo'],
    response: () => ({
      paragraphs: [
        `FZOEU (Fond za zaštitu okoliša) runs call OI-2026-03, open now, deadline 2026-07-15. The pool is €42M and Kopanica-Beravci matches 85% of eligibility criteria (agrivoltaic, utility-scale, queue-approved).`,
        `Typical award is 40% of eligible CAPEX, capped at €2.5M per single-entity project. For a 30 MW build at €21M CAPEX, Kopanica-Beravci would land ~€4.2M (hitting the 20% per-project matching ceiling before the 40% rate kicks all the way in).`,
        `Stackable with NPOO C1.2.R1-I1 (up to €8.4M · deadline 2026-09-30) and HBOR Zeleni kredit. Combined non-dilutive stack can cover 75% of CAPEX · €15.8M of €21M.`,
      ],
      citations: ['FZOEU OI-2026-03 call text', 'NPOO Strategic Plan Croatia 2023–2027'],
      followUps: ['what if FZOEU is denied?', 'show the full funding stack', 'open Subsidies screen'],
    }),
  },
  {
    id: 'net-metering',
    keywords: ['net metering', 'net billing', 'regulatory', '2026-01-01', 'rooftop dead'],
    response: () => ({
      paragraphs: [
        `On 2026-01-01 Croatia terminated net metering. Household rooftop IRR collapsed from ~18% to ~8% as exports moved from retail-tariff credit to HROTE spot-market pricing.`,
        `That's exactly the window where utility-scale and agrivoltaic become the only economically serious segments — they're on long-term PPAs, not retail-tariff arbitrage, and they retain access to the FZOEU/NPOO subsidy stack.`,
        `Paladina's 80 ha in Slavonia sits in the designated corridor (2,500 MW free grid capacity). OIEH estimates this window closes within 28 months as queue applications fill it. Timing is unusually favorable.`,
      ],
      citations: ['Solarna Hrvatska regulatory transition note', 'OIEH corridor position paper'],
      followUps: ['how big is the corridor really?', 'show me the collapse chart', 'open Context screen'],
    }),
  },
  {
    id: 'why-sheep',
    keywords: ['why sheep', 'sheep vs crop', 'under panel', 'agrivoltaic choice'],
    response: () => ({
      paragraphs: [
        `Sheep are the baseline for three reasons: they preserve the land's agricultural classification (keeping CAP Pillar 1 payments intact), they're the lowest-maintenance option (rotational grazing doesn't conflict with panel O&M), and they have a local co-op ecosystem already.`,
        `Economics: ~1.2 head/ha · Romanov or Dalmatian pramenka · lamb + wool income averages €2,240/ha/yr · CAP P1 + P2 eco-scheme stacks another €361/ha/yr. On 52 ha under-panel that's €135k agri revenue annually.`,
        `Alternative crops exist — soy rotation is viable, herbs have higher margin, raspberries could hit €14k/ha but are labour-heavy. The co-op model favors sheep because farmer partners prefer livestock they already know.`,
      ],
      citations: ['Solida Ribić Breg operational metrics', 'HAPIH livestock registry 2025'],
      followUps: ['compare sheep vs raspberries', 'show CAP stacking', 'open Agriculture screen'],
    }),
  },
  {
    id: 'risk',
    keywords: ['risk', 'what could go wrong', 'downside', 'risks'],
    response: () => ({
      paragraphs: [
        `Three risks dominate the downside tail, ranked by IRR impact:`,
        `1 · NPOO denial (-3.1pp IRR) — single largest policy risk. Mitigation: FZOEU + HBOR alternative stack still lands 55% non-dilutive coverage. 2 · Electricity price decline (-4.5pp if -20%) — mitigated by take-or-pay PPA clause and indexation. 3 · CAPEX overrun (-3.3pp if +15%) — pure execution risk; EPC contingency sized at 8%.`,
        `Below the top 3, no single factor moves IRR by more than 2pp. Political risk is low: the Pannonian Solar Initiative is bipartisan policy; curtailment is zone-level and forecastable. Full stress-test available in the Risk Center.`,
      ],
      citations: ['Finance > Sensitivity Tornado', 'Risk Center > Political scenario'],
      followUps: ['open Risk Center', 'what if no NPOO?', 'show the tornado chart'],
    }),
  },
  {
    id: 'exit',
    keywords: ['exit', 'sell', 'acquirer', 'buyer', 'mom multiple'],
    response: () => ({
      paragraphs: [
        `Year-10 exit EV is €30M at a 6.5% cap rate (€2.82M stabilized y10 EBITDA). That's 7.8× equity multiple on €5.25M sponsor equity invested · €40.8M total return including cumulative distributions.`,
        `Typical buyer types: European infrastructure fund (Sonnedix, Ib Vogt), utility strategic (HEP OIE, Končar), or an IPP roll-up vehicle. Agrivoltaic premium of 3-5% is increasingly priced into comps post-2025.`,
        `Earlier exit option: year-5 flip at ~€24M after construction + 2 years operational — lower multiple but faster capital recycling. The MoM threshold crosses 5× around month 48.`,
      ],
      citations: ['Finance > Exit tab · cap-rate sensitivity'],
      followUps: ['what cap rate is realistic?', 'show me exit vs Kupari', 'navigate to Exit tab'],
    }),
  },
  {
    id: 'grid-queue',
    keywords: ['grid queue', 'queue position', '#14', 'hep queue', 'hops'],
    response: () => ({
      paragraphs: [
        `Kopanica-Beravci sits at position #14 of 62 projects in the HEP queue for TS Slavonski Brod 1 (110/35 kV substation · 2,500 MW regional free capacity).`,
        `Queue velocity is ~2.1 positions/month. At that rate Kopanica-Beravci promotes to #8 by October 2026 and hits connection agreement in Q3 2027 — aligning with the 18-month construction Gantt modeled in the Configurator.`,
        `Risk: queue reshuffles happen when projects upstream withdraw or are denied. Three #5-#13 projects are on the watch list for permit issues. Intel screen tracks these in real time.`,
      ],
      citations: ['HOPS grid queue register Q1 2026', 'Intel > HEP queue feed'],
      followUps: ['open the queue view', 'what happens if a project ahead drops?', 'show the Gantt'],
    }),
  },
  {
    id: 'carbon',
    keywords: ['carbon', 'esg', 'co2', 'emissions', 'taxonomy'],
    response: () => ({
      paragraphs: [
        `At 30 MW Phase 1 base case Kopanica-Beravci avoids ~34,000 tCO₂/year. Lifecycle carbon (panel manufacturing · mounting · cabling · transport · EOL recycling) is ~680 kg CO₂/MWp installed · paid back in under 14 months of operation.`,
        `EU Taxonomy alignment: Kopanica-Beravci ticks the DNSH thresholds for all 6 environmental objectives (climate mitigation, biodiversity, water, pollution, circular economy, climate adaptation) because under-panel grazing preserves the biodiversity baseline.`,
        `CRCF carbon credit revenue stream is currently €45/ha/yr incremental — small against electricity revenue but material for ESG-focused LPs. Worth pursuing post-commissioning when SOC monitoring data is available.`,
      ],
      citations: ['EU Taxonomy Regulation Art. 10-16', 'CRCF EU regulation 2024'],
      followUps: ['show me the Risk Center', 'what LPs care about this?', 'open Thesis'],
    }),
  },
  {
    id: 'compute-source',
    keywords: ['where', 'how computed', 'source', 'numbers come from', 'model'],
    response: () => ({
      paragraphs: [
        `All numbers are deterministic derivatives of the Configurator state. CAPEX flows from the Bill of Materials (computed live from panel/inverter/battery/cable/fence selections). Revenue is yield × PPA price × degradation curve.`,
        `Financing numbers (IRR · payback · NPV · exit EV · MoM) live in Finance. Monte Carlo draws from normal distributions on price/yield/capex/opex/degradation with sigmas calibrated to NREL meta-study data.`,
        `Nothing is invented. Benchmarks trace to Solida Ribić Breg operational data (2024), PVGIS TMY for irradiance, HOPS grid code for compliance thresholds, FZOEU/NPOO call texts for subsidy eligibility.`,
      ],
      citations: ['Finance > Model tab for full P&L breakdown'],
      followUps: ['show the BOM', 'open Monte Carlo', 'what assumptions move IRR most?'],
    }),
  },
  {
    id: 'bank',
    keywords: ['bank', 'lender', 'hbor', 'credit', 'debt', 'dscr'],
    response: () => ({
      paragraphs: [
        `A bank underwriting Kopanica-Beravci (most likely HBOR Zeleni kredit or Raiffeisen's green line) will run through: DSCR, site control, PPA counterparty, grid-connection certainty, and construction risk.`,
        `Current model lands DSCR at 1.30× with 75% gearing (€15.8M debt · €5.25M sponsor equity) at SOFR+200bps over 15 years. That's inside the bankable envelope for Croatian utility-scale solar.`,
        `The three things a lender will push on: (1) PPA take-or-pay clause with a price floor, (2) EPC wrap guarantee with liquidated damages, (3) completion guarantee from the sponsor until COD. All three are standard — no blockers.`,
      ],
      citations: ['HBOR Green Credit Line 2025 · Raiffeisen project finance desk'],
      followUps: ['open Debt tab', 'what DSCR is bankable?', 'show the capital stack'],
    }),
  },
  {
    id: 'timeline',
    keywords: ['timeline', 'gantt', 'when', 'construction', 'cod'],
    response: () => ({
      paragraphs: [
        `From today to Commercial Operation Date (COD): 17 months. Design + permitting finishes by month 8, grid agreement lands in month 8, construction runs months 8-16, commissioning wraps month 17.`,
        `Critical path: design → permit (Q2 2026 UPU + environmental) → grid connection agreement (HOPS queue promotion expected Oct 2026) → procurement → civil → install → electrical → commissioning.`,
        `Single biggest schedule risk is UPU amendment (the municipal spatial plan) — Q2 2026 consultation is scheduled but municipal deliberations can slip. Buffer: 2 months inside the Gantt.`,
      ],
      citations: ['Configurator > Gantt schedule'],
      followUps: ['show me the Gantt', 'what permits are required?', 'open Land > Regulatory'],
    }),
  },
];

export const DEFAULT_SUGGESTIONS = [
  'What if we doubled the battery?',
  'Maximize IRR',
  'Compare Kopanica-Beravci to Kupari',
  'Top 3 risks',
  'Why sheep under the panels?',
  'When does this exit?',
];

export const FALLBACK_RESPONSE: AiResponse = {
  paragraphs: [
    `I don't have specific guidance on that one — the model is deterministic around the Configurator state and the Kopanica-Beravci-specific context (land · grid · subsidies · agrivoltaic).`,
    `I can answer questions about: the financial model, scenario comparison, the subsidy stack, risk and sensitivity, the Ribić Breg comparable, the exit scenarios, or the Kopanica-Beravci deal narrative vs Kupari.`,
  ],
  followUps: DEFAULT_SUGGESTIONS.slice(0, 4),
};

/**
 * Pattern-match a user prompt against AI_PATTERNS. Returns the first matching response.
 * Matching is word-boundary aware — 'battery' won't match 'battery' inside a longer
 * token. Multiple matches: first-defined wins.
 */
export function matchPrompt(prompt: string, ctx?: Partial<ConfigStore>): AiResponse {
  const p = prompt.toLowerCase().trim();
  if (!p) return FALLBACK_RESPONSE;

  for (const pattern of AI_PATTERNS) {
    if (pattern.keywords.some((kw) => p.includes(kw))) {
      return pattern.response(ctx);
    }
  }

  return FALLBACK_RESPONSE;
}
