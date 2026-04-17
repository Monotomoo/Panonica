import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, FileText, Info, X } from 'lucide-react';
import { Citation, cn } from '@paladian/ui';
import {
  kupariMeta,
  kupariTimeline,
  kupariEdges,
  kupariSources,
  kupariSignals,
  type KupariEvent,
} from '@/mock/kupariDeal';
import { entities, findEntity } from '@/mock/entities';
import { deals } from '@/mock/deals';

export function DealRoute() {
  const { slug } = useParams();
  const [activeEvent, setActiveEvent] = useState<KupariEvent | null>(null);

  // For the prototype we only have Kupari fully modelled
  const isKupari = slug === 'kupari';
  if (!isKupari) {
    const d = deals.find((x) => x.slug === slug);
    return (
      <section className="flex min-h-full items-center justify-center px-10 py-16">
        <div className="max-w-md text-center">
          <h1 className="font-editorial text-4xl text-text-primary">{d?.name ?? slug}</h1>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">
            dossier preview available for Kupari in this prototype
          </p>
          <Link
            to="/deal/kupari"
            className="mt-6 inline-flex items-center gap-2 rounded-md border border-pulse/40 bg-pulse/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-pulse"
          >
            open Kupari <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[calc(100vh-2.75rem)] px-10 py-10">
      <article className="mx-auto flex max-w-[960px] flex-col gap-12 pb-20">
        {/* HERO */}
        <div className="border-b border-border pb-10">
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            deal dossier · {kupariMeta.dealId}
          </div>
          <h1 className="font-editorial text-[4rem] leading-[0.95] text-text-primary text-balance">
            A 99-year concession.
            <br />
            Four operators.
            <br />
            Three owners. <span className="text-pulse">Ten years.</span>
          </h1>
          <p className="mt-4 max-w-xl font-editorial text-xl italic text-text-secondary">
            The Kupari saga — from tender to Four Seasons — in one navigable timeline.
          </p>
        </div>

        {/* METADATA */}
        <div className="grid grid-cols-3 gap-x-10 gap-y-5 border-b border-border pb-10">
          <Field label="STATUS" value={kupariMeta.status} />
          <Field label="AREA" value={`${kupariMeta.landHa} ha land + ${kupariMeta.seaHa} ha sea`} />
          <Field
            label="CONCESSION TERM"
            value={`${kupariMeta.concessionYears} years (until ${kupariMeta.expiry})`}
          />
          <Field
            label="TOTAL INVESTMENT"
            value={`~€${(kupariMeta.investmentEUR / 1_000_000).toFixed(0)}M`}
            hint="(revised up from €100M)"
          />
          <Field label="OPERATOR" value={kupariMeta.operator} />
          <Field label="LOCATION" value={kupariMeta.location} />
        </div>

        {/* TIMELINE */}
        <div>
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            interactive timeline
          </div>
          <h2 className="mb-6 font-editorial text-3xl text-text-primary">
            A decade of Kupari in {kupariTimeline.length} moves
          </h2>

          <div className="relative overflow-x-auto">
            {/* axis */}
            <div className="relative min-w-[1800px] py-8">
              <div className="absolute left-0 right-0 top-12 h-px bg-border-bright" />

              <div className="relative grid grid-flow-col auto-cols-[minmax(160px,1fr)] gap-0">
                {kupariTimeline.map((ev, i) => (
                  <motion.button
                    key={ev.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => setActiveEvent(ev)}
                    className="group relative flex flex-col items-center text-center"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                      {ev.year}-{String(ev.month).padStart(2, '0')}
                    </span>
                    <span
                      className={cn(
                        'my-3 flex h-3 w-3 items-center justify-center rounded-full border-2 transition-all group-hover:scale-125',
                        ev.status === 'done' && 'border-pulse bg-pulse',
                        ev.status === 'active' && 'border-pulse bg-canvas ring-2 ring-pulse/40',
                        ev.status === 'upcoming' && 'border-border-bright bg-canvas',
                      )}
                    />
                    <span className="line-clamp-3 px-2 font-mono text-[11px] leading-tight text-text-secondary group-hover:text-text-primary">
                      {ev.label}
                    </span>
                    <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                      {ev.actor}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ENTITY NETWORK (custom SVG graph) */}
        <div>
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            entity network
          </div>
          <h2 className="mb-6 font-editorial text-3xl text-text-primary">
            Who owns what, who did what, and when.
          </h2>
          <EntityGraph />
        </div>

        {/* DEAL SIGNALS */}
        <div>
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            deal signals
          </div>
          <div className="flex flex-col gap-2">
            {kupariSignals.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.5 }}
                className="flex items-center gap-4 border-l-2 border-border-bright bg-surface/40 px-5 py-3"
                style={{
                  borderLeftColor:
                    s.level === 'warn' ? 'rgb(255 184 0)' : 'rgb(0 217 255)',
                }}
              >
                {s.level === 'warn' ? (
                  <AlertTriangle className="h-4 w-4 text-sun" strokeWidth={1.8} />
                ) : (
                  <Info className="h-4 w-4 text-signal" strokeWidth={1.8} />
                )}
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-primary">
                    {s.label}
                  </div>
                  <div className="font-mono text-[10px] text-text-secondary">{s.detail}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RELATED DEALS */}
        <div>
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            projects like this
          </div>
          <div className="grid grid-cols-3 gap-3">
            {deals
              .filter((d) => d.slug !== 'kupari')
              .slice(0, 6)
              .map((d) => (
                <Link
                  key={d.slug}
                  to={`/deal/${d.slug}`}
                  className="group block rounded-md border border-border bg-surface/50 p-4 transition-colors hover:border-pulse hover:bg-surface"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'inline-block h-1.5 w-1.5 rounded-full',
                        d.status === 'active' && 'bg-pulse',
                        d.status === 'stalled' && 'bg-spark',
                        d.status === 'completed' && 'bg-gold',
                        d.status === 'awarded' && 'bg-signal',
                      )}
                    />
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">
                      {d.status}
                    </span>
                  </div>
                  <div className="mt-3 font-editorial text-lg text-text-primary">{d.name}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                    {d.location}
                  </div>
                  <div className="mt-3 font-mono text-[10px] tabular-nums text-text-secondary">
                    €{(d.investmentEUR / 1_000_000).toFixed(0)}M · {d.timelineYears}y
                  </div>
                </Link>
              ))}
          </div>
        </div>

        {/* SOURCES */}
        <div className="border-t border-border pt-10">
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            sources
          </div>
          <ol className="flex flex-col gap-1.5">
            {kupariSources.map((s) => (
              <li key={s.id} className="flex gap-3 font-mono text-[11px] text-text-secondary">
                <Citation index={s.id} />
                <span className="text-text-muted">{s.source},</span>
                <span className="text-text-secondary">&ldquo;{s.title}&rdquo;,</span>
                <span className="text-text-muted">{s.url},</span>
                <span className="text-text-muted tabular-nums">{s.date}</span>
              </li>
            ))}
          </ol>
        </div>
      </article>

      {/* EVENT DRAWER */}
      <AnimatePresence>
        {activeEvent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveEvent(null)}
              className="fixed inset-0 z-40 bg-canvas/70 backdrop-blur"
            />
            <motion.aside
              initial={{ x: 460, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 460, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed right-0 top-11 z-50 h-[calc(100vh-2.75rem)] w-[460px] overflow-y-auto border-l border-border bg-surface p-8"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
                    timeline event · {activeEvent.year}-
                    {String(activeEvent.month).padStart(2, '0')}
                  </div>
                  <h3 className="mt-2 font-editorial text-2xl text-text-primary">
                    {activeEvent.label}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveEvent(null)}
                  className="rounded-sm border border-border bg-canvas p-1.5 text-text-secondary hover:border-pulse hover:text-pulse"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>

              <div className="mt-8 flex flex-col gap-5 font-mono text-[11px]">
                <Row label="ACTOR" value={activeEvent.actor} />
                <Row
                  label="STATUS"
                  value={
                    activeEvent.status === 'active'
                      ? 'in progress'
                      : activeEvent.status === 'upcoming'
                      ? 'upcoming'
                      : 'complete'
                  }
                  tone={activeEvent.status === 'done' ? 'agri' : 'pulse'}
                />
                <Row label="SOURCE" value={activeEvent.source ?? '—'} tone="signal" />
              </div>

              {activeEvent.description && (
                <p className="mt-6 font-editorial text-sm italic leading-relaxed text-text-secondary">
                  {activeEvent.description}
                </p>
              )}

              <div className="mt-8 flex items-center gap-2 rounded-md border border-border bg-canvas/60 p-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                <FileText className="h-3.5 w-3.5" strokeWidth={1.8} />
                source documents available · linked in citations
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}

function Field({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-text-muted">
        {label}
      </span>
      <span className="font-mono text-[13px] text-text-primary">
        {value}
        {hint && <span className="ml-2 text-text-muted">{hint}</span>}
      </span>
    </div>
  );
}

function Row({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'pulse' | 'signal' | 'agri';
}) {
  return (
    <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
      <span className="text-[9px] uppercase tracking-[0.22em] text-text-muted">{label}</span>
      <span
        className={cn(
          'tabular-nums',
          tone === 'pulse' && 'text-pulse',
          tone === 'signal' && 'text-signal',
          tone === 'agri' && 'text-agri',
          tone === 'default' && 'text-text-primary',
        )}
      >
        {value}
      </span>
    </div>
  );
}

/* --------------------------- Entity Graph --------------------------------- */

function EntityGraph() {
  // Simple SVG force-layout approximation with hard-coded positions
  // Avoids pulling @xyflow/react rendering complexity for the prototype
  const positions: Record<string, { x: number; y: number }> = {
    'gov-rh': { x: 120, y: 80 },
    'opcina-zupa-dubrovacka': { x: 120, y: 380 },
    'avenue-ulaganja': { x: 340, y: 200 },
    'sergej-gljadelkin': { x: 340, y: 60 },
    'avenue-osteuropa': { x: 220, y: 220 },
    'avenue-holdings': { x: 220, y: 280 },
    'ivan-paladina': { x: 500, y: 320 },
    'kupari-luxury-hotels': { x: 640, y: 220 },
    'hpl-croatia-ltd': { x: 840, y: 220 },
    'hotel-properties-ltd': { x: 1020, y: 140 },
    'ong-beng-seng': { x: 1020, y: 340 },
    'four-seasons-hotels': { x: 780, y: 80 },
    '3lhd': { x: 720, y: 400 },
    tering: { x: 860, y: 400 },
    'institut-igh': { x: 500, y: 80 },
    'ritz-carlton': { x: 560, y: 440 },
    'titan-grupa': { x: 380, y: 360 },
    'hidroelektra-niskogradnja': { x: 640, y: 80 },
  };

  const [hover, setHover] = useState<string | null>(null);

  return (
    <div className="relative w-full overflow-auto rounded-md border border-border bg-surface/30">
      <svg viewBox="0 0 1140 500" className="h-[500px] w-full">
        {/* Edges */}
        {kupariEdges.map((e, i) => {
          const from = positions[e.from];
          const to = positions[e.to];
          if (!from || !to) return null;
          const active = hover === e.from || hover === e.to || !hover;
          const stroke = {
            own: 'rgb(124 92 255)',
            contract: 'rgb(0 217 255)',
            director: 'rgb(255 184 0)',
            grantor: 'rgb(74 222 128)',
            related: 'rgb(82 82 91)',
            'origin-ru': 'rgb(255 61 113)',
          }[e.kind];
          return (
            <g key={i} opacity={active ? 0.9 : 0.2}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={stroke}
                strokeWidth={1.2}
                strokeDasharray={e.kind === 'related' ? '4 4' : undefined}
              />
              <text
                x={(from.x + to.x) / 2}
                y={(from.y + to.y) / 2 - 4}
                fill="rgb(138 138 148)"
                fontSize={9}
                textAnchor="middle"
                fontFamily="JetBrains Mono Variable, monospace"
                className="pointer-events-none"
              >
                {active ? e.label : ''}
              </text>
            </g>
          );
        })}

        {/* Nodes */}
        {entities
          .filter((e) => positions[e.slug])
          .map((ent) => {
            const p = positions[ent.slug];
            const active = hover === ent.slug || !hover;
            const color =
              ent.slug === 'ivan-paladina'
                ? 'rgb(124 92 255)'
                : ent.type === 'person'
                ? 'rgb(255 184 0)'
                : ent.type === 'government'
                ? 'rgb(74 222 128)'
                : 'rgb(0 217 255)';
            return (
              <g
                key={ent.slug}
                transform={`translate(${p.x}, ${p.y})`}
                onMouseEnter={() => setHover(ent.slug)}
                onMouseLeave={() => setHover(null)}
                opacity={active ? 1 : 0.35}
                className="cursor-pointer"
              >
                <Link to={`/entity/${ent.slug}`} className="cursor-pointer">
                  <rect
                    x={-64}
                    y={-14}
                    width={128}
                    height={28}
                    rx={14}
                    fill="rgb(17 17 19)"
                    stroke={color}
                    strokeWidth={1.2}
                  />
                  <text
                    y={4}
                    textAnchor="middle"
                    fill={active ? 'rgb(250 250 250)' : 'rgb(138 138 148)'}
                    fontSize={9}
                    fontFamily="JetBrains Mono Variable, monospace"
                  >
                    {truncate(ent.name, 18)}
                  </text>
                </Link>
              </g>
            );
          })}
      </svg>

      <div className="flex flex-wrap gap-4 border-t border-border bg-canvas/60 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
        <LegendDot color="rgb(124 92 255)" label="ownership" />
        <LegendDot color="rgb(0 217 255)" label="contractual" />
        <LegendDot color="rgb(255 184 0)" label="director / personnel" />
        <LegendDot color="rgb(74 222 128)" label="grantor" />
        <LegendDot color="rgb(82 82 91)" label="historical / dissolved" />
        <LegendDot color="rgb(255 61 113)" label="russian-origin" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
