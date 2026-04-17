import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Droplets, Home, Leaf, TreeDeciduous } from 'lucide-react';
import { NumberTicker, cn } from '@paladian/ui';
import { configs, configOrder, type ConfigKey, type ConfigScenario } from '@/mock/configs';
import { IsoFarm } from '@/components/IsoFarm';

type Tracking = 'fixed' | '1-axis' | '2-axis';
type UnderPanel = 'none' | 'sheep' | 'soy' | 'herbs';

interface Live {
  capacityMW: number;
  panelHeight: number;
  rowSpacing: number;
  tracking: Tracking;
  battery: number;
  underPanel: UnderPanel;
}

export function ConfiguratorRoute() {
  const [active, setActive] = useState<ConfigKey>('agri-sheep');
  const [live, setLive] = useState<Live>(() => toLive(configs['agri-sheep']));

  const handleTabChange = (key: ConfigKey) => {
    setActive(key);
    setLive(toLive(configs[key]));
  };

  const set = <K extends keyof Live>(k: K, v: Live[K]) =>
    setLive((prev) => ({ ...prev, [k]: v }));

  // Derive financial numbers from live state with simple interpolation
  const derived = useMemo(() => derive(active, live), [active, live]);
  const rows = Math.max(3, Math.round(7 - (live.rowSpacing - 4) * 0.5));
  const cols = Math.max(4, Math.round(10 - (live.capacityMW - 10) * 0.06));

  return (
    <section className="grid min-h-full grid-cols-[minmax(400px,0.9fr)_1.3fr] gap-0">
      {/* LEFT — controls */}
      <div className="flex min-h-full flex-col gap-8 border-r border-border bg-surface/30 p-10">
        {/* SCENARIO TABS */}
        <div>
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            scenario
          </div>
          <div className="flex gap-1 rounded-md border border-border bg-surface p-1">
            {configOrder.map((key) => (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={cn(
                  'flex-1 rounded-sm px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors',
                  active === key
                    ? 'bg-pulse/15 text-pulse shadow-glow-pulse'
                    : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary',
                )}
              >
                {configs[key].name}
              </button>
            ))}
          </div>
        </div>

        {/* SLIDERS */}
        <div className="flex flex-col gap-5">
          <Slider
            label="installed capacity"
            unit="MWp"
            min={10}
            max={60}
            step={1}
            value={live.capacityMW}
            onChange={(v) => set('capacityMW', v)}
            tone="pulse"
          />
          <Slider
            label="panel height"
            unit="m"
            min={2}
            max={6}
            step={0.1}
            value={live.panelHeight}
            onChange={(v) => set('panelHeight', v)}
            decimals={1}
          />
          <Slider
            label="row spacing"
            unit="m"
            min={4}
            max={12}
            step={0.1}
            value={live.rowSpacing}
            onChange={(v) => set('rowSpacing', v)}
            decimals={1}
          />

          <Segmented
            label="tracking"
            options={[
              { value: 'fixed', label: 'Fixed' },
              { value: '1-axis', label: '1-axis' },
              { value: '2-axis', label: '2-axis' },
            ]}
            value={live.tracking}
            onChange={(v) => set('tracking', v as Tracking)}
          />

          <Slider
            label="battery storage"
            unit="MWh"
            min={0}
            max={40}
            step={1}
            value={live.battery}
            onChange={(v) => set('battery', v)}
            tone="signal"
          />

          <Segmented
            label="under-panel use"
            options={[
              { value: 'none', label: 'None', icon: Home },
              { value: 'sheep', label: 'Sheep', icon: TreeDeciduous },
              { value: 'soy', label: 'Soy', icon: Leaf },
              { value: 'herbs', label: 'Herbs', icon: Leaf },
            ]}
            value={live.underPanel}
            onChange={(v) => set('underPanel', v as UnderPanel)}
          />
        </div>

        {/* SUMMARY */}
        <div className="mt-auto rounded-lg border border-border bg-surface p-5">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            financial summary · live
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 font-mono text-[11px]">
            <SummaryRow label="CAPEX" value={`€${(derived.capex / 1_000_000).toFixed(1)}M`} tone="sun" />
            <SummaryRow label="OPEX (annual)" value={`€${(derived.opex / 1000).toFixed(0)}K`} />
            <SummaryRow label="annual yield" value={`${derived.yieldGWh.toFixed(1)} GWh`} tone="pulse" />
            <SummaryRow label="annual revenue" value={`€${(derived.revenue / 1000).toFixed(0)}K`} />
            <SummaryRow
              label="agri income"
              value={derived.agriIncome > 0 ? `€${(derived.agriIncome / 1000).toFixed(0)}K` : '—'}
              tone="agri"
            />
            <SummaryRow label="LCOE" value={`€${derived.lcoe} / MWh`} />
            <SummaryRow label="payback" value={`${derived.payback.toFixed(1)} yr`} tone="pulse" />
            <SummaryRow label="IRR" value={`${derived.irr.toFixed(1)}%`} />
          </div>
        </div>
      </div>

      {/* RIGHT — live visualization + impact */}
      <div className="flex min-h-full flex-col">
        <div className="relative flex-1 overflow-hidden border-b border-border bg-gradient-to-b from-canvas via-surface/30 to-canvas">
          <IsoFarm
            rows={rows}
            cols={cols}
            tracking={live.tracking}
            underPanel={live.underPanel}
            rowSpacing={live.rowSpacing}
            panelHeight={live.panelHeight}
          />
          <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              live visualization · beravci
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-pulse">
              {configs[active].name}
            </span>
          </div>
        </div>

        {/* IMPACT STRIP */}
        <div className="grid grid-cols-4 gap-px bg-border">
          <ImpactCell
            icon={Leaf}
            label="CO₂ avoided"
            value={
              <NumberTicker
                value={derived.co2}
                duration={1.2}
                format={(v) => `${Math.round(v).toLocaleString()} t/yr`}
                triggerOnView={false}
              />
            }
            tone="agri"
          />
          <ImpactCell
            icon={Home}
            label="households powered"
            value={
              <NumberTicker
                value={derived.households}
                duration={1.2}
                triggerOnView={false}
              />
            }
            tone="pulse"
          />
          <ImpactCell
            icon={Droplets}
            label="water saved"
            value="0 (no cooling)"
            tone="signal"
          />
          <ImpactCell
            icon={TreeDeciduous}
            label="agri yield maintained"
            value={`${Math.round(derived.agriMaintained * 100)}%`}
            tone="sun"
          />
        </div>

        {/* CTA */}
        <div className="flex items-center justify-end gap-4 px-10 py-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            numbers update live as you move sliders
          </span>
          <Link
            to="/roi"
            className="group inline-flex items-center gap-3 rounded-md border border-border-bright bg-surface px-5 py-3 transition-all hover:border-pulse hover:shadow-glow-pulse"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary group-hover:text-pulse">
              see 20-year projection
            </span>
            <ArrowRight
              className="h-4 w-4 text-text-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-pulse"
              strokeWidth={1.8}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- helpers -------------------------------- */

function toLive(s: ConfigScenario): Live {
  return {
    capacityMW: s.installedMW,
    panelHeight: s.panelHeight,
    rowSpacing: s.rowSpacing,
    tracking: s.tracking,
    battery: s.battery,
    underPanel: s.underPanel,
  };
}

function derive(
  active: ConfigKey,
  live: Live,
): {
  capex: number;
  opex: number;
  yieldGWh: number;
  revenue: number;
  agriIncome: number;
  lcoe: number;
  payback: number;
  irr: number;
  co2: number;
  households: number;
  agriMaintained: number;
} {
  const base = configs[active];
  const k = live.capacityMW / base.installedMW;
  const trackingMul =
    live.tracking === '2-axis' ? 1.12 : live.tracking === '1-axis' ? 1.06 : 1;
  const batteryUplift = live.battery * 15_000;

  const capex = base.capex * k + live.battery * 280_000;
  const opex = base.opex * Math.sqrt(k) + live.battery * 6_000;
  const yieldGWh = base.annualYieldGWh * k * trackingMul;
  const revenue = base.revenue * k * trackingMul + batteryUplift;
  const agriIncome =
    live.underPanel === 'none' ? 0 : base.agriIncome * (0.8 + live.rowSpacing / 20);
  const lcoe = Math.round(base.lcoeEurPerMWh * (1 + (live.rowSpacing - base.rowSpacing) * 0.015));
  const payback = Math.max(
    4,
    base.payback * Math.sqrt(1 / (trackingMul * (1 + batteryUplift / revenue))),
  );
  const irr = Math.min(18, base.irr * trackingMul * (1 + (live.battery * 0.005)));
  const co2 = base.co2Avoided * k * trackingMul;
  const households = Math.round(base.householdsPowered * k * trackingMul);
  const agriMaintained = live.underPanel === 'none' ? 0 : Math.min(0.9, 0.5 + live.rowSpacing / 18);

  return {
    capex,
    opex,
    yieldGWh,
    revenue,
    agriIncome,
    lcoe,
    payback,
    irr,
    co2,
    households,
    agriMaintained,
  };
}

/* ------------------------------- Slider ----------------------------------- */

interface SliderProps {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  tone?: 'pulse' | 'signal' | 'sun' | 'agri' | 'default';
  decimals?: number;
}

function Slider({ label, unit, min, max, step, value, onChange, tone = 'default', decimals = 0 }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const toneColor = {
    pulse: 'rgb(124, 92, 255)',
    signal: 'rgb(0, 217, 255)',
    sun: 'rgb(255, 184, 0)',
    agri: 'rgb(74, 222, 128)',
    default: 'rgb(250, 250, 250)',
  }[tone];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          {label}
        </span>
        <span
          className="font-mono text-sm tabular-nums"
          style={{ color: tone === 'default' ? undefined : toneColor }}
        >
          {value.toFixed(decimals)} {unit}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="slider-native absolute inset-0 w-full cursor-grab appearance-none bg-transparent outline-none"
          style={{ accentColor: toneColor }}
        />
        <div className="pointer-events-none h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full transition-[width] duration-150"
            style={{ width: `${pct}%`, background: toneColor }}
          />
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Segmented ---------------------------------- */

interface SegmentedProps<T extends string> {
  label: string;
  options: { value: T; label: string; icon?: React.ComponentType<{ className?: string }> }[];
  value: T;
  onChange: (v: T) => void;
}

function Segmented<T extends string>({ label, options, value, onChange }: SegmentedProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">{label}</span>
      <div className="flex gap-1 rounded-md border border-border bg-surface p-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex-1 rounded-sm px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors',
              value === opt.value
                ? 'bg-pulse/15 text-pulse'
                : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- SummaryRow --------------------------------- */

function SummaryRow({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'pulse' | 'signal' | 'sun' | 'agri';
}) {
  return (
    <div className="flex items-baseline justify-between border-b border-border/50 py-1.5">
      <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">{label}</span>
      <motion.span
        key={value}
        initial={{ opacity: 0.4, y: -2 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'tabular-nums',
          tone === 'pulse' && 'text-pulse',
          tone === 'signal' && 'text-signal',
          tone === 'sun' && 'text-sun',
          tone === 'agri' && 'text-agri',
          tone === 'default' && 'text-text-primary',
        )}
      >
        {value}
      </motion.span>
    </div>
  );
}

/* ----------------------------- ImpactCell --------------------------------- */

function ImpactCell({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: React.ReactNode;
  tone: 'pulse' | 'signal' | 'sun' | 'agri';
}) {
  const toneClass = {
    pulse: 'text-pulse',
    signal: 'text-signal',
    sun: 'text-sun',
    agri: 'text-agri',
  }[tone];

  return (
    <div className="flex items-center gap-4 bg-surface/70 px-6 py-5">
      <Icon className={cn('h-5 w-5', toneClass)} strokeWidth={1.6} />
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
          {label}
        </span>
        <span className={cn('font-mono text-sm tabular-nums', toneClass)}>{value}</span>
      </div>
    </div>
  );
}
