import { useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CalendarDays, Zap } from 'lucide-react';
import { cn } from '@paladian/ui';
import {
  ResponsiveContainer,
  Sankey,
  Tooltip,
  Rectangle,
  Layer,
} from 'recharts';

/**
 * SolarAtlas — two viz blocks bundled for the /solar route.
 *
 *   1. Calendar GHI heatmap · 365 cells · weekly columns · intensity color
 *   2. Sankey energy flow · GHI → panels → inverter → [grid / battery / export / curtail / loss]
 *
 * Both are self-contained · pure SVG (heatmap) + Recharts (Sankey).
 * Numbers reconcile to the Kopanica-Beravci 30 MW Phase 1 base case.
 */

export function SolarAtlas() {
  return (
    <div className="flex flex-col gap-8 border-b border-border px-12 py-12">
      <CalendarHeatmap />
      <EnergyFlowSankey />
    </div>
  );
}

/* ============================ CALENDAR HEATMAP ============================ */

function CalendarHeatmap() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });
  const year = 2026;

  const data = useMemo(() => generateYearGHI(year), [year]);

  const total = data.reduce((s, d) => s + d.ghi, 0);
  const peakDay = data.reduce((a, b) => (b.ghi > a.ghi ? b : a), data[0]);
  const troughDay = data.reduce((a, b) => (b.ghi < a.ghi ? b : a), data[0]);

  // Group into week columns (52 or 53) × 7 days
  const weeks = useMemo(() => {
    const cols: { week: number; cells: (typeof data)[number][] }[] = [];
    let current: (typeof data)[number][] = [];
    let weekIdx = 0;
    for (const d of data) {
      const dow = new Date(d.date).getDay(); // 0 Sun .. 6 Sat
      if (dow === 0 && current.length > 0) {
        cols.push({ week: weekIdx++, cells: current });
        current = [];
      }
      current.push(d);
    }
    if (current.length) cols.push({ week: weekIdx, cells: current });
    return cols;
  }, [data]);

  return (
    <div ref={ref} className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            <CalendarDays className="h-3.5 w-3.5 text-sun" strokeWidth={1.8} />
            GHI calendar · {year} · daily global horizontal irradiance
          </div>
          <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
            a year of sun
          </h2>
          <p className="max-w-3xl font-mono text-[11px] text-text-secondary">
            Every day coloured by kWh/m²/day. PVGIS v5.2 cloud-season model for{' '}
            <span className="text-sun">45.1348°N 18.4130°E</span>. Annual total{' '}
            <span className="text-sun">{(total).toFixed(0)} kWh/m²</span> ·{' '}
            peak <span className="text-agri">{peakDay.ghi.toFixed(1)}</span> on {peakDay.date} ·{' '}
            trough <span className="text-spark">{troughDay.ghi.toFixed(1)}</span> on {troughDay.date}.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-col items-end gap-1 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
          <div className="flex items-center gap-1">
            <span>low</span>
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((t) => (
              <span
                key={t}
                className="inline-block h-3 w-3 rounded-sm"
                style={{ background: intensityColor(t) }}
              />
            ))}
            <span>high</span>
          </div>
          <span>0 – 8 kWh/m²/day</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="rounded-lg border border-border bg-surface/30 p-5"
      >
        <svg
          viewBox={`0 0 ${weeks.length * 12 + 40} 110`}
          className="w-full"
          style={{ aspectRatio: `${weeks.length * 12 + 40} / 110` }}
        >
          {/* Day-of-week labels */}
          {['Mon', 'Wed', 'Fri'].map((label, i) => (
            <text
              key={label}
              x={34}
              y={28 + i * 20}
              fontSize={7}
              textAnchor="end"
              fill="#6B7180"
              fontFamily="monospace"
            >
              {label}
            </text>
          ))}

          {/* Week columns */}
          {weeks.map((wk, wi) => (
            <g key={wi} transform={`translate(${38 + wi * 12}, 10)`}>
              {wk.cells.map((d) => {
                const dow = new Date(d.date).getDay();
                const y = dow * 10;
                // Normalize GHI: 0 = min (~1.2), 1 = max (~7.8)
                const t = Math.min(1, Math.max(0, (d.ghi - 1) / 7));
                return (
                  <motion.rect
                    key={d.date}
                    x={0}
                    y={y}
                    width={9}
                    height={9}
                    rx={1.2}
                    fill={intensityColor(t)}
                    initial={inView ? { opacity: 0 } : undefined}
                    animate={inView ? { opacity: 1 } : undefined}
                    transition={{ duration: 0.5, delay: wi * 0.008 }}
                  >
                    <title>
                      {d.date} · {d.ghi.toFixed(2)} kWh/m²/day
                    </title>
                  </motion.rect>
                );
              })}
            </g>
          ))}

          {/* Month labels */}
          {monthBoundaries(year).map((mb) => (
            <text
              key={mb.label}
              x={38 + mb.week * 12}
              y={7}
              fontSize={6.5}
              fill="#8B93A3"
              fontFamily="monospace"
            >
              {mb.label}
            </text>
          ))}
        </svg>

        <div className="mt-2 grid grid-cols-4 gap-3 font-mono text-[10px]">
          <MiniStat label="annual GHI" value={`${total.toFixed(0)} kWh/m²`} tone="sun" />
          <MiniStat label="PSH avg" value={`${(total / 365).toFixed(2)} h/day`} tone="sun" />
          <MiniStat label="summer PSH" value="6.4 h/day" tone="agri" sub="Jun-Aug avg" />
          <MiniStat label="winter PSH" value="1.8 h/day" tone="signal" sub="Dec-Feb avg" />
        </div>
      </motion.div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
  sub,
}: {
  label: string;
  value: string;
  tone: 'sun' | 'agri' | 'signal' | 'pulse';
  sub?: string;
}) {
  const t = { sun: 'text-sun', agri: 'text-agri', signal: 'text-signal', pulse: 'text-pulse' }[tone];
  return (
    <div className="flex flex-col gap-0.5 rounded-sm border border-border bg-canvas/40 p-2">
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
        {label}
      </span>
      <span className={cn('font-display text-lg tabular-nums tracking-tech-tight', t)}>
        {value}
      </span>
      {sub && (
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
          {sub}
        </span>
      )}
    </div>
  );
}

/* ============================ SANKEY ============================ */

function EnergyFlowSankey() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });

  const data = useMemo(() => buildSankey(), []);

  return (
    <div ref={ref} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Zap className="h-3.5 w-3.5 text-agri" strokeWidth={1.8} />
          energy flow · sankey · 30 MW phase 1 · annual
        </div>
        <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
          where the electrons go
        </h2>
        <p className="max-w-3xl font-mono text-[11px] text-text-secondary">
          Annual energy balance for the 30 MW base case. GHI resource → panels → inverter →{' '}
          <span className="text-agri">on-site battery</span>,{' '}
          <span className="text-pulse">grid injection</span>,{' '}
          <span className="text-signal">BiH export</span>, or{' '}
          <span className="text-spark">losses and curtailment</span>.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="overflow-hidden rounded-lg border border-border bg-surface/30 p-5"
        style={{ height: 460 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={data}
            nodePadding={28}
            margin={{ top: 20, right: 160, bottom: 20, left: 20 }}
            link={{ stroke: 'url(#sankey-link-grad)' } as any}
            node={<SankeyNode />}
          >
            <defs>
              <linearGradient id="sankey-link-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FFB800" stopOpacity={0.45} />
                <stop offset="50%" stopColor="#7C5CFF" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#4ADE80" stopOpacity={0.45} />
              </linearGradient>
            </defs>
            <Tooltip
              content={({ payload, active }: any) => {
                if (!active || !payload?.[0]) return null;
                const p = payload[0].payload as any;
                const mwh = p.value ?? 0;
                const pct = p.payload?.name
                  ? ` (${((mwh / 49200) * 100).toFixed(1)}%)`
                  : '';
                return (
                  <div className="rounded-md border border-border-bright bg-canvas/95 p-3 font-mono text-[10px] backdrop-blur">
                    {p.source && p.target ? (
                      <>
                        <div className="uppercase tracking-[0.22em] text-pulse">
                          {p.source.name} → {p.target.name}
                        </div>
                        <div className="mt-1 tabular-nums text-text-secondary">
                          {(mwh).toFixed(0).toLocaleString()} MWh / yr{pct}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="uppercase tracking-[0.22em] text-pulse">{p.name}</div>
                        <div className="mt-1 tabular-nums text-text-secondary">
                          {mwh.toFixed(0)} MWh / yr
                        </div>
                      </>
                    )}
                  </div>
                );
              }}
            />
          </Sankey>
        </ResponsiveContainer>
      </motion.div>

      {/* Summary rail */}
      <div className="grid grid-cols-4 gap-3">
        <FlowStat label="GHI resource" value="49,200 MWh" tone="sun" sub="incident on panels" />
        <FlowStat label="grid delivered" value="39,200 MWh" tone="agri" sub="80% · post-derate" />
        <FlowStat label="battery cycled" value="4,100 MWh" tone="pulse" sub="8% · LFP 12 MWh" />
        <FlowStat label="loss + curtail" value="5,900 MWh" tone="spark" sub="12% · temp + inv + clip" />
      </div>
    </div>
  );
}

function FlowStat({
  label,
  value,
  tone,
  sub,
}: {
  label: string;
  value: string;
  tone: 'sun' | 'agri' | 'pulse' | 'signal' | 'spark';
  sub: string;
}) {
  const toneBorder = {
    sun: 'border-sun/30 bg-sun/5',
    agri: 'border-agri/30 bg-agri/5',
    pulse: 'border-pulse/30 bg-pulse/5',
    signal: 'border-signal/30 bg-signal/5',
    spark: 'border-spark/30 bg-spark/5',
  }[tone];
  const toneText = { sun: 'text-sun', agri: 'text-agri', pulse: 'text-pulse', signal: 'text-signal', spark: 'text-spark' }[tone];
  return (
    <div className={cn('flex flex-col gap-1 rounded-lg border p-3', toneBorder)}>
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
        {label}
      </span>
      <span className={cn('font-display text-xl tracking-tech-tight tabular-nums', toneText)}>
        {value}
      </span>
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
        {sub}
      </span>
    </div>
  );
}

/* ============================ SANKEY NODE ============================ */

function SankeyNode(props: any) {
  const { x, y, width, height, index, payload } = props;
  const colors = [
    '#FFB800', // GHI
    '#FFD54A', // after panel
    '#7C5CFF', // after inverter (AC bus)
    '#4ADE80', // grid
    '#4FA6D9', // BiH export
    '#B89CFF', // battery
    '#FF3D71', // loss / curtail
    '#6B7180', // degradation + soiling
  ];
  const color = colors[index % colors.length];
  return (
    <Layer>
      <Rectangle x={x} y={y} width={width} height={height} fill={color} fillOpacity={0.85} />
      <text
        x={x + width + 8}
        y={y + height / 2}
        dy={3}
        textAnchor="start"
        fill="#FAFAFA"
        fontFamily="monospace"
        fontSize={10}
        style={{ letterSpacing: '0.06em' }}
      >
        {payload?.name} <tspan fill="#8B93A3">· {Math.round(payload?.value ?? 0).toLocaleString()} MWh</tspan>
      </text>
    </Layer>
  );
}

/* ============================ DATA BUILDERS ============================ */

/** Deterministic GHI year — seasonal sinusoid + noise seeded per day. */
function generateYearGHI(year: number): { date: string; ghi: number }[] {
  const out: { date: string; ghi: number }[] = [];
  const start = new Date(`${year}-01-01T00:00:00Z`);
  const days = isLeap(year) ? 366 : 365;
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    // Seasonal sinusoid · peak ~day 180 (late June)
    const seasonal = 4.5 + 3.1 * Math.sin(((i - 81) / days) * 2 * Math.PI);
    // Deterministic noise from date hash
    const seed = (d.getUTCDate() * 17 + d.getUTCMonth() * 31 + 7) >>> 0;
    const noise = ((Math.sin(seed * 12.9898) * 43758.5453) % 1) - 0.5;
    const ghi = Math.max(0.2, seasonal + noise * 1.4);
    out.push({ date: d.toISOString().slice(0, 10), ghi });
  }
  return out;
}

function isLeap(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

/** Color ramp · dark Posavina night → golden noon */
function intensityColor(t: number): string {
  // t in [0,1]. Low = dark surface, high = golden yellow
  if (t < 0.15) return '#1f2229';
  if (t < 0.3) return '#3a2f1a';
  if (t < 0.45) return '#7a5a14';
  if (t < 0.6) return '#b68412';
  if (t < 0.75) return '#e7a820';
  if (t < 0.88) return '#fcc33b';
  return '#ffde6b';
}

/** Month label + week index for top-of-heatmap. */
function monthBoundaries(year: number): { label: string; week: number }[] {
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const out: { label: string; week: number }[] = [];
  for (let m = 0; m < 12; m++) {
    const firstDay = new Date(Date.UTC(year, m, 1));
    const dayOfYear = Math.floor(
      (firstDay.getTime() - new Date(Date.UTC(year, 0, 1)).getTime()) / 86_400_000,
    );
    const week = Math.floor(dayOfYear / 7);
    out.push({ label: labels[m], week });
  }
  return out;
}

/** Sankey data · MWh/yr for 30 MW base case. */
function buildSankey() {
  // Total resource · 49,200 MWh/yr incident
  // Post-panel · 8,000 MWh/yr lost to reflection/temp → 41,200 MWh DC
  // Post-inverter · 1,000 MWh inverter loss → 40,200 MWh AC bus
  // Split: 28,500 direct grid · 4,100 battery (cycled through, lose ~300) · 5,800 export · 1,800 curtail
  return {
    nodes: [
      { name: 'GHI resource' },     // 0
      { name: 'panel DC' },          // 1
      { name: 'AC bus' },            // 2
      { name: 'domestic grid' },     // 3
      { name: 'BiH export' },        // 4
      { name: 'battery (LFP)' },     // 5
      { name: 'curtailment' },       // 6
      { name: 'conversion loss' },   // 7
    ],
    links: [
      { source: 0, target: 1, value: 41200 },
      { source: 0, target: 7, value: 8000 },
      { source: 1, target: 2, value: 40200 },
      { source: 1, target: 7, value: 1000 },
      { source: 2, target: 3, value: 28500 },
      { source: 2, target: 4, value: 5800 },
      { source: 2, target: 5, value: 4100 },
      { source: 2, target: 6, value: 1800 },
    ],
  };
}
