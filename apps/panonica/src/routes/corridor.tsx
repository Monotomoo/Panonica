import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Cable,
  Droplets,
  Fuel,
  Globe,
  Landmark,
  MapPin,
  Plug,
  Ship,
  Train,
  TrainFront,
  Truck,
  Waves,
  Wifi,
} from 'lucide-react';
import { cn } from '@paladian/ui';
import { Sourced } from '@/components/Sourced';
import {
  borderDistances,
  businessZone,
  capacityPhases,
  corridorImagery,
  crossBorderThesis,
  onSiteInfrastructure,
  paladinaHistory,
  transportCorridors,
} from '@/mock/corridor';

export function CorridorRoute() {
  return (
    <section className="flex min-h-full flex-col">
      <Hero />
      <TransportGrid />
      <BorderDistances />
      <Infrastructure />
      <BusinessZone />
      <PhaseSplit />
      <Footer />
    </section>
  );
}

/* ================================= HERO ================================= */

function Hero() {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden border-b border-border bg-gradient-to-br from-signal/5 via-canvas to-canvas px-12 py-12">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute right-[10%] top-[15%] h-[320px] w-[320px] rounded-full bg-signal/10 blur-[120px]" />
        <div className="absolute left-[6%] bottom-[15%] h-[240px] w-[240px] rounded-full bg-pulse/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
        <Globe className="h-3 w-3 text-signal animate-pulse-dot" strokeWidth={1.8} />
        <span>corridor · transport · borders · infrastructure</span>
      </div>

      <div className="relative z-10 mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-[clamp(2.2rem,5vw,4.4rem)] font-light uppercase leading-[0.94] tracking-tech-tight text-text-primary">
            At the intersection of{' '}
            <span className="text-pulse">corridor X</span>
            {' '}and{' '}
            <span className="text-signal">corridor Vc</span>.
          </h1>
          <p className="max-w-3xl font-mono text-[12px] uppercase tracking-[0.22em] text-text-secondary">
            <Sourced sourceId="paladina-2023-deck">
              Paladina's own 2023 project deck leads with this
            </Sourced>. Two pan-European corridors cross here. A3 + A5 motorways. MP13C railway +
            Kopanica-Beravci station. Sava River port at 22 km. BiH border at 11 km.
          </p>
          <p className="max-w-3xl font-mono text-[11px] leading-relaxed text-text-muted">
            The original 2020 master plan designates a <Sourced sourceId="paladina-2020-teaser">770,000 sqm
            business zone</Sourced> for mixed use · solar is one leg. Gas pipeline and HV transmission
            line are both on-site — the most CAPEX-light greenfield position we've seen in
            Slavonia.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <HeroStat label="transport corridors" value="X + Vc" tone="pulse" sub="Pan-European · rail + road" />
          <HeroStat label="nearest border" value="11 km" tone="signal" sub="BiH · Samac crossing" />
          <HeroStat label="business zone" value="77 ha" tone="sun" sub="2020 master plan" />
          <HeroStat label="on-site infra" value="HV + gas" tone="agri" sub="both at parcel · CAPEX saved" />
        </div>
      </div>
    </div>
  );
}

function HeroStat({ label, value, tone, sub }: { label: string; value: string; tone: 'pulse' | 'signal' | 'sun' | 'agri'; sub: string }) {
  const t = { pulse: 'text-pulse border-pulse/30 bg-pulse/5', signal: 'text-signal border-signal/30 bg-signal/5', sun: 'text-sun border-sun/30 bg-sun/5', agri: 'text-agri border-agri/30 bg-agri/5' }[tone];
  return (
    <div className={cn('flex flex-col gap-1 rounded-lg border p-4 backdrop-blur', t)}>
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">{label}</span>
      <span className={cn('font-display text-2xl tracking-tech-tight', t.split(' ')[0])}>{value}</span>
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">{sub}</span>
    </div>
  );
}

/* =========================== TRANSPORT GRID ============================ */

function TransportGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });
  return (
    <div ref={ref} className="border-b border-border bg-surface/20 px-12 py-12">
      <div className="mb-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
        <Train className="h-3.5 w-3.5 text-pulse" strokeWidth={1.8} />
        transport · 7 connections
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {transportCorridors.map((c, i) => {
          const toneCls = {
            pulse: 'border-pulse/30 bg-pulse/5 text-pulse',
            signal: 'border-signal/30 bg-signal/5 text-signal',
            sun: 'border-sun/30 bg-sun/5 text-sun',
            agri: 'border-agri/30 bg-agri/5 text-agri',
            spark: 'border-spark/30 bg-spark/5 text-spark',
          }[c.tone];
          const Icon =
            c.kind === 'rail' ? TrainFront :
            c.kind === 'river' ? Ship :
            c.kind === 'highway' ? Truck :
            Truck;
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -6 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.05 * i }}
              className={cn('flex items-start gap-4 rounded-lg border bg-surface/40 p-4', toneCls)}
            >
              <Icon className={cn('h-4 w-4 shrink-0', toneCls.split(' ')[2])} strokeWidth={1.6} />
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className={cn('font-mono text-[11px]', toneCls.split(' ')[2])}>
                    {c.designation}
                  </span>
                  <span className="font-display text-lg tracking-tech-tight text-text-primary tabular-nums">
                    {c.accessKm} km
                  </span>
                </div>
                <span className="font-mono text-[11px] text-text-secondary">{c.label}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                  {c.note}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================ BORDER DISTANCES ========================= */

function BorderDistances() {
  return (
    <div className="border-b border-border px-12 py-12">
      <div className="mb-6 flex items-start justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            <MapPin className="h-3.5 w-3.5 text-pulse" strokeWidth={1.8} />
            borders · cross-border electricity thesis
          </div>
          <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
            11 km to an export market
          </h2>
          <p className="max-w-3xl font-mono text-[11px] text-text-secondary">
            {crossBorderThesis.thesisLine}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 rounded-lg border border-agri/30 bg-agri/5 px-5 py-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
            annual export upside
          </span>
          <span className="font-display text-2xl tracking-tech-tight text-agri">
            +€380k / yr
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
            on top of domestic PPA
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {borderDistances.map((b, i) => {
          const tone = i === 0 ? 'border-agri/40 bg-agri/5 text-agri' : i === 1 ? 'border-pulse/40 bg-pulse/5 text-pulse' : 'border-signal/40 bg-signal/5 text-signal';
          return (
            <motion.div
              key={b.country}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              className={cn('flex flex-col gap-3 rounded-lg border bg-surface/40 p-5', tone)}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                  {b.flag}
                </span>
                <span className={cn('font-display text-2xl tracking-tech-tight', tone.split(' ')[2])}>
                  {b.distanceKm} km
                </span>
              </div>
              <span className="font-display text-lg uppercase tracking-tech-tight text-text-primary">
                {b.country}
              </span>
              <span className="font-mono text-[10px] leading-relaxed text-text-muted">
                {b.note}
              </span>
              <div className="mt-auto border-t border-border/60 pt-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                  export market
                </span>
                <span className="block font-mono text-[11px] text-text-secondary">
                  {b.exportMarket}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 rounded-lg border border-border bg-surface/30 p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <ThesisKv label="nearest BiH substation" value="Samac · 400 kV" tone="agri" />
          <ThesisKv label="distance to substation" value={`${crossBorderThesis.nearestBiHSubstationDistanceKm} km`} tone="pulse" />
          <ThesisKv label="price spread · peak" value={`€${crossBorderThesis.priceSpreadEurPerMWh}/MWh`} tone="sun" />
          <ThesisKv label="market-coupled days" value={`${crossBorderThesis.exportProbabilityPct}%`} tone="signal" />
        </div>
        <p className="mt-4 font-mono text-[10px] leading-relaxed text-text-muted">
          {crossBorderThesis.regulatoryFrictionNote}
        </p>
      </div>
    </div>
  );
}

function ThesisKv({ label, value, tone }: { label: string; value: string; tone: 'pulse' | 'signal' | 'sun' | 'agri' }) {
  const t = { pulse: 'text-pulse', signal: 'text-signal', sun: 'text-sun', agri: 'text-agri' }[tone];
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">{label}</span>
      <span className={cn('font-display text-xl tracking-tech-tight', t)}>{value}</span>
    </div>
  );
}

/* ============================ INFRASTRUCTURE =========================== */

function Infrastructure() {
  return (
    <div className="border-b border-border bg-surface/20 px-12 py-12">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Plug className="h-3.5 w-3.5 text-sun" strokeWidth={1.8} />
          on-site infrastructure · what's already there
        </div>
        <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
          HV line and gas pipeline · both at the parcel
        </h2>
        <p className="max-w-3xl font-mono text-[11px] text-text-secondary">
          <Sourced sourceId="paladina-2023-deck">
            Per Paladina's 2023 deck
          </Sourced>: the main high-pressure gas pipeline and the high-voltage transmission line
          are both available on-site. This is the single biggest greenfield CAPEX saver — no
          long MV cable runs, no substation build.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {onSiteInfrastructure.map((i) => {
          const toneClass = {
            pulse: 'border-pulse/30 text-pulse bg-pulse/5',
            signal: 'border-signal/30 text-signal bg-signal/5',
            sun: 'border-sun/30 text-sun bg-sun/5',
            agri: 'border-agri/30 text-agri bg-agri/5',
          }[i.tone];
          const Icon =
            i.id === 'hv-line' ? Cable :
            i.id === 'gas-pipeline' ? Fuel :
            i.id === 'wastewater' ? Droplets :
            i.id === 'water-supply' ? Waves :
            i.id === 'internet' ? Wifi :
            i.id === 'gas-genset-option' ? Plug :
            Cable;
          return (
            <div key={i.id} className={cn('flex items-start gap-3 rounded-lg border bg-surface/40 p-4', toneClass)}>
              <Icon className={cn('h-4 w-4 shrink-0', toneClass.split(' ')[1])} strokeWidth={1.6} />
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-baseline justify-between">
                  <span className={cn('font-mono text-[11px]', toneClass.split(' ')[1])}>
                    {i.label}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                    {i.status}
                  </span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                  {i.note}
                </span>
                {i.paladina2023 && (
                  <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-sm bg-surface/80 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.22em] text-text-muted">
                    † paladina 2023 deck
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================= BUSINESS ZONE =========================== */

function BusinessZone() {
  return (
    <div className="border-b border-border px-12 py-12">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Building2 className="h-3.5 w-3.5 text-pulse" strokeWidth={1.8} />
          wider business zone · 2020 master plan
        </div>
        <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
          <Sourced sourceId="paladina-2020-teaser">
            {businessZone.totalAreaSqm.toLocaleString()} sqm
          </Sourced>{' '}
          <span className="text-text-muted">master-planned for mixed use</span>
        </h2>
        <p className="max-w-3xl font-mono text-[11px] text-text-secondary">
          Solar is one leg of a four-leg master plan. The original municipal teaser (2020) designates
          the zone for business + production, logistics + warehousing, renewables, and agriculture.
          Phase-2 expansion could unlock all four.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {businessZone.designatedUses.map((u) => {
          const t = { pulse: 'text-pulse bg-pulse/10 border-pulse/30', signal: 'text-signal bg-signal/10 border-signal/30', sun: 'text-sun bg-sun/10 border-sun/30', agri: 'text-agri bg-agri/10 border-agri/30' }[u.tone];
          return (
            <div key={u.label} className={cn('flex flex-col gap-2 rounded-lg border bg-surface/40 p-5', t)}>
              <span className={cn('font-display text-4xl tracking-tech-tight', t.split(' ')[0])}>
                {u.sharePct}%
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-primary">
                {u.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================ PHASE 1 / PHASE 2 ======================== */

function PhaseSplit() {
  return (
    <div className="border-b border-border bg-surface/30 px-12 py-12">
      <div className="mb-6 flex items-baseline justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            <Landmark className="h-3.5 w-3.5 text-agri" strokeWidth={1.8} />
            phase 1 · phase 2 · the capacity path
          </div>
          <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
            <Sourced sourceId="paladina-2023-deck">70 MW</Sourced>
            {' '}in <span className="text-text-muted">Paladina's 2023 plan</span> · 30 MW today · 40 MW unlocked later
          </h2>
          <p className="max-w-3xl font-mono text-[11px] text-text-secondary">
            Paladina's original deck proposed 70 MW on 73 ha. HOPS queue allocates only 30 MW at
            TS Slavonski Brod 1 — we modeled that phase as the bankable case. Phase 2 unlocks the
            remaining 40 MW when the substation upgrades or a second connection lands.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <PhaseCard phase={capacityPhases.phase1} label="PHASE 1" accent="agri" recommended />
        <PhaseCard phase={capacityPhases.phase2} label="PHASE 2" accent="pulse" />
      </div>

      <div className="mt-5 rounded-lg border border-border bg-canvas/40 p-5 font-mono text-[10px] leading-relaxed text-text-secondary">
        <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          <ArrowUpRight className="h-3 w-3 text-pulse" strokeWidth={1.8} />
          paladina's own framing · 2023
        </div>
        <p className="font-mono text-[12px] italic leading-relaxed text-text-primary">
          "{paladinaHistory.plannerQuote}"
        </p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          — Paladina 2023 project deck. Status today: {paladinaHistory.actualStatus}.
        </p>
      </div>
    </div>
  );
}

function PhaseCard({ phase, label, accent, recommended }: { phase: typeof capacityPhases.phase1; label: string; accent: 'agri' | 'pulse'; recommended?: boolean }) {
  const t = { agri: 'border-agri text-agri bg-agri/5', pulse: 'border-pulse text-pulse bg-pulse/5' }[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      className={cn('flex flex-col gap-4 rounded-lg border bg-surface/40 p-6', t, recommended && 'shadow-glow-pulse')}
    >
      <div className="flex items-baseline justify-between">
        <span className={cn('font-display text-xl uppercase tracking-tech-tight', t.split(' ')[1])}>
          {label}
        </span>
        {recommended && (
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-agri">
            recommended base case
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-3">
        <span className={cn('font-display text-5xl tracking-tech-tight', t.split(' ')[1])}>
          {phase.capacityMW} MW
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          on {phase.areaHa} ha
        </span>
      </div>
      <p className="font-mono text-[11px] leading-relaxed text-text-secondary">
        {phase.statusNote}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          confidence
        </span>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-border">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${phase.confidence * 100}%` }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.2 }}
            className={cn('h-full', accent === 'agri' ? 'bg-agri' : 'bg-pulse')}
          />
        </div>
        <span className="font-mono text-[10px] tabular-nums text-text-secondary">
          {(phase.confidence * 100).toFixed(0)}%
        </span>
      </div>
    </motion.div>
  );
}

/* ================================ FOOTER =============================== */

function Footer() {
  return (
    <div className="flex items-center justify-between border-t border-border px-12 py-6">
      <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
        source · <a href={corridorImagery.paladinaDeckPDF} target="_blank" rel="noreferrer" className="text-pulse underline-offset-4 hover:underline">Paladina project deck 2023 · V2.pdf</a>
      </div>
      <Link
        to="/configurator"
        className="group inline-flex items-center gap-3 rounded-md border border-border-bright bg-surface px-5 py-3 transition-all hover:border-pulse hover:shadow-glow-pulse"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary group-hover:text-pulse">
          configure phase 1
        </span>
        <ArrowRight className="h-4 w-4 text-text-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-pulse" strokeWidth={1.8} />
      </Link>
    </div>
  );
}
