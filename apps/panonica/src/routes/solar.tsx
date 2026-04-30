import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sigma, SunMedium, Thermometer, TrendingDown, Wifi, Wind } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { NumberTicker, cn } from '@paladian/ui';
import { ParcelMap } from '@/components/ParcelMap';
import { Sourced } from '@/components/Sourced';
import { SolarAtlas } from '@/components/SolarAtlas';
import { solarProfile } from '@/mock/solar';
import {
  degradationYears,
  ghiByHourMonth,
  monthlySoilingLoss,
  months,
  panelTechComparison,
  performanceRatio,
  temperatureDerateByMonth,
  trackerUpliftByMonth,
  weatherStation,
} from '@/mock/solarDeep';

export function SolarRoute() {
  const maxBenchmark = Math.max(...solarProfile.benchmarks.map((b) => b.kwh));

  return (
    <section className="flex min-h-full flex-col gap-10 px-12 py-12">
      {/* HERO */}
      <div className="flex flex-col items-start gap-2 border-b border-border pb-10">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <SunMedium className="h-3 w-3 text-sun" strokeWidth={1.8} />
          annual solar irradiance · kopanica-beravci
        </div>
        <div className="flex items-end gap-5">
          <div className="font-display text-[7rem] leading-none tracking-tech-tight text-text-primary">
            <Sourced sourceId="pvgis-tmy">
              <NumberTicker
                value={solarProfile.annualIrradiance}
                duration={1.6}
                triggerOnView={false}
              />
            </Sourced>
          </div>
          <div className="flex flex-col font-mono text-xs uppercase tracking-[0.22em] text-text-muted">
            <span>kWh / m² / year</span>
            <span className="text-sun">peak sun hours: {solarProfile.peakSunHours}</span>
          </div>
        </div>
        <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary">
          south-facing slope · atmospheric clarity: favourable · slavonian plain
        </div>
      </div>

      {/* TWO COLS */}
      <div className="grid grid-cols-[1.1fr_1fr] gap-10">
        {/* LEFT — heatmap */}
        <div className="flex flex-col gap-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            plot irradiance distribution
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-border">
            <ParcelMap
              backgroundUrl="/imagery/kopanica-close.jpg"
              imageOpacity={0.65}
              tone="sun"
              showSunArc
              showCentroidPulse
              showScaleBar
            />
            {/* Heat gradient overlay hinting hotspots */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 mix-blend-screen"
              style={{
                background:
                  'radial-gradient(ellipse 30% 30% at 50% 48%, rgba(255,184,0,0.45), transparent 65%), radial-gradient(ellipse 22% 22% at 45% 52%, rgba(255,61,113,0.3), transparent 60%)',
              }}
            />
            <div className="absolute bottom-3 left-3 rounded-sm border border-border-bright bg-canvas/80 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted backdrop-blur">
              <div className="flex items-center gap-2">
                <span>1,180</span>
                <span className="block h-1.5 w-24 rounded-sm bg-gradient-to-r from-signal via-sun to-spark" />
                <span>1,420 kWh/m²</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — charts */}
        <div className="flex flex-col gap-10">
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              monthly irradiance · kWh/m²
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[...solarProfile.monthlyIrradiance]}
                  margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
                >
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: 'rgb(138 138 148)',
                      fontSize: 10,
                      fontFamily: 'JetBrains Mono Variable, monospace',
                    }}
                  />
                  <YAxis hide domain={[0, 'dataMax + 30']} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,184,0,0.08)' }}
                    contentStyle={{
                      background: 'rgb(17 17 19)',
                      border: '1px solid rgb(42 42 48)',
                      borderRadius: 6,
                      fontFamily: 'JetBrains Mono Variable, monospace',
                      fontSize: 11,
                    }}
                    labelStyle={{ color: 'rgb(138 138 148)' }}
                  />
                  <Bar dataKey="kwh" radius={[2, 2, 0, 0]} fill="rgb(255 184 0)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              peak sun hours · daily average
            </div>
            <div className="flex flex-col gap-1.5">
              {solarProfile.dailySunHoursByMonth.map((m, i) => (
                <motion.div
                  key={m.month}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.2 + i * 0.03, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex origin-left items-center gap-3"
                >
                  <span className="w-8 font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted">
                    {m.month}
                  </span>
                  <span
                    className="h-1 rounded-sm bg-sun/70"
                    style={{ width: `${(m.hours / 6) * 72}%` }}
                  />
                  <span className="font-mono text-[10px] tabular-nums text-text-secondary">
                    {m.hours.toFixed(1)} h
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BENCHMARKS */}
      <div className="flex flex-col gap-3 border-t border-border pt-10">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          european benchmark · kWh / m² / year
        </div>
        <div className="flex flex-col gap-2">
          {solarProfile.benchmarks.map((b, i) => (
            <motion.div
              key={b.city}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'flex items-center gap-5 py-2 px-3 rounded-sm',
                b.highlight && 'bg-pulse/10 ring-1 ring-pulse/30',
              )}
            >
              <span
                className={cn(
                  'w-24 font-mono text-[11px] uppercase tracking-[0.22em]',
                  b.highlight ? 'text-pulse' : 'text-text-secondary',
                )}
              >
                {b.city}
              </span>
              <span
                className={cn(
                  'h-2 rounded-sm',
                  b.highlight ? 'bg-pulse' : 'bg-text-muted/60',
                )}
                style={{ width: `${(b.kwh / maxBenchmark) * 60}%` }}
              />
              <span className="font-mono text-xs tabular-nums text-text-primary">
                {b.kwh.toLocaleString()} kWh
              </span>
              {b.highlight && (
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-pulse">
                  ← beravci
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* DEEP TABS */}
      <SolarDeepTabs />

      {/* CTA */}
      <div className="mt-auto flex justify-end pt-6">
        <Link
          to="/grid"
          className="group inline-flex items-center gap-3 rounded-md border border-border-bright bg-surface px-5 py-3 transition-all hover:border-pulse hover:shadow-glow-pulse"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary group-hover:text-pulse">
            check grid capacity
          </span>
          <ArrowRight
            className="h-4 w-4 text-text-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-pulse"
            strokeWidth={1.8}
          />
        </Link>
      </div>

      {/* SOLAR ATLAS · calendar heatmap + Sankey energy flow */}
      <SolarAtlas />
    </section>
  );
}

/* ============================= DEEP TABS ============================= */

type SolarTab = 'irradiance' | 'production' | 'variability' | 'tech';

function SolarDeepTabs() {
  const [tab, setTab] = useState<SolarTab>('irradiance');
  const TABS: { key: SolarTab; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
    { key: 'irradiance', label: 'Irradiance', icon: SunMedium },
    { key: 'production', label: 'Production', icon: TrendingDown },
    { key: 'variability', label: 'Variability', icon: Wind },
    { key: 'tech', label: 'Tech', icon: Sigma },
  ];

  return (
    <div className="mt-2 flex flex-col gap-4 rounded-lg border border-border bg-surface/30 p-6">
      <div className="flex items-center gap-1 border-b border-border pb-3">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'inline-flex items-center gap-2 rounded-sm px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors',
                active ? 'bg-sun/15 text-sun ring-1 ring-sun/30' : 'text-text-muted hover:bg-surface hover:text-text-secondary',
              )}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
              {t.label}
            </button>
          );
        })}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        {tab === 'irradiance' && <IrradianceTab />}
        {tab === 'production' && <ProductionTab />}
        {tab === 'variability' && <VariabilityTab />}
        {tab === 'tech' && <TechTab />}
      </motion.div>
    </div>
  );
}

/* ============================ IRRADIANCE TAB ============================ */

function IrradianceTab() {
  const allValues = ghiByHourMonth.flat();
  const max = Math.max(...allValues);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            GHI heatmap · W/m² · month × hour · PVGIS TMY
          </span>
          <span className="font-mono text-[11px] text-text-secondary">
            Beravci 45.21°N · 18.44°E · south-facing 25° tilt
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em]">
          <span className="h-2 w-20 rounded-sm bg-gradient-to-r from-canvas via-sun/80 to-spark" />
          <span className="text-text-muted">0</span>
          <span className="text-text-muted">→</span>
          <span className="text-text-muted">{max} W/m²</span>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface/40 p-4 overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="mb-1 grid gap-[1px] text-center font-mono text-[8px] uppercase tracking-[0.2em] text-text-muted" style={{ gridTemplateColumns: `40px repeat(24, 1fr)` }}>
            <span />
            {Array.from({ length: 24 }, (_, i) => (
              <span key={i}>{i.toString().padStart(2, '0')}</span>
            ))}
          </div>
          {ghiByHourMonth.map((row, mi) => (
            <div key={mi} className="mb-[1px] grid gap-[1px]" style={{ gridTemplateColumns: `40px repeat(24, 1fr)` }}>
              <span className="pr-1 text-right font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">
                {months[mi]}
              </span>
              {row.map((v, hi) => {
                const norm = v / max;
                const color =
                  norm === 0
                    ? 'rgb(23 23 26)'
                    : norm < 0.25
                      ? `rgba(0, 217, 255, ${norm * 2})`
                      : norm < 0.6
                        ? `rgba(255, 184, 0, ${0.4 + norm * 0.6})`
                        : `rgba(255, 61, 113, ${0.5 + norm * 0.5})`;
                return (
                  <div
                    key={hi}
                    className="h-4 rounded-[1px]"
                    style={{ background: color }}
                    title={`${months[mi]} ${hi}:00 · ${v} W/m²`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Stat3 label="peak hour · year" value="Jul · 12:00" sub="905 W/m²" tone="spark" />
        <Stat3 label="peak month" value="Jul" sub="178 kWh/m²" tone="sun" />
        <Stat3 label="trough month" value="Dec" sub="42 kWh/m²" tone="signal" />
        <Stat3 label="annual total" value={`${solarProfile.annualIrradiance}`} sub="kWh/m²·yr" tone="sun" />
      </div>

      <div className="rounded-lg border border-border bg-surface/40 p-5">
        <div className="flex items-baseline gap-3">
          <Wifi className="h-4 w-4 text-pulse" strokeWidth={1.8} />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            connected reference station · {weatherStation.name}
          </span>
          <span className="font-mono text-[11px] text-agri">● {weatherStation.dataFeed}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 font-mono text-[10px] md:grid-cols-4">
          <MiniKv label="distance" value={`${weatherStation.distanceKm} km`} />
          <MiniKv label="availability" value={`${(weatherStation.availability * 100).toFixed(1)}%`} />
          <MiniKv label="pyranometer" value={weatherStation.pyranometerClass} />
          <MiniKv label="since" value={weatherStation.since} />
        </div>
      </div>
    </div>
  );
}

/* ============================ PRODUCTION TAB ============================ */

function ProductionTab() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          25-year production · P10 / P50 / P90 bands · NREL meta-study degradation
        </span>
      </div>

      <div className="rounded-lg border border-border bg-surface/40 p-5">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={degradationYears} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <defs>
                <linearGradient id="p90Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(124 92 255)" stopOpacity={0.24} />
                  <stop offset="100%" stopColor="rgb(124 92 255)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgb(31 31 35)" strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: 'rgb(138 138 148)', fontSize: 10, fontFamily: 'JetBrains Mono Variable' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgb(138 138 148)', fontSize: 10, fontFamily: 'JetBrains Mono Variable' }} tickFormatter={(v) => `${v.toFixed(0)}%`} domain={[70, 102]} />
              <Tooltip contentStyle={{ background: 'rgb(17 17 19)', border: '1px solid rgb(42 42 48)', borderRadius: 6, fontFamily: 'JetBrains Mono Variable, monospace', fontSize: 11 }} formatter={(v: number) => [`${v.toFixed(1)}% of nameplate`]} labelStyle={{ color: 'rgb(138 138 148)' }} />
              <Area type="monotone" dataKey="p90" name="p90 best" stroke="rgb(124 92 255)" fill="url(#p90Grad)" strokeWidth={0.8} fillOpacity={1} />
              <Area type="monotone" dataKey="p10" name="p10 worst" stroke="rgb(124 92 255)" fill="rgb(10 10 11)" strokeWidth={0.8} fillOpacity={1} />
              <Line type="monotone" dataKey="p50" name="median" stroke="rgb(255 184 0)" strokeWidth={2} dot={false} />
              <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono Variable, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgb(138 138 148)' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PR waterfall */}
      <div className="rounded-lg border border-border bg-surface/40 p-5">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            performance ratio · beravci model
          </span>
          <span className="font-display text-3xl tracking-tech-tight text-sun">
            {(performanceRatio.value * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          {performanceRatio.components.map((c) => {
            const isLoss = c.value < 0;
            return (
              <div key={c.label} className="flex items-center gap-3 py-1">
                <span className="flex-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                  {c.label}
                </span>
                <div className="relative h-1 w-48 overflow-hidden rounded-full bg-border">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.abs(c.value) * 300}%` }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 1.2 }}
                    className={cn('h-full', isLoss ? 'bg-spark/80' : 'bg-agri')}
                  />
                </div>
                <span className={cn('w-16 text-right font-mono text-[11px] tabular-nums', isLoss ? 'text-spark' : 'text-agri')}>
                  {(c.value * 100).toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* =========================== VARIABILITY TAB =========================== */

function VariabilityTab() {
  const data = monthlySoilingLoss.map((s, i) => ({
    month: s.month,
    soiling: s.lossPct,
    temperature: temperatureDerateByMonth[i].deratePct,
    tempAmb: temperatureDerateByMonth[i].avgC,
    panelTemp: temperatureDerateByMonth[i].panelTempC,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
        weather variance · dust/soiling · temperature derate · Slavonian summers are dry & dusty
      </div>

      <div className="rounded-lg border border-border bg-surface/40 p-5">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          monthly losses · % of theoretical output
        </div>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgb(31 31 35)" strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgb(138 138 148)', fontSize: 10, fontFamily: 'JetBrains Mono Variable' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgb(138 138 148)', fontSize: 10, fontFamily: 'JetBrains Mono Variable' }} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={{ background: 'rgb(17 17 19)', border: '1px solid rgb(42 42 48)', borderRadius: 6, fontFamily: 'JetBrains Mono Variable, monospace', fontSize: 11 }} />
              <Bar dataKey="soiling" name="Soiling" fill="rgb(255 184 0)" fillOpacity={0.8} radius={[2, 2, 0, 0]} />
              <Bar dataKey="temperature" name="Temperature derate" fill="rgb(255 61 113)" fillOpacity={0.8} radius={[2, 2, 0, 0]} />
              <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono Variable, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgb(138 138 148)' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface/40 p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              panel temperature · when it matters
            </span>
            <Thermometer className="h-4 w-4 text-spark" strokeWidth={1.8} />
          </div>
          <div className="h-[160px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgb(31 31 35)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgb(138 138 148)', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgb(138 138 148)', fontSize: 10 }} tickFormatter={(v) => `${v}°`} />
                <Tooltip contentStyle={{ background: 'rgb(17 17 19)', border: '1px solid rgb(42 42 48)', borderRadius: 6, fontSize: 11 }} />
                <Line type="monotone" dataKey="tempAmb" name="Ambient" stroke="rgb(0 217 255)" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="panelTemp" name="Panel surface" stroke="rgb(255 61 113)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
            panel temp can exceed ambient by +30°C at noon · 10% July output haircut
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface/40 p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            cleaning strategy · mitigation
          </div>
          {[
            { action: 'Rain-only', loss: 4.6, capex: '€0', tone: 'text-text-muted' },
            { action: '2× scheduled wash (Apr/Aug)', loss: 3.0, capex: '€8k/yr', tone: 'text-pulse' },
            { action: '4× wash + drone monitoring', loss: 1.8, capex: '€22k/yr', tone: 'text-agri' },
            { action: 'Robotic sweep · daily', loss: 0.6, capex: '€140k capex + €12k/yr', tone: 'text-sun' },
          ].map((opt) => (
            <div key={opt.action} className="flex items-baseline justify-between rounded-md border border-border bg-surface/30 px-3 py-2">
              <div className="flex flex-col gap-0.5">
                <span className={cn('font-mono text-[11px]', opt.tone)}>{opt.action}</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">{opt.capex}</span>
              </div>
              <span className={cn('font-display text-lg tracking-tech-tight', opt.tone)}>
                −{opt.loss}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =============================== TECH TAB =============================== */

function TechTab() {
  return (
    <div className="flex flex-col gap-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
        panel technology comparison · IEC 61853-1 performance characterization
      </div>

      <div className="rounded-lg border border-border bg-surface/40 overflow-x-auto">
        <table className="w-full font-mono text-[11px]">
          <thead>
            <tr className="border-b border-border-bright bg-surface text-text-muted">
              <th className="px-4 py-2 text-left uppercase tracking-[0.22em]">technology</th>
              <th className="px-4 py-2 text-right uppercase tracking-[0.22em]">rel. yield</th>
              <th className="px-4 py-2 text-right uppercase tracking-[0.22em]">bifacial gain</th>
              <th className="px-4 py-2 text-right uppercase tracking-[0.22em]">temp coef</th>
              <th className="px-4 py-2 text-right uppercase tracking-[0.22em]">degradation</th>
              <th className="px-4 py-2 text-right uppercase tracking-[0.22em]">price</th>
              <th className="px-4 py-2 text-left uppercase tracking-[0.22em]">note</th>
            </tr>
          </thead>
          <tbody>
            {panelTechComparison.map((p, i) => (
              <tr key={p.name} className={cn('border-b border-border/40', i === 2 && 'bg-sun/5')}>
                <td className="px-4 py-2 text-text-primary">{p.name}</td>
                <td className="px-4 py-2 text-right tabular-nums text-sun">{p.relativeYield.toFixed(2)}×</td>
                <td className="px-4 py-2 text-right tabular-nums">{(p.bifacialGain * 100).toFixed(1)}%</td>
                <td className="px-4 py-2 text-right tabular-nums text-spark">{p.tempCoef.toFixed(2)} %/°C</td>
                <td className="px-4 py-2 text-right tabular-nums text-signal">{p.degradation.toFixed(2)}%/yr</td>
                <td className="px-4 py-2 text-right tabular-nums text-pulse">{p.pricePremium.toFixed(2)}×</td>
                <td className="px-4 py-2 text-text-secondary">{p.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tracker uplift by month */}
      <div className="rounded-lg border border-border bg-surface/40 p-5">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          1-axis tracker uplift vs fixed · by month
        </div>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trackerUpliftByMonth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgb(31 31 35)" strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgb(138 138 148)', fontSize: 10 }} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: 'rgb(138 138 148)', fontSize: 10 }} tickFormatter={(v) => `${v}`} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: 'rgb(255 184 0)', fontSize: 10 }} tickFormatter={(v) => `${v}%`} domain={[0, 20]} />
              <Tooltip contentStyle={{ background: 'rgb(17 17 19)', border: '1px solid rgb(42 42 48)', borderRadius: 6, fontSize: 11 }} />
              <Bar yAxisId="left" dataKey="fixedGhiKwh" name="Fixed" fill="rgb(124 92 255)" fillOpacity={0.6} radius={[2, 2, 0, 0]} />
              <Bar yAxisId="left" dataKey="onexAxis" name="1-axis" fill="rgb(0 217 255)" fillOpacity={0.6} radius={[2, 2, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="uplifterPct" name="Uplift %" stroke="rgb(255 184 0)" strokeWidth={2} dot={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
          winter months = highest tracker uplift (low solar angle) · annual average ~+8%
        </div>
      </div>
    </div>
  );
}

/* =============================== HELPERS =============================== */

function Stat3({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: 'pulse' | 'sun' | 'agri' | 'signal' | 'spark' }) {
  const t = { pulse: 'text-pulse', sun: 'text-sun', agri: 'text-agri', signal: 'text-signal', spark: 'text-spark' }[tone];
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface/40 p-4">
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">{label}</span>
      <span className={cn('font-display text-2xl tracking-tech-tight', t)}>{value}</span>
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">{sub}</span>
    </div>
  );
}

function MiniKv({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-border bg-surface/40 p-3">
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">{label}</span>
      <span className="font-mono text-sm tabular-nums text-text-primary">{value}</span>
    </div>
  );
}
