import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Battery,
  Bookmark,
  Cable,
  Check,
  ChevronDown,
  Cpu,
  Droplets,
  Fence,
  Grid3x3,
  Home,
  Leaf,
  LineChart,
  Package,
  ShieldCheck,
  Sun,
  TreeDeciduous,
  X,
} from 'lucide-react';
import { NumberTicker, cn } from '@paladian/ui';
import { configs, configOrder, type ConfigKey } from '@/mock/configs';
import { IsoFarm } from '@/components/IsoFarm';
import {
  complianceRules,
  computeBom,
  constructionSchedule,
  electricalOptions,
  inverterCatalog,
  panelCatalog,
  storageChemistries,
  type ConfiguratorState,
} from '@/mock/configDeep';
import { useConfigStore, type ConfigState } from '@/store/configStore';
import { useScenariosStore, type ScenarioSlot } from '@/store/scenariosStore';
import { DnaGlyph } from '@/components/DnaGlyph';

type Tracking = 'fixed' | '1-axis' | '2-axis';
type UnderPanel = 'none' | 'sheep' | 'soy' | 'herbs';

type SectionKey = 'scenario' | 'module' | 'mounting' | 'inverter' | 'layout' | 'electrical' | 'storage' | 'agri' | 'security';

export function ConfiguratorRoute() {
  const live = useConfigStore();
  const setScenario = useConfigStore((s) => s.setScenario);
  const set = useConfigStore((s) => s.set);
  const snapshot = useConfigStore((s) => s.snapshot);
  const active = live.activeScenario;

  const saveScenario = useScenariosStore((s) => s.save);
  const scenarios = useScenariosStore((s) => s.scenarios);

  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    scenario: true,
    module: true,
    mounting: true,
    inverter: false,
    layout: false,
    electrical: false,
    storage: true,
    agri: true,
    security: false,
  });

  const toggleSection = (k: SectionKey) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  const handleScenarioChange = (key: ConfigKey) => setScenario(key);

  const derived = useMemo(() => derive(active, live), [active, live]);
  const rows = Math.max(3, Math.round(7 - (live.rowSpacing - 4) * 0.5));
  const cols = Math.max(4, Math.round(10 - (live.capacityMW - 10) * 0.06));

  const panel = panelCatalog.find((p) => p.id === live.panelId)!;
  const inverter = inverterCatalog.find((i) => i.id === live.inverterId)!;
  const chem = storageChemistries.find((c) => c.id === live.batteryChem)!;

  const state: ConfiguratorState = {
    capacityMW: live.capacityMW,
    dcAcRatio: live.dcAcRatio,
    batteryMWh: live.battery,
    batteryChem: live.batteryChem,
    mvKv: live.mvKv,
    gcr: live.gcr,
    fenceHeightM: live.fenceHeightM,
    cctvCount: live.cctvCount,
    tracking: live.tracking,
    underPanel: live.underPanel,
    panelHeightM: live.panelHeight,
    rowSpacingM: live.rowSpacing,
  };

  const handleSnapshot = (slot: ScenarioSlot) => {
    const defaultName = `${configs[active].name} · ${live.capacityMW}MW${live.battery ? ` · ${live.battery}MWh` : ''}`;
    saveScenario(slot, defaultName, snapshot());
  };

  const bom = useMemo(() => computeBom(state, panel, inverter, chem), [state, panel, inverter, chem]);
  const compliance = useMemo(() => complianceRules.map((r) => ({ ...r, result: r.check(state) })), [state]);

  return (
    <section className="flex min-h-full flex-col">
      {/* TOP — two-column controls + viz */}
      <div className="grid min-h-[calc(100vh-2.75rem)] grid-cols-[minmax(460px,0.9fr)_1.2fr] gap-0">
        {/* LEFT — sectioned controls */}
        <div className="flex min-h-full flex-col gap-3 overflow-y-auto border-r border-border bg-surface/30 p-8">
          <Section title="Scenario preset" icon={Activity} tone="pulse" open={open.scenario} onToggle={() => toggleSection('scenario')}>
            <div className="flex gap-1 rounded-md border border-border bg-surface p-1">
              {configOrder.map((key) => (
                <button
                  key={key}
                  onClick={() => handleScenarioChange(key)}
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
            <Link
              to="/build"
              className="inline-flex items-center gap-2 rounded-sm border border-border-bright bg-surface px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted transition-colors hover:border-sun hover:text-sun"
            >
              need engineering depth? open builder · 16 sections · 120 fields →
            </Link>
          </Section>

          <Section title="Module · panel selection" icon={Sun} tone="sun" open={open.module} onToggle={() => toggleSection('module')}>
            <div className="flex flex-col gap-2">
              {panelCatalog.map((p) => (
                <button
                  key={p.id}
                  onClick={() => set('panelId', p.id)}
                  className={cn(
                    'flex flex-col gap-1 rounded-md border bg-surface/40 px-4 py-3 text-left transition-all',
                    live.panelId === p.id
                      ? 'border-sun bg-sun/5 shadow-glow-pulse'
                      : 'border-border hover:border-border-bright',
                  )}
                >
                  <div className="flex items-baseline justify-between font-mono text-[10px]">
                    <span className={cn('text-text-primary', live.panelId === p.id && 'text-sun')}>
                      {p.name}
                    </span>
                    {p.flag && (
                      <span className="rounded-sm border border-border px-1.5 py-0.5 text-[8px] uppercase tracking-[0.2em] text-text-muted">
                        {p.flag}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">
                    <span>{p.manufacturer}</span>
                    <span>{p.wpPerModule} Wp</span>
                    <span>{p.efficiencyPct}% η</span>
                    <span className="ml-auto text-sun">€{p.pricePerWp.toFixed(3)}/Wp</span>
                  </div>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Mounting + tracking" icon={Grid3x3} tone="pulse" open={open.mounting} onToggle={() => toggleSection('mounting')}>
            <Slider label="installed capacity" unit="MWp" min={10} max={60} step={1} value={live.capacityMW} onChange={(v) => set('capacityMW', v)} tone="pulse" />
            <Slider label="panel height" unit="m" min={2} max={6} step={0.1} value={live.panelHeight} onChange={(v) => set('panelHeight', v)} decimals={1} />
            <Slider label="row spacing" unit="m" min={4} max={12} step={0.1} value={live.rowSpacing} onChange={(v) => set('rowSpacing', v)} decimals={1} />
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
          </Section>

          <Section title="Inverter topology" icon={Cpu} tone="signal" open={open.inverter} onToggle={() => toggleSection('inverter')}>
            <div className="flex flex-col gap-2">
              {inverterCatalog.map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => set('inverterId', inv.id)}
                  className={cn(
                    'flex flex-col gap-1 rounded-md border bg-surface/40 px-4 py-3 text-left transition-all',
                    live.inverterId === inv.id
                      ? 'border-signal bg-signal/5 shadow-glow-pulse'
                      : 'border-border hover:border-border-bright',
                  )}
                >
                  <div className="flex items-baseline justify-between font-mono text-[10px]">
                    <span className={cn('text-text-primary', live.inverterId === inv.id && 'text-signal')}>
                      {inv.name}
                    </span>
                    <span className="text-signal">€{inv.pricePerKw}/kW</span>
                  </div>
                  <div className="flex gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">
                    <span>{inv.topology}</span>
                    <span>{inv.kwPerUnit} kW</span>
                    <span>{(inv.efficiency * 100).toFixed(1)}% eff</span>
                  </div>
                  <span className="font-mono text-[9px] text-text-secondary">{inv.note}</span>
                </button>
              ))}
            </div>
            <Slider label="DC/AC ratio" unit="" min={1.0} max={1.5} step={0.01} value={live.dcAcRatio} onChange={(v) => set('dcAcRatio', v)} decimals={2} tone="signal" />
          </Section>

          <Section title="Layout · GCR + density" icon={LineChart} tone="agri" open={open.layout} onToggle={() => toggleSection('layout')}>
            <Slider label="ground coverage ratio" unit="" min={0.25} max={0.55} step={0.01} value={live.gcr} onChange={(v) => set('gcr', v)} decimals={2} tone="agri" />
            <div className="rounded-md border border-border bg-surface/40 p-3 font-mono text-[10px] leading-relaxed text-text-muted">
              GCR ratio of panel area to land area. Lower = more light for under-panel crops. Higher = more MW per hectare but less photosynthetically active radiation.
            </div>
          </Section>

          <Section title="Electrical · MV level" icon={Cable} tone="signal" open={open.electrical} onToggle={() => toggleSection('electrical')}>
            <Segmented
              label="MV voltage level"
              options={electricalOptions.mvVoltageLevels.map((v) => ({ value: String(v), label: `${v} kV` }))}
              value={String(live.mvKv)}
              onChange={(v) => set('mvKv', parseInt(v, 10))}
            />
            <div className="rounded-md border border-border bg-surface/40 p-3 font-mono text-[10px] leading-relaxed text-text-muted">
              20 kV standard for rural MV · 30 kV transitional · 35 kV required for ≥ 20 MW sites connecting at TS Slavonski Brod 1.
            </div>
          </Section>

          <Section title="Storage · battery" icon={Battery} tone="pulse" open={open.storage} onToggle={() => toggleSection('storage')}>
            <Slider label="battery storage" unit="MWh" min={0} max={40} step={1} value={live.battery} onChange={(v) => set('battery', v)} tone="pulse" />
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">chemistry</span>
              <div className="flex flex-col gap-1.5">
                {storageChemistries.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => set('batteryChem', c.id)}
                    className={cn(
                      'flex flex-col gap-1 rounded-md border bg-surface/40 px-3 py-2 text-left transition-all',
                      live.batteryChem === c.id
                        ? 'border-pulse bg-pulse/5 shadow-glow-pulse'
                        : 'border-border hover:border-border-bright',
                    )}
                  >
                    <div className="flex items-baseline justify-between font-mono text-[10px]">
                      <span className={cn('text-text-primary', live.batteryChem === c.id && 'text-pulse')}>
                        {c.name}
                      </span>
                      <span className="text-pulse">€{c.pricePerKwh}/kWh</span>
                    </div>
                    <div className="flex gap-3 font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">
                      <span>{c.cyclesTo80Pct.toLocaleString()} cyc</span>
                      <span>{(c.roundtripEff * 100).toFixed(0)}% rt</span>
                      <span>{c.cRateMax}C max</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Section>

          <Section title="Agriculture · under-panel" icon={Leaf} tone="agri" open={open.agri} onToggle={() => toggleSection('agri')}>
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
            <Link
              to="/agriculture"
              className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-agri underline-offset-4 hover:underline"
            >
              configure agriculture in detail →
            </Link>
          </Section>

          <Section title="Security · fence + CCTV" icon={Fence} tone="spark" open={open.security} onToggle={() => toggleSection('security')}>
            <Slider label="fence height" unit="m" min={2} max={3} step={0.1} value={live.fenceHeightM} onChange={(v) => set('fenceHeightM', v)} decimals={1} tone="spark" />
            <Slider label="CCTV towers" unit="" min={4} max={16} step={1} value={live.cctvCount} onChange={(v) => set('cctvCount', v)} tone="spark" />
          </Section>
        </div>

        {/* RIGHT — IsoFarm + live impact + BOM */}
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
                live visualization · kopanica-beravci
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-pulse">
                {configs[active].name} · {live.capacityMW} MWp · {panel.manufacturer.split(' ')[0]} {panel.wpPerModule}Wp
              </span>
            </div>
            <div className="pointer-events-none absolute right-4 top-4 flex flex-col items-end gap-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                layout · GCR {live.gcr.toFixed(2)}
              </span>
              <div className="pointer-events-none rounded-md border border-border/60 bg-canvas/60 p-2 backdrop-blur">
                <DnaGlyph config={live as ConfigState} size={88} />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                deal DNA · live
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-px bg-border">
            <ImpactCell icon={Leaf} label="CO₂ avoided" value={<NumberTicker value={derived.co2} duration={1.2} format={(v) => `${Math.round(v).toLocaleString()} t/yr`} triggerOnView={false} />} tone="agri" />
            <ImpactCell icon={Home} label="households powered" value={<NumberTicker value={derived.households} duration={1.2} triggerOnView={false} />} tone="pulse" />
            <ImpactCell icon={Droplets} label="water saved" value="0 (no cooling)" tone="signal" />
            <ImpactCell icon={TreeDeciduous} label="agri yield maintained" value={`${Math.round(derived.agriMaintained * 100)}%`} tone="sun" />
          </div>

          {/* SUMMARY — live derived financials */}
          <div className="grid grid-cols-2 gap-px bg-border">
            <LiveBlock label="CAPEX · BOM" value={`€${(bom.total / 1_000_000).toFixed(1)}M`} tone="sun" />
            <LiveBlock label="OPEX · annual" value={`€${(derived.opex / 1000).toFixed(0)}K`} tone="pulse" />
            <LiveBlock label="annual yield" value={`${derived.yieldGWh.toFixed(1)} GWh`} tone="signal" />
            <LiveBlock label="LCOE" value={`€${derived.lcoe}/MWh`} tone="signal" />
            <LiveBlock label="IRR" value={`${derived.irr.toFixed(1)}%`} tone="agri" />
            <LiveBlock label="payback" value={`${derived.payback.toFixed(1)} yr`} tone="pulse" />
          </div>

          {/* Snapshot strip — A/B/C quick-save */}
          <div className="flex items-center gap-3 border-t border-border bg-surface/50 px-5 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              snapshot current config →
            </span>
            <div className="flex gap-2">
              {(['A', 'B', 'C'] as ScenarioSlot[]).map((slot) => {
                const filled = !!scenarios[slot];
                return (
                  <button
                    key={slot}
                    onClick={() => handleSnapshot(slot)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] transition-all',
                      filled
                        ? 'border-pulse/50 bg-pulse/10 text-pulse hover:bg-pulse/20 hover:shadow-glow-pulse'
                        : 'border-border bg-surface text-text-muted hover:border-border-bright hover:text-text-secondary',
                    )}
                    title={filled ? `Overwrite ${slot}` : `Save to ${slot}`}
                  >
                    <Bookmark className="h-3 w-3" strokeWidth={1.8} />
                    {filled ? `${slot} ↺` : `save ${slot}`}
                  </button>
                );
              })}
            </div>
            <Link
              to="/scenarios"
              className="ml-auto font-mono text-[10px] uppercase tracking-[0.22em] text-agri underline-offset-4 hover:underline"
            >
              compare →
            </Link>
          </div>
        </div>
      </div>

      {/* DEEP BAND — BOM + Compliance + Gantt */}
      <BomPanel bom={bom} panel={panel} inverter={inverter} chem={chem} />
      <CompliancePanel compliance={compliance} />
      <GanttPanel />

      {/* CTA */}
      <div className="flex items-center justify-end gap-4 border-t border-border px-10 py-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          every slider updates CAPEX · BOM · compliance · impact · live
        </span>
        <Link
          to="/roi"
          className="group inline-flex items-center gap-3 rounded-md border border-border-bright bg-surface px-5 py-3 transition-all hover:border-pulse hover:shadow-glow-pulse"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary group-hover:text-pulse">
            see 25-year finance model
          </span>
          <ArrowRight className="h-4 w-4 text-text-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-pulse" strokeWidth={1.8} />
        </Link>
      </div>
    </section>
  );
}

/* ================================ HELPERS =============================== */

function derive(active: ConfigKey, live: ConfigState) {
  const base = configs[active];
  const k = live.capacityMW / base.installedMW;
  const trackingMul = live.tracking === '2-axis' ? 1.12 : live.tracking === '1-axis' ? 1.06 : 1;
  const batteryUplift = live.battery * 15_000;

  const opex = base.opex * Math.sqrt(k) + live.battery * 6_000;
  const yieldGWh = base.annualYieldGWh * k * trackingMul;
  const revenue = base.revenue * k * trackingMul + batteryUplift;
  const agriIncome = live.underPanel === 'none' ? 0 : base.agriIncome * (0.8 + live.rowSpacing / 20);
  const lcoe = Math.round(base.lcoeEurPerMWh * (1 + (live.rowSpacing - base.rowSpacing) * 0.015));
  const payback = Math.max(4, base.payback * Math.sqrt(1 / (trackingMul * (1 + batteryUplift / revenue))));
  const irr = Math.min(18, base.irr * trackingMul * (1 + live.battery * 0.005));
  const co2 = base.co2Avoided * k * trackingMul;
  const households = Math.round(base.householdsPowered * k * trackingMul);
  const agriMaintained = live.underPanel === 'none' ? 0 : Math.min(0.9, 0.5 + live.rowSpacing / 18);

  return { opex, yieldGWh, revenue, agriIncome, lcoe, payback, irr, co2, households, agriMaintained };
}

/* ============================== Section ================================= */

function Section({ title, icon: Icon, tone, open, onToggle, children }: { title: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; tone: 'pulse' | 'sun' | 'agri' | 'signal' | 'spark'; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  const t = { pulse: 'text-pulse', sun: 'text-sun', agri: 'text-agri', signal: 'text-signal', spark: 'text-spark' }[tone];
  return (
    <div className="rounded-md border border-border bg-surface/50">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface"
      >
        <Icon className={cn('h-3.5 w-3.5', t)} strokeWidth={1.8} />
        <span className={cn('font-mono text-[11px] uppercase tracking-[0.22em]', t)}>
          {title}
        </span>
        <ChevronDown className={cn('ml-auto h-3 w-3 text-text-muted transition-transform', open && 'rotate-180')} strokeWidth={1.8} />
      </button>
      {open && (
        <div className="flex flex-col gap-3 border-t border-border/60 px-4 py-3">
          {children}
        </div>
      )}
    </div>
  );
}

/* =========================== Slider + Segmented ========================= */

function Slider({ label, unit, min, max, step, value, onChange, tone = 'default', decimals = 0 }: { label: string; unit: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void; tone?: 'pulse' | 'signal' | 'sun' | 'agri' | 'spark' | 'default'; decimals?: number }) {
  const pct = ((value - min) / (max - min)) * 100;
  const toneColor = { pulse: 'rgb(124, 92, 255)', signal: 'rgb(0, 217, 255)', sun: 'rgb(255, 184, 0)', agri: 'rgb(74, 222, 128)', spark: 'rgb(255, 61, 113)', default: 'rgb(250, 250, 250)' }[tone];
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">{label}</span>
        <span className="font-mono text-sm tabular-nums" style={{ color: tone === 'default' ? undefined : toneColor }}>
          {value.toFixed(decimals)} {unit}
        </span>
      </div>
      <div className="relative">
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="slider-native absolute inset-0 w-full cursor-grab appearance-none bg-transparent outline-none" style={{ accentColor: toneColor }} />
        <div className="pointer-events-none h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div className="h-full rounded-full transition-[width] duration-150" style={{ width: `${pct}%`, background: toneColor }} />
        </div>
      </div>
    </div>
  );
}

function Segmented<T extends string>({ label, options, value, onChange }: { label: string; options: { value: T; label: string; icon?: React.ComponentType<{ className?: string }> }[]; value: T; onChange: (v: T) => void }) {
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
              value === opt.value ? 'bg-pulse/15 text-pulse' : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================= ImpactCell =============================== */

function ImpactCell({ icon: Icon, label, value, tone }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string; value: React.ReactNode; tone: 'pulse' | 'signal' | 'sun' | 'agri' }) {
  const toneClass = { pulse: 'text-pulse', signal: 'text-signal', sun: 'text-sun', agri: 'text-agri' }[tone];
  return (
    <div className="flex items-center gap-4 bg-surface/70 px-6 py-5">
      <Icon className={cn('h-5 w-5', toneClass)} strokeWidth={1.6} />
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">{label}</span>
        <span className={cn('font-mono text-sm tabular-nums', toneClass)}>{value}</span>
      </div>
    </div>
  );
}

function LiveBlock({ label, value, tone }: { label: string; value: string; tone: 'pulse' | 'sun' | 'agri' | 'signal' | 'spark' }) {
  const t = { pulse: 'text-pulse', sun: 'text-sun', agri: 'text-agri', signal: 'text-signal', spark: 'text-spark' }[tone];
  return (
    <div className="flex flex-col gap-1 bg-surface/80 px-5 py-4">
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">{label}</span>
      <motion.span key={value} initial={{ opacity: 0.4, y: -2 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className={cn('font-display text-xl tracking-tech-tight', t)}>
        {value}
      </motion.span>
    </div>
  );
}

/* =============================== BOM ==================================== */

function BomPanel({ bom, panel, inverter, chem }: { bom: ReturnType<typeof computeBom>; panel: ReturnType<typeof panelCatalog['0']> | typeof panelCatalog[number]; inverter: typeof inverterCatalog[number]; chem: typeof storageChemistries[number] }) {
  return (
    <div className="border-t border-border bg-surface/20 px-12 py-10">
      <div className="mb-5 flex items-baseline justify-between">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Package className="h-3.5 w-3.5 text-sun" strokeWidth={1.8} />
          bill of materials · live from configuration
        </div>
        <div className="font-display text-3xl tracking-tech-tight text-sun">
          €<NumberTicker value={bom.total / 1_000_000} decimals={2} duration={0.5} triggerOnView={false} />M
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-2">
          <div className="rounded-md border border-border bg-surface/40 p-4 text-[11px] leading-relaxed">
            <div className="font-mono uppercase tracking-[0.22em] text-text-muted">selected</div>
            <div className="mt-1 flex flex-col gap-0.5 font-mono">
              <span className="text-sun">{panel.name} · {panel.wpPerModule}Wp · {panel.manufacturer}</span>
              <span className="text-signal">{inverter.name} · {inverter.topology}</span>
              <span className="text-pulse">{chem.name}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <Stat2 label="Module count" value={bom.moduleCount.toLocaleString()} />
            <Stat2 label="Inverter count" value={String(bom.inverterCount)} />
            <Stat2 label="Transformers" value={`${bom.transformerCount} × ${bom.transformerMva} MVA`} />
            <Stat2 label="DC + AC cable" value={`${bom.dcCableKm.toFixed(0)} + ${bom.acCableKm.toFixed(0)} km`} />
            <Stat2 label="Site area" value={`${bom.areaHa.toFixed(1)} ha`} />
            <Stat2 label="Battery energy" value={`${(bom.batteryKwh / 1000).toFixed(1)} MWh`} />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface/40 overflow-hidden">
          <table className="w-full font-mono text-[11px]">
            <thead>
              <tr className="border-b border-border-bright bg-surface text-text-muted">
                <th className="px-4 py-2 text-left uppercase tracking-[0.22em]">line</th>
                <th className="px-4 py-2 text-left uppercase tracking-[0.22em]">quantity</th>
                <th className="px-4 py-2 text-right uppercase tracking-[0.22em]">cost</th>
                <th className="px-4 py-2 text-right uppercase tracking-[0.22em]">%</th>
              </tr>
            </thead>
            <tbody>
              {bom.lines.map((l) => (
                <tr key={l.label} className="border-b border-border/40">
                  <td className="px-4 py-2 text-text-primary">{l.label}</td>
                  <td className="px-4 py-2 text-text-secondary">{l.qty}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-sun">€{(l.cost / 1_000_000).toFixed(2)}M</td>
                  <td className="px-4 py-2 text-right tabular-nums text-text-muted">{((l.cost / bom.total) * 100).toFixed(1)}%</td>
                </tr>
              ))}
              <tr>
                <td className="px-4 py-2 font-semibold text-text-primary">TOTAL</td>
                <td />
                <td className="px-4 py-2 text-right font-semibold text-sun">€{(bom.total / 1_000_000).toFixed(2)}M</td>
                <td className="px-4 py-2 text-right text-text-muted">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat2({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border bg-surface/40 p-3">
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">{label}</span>
      <span className="font-mono text-sm tabular-nums text-text-primary">{value}</span>
    </div>
  );
}

/* ============================= Compliance =============================== */

function CompliancePanel({ compliance }: { compliance: (typeof complianceRules[number] & { result: { pass: boolean; note: string } })[] }) {
  const passCount = compliance.filter((r) => r.result.pass).length;
  return (
    <div className="border-t border-border px-12 py-10">
      <div className="mb-5 flex items-baseline justify-between">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <ShieldCheck className="h-3.5 w-3.5 text-agri" strokeWidth={1.8} />
          compliance · {passCount} / {compliance.length} checks pass
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {compliance.map((r) => {
          const pass = r.result.pass;
          const tone = pass ? 'text-agri border-agri/30 bg-agri/5' : 'text-spark border-spark/30 bg-spark/5';
          const Icon = pass ? Check : AlertTriangle;
          return (
            <div key={r.id} className={cn('flex items-start gap-3 rounded-lg border p-4', tone)}>
              <Icon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} />
              <div className="flex-1 flex flex-col gap-0.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                  {r.authority}
                </span>
                <span className="font-mono text-[11px] text-text-primary">{r.rule}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary">
                  {r.result.note}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================ Gantt ================================= */

function GanttPanel() {
  const totalMonths = 18;
  return (
    <div className="border-t border-border bg-surface/30 px-12 py-10">
      <div className="mb-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
        <Activity className="h-3.5 w-3.5 text-pulse" strokeWidth={1.8} />
        construction schedule · {totalMonths}-month plan · design → COD
      </div>

      <div className="rounded-lg border border-border bg-surface/40 p-4 overflow-x-auto">
        {/* Month header */}
        <div className="grid grid-cols-[200px_1fr] gap-4">
          <div />
          <div className="relative grid" style={{ gridTemplateColumns: `repeat(${totalMonths}, 1fr)` }}>
            {Array.from({ length: totalMonths }, (_, i) => (
              <div key={i} className="border-l border-border/40 px-1 font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">
                M{i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Phase rows */}
        <div className="mt-2 flex flex-col gap-2">
          {constructionSchedule.map((phase, i) => {
            const tone = { pulse: 'bg-pulse', sun: 'bg-sun', agri: 'bg-agri', signal: 'bg-signal', spark: 'bg-spark' }[phase.tone];
            const toneText = { pulse: 'text-pulse', sun: 'text-sun', agri: 'text-agri', signal: 'text-signal', spark: 'text-spark' }[phase.tone];
            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="grid grid-cols-[200px_1fr] gap-4"
              >
                <div className="flex items-center gap-2">
                  <span className={cn('inline-block h-2 w-2 rounded-full', tone)} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-primary truncate">
                    {phase.name}
                  </span>
                </div>
                <div className="relative h-5">
                  <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${totalMonths}, 1fr)` }}>
                    {Array.from({ length: totalMonths }).map((_, j) => (
                      <div key={j} className="border-l border-border/30" />
                    ))}
                  </div>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(phase.durationMonths / totalMonths) * 100}%` }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 1.2, delay: 0.2 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className={cn('absolute h-full rounded-sm opacity-80', tone)}
                    style={{ left: `${(phase.startMonth / totalMonths) * 100}%` }}
                  >
                    <span className={cn('absolute left-1 top-0.5 whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.2em]', toneText, 'invert-0 mix-blend-difference')}>
                      {phase.durationMonths}m
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-6 border-t border-border pt-3 font-mono text-[10px]">
          <span className="text-text-muted">ground-breaking · M8</span>
          <span className="text-text-muted">first MW installed · M13</span>
          <span className="text-sun">COD · M17</span>
          <span className="ml-auto text-text-muted">critical path · design → permit → procurement → civil → install → electrical → commissioning</span>
        </div>
      </div>
    </div>
  );
}
