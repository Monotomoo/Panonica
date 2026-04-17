import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Plug } from 'lucide-react';
import { NumberTicker, DataPanel, cn } from '@paladian/ui';
import { gridInfo } from '@/mock/grid';

export function GridRoute() {
  return (
    <section className="flex min-h-full flex-col gap-10 px-12 py-12">
      {/* HERO — dual stat */}
      <div className="grid grid-cols-2 gap-10 border-b border-border pb-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            <Plug className="h-3 w-3 text-pulse" strokeWidth={1.8} /> regional capacity
          </div>
          <div className="flex items-end gap-3">
            <div className="font-display text-[6rem] leading-none tracking-tech-tight text-pulse">
              <NumberTicker value={2500} duration={1.6} triggerOnView={false} />
            </div>
            <div className="flex flex-col font-mono text-xs uppercase tracking-[0.22em] text-text-muted">
              <span>MW free</span>
              <span>pannonian croatia</span>
            </div>
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            source: {gridInfo.capacitySource}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            connection queue · TS SLAVONSKI BROD 1
          </div>
          <div className="flex items-end gap-3">
            <div className="font-display text-[6rem] leading-none tracking-tech-tight text-signal">
              #
              <NumberTicker value={gridInfo.queuePosition} duration={1.4} triggerOnView={false} />
            </div>
            <div className="flex flex-col font-mono text-xs uppercase tracking-[0.22em] text-text-muted">
              <span>queue position</span>
              <span>est. 8–14 months</span>
            </div>
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            voltage level · 110/35 kV
          </div>
        </div>
      </div>

      {/* GRID DIAGRAM */}
      <div className="relative flex min-h-[280px] flex-col gap-3 rounded-lg border border-border bg-surface/30 p-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          infrastructure link · beravci → TS slavonski brod 1
        </div>
        <svg viewBox="0 0 1000 220" className="h-[220px] w-full">
          {/* Ground line */}
          <line
            x1={40}
            x2={960}
            y1={180}
            y2={180}
            className="stroke-border-bright"
            strokeWidth={0.6}
            strokeDasharray="4 4"
          />

          {/* Parcel marker (right side) */}
          <g transform="translate(880, 130)">
            <motion.rect
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              width={60}
              height={40}
              rx={3}
              className="fill-pulse/15 stroke-pulse"
              strokeWidth={1.2}
            />
            <text
              x={30}
              y={25}
              textAnchor="middle"
              className="fill-pulse font-mono"
              fontSize={10}
            >
              BERAVCI
            </text>
            <text
              x={30}
              y={64}
              textAnchor="middle"
              className="fill-text-muted font-mono"
              fontSize={9}
            >
              80.3 ha · 38 MWp
            </text>
          </g>

          {/* Substation marker (left side) */}
          <g transform="translate(40, 120)">
            <motion.g
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <polygon
                points="30,0 60,30 30,60 0,30"
                className="fill-signal/15 stroke-signal"
                strokeWidth={1.2}
              />
              <line x1={30} y1={10} x2={30} y2={50} className="stroke-signal" strokeWidth={0.8} />
              <line x1={10} y1={30} x2={50} y2={30} className="stroke-signal" strokeWidth={0.8} />
            </motion.g>
            <text
              x={30}
              y={80}
              textAnchor="middle"
              className="fill-signal font-mono"
              fontSize={10}
            >
              TS SLAVONSKI BROD 1
            </text>
            <text
              x={30}
              y={95}
              textAnchor="middle"
              className="fill-text-muted font-mono"
              fontSize={9}
            >
              110/35 kV
            </text>
          </g>

          {/* Cable run */}
          <motion.line
            x1={100}
            x2={880}
            y1={150}
            y2={150}
            className="stroke-signal"
            strokeWidth={1.2}
            strokeDasharray="6 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
          <text x={500} y={140} textAnchor="middle" className="fill-text-secondary font-mono" fontSize={10}>
            18.4 km · est. €620,000
          </text>

          {/* Pulse travelling along line */}
          <motion.circle
            r={3.5}
            className="fill-signal"
            initial={{ cx: 100, cy: 150, opacity: 0 }}
            animate={{ cx: [100, 880, 880], opacity: [0, 1, 0] }}
            transition={{ duration: 2.6, delay: 2.4, repeat: Infinity, repeatDelay: 1 }}
            style={{ filter: 'drop-shadow(0 0 3px rgb(0 217 255))' }}
          />
        </svg>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-4 gap-px overflow-hidden rounded-lg border border-border bg-border">
        {[
          { label: 'distance to ts', value: `${gridInfo.distanceKm} km`, tone: 'default' },
          { label: 'voltage level', value: gridInfo.voltage, tone: 'signal' },
          {
            label: 'est. cable cost',
            value: '€620,000',
            tone: 'default',
          },
          {
            label: 'conn. fee estimate',
            value: '€1.1M / MW',
            tone: 'default',
          },
          {
            label: 'regional capacity',
            value: `${gridInfo.regionalFreeCapacityMW.toLocaleString()} MW free`,
            tone: 'pulse',
          },
          { label: 'your max install', value: `${gridInfo.maxInstallMWp} MWp`, tone: 'sun' },
          {
            label: 'utilization',
            value: `${(gridInfo.regionalUtilization * 100).toFixed(0)}% · low`,
            tone: 'agri',
          },
          {
            label: 'processing time',
            value: `${gridInfo.estProcessingMonths[0]}–${gridInfo.estProcessingMonths[1]} months`,
            tone: 'default',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.04, duration: 0.5 }}
            className="flex flex-col gap-2 bg-surface/60 p-6"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              {stat.label}
            </span>
            <span
              className={cn(
                'font-mono text-lg tabular-nums',
                stat.tone === 'pulse' && 'text-pulse',
                stat.tone === 'signal' && 'text-signal',
                stat.tone === 'sun' && 'text-sun',
                stat.tone === 'agri' && 'text-agri',
                stat.tone === 'default' && 'text-text-primary',
              )}
            >
              {stat.value}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <Link
          to="/configurator"
          className="group inline-flex items-center gap-3 rounded-md border border-border-bright bg-surface px-5 py-3 transition-all hover:border-pulse hover:shadow-glow-pulse"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary group-hover:text-pulse">
            configure your system
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
