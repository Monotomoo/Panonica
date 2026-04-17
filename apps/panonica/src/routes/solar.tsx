import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, SunMedium } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Cell, Tooltip } from 'recharts';
import { NumberTicker, cn } from '@paladian/ui';
import { ParcelMap } from '@/components/ParcelMap';
import { solarProfile } from '@/mock/solar';

export function SolarRoute() {
  const maxBenchmark = Math.max(...solarProfile.benchmarks.map((b) => b.kwh));

  return (
    <section className="flex min-h-full flex-col gap-10 px-12 py-12">
      {/* HERO */}
      <div className="flex flex-col items-start gap-2 border-b border-border pb-10">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <SunMedium className="h-3 w-3 text-sun" strokeWidth={1.8} />
          annual solar irradiance · beravci
        </div>
        <div className="flex items-end gap-5">
          <div className="font-display text-[7rem] leading-none tracking-tech-tight text-text-primary">
            <NumberTicker
              value={solarProfile.annualIrradiance}
              duration={1.6}
              triggerOnView={false}
            />
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
              backgroundUrl="/imagery/beravci-close.png"
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
    </section>
  );
}
