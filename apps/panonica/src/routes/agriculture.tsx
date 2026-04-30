import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Award,
  Cherry,
  Droplets,
  Flower2,
  Leaf,
  Maximize2,
  MinusCircle,
  Network,
  PlusCircle,
  Signal,
  Sprout,
  TrendingUp,
  Wheat,
  Wifi,
  Wind,
} from 'lucide-react';
import { cn } from '@paladian/ui';
import {
  agrosFlockMonitor,
  agriSummary,
  agriSystems,
  annualCalendar,
  certifications,
  coopModel,
  microclimateDeltas,
  sheepBreeds,
  type AgriSystem,
  type AgriSystemKey,
} from '@/mock/agri';

export function AgricultureRoute() {
  const [selected, setSelected] = useState<AgriSystemKey>('sheep');
  const selectedSystem = agriSystems.find((s) => s.key === selected)!;

  return (
    <section className="flex min-h-full flex-col">
      <HeroBand system={selectedSystem} />
      <SystemOptionsGrid selected={selected} onSelect={setSelected} />
      <MicroclimateSection />
      <SheepDeepDive />
      <AgrosMonitor />
      <CertificationMatrix />
      <AnnualCalendar />
      <CoopModel />
      <Footer />
    </section>
  );
}

/* ================================ HERO =================================== */

function HeroBand({ system }: { system: AgriSystem }) {
  return (
    <div className="relative flex min-h-[54vh] flex-col justify-between overflow-hidden border-b border-border bg-gradient-to-br from-agri/5 via-canvas to-canvas px-12 py-12">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute right-[8%] top-[18%] h-[360px] w-[360px] rounded-full bg-agri/10 blur-[120px]" />
        <div className="absolute left-[12%] bottom-[10%] h-[240px] w-[240px] rounded-full bg-sun/10 blur-[100px]" />
      </div>

      {/* Animated panel-over-grazing SVG scene */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[40%] opacity-60">
        <svg viewBox="0 0 1200 300" className="h-full w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="agriSceneGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(74 222 128)" stopOpacity={0} />
              <stop offset="100%" stopColor="rgb(74 222 128)" stopOpacity={0.12} />
            </linearGradient>
          </defs>
          <rect x={0} y={180} width={1200} height={120} fill="url(#agriSceneGradient)" />

          {/* Panel rows (isometric shorthand) */}
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.g
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
            >
              <rect
                x={60 + i * 70}
                y={90 + (i % 2) * 5}
                width={56}
                height={14}
                fill="rgb(0 217 255)"
                fillOpacity={0.35}
                stroke="rgb(0 217 255)"
                strokeOpacity={0.65}
                strokeWidth={0.8}
                transform="skewX(-22)"
              />
              <line
                x1={60 + i * 70 + 16}
                x2={60 + i * 70 + 16}
                y1={104 + (i % 2) * 5}
                y2={170}
                stroke="rgb(138 138 148)"
                strokeOpacity={0.4}
                strokeWidth={0.6}
              />
            </motion.g>
          ))}

          {/* Sheep dots */}
          {[
            [130, 210],
            [260, 228],
            [360, 220],
            [470, 240],
            [580, 225],
            [700, 238],
            [810, 222],
            [920, 232],
            [1040, 246],
            [200, 250],
            [440, 254],
            [760, 252],
          ].map(([cx, cy], i) => (
            <motion.g
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 + i * 0.08, duration: 0.4 }}
            >
              <ellipse cx={cx} cy={cy} rx={6} ry={4} fill="rgb(250 250 250)" fillOpacity={0.9} />
              <circle cx={cx + 5} cy={cy - 2} r={2.5} fill="rgb(250 250 250)" fillOpacity={0.9} />
            </motion.g>
          ))}
        </svg>
      </div>

      <div className="relative z-10 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-agri animate-pulse-dot" />
        <span>agrivoltaic · under-panel agriculture · kopanica-beravci</span>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-[clamp(2.2rem,4.8vw,4.2rem)] font-light uppercase leading-[0.96] tracking-tech-tight text-text-primary">
            The land doesn't stop being farm.
            <br />
            <span className="text-agri">It starts being two farms at once.</span>
          </h1>
          <p className="max-w-2xl font-mono text-[12px] uppercase tracking-[0.22em] text-text-secondary">
            dual-use agrivoltaic · {(agriSummary.landEfficiency * 100).toFixed(0)}% of original
            yield preserved · {agriSummary.flockSize} head flock · {agriSummary.carbonSequestrationTonsYear} t
            CO₂ sequestered annually.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <HeroStat label="agri revenue · annual" value={`€${(agriSummary.annualAgriRevenue / 1000).toFixed(0)}k`} tone="agri" />
          <HeroStat label="CAP payments · stacked" value={`€${(agriSummary.capPaymentAnnual / 1000).toFixed(0)}k`} tone="sun" />
          <HeroStat label="usable under-panel" value={`${agriSummary.usableUnderPanelHa.toFixed(1)} ha`} tone="pulse" />
          <HeroStat label="land efficiency" value={`${(agriSummary.landEfficiency * 100).toFixed(0)}%`} tone="signal" />
        </div>
      </div>
    </div>
  );
}

function HeroStat({ label, value, tone }: { label: string; value: string; tone: 'agri' | 'sun' | 'pulse' | 'signal' }) {
  const t = { agri: 'text-agri border-agri/30 bg-agri/5', sun: 'text-sun border-sun/30 bg-sun/5', pulse: 'text-pulse border-pulse/30 bg-pulse/5', signal: 'text-signal border-signal/30 bg-signal/5' }[tone];
  return (
    <div className={cn('flex flex-col gap-1 rounded-lg border p-4 backdrop-blur', t)}>
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">{label}</span>
      <span className={cn('font-display text-2xl tracking-tech-tight', t.split(' ')[0])}>{value}</span>
    </div>
  );
}

/* =========================== SYSTEM OPTIONS ============================= */

const ICON_MAP: Record<AgriSystem['icon'], React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  sheep: Sprout,
  leaf: Leaf,
  wheat: Wheat,
  flower: Flower2,
  cherry: Cherry,
  network: Network,
};

function SystemOptionsGrid({ selected, onSelect }: { selected: AgriSystemKey; onSelect: (k: AgriSystemKey) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.15, once: true });

  return (
    <div ref={ref} className="px-12 py-12 border-b border-border">
      <div className="mb-6 flex items-baseline justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            <Sprout className="h-3.5 w-3.5 text-agri" strokeWidth={1.8} />
            system options · {agriSystems.length} under-panel configurations
          </div>
          <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
            pick the shape of the second farm
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {agriSystems.map((s, i) => (
          <SystemCard
            key={s.key}
            system={s}
            active={s.key === selected}
            index={i}
            inView={inView}
            onClick={() => onSelect(s.key)}
          />
        ))}
      </div>
    </div>
  );
}

function SystemCard({ system, active, index, inView, onClick }: { system: AgriSystem; active: boolean; index: number; inView: boolean; onClick: () => void }) {
  const Icon = ICON_MAP[system.icon];
  const t = {
    agri: 'border-agri text-agri',
    pulse: 'border-pulse text-pulse',
    sun: 'border-sun text-sun',
    signal: 'border-signal text-signal',
    spark: 'border-spark text-spark',
  }[system.tone];

  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.08 + index * 0.06 }}
      onClick={onClick}
      className={cn(
        'group flex flex-col gap-3 rounded-lg border bg-surface/40 p-5 text-left transition-all hover:shadow-glow-pulse',
        active ? cn(t.split(' ')[0], 'bg-surface/80 shadow-glow-pulse ring-1 ring-current') : 'border-border hover:border-border-bright',
      )}
    >
      <div className="flex items-start justify-between">
        <Icon className={cn('h-5 w-5', active ? t.split(' ')[1] : 'text-text-secondary')} strokeWidth={1.5} />
        <div className="flex flex-wrap gap-1">
          {system.tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                'rounded-sm border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.2em]',
                active ? cn(t.split(' ')[0], t.split(' ')[1], 'bg-current/10') : 'border-border text-text-muted',
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-0.5">
        <span className={cn('font-display text-lg uppercase tracking-tech-tight', active ? t.split(' ')[1] : 'text-text-primary')}>
          {system.name}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          {system.subtitle}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-border/60 pt-3 font-mono text-[10px]">
        <MiniStat label="€/ha·yr" value={system.annualRevenuePerHa.toLocaleString()} />
        <MiniStat label="land eff." value={`${(system.landEfficiency * 100).toFixed(0)}%`} />
        <MiniStat label="ecology" value={`${system.ecologyScore}`} />
      </div>

      <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em]">
        <span className="text-text-muted">labour</span>
        <LabourDots level={system.labourIntensity} />
        <span className="ml-auto text-text-muted">water {system.waterUsage}</span>
      </div>

      <p className="mt-1 border-t border-border/40 pt-2 font-mono text-[10px] leading-relaxed text-text-secondary">
        {system.operationalNote}
      </p>
    </motion.button>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[8px] uppercase tracking-[0.2em] text-text-muted">{label}</span>
      <span className="tabular-nums text-text-primary">{value}</span>
    </div>
  );
}

function LabourDots({ level }: { level: 'low' | 'medium' | 'high' }) {
  const count = level === 'low' ? 1 : level === 'medium' ? 2 : 3;
  return (
    <span className="inline-flex items-center gap-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            'inline-block h-1.5 w-1.5 rounded-full',
            i < count ? 'bg-pulse' : 'bg-border-bright',
          )}
        />
      ))}
    </span>
  );
}

/* ============================ MICROCLIMATE ============================== */

function MicroclimateSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });

  return (
    <div ref={ref} className="border-b border-border bg-surface/20 px-12 py-14">
      <div className="mb-8 flex flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Wind className="h-3.5 w-3.5 text-signal" strokeWidth={1.8} />
          microclimate · under-panel vs open-field
        </div>
        <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
          what the panels do to the soil below them
        </h2>
        <p className="max-w-3xl font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary">
          Fraunhofer ISE long-term monitoring across 17 agri-PV sites · Kopanica-Beravci modeled values
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {microclimateDeltas.map((m, i) => {
          const tone = { agri: 'text-agri', pulse: 'text-pulse', sun: 'text-sun', signal: 'text-signal' }[m.tone];
          return (
            <motion.div
              key={m.metric}
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.05 + i * 0.06 }}
              className="flex flex-col gap-2 rounded-lg border border-border bg-surface/40 p-5"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                {m.metric}
              </span>
              <div className="flex items-baseline gap-2">
                {m.direction === 'up' ? (
                  <ArrowUpRight className={cn('h-4 w-4', tone)} strokeWidth={2} />
                ) : (
                  <ArrowUpRight className={cn('h-4 w-4 rotate-90', tone)} strokeWidth={2} />
                )}
                <span className={cn('font-display text-3xl tracking-tech-tight', tone)}>
                  {m.delta > 0 ? '+' : ''}
                  {m.delta}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">
                  {m.unit}
                </span>
              </div>
              <span className="font-mono text-[10px] leading-relaxed text-text-secondary">
                {m.note}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================== SHEEP DEEP-DIVE ============================ */

function SheepDeepDive() {
  const [breedKey, setBreedKey] = useState(sheepBreeds[0].key);
  const [flockSize, setFlockSize] = useState(96);

  const breed = sheepBreeds.find((b) => b.key === breedKey)!;
  const economics = useMemo(() => deriveSheepEconomics(breed, flockSize), [breed, flockSize]);

  return (
    <div className="border-b border-border px-12 py-14">
      <div className="mb-8 flex flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Sprout className="h-3.5 w-3.5 text-agri" strokeWidth={1.8} />
          sheep · stocking-rate calculator
        </div>
        <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
          pick the breed · size the flock · see the income
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Breed selector + flock slider */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">breed</span>
            <div className="flex flex-col gap-2">
              {sheepBreeds.map((b) => (
                <button
                  key={b.key}
                  onClick={() => setBreedKey(b.key)}
                  className={cn(
                    'flex flex-col gap-1 rounded-lg border bg-surface/40 px-5 py-4 text-left transition-all',
                    breedKey === b.key
                      ? 'border-agri bg-agri/5 shadow-glow-pulse'
                      : 'border-border hover:border-border-bright',
                  )}
                >
                  <div className="flex items-baseline justify-between">
                    <span className={cn('font-display text-lg uppercase tracking-tech-tight', breedKey === b.key ? 'text-agri' : 'text-text-primary')}>
                      {b.name}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                      {b.lambPriceEur} EUR/lamb
                    </span>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                    {b.origin}
                  </span>
                  <div className="mt-1 grid grid-cols-4 gap-2 font-mono text-[10px]">
                    <span className="text-text-secondary">{b.weightKg} kg</span>
                    <span className="text-text-secondary">{b.lambsPerYear} lambs</span>
                    <span className="text-text-secondary">{b.fleeceKgYear} kg wool</span>
                    <span className="text-text-secondary">{b.grazeHaPerHead} ha/hd</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface/40 p-5">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                flock size
              </span>
              <span className="font-mono text-xl tabular-nums text-agri">
                {flockSize} head
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFlockSize((f) => Math.max(40, f - 4))}
                className="rounded-md border border-border p-1 text-text-muted transition-colors hover:border-agri hover:text-agri"
              >
                <MinusCircle className="h-4 w-4" strokeWidth={1.6} />
              </button>
              <input
                type="range"
                min={40}
                max={160}
                step={1}
                value={flockSize}
                onChange={(e) => setFlockSize(parseInt(e.target.value, 10))}
                style={{ accentColor: 'rgb(74, 222, 128)' }}
                className="slider-native flex-1 cursor-grab"
              />
              <button
                onClick={() => setFlockSize((f) => Math.min(160, f + 4))}
                className="rounded-md border border-border p-1 text-text-muted transition-colors hover:border-agri hover:text-agri"
              >
                <PlusCircle className="h-4 w-4" strokeWidth={1.6} />
              </button>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              requires {economics.landNeededHa.toFixed(1)} ha at {breed.grazeHaPerHead} ha/head · fits in {agriSummary.usableUnderPanelHa.toFixed(0)} ha under-panel
            </div>
          </div>
        </div>

        {/* Economics output */}
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <KpiBlock label="lamb revenue" value={`€${(economics.lambRevenue / 1000).toFixed(1)}k`} sub={`${economics.totalLambs} lambs × €${breed.lambPriceEur}`} tone="agri" />
            <KpiBlock label="wool revenue" value={`€${(economics.woolRevenue / 1000).toFixed(1)}k`} sub={`${economics.totalWoolKg} kg × €3.2/kg`} tone="pulse" />
            <KpiBlock label="CAP payments" value={`€${(economics.capAnnual / 1000).toFixed(1)}k`} sub="P1 + P2 eco · stacked" tone="sun" />
            <KpiBlock label="feed + vet opex" value={`−€${(economics.opexAnnual / 1000).toFixed(1)}k`} sub={`€${(economics.opexPerHead).toFixed(0)}/head/yr`} tone="spark" />
          </div>

          <div className="rounded-lg border border-agri/40 bg-agri/5 p-5 shadow-glow-pulse">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-agri">
              net annual income · sheep
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <motion.span
                key={economics.netAnnual}
                initial={{ opacity: 0.4, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="font-display text-5xl tracking-tech-tight text-agri"
              >
                €{(economics.netAnnual / 1000).toFixed(1)}k
              </motion.span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                / year · on top of €{(economics.electricityReference / 1_000_000).toFixed(1)}M electricity
              </span>
            </div>
          </div>

          <div className="rounded-md border border-border bg-surface/40 p-4 font-mono text-[10px] leading-relaxed text-text-secondary">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">rotation</div>
            {/* Rotation timeline — 4 paddocks across a 28-day cycle */}
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'flex-1 rounded-sm px-2 py-2 font-mono text-[9px] uppercase tracking-[0.22em]',
                    i === 2 ? 'bg-agri/20 text-agri ring-1 ring-agri' : 'bg-surface text-text-secondary',
                  )}
                >
                  paddock {i + 1}
                  <div className="mt-1 font-mono text-[8px] text-text-muted">
                    {i === 0 && 'rested · 21d'}
                    {i === 1 && 'recovering · 14d'}
                    {i === 2 && 'grazing · 7d'}
                    {i === 3 && 'next · 0d'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiBlock({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: 'agri' | 'pulse' | 'sun' | 'spark' }) {
  const t = { agri: 'text-agri', pulse: 'text-pulse', sun: 'text-sun', spark: 'text-spark' }[tone];
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface/40 p-4">
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">{label}</span>
      <span className={cn('font-display text-2xl tracking-tech-tight', t)}>{value}</span>
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">{sub}</span>
    </div>
  );
}

function deriveSheepEconomics(breed: typeof sheepBreeds[number], flockSize: number) {
  const ewes = Math.round(flockSize * 0.9); // 90% breeding stock
  const totalLambs = Math.round(ewes * breed.lambsPerYear);
  const lambRevenue = totalLambs * breed.lambPriceEur;
  const totalWoolKg = Math.round(flockSize * breed.fleeceKgYear);
  const woolRevenue = totalWoolKg * 3.2;
  const landNeededHa = flockSize * breed.grazeHaPerHead;
  const opexPerHead = 42; // feed + vet + salt + minerals annually
  const opexAnnual = flockSize * opexPerHead;
  const capAnnual = 80.3 * (159 + 62 + 140);
  const netAnnual = lambRevenue + woolRevenue + capAnnual - opexAnnual;
  return {
    ewes,
    totalLambs,
    lambRevenue,
    totalWoolKg,
    woolRevenue,
    landNeededHa,
    opexPerHead,
    opexAnnual,
    capAnnual,
    netAnnual,
    electricityReference: 3_933_000,
  };
}

/* ===================== AGROS FLOCK MONITOR PLACEHOLDER =================== */

function AgrosMonitor() {
  return (
    <div className="border-b border-border bg-surface/30 px-12 py-14">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Wifi className="h-3.5 w-3.5 text-pulse" strokeWidth={1.8} />
          companion product · agros flock monitor
        </div>
        <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
          live flock telemetry · {agrosFlockMonitor.collarCount} LoRa collars
        </h2>
        <p className="max-w-3xl font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary">
          separate application watching the livestock layer · deploys alongside panonica when the site is commissioned
        </p>
      </div>

      {/* Fake app chrome */}
      <div className="overflow-hidden rounded-lg border border-border-bright bg-canvas shadow-2xl">
        {/* Title bar */}
        <div className="flex items-center gap-3 border-b border-border bg-surface/80 px-4 py-2 backdrop-blur">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-spark" />
            <span className="h-3 w-3 rounded-full bg-sun" />
            <span className="h-3 w-3 rounded-full bg-agri" />
          </div>
          <div className="flex flex-1 items-center justify-center gap-2">
            <Wifi className="h-3 w-3 text-pulse" strokeWidth={2} />
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-secondary">
              {agrosFlockMonitor.appName}
            </span>
            <span className="font-mono text-[9px] text-text-muted">/ kopanica-beravci · tenant #paladina-01</span>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-agri">
            ● LIVE
          </span>
        </div>

        {/* Body */}
        <div className="grid grid-cols-[220px_1.4fr_0.9fr] gap-px bg-border">
          {/* Left nav */}
          <div className="flex flex-col gap-1 bg-surface/80 p-3">
            {['Dashboard', 'Paddocks', 'Flock', 'Weight gain', 'Alerts', 'Integrations', 'Billing'].map((item, i) => (
              <div
                key={item}
                className={cn(
                  'flex items-center gap-2 rounded-sm px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em]',
                  i === 0 ? 'bg-pulse/15 text-pulse' : 'text-text-muted hover:bg-surface-raised',
                )}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
                {item}
              </div>
            ))}
            <div className="mt-auto flex flex-col gap-1 border-t border-border pt-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">tenant</span>
              <span className="font-mono text-[10px] text-text-secondary">Paladina Investments</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">plan</span>
              <span className="font-mono text-[10px] text-pulse">Demo · 30 days</span>
            </div>
          </div>

          {/* Center: grazing heatmap */}
          <div className="flex flex-col gap-3 bg-canvas p-5">
            <div className="flex items-baseline justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                  {agrosFlockMonitor.currentPaddock}
                </span>
                <span className="font-display text-base uppercase tracking-tech-tight text-text-primary">
                  Grazing density · last 24 h
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                  active flock
                </span>
                <span className="font-mono text-sm text-agri">{agrosFlockMonitor.activeFlock} / {agrosFlockMonitor.collarCount}</span>
              </div>
            </div>

            {/* Heatmap grid with sheep dots overlaid */}
            <div className="relative aspect-[5/3] w-full overflow-hidden rounded-md border border-border bg-surface/40">
              <div className="grid h-full grid-cols-10 grid-rows-6 gap-[1px] bg-border/60">
                {agrosFlockMonitor.grazingHeatmap.flat().map((v, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.35, delay: 0.003 * i }}
                    style={{ background: `rgb(74 222 128 / ${v * 0.65})` }}
                  />
                ))}
              </div>

              {/* Sheep collar dots */}
              <div className="absolute inset-0">
                {agrosFlockMonitor.sampleCollars.map((c) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.5 + Math.random() * 0.4 }}
                    className={cn(
                      'absolute flex h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full',
                      c.state === 'stationary' && 'bg-spark shadow-[0_0_6px_rgb(255_61_113_/_0.7)]',
                      c.state === 'grazing' && 'bg-agri shadow-[0_0_6px_rgb(74_222_128_/_0.7)]',
                      c.state === 'resting' && 'bg-pulse shadow-[0_0_6px_rgb(124_92_255_/_0.7)]',
                    )}
                    style={{ left: `${c.pos[0]}%`, top: `${c.pos[1]}%` }}
                    title={`${c.id} ${c.name} · ${c.state}`}
                  >
                    {c.state === 'stationary' && (
                      <motion.span
                        className="absolute inline-flex h-6 w-6 rounded-full bg-spark/40"
                        animate={{ scale: [1, 2], opacity: [0.6, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Scale hint */}
              <div className="absolute bottom-2 right-2 flex items-center gap-2 rounded-sm border border-border bg-canvas/80 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.2em] text-text-muted backdrop-blur">
                12.4 ha · 16:9
              </div>
            </div>

            {/* Weight gain spark */}
            <div className="rounded-md border border-border bg-surface/40 p-3">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                  weight gain · 12-week rolling avg
                </span>
                <span className="font-mono text-[10px] text-agri">
                  +{agrosFlockMonitor.weightGainAvgGPerDay} g/day
                </span>
              </div>
              <svg viewBox="0 0 200 40" className="h-10 w-full">
                <polyline
                  fill="none"
                  stroke="rgb(74 222 128)"
                  strokeWidth={1.4}
                  points={agrosFlockMonitor.weightCurve
                    .map((w, i) => {
                      const x = (i / (agrosFlockMonitor.weightCurve.length - 1)) * 200;
                      const minW = 42;
                      const maxW = 53;
                      const y = 40 - ((w.weight - minW) / (maxW - minW)) * 34;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
                <motion.circle
                  cx={200}
                  cy={6}
                  r={2.2}
                  fill="rgb(74 222 128)"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  style={{ filter: 'drop-shadow(0 0 3px rgb(74 222 128))' }}
                />
              </svg>
            </div>
          </div>

          {/* Right: collar list + alerts */}
          <div className="flex flex-col gap-3 bg-canvas p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                active collars · sample
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-pulse">
                {agrosFlockMonitor.telemetryProtocol.split(' ')[0]}
              </span>
            </div>

            <div className="flex flex-col gap-1 font-mono text-[10px]">
              {agrosFlockMonitor.sampleCollars.slice(0, 6).map((c) => (
                <div
                  key={c.id}
                  className="grid grid-cols-[42px_1fr_56px_52px] items-center gap-2 rounded-sm border border-border/40 bg-surface/30 px-2 py-1.5"
                >
                  <span className="font-mono text-[10px] text-pulse">{c.id}</span>
                  <span
                    className={cn(
                      'font-mono text-[9px] uppercase tracking-[0.2em]',
                      c.state === 'grazing' && 'text-agri',
                      c.state === 'stationary' && 'text-spark',
                      c.state === 'resting' && 'text-pulse',
                    )}
                  >
                    {c.state}
                  </span>
                  <span className="text-right text-text-secondary">{c.steps} st</span>
                  <span className="text-right text-text-muted">{c.battery}%</span>
                </div>
              ))}
            </div>

            <div className="mt-2 border-t border-border pt-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                alerts · {agrosFlockMonitor.alertsActive} active
              </span>
              <div className="mt-2 flex flex-col gap-2">
                {agrosFlockMonitor.alerts.map((a) => (
                  <div
                    key={a.id}
                    className={cn(
                      'flex items-start gap-2 rounded-sm border px-2 py-2 font-mono text-[10px]',
                      a.severity === 'warn'
                        ? 'border-spark/40 bg-spark/5 text-spark'
                        : 'border-border bg-surface/30 text-text-secondary',
                    )}
                  >
                    <Signal className="mt-0.5 h-3 w-3 shrink-0" strokeWidth={1.8} />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] uppercase tracking-[0.22em]">{a.at}</span>
                      <span className="leading-snug">{a.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto border-t border-border pt-3 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
              uptime · {agrosFlockMonitor.uptimeDays}d · last sync {new Date(agrosFlockMonitor.lastSync).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 max-w-3xl font-mono text-[11px] leading-relaxed text-text-secondary">
        <span className="text-text-primary">Agros</span> is a sibling SaaS product that ingests LoRa
        collar telemetry ({agrosFlockMonitor.telemetryProtocol}), exposes grazing + health analytics
        per paddock, and pages the operator on anomalies. It runs on the same Supabase backend as
        Panonica. Shown here is the demo snapshot — in production it streams live.
      </p>
    </div>
  );
}

/* ======================= CERTIFICATION MATRIX =========================== */

function CertificationMatrix() {
  const totalAnnual = certifications
    .filter((c) => c.stackable && c.eligibilityScore > 0.7)
    .reduce((a, c) => a + c.annualPaymentEurPerHa, 0);

  return (
    <div className="border-b border-border px-12 py-14">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Award className="h-3.5 w-3.5 text-sun" strokeWidth={1.8} />
          CAP + EIP + carbon · stackable non-dilutive
        </div>
        <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
          every stream stacks to &euro;{(totalAnnual * 80.3 / 1000).toFixed(0)}k / year
        </h2>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface/40">
        <table className="w-full font-mono text-[11px]">
          <thead>
            <tr className="border-b border-border-bright bg-surface text-text-muted">
              <th className="px-4 py-3 text-left uppercase tracking-[0.22em]">scheme</th>
              <th className="px-4 py-3 text-left uppercase tracking-[0.22em]">authority</th>
              <th className="px-4 py-3 text-right uppercase tracking-[0.22em]">€/ha·yr</th>
              <th className="px-4 py-3 text-right uppercase tracking-[0.22em]">eligibility</th>
              <th className="px-4 py-3 text-center uppercase tracking-[0.22em]">stack</th>
              <th className="px-4 py-3 text-left uppercase tracking-[0.22em]">conditions</th>
            </tr>
          </thead>
          <tbody>
            {certifications.map((c) => (
              <tr key={c.id} className="border-b border-border/40">
                <td className="px-4 py-3 text-text-primary">{c.name}</td>
                <td className="px-4 py-3 text-text-muted">{c.authority}</td>
                <td className="px-4 py-3 text-right tabular-nums text-sun">€{c.annualPaymentEurPerHa}</td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={cn(
                      'inline-block h-1.5 w-14 rounded-full align-middle',
                      c.eligibilityScore > 0.9
                        ? 'bg-agri'
                        : c.eligibilityScore > 0.7
                          ? 'bg-pulse'
                          : 'bg-spark',
                    )}
                    style={{ width: `${c.eligibilityScore * 56}px` }}
                  />
                  <span className="ml-2 tabular-nums text-text-secondary">
                    {(c.eligibilityScore * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {c.stackable ? (
                    <span className="inline-flex h-2 w-2 rounded-full bg-agri shadow-[0_0_4px_rgb(74_222_128)]" />
                  ) : (
                    <span className="inline-flex h-2 w-2 rounded-full bg-spark" />
                  )}
                </td>
                <td className="px-4 py-3 text-text-secondary">{c.conditions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================= ANNUAL CALENDAR =========================== */

function AnnualCalendar() {
  return (
    <div className="border-b border-border bg-surface/20 px-12 py-14">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Activity className="h-3.5 w-3.5 text-pulse" strokeWidth={1.8} />
          annual ops · sheep + crop + PV · 12-month overlay
        </div>
        <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
          two calendars aligned on one plot
        </h2>
      </div>

      <div className="grid grid-cols-12 gap-1 rounded-lg border border-border bg-surface/40 p-4">
        {annualCalendar.map((m) => (
          <motion.div
            key={m.month}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-1 rounded-md border border-border/40 bg-canvas p-3"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              {m.month}
            </span>
            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-sun"
                style={{ width: `${(m.pv / 175) * 100}%` }}
              />
            </div>
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-sun">
              PV {m.pv} GWh
            </span>
            <span className="mt-1 font-mono text-[9px] leading-snug text-agri">{m.sheep}</span>
            <span className="font-mono text-[9px] leading-snug text-pulse">{m.crop}</span>
            <span className="font-mono text-[9px] leading-snug text-text-muted">{m.activity}</span>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
        <LegendDot tone="sun" label="PV production GWh" />
        <LegendDot tone="agri" label="sheep activity" />
        <LegendDot tone="pulse" label="crop cycle" />
      </div>
    </div>
  );
}

function LegendDot({ tone, label }: { tone: 'sun' | 'agri' | 'pulse'; label: string }) {
  const t = { sun: 'bg-sun', agri: 'bg-agri', pulse: 'bg-pulse' }[tone];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('inline-block h-1.5 w-1.5 rounded-full', t)} />
      {label}
    </span>
  );
}

/* ============================== CO-OP MODEL ============================= */

function CoopModel() {
  return (
    <div className="border-b border-border px-12 py-14">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Network className="h-3.5 w-3.5 text-pulse" strokeWidth={1.8} />
          partnership · {coopModel.legalForm}
        </div>
        <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
          {coopModel.name}
        </h2>
        <p className="max-w-3xl font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary">
          {coopModel.governance}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {coopModel.members.map((m, i) => {
          const tone = ['agri', 'pulse', 'sun'][i] as 'agri' | 'pulse' | 'sun';
          const t = { agri: 'border-agri text-agri', pulse: 'border-pulse text-pulse', sun: 'border-sun text-sun' }[tone];
          return (
            <motion.div
              key={m.role}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.1 * i }}
              className={cn('flex flex-col gap-3 rounded-lg border bg-surface/40 p-6', t)}
            >
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                {m.role}
              </span>
              <div className="flex items-baseline justify-between">
                <span className={cn('font-display text-xl uppercase tracking-tech-tight', t.split(' ')[1])}>
                  {m.name}
                </span>
                <span className={cn('font-display text-3xl tracking-tech-tight', t.split(' ')[1])}>
                  {(m.share * 100).toFixed(0)}%
                </span>
              </div>
              <p className="font-mono text-[10px] leading-relaxed text-text-secondary">
                {m.contribution}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue-split breakdown */}
      <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-3">
        {([
          ['electricity', coopModel.revenueSplit.electricity, 'sun'],
          ['agri products', coopModel.revenueSplit.agriProducts, 'agri'],
          ['subsidies + grants', coopModel.revenueSplit.subsidies, 'pulse'],
        ] as const).map(([label, split, tone]) => {
          const tint = { sun: 'bg-sun', agri: 'bg-agri', pulse: 'bg-pulse' }[tone];
          return (
            <div key={label} className="flex flex-col gap-3 rounded-md border border-border bg-surface/40 p-5">
              <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
                <span className="text-text-muted">{label} split</span>
                <span className={cn('text-xs', tone === 'sun' && 'text-sun', tone === 'agri' && 'text-agri', tone === 'pulse' && 'text-pulse')}>
                  op {(split.operator * 100).toFixed(0)} · fm {(split.farmer * 100).toFixed(0)} · co {(split.community * 100).toFixed(0)}
                </span>
              </div>
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-border">
                {split.operator > 0 && <div className={cn('h-full', tint)} style={{ width: `${split.operator * 100}%`, opacity: 1 }} />}
                {split.farmer > 0 && <div className={cn('h-full', tint)} style={{ width: `${split.farmer * 100}%`, opacity: 0.65 }} />}
                {split.community > 0 && <div className={cn('h-full', tint)} style={{ width: `${split.community * 100}%`, opacity: 0.3 }} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =============================== FOOTER ================================= */

function Footer() {
  return (
    <div className="flex items-center justify-end gap-3 px-12 py-8">
      <Link
        to="/configurator"
        className="group inline-flex items-center gap-3 rounded-md border border-border-bright bg-surface px-5 py-3 transition-all hover:border-pulse hover:shadow-glow-pulse"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary group-hover:text-pulse">
          configure the system
        </span>
        <ArrowRight
          className="h-4 w-4 text-text-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-pulse"
          strokeWidth={1.8}
        />
      </Link>
    </div>
  );
}
