import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NumberTicker, Typewriter, cn } from '@paladian/ui';
import { ParcelMap } from '@/components/ParcelMap';
import { beravciParcel } from '@/mock/parcel';

const SESSION_KEY = 'panonica.intro-played';

export function HeroRoute() {
  const [phase, setPhase] = useState<'coords' | 'map' | 'meta' | 'done'>(() =>
    typeof window !== 'undefined' && window.sessionStorage.getItem(SESSION_KEY)
      ? 'done'
      : 'coords',
  );

  useEffect(() => {
    if (phase === 'done') return;

    if (phase === 'coords') {
      // move on once typewriter itself fires onComplete, but safety timer too
      const t = setTimeout(() => setPhase('map'), 2600);
      return () => clearTimeout(t);
    }
    if (phase === 'map') {
      const t = setTimeout(() => setPhase('meta'), 2300);
      return () => clearTimeout(t);
    }
    if (phase === 'meta') {
      const t = setTimeout(() => {
        setPhase('done');
        window.sessionStorage.setItem(SESSION_KEY, '1');
      }, 2400);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const mapVisible = phase !== 'coords';
  const metaVisible = phase === 'meta' || phase === 'done';
  const ctaVisible = phase === 'done';

  return (
    <section className="relative flex h-[calc(100vh-2.75rem)] w-full overflow-hidden bg-canvas">
      {/* Background map layer — fades and scales in during 'map' phase */}
      <motion.div
        initial={{ opacity: 0, scale: 1.08 }}
        animate={{
          opacity: mapVisible ? 1 : 0,
          scale: mapVisible ? 1 : 1.08,
        }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0"
      >
        <ParcelMap
          backgroundUrl="/imagery/beravci-close.png"
          imageOpacity={0.78}
          drawOnMount={mapVisible}
          drawDelay={0.4}
          tone="pulse"
          showSunArc
          showCentroidPulse
        />
      </motion.div>

      {/* Grid backdrop (visible during coords phase) */}
      <AnimatePresence>
        {phase === 'coords' && (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-none absolute inset-0 grid-bg"
          />
        )}
      </AnimatePresence>

      {/* Dark scrim that eases as map appears */}
      <motion.div
        aria-hidden
        initial={{ opacity: 1 }}
        animate={{ opacity: mapVisible ? 0.35 : 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 bg-canvas"
      />

      {/* Content layer */}
      <div className="relative z-10 grid h-full w-full grid-cols-12 gap-6 px-12 py-16">
        {/* LEFT — coordinates & tagline */}
        <div className="col-span-7 flex flex-col justify-between">
          <div>
            <div className="mb-12 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-text-muted">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-pulse animate-pulse-dot" />
              <span>// panonica · pannonian solar intelligence</span>
            </div>

            <div className="mb-4 font-mono text-xs uppercase tracking-[0.26em] text-text-muted">
              target coordinates
            </div>
            <div className="font-mono text-3xl tracking-tight text-text-primary">
              <Typewriter text="45.2074°N  18.4393°E" speed={45} cursor />
            </div>
            <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">
              BERAVCI · OPĆINA VELIKA KOPANICA · SLAVONIA
            </div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: ctaVisible ? 1 : 0, y: ctaVisible ? 0 : 20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[clamp(2rem,5vw,4rem)] font-light uppercase leading-[0.95] tracking-[0.18em] text-text-primary"
            >
              pannonian
              <br />
              solar intelligence
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: ctaVisible ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="mt-4 max-w-md font-mono text-[12px] uppercase tracking-[0.22em] text-text-secondary"
            >
              an investment-grade view of croatia's first-mover
              <br />
              agrivoltaic land bank — parcel, panel, grid, euro.
            </motion.p>
          </div>
        </div>

        {/* RIGHT — metadata cards */}
        <div className="col-span-5 flex flex-col items-end justify-center gap-3 pr-2">
          <MetaCards visible={metaVisible} />
        </div>
      </div>

      {/* CTA — Continue */}
      <AnimatePresence>
        {ctaVisible && (
          <motion.div
            key="cta"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute bottom-10 right-12 z-20"
          >
            <Link
              to="/land"
              className={cn(
                'group inline-flex items-center gap-3 rounded-md border border-border-bright px-5 py-3',
                'bg-surface/80 backdrop-blur transition-all hover:border-pulse hover:shadow-glow-pulse',
              )}
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary group-hover:text-pulse">
                enter land view
              </span>
              <ArrowRight
                className="h-3.5 w-3.5 text-text-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-pulse"
                strokeWidth={1.8}
              />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function MetaCards({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
          }}
          className="flex w-full max-w-sm flex-col gap-2"
        >
          <MetaRow label="parcel" value="BERAVCI" accent="display" />
          <MetaRow
            label="area"
            value={
              <NumberTicker
                value={beravciParcel.areaHa}
                decimals={1}
                suffix=" ha"
                duration={1.4}
                triggerOnView={false}
                className="text-pulse"
              />
            }
            accent="big"
          />
          <MetaRow
            label="land use"
            value={`${beravciParcel.parcels.building} građevinskih · ${beravciParcel.parcels.arable} oranica`}
          />
          <MetaRow label="owner" value={beravciParcel.owner} />
          <MetaRow
            label="acquired"
            value={`${beravciParcel.acquiredYear} · IGH bond recovery`}
            muted
          />
          <MetaRow
            label="valuation"
            value={
              <NumberTicker
                value={beravciParcel.estimatedValueEUR}
                prefix="€"
                duration={1.6}
                triggerOnView={false}
                className="text-gold"
              />
            }
            accent="big"
          />
          <MetaRow
            label="status"
            value={
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-agri animate-pulse-dot" />
                UPU consultation · May 20
              </span>
            }
            tone="agri"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MetaRow({
  label,
  value,
  accent = 'default',
  tone = 'default',
  muted,
}: {
  label: string;
  value: React.ReactNode;
  accent?: 'default' | 'big' | 'display';
  tone?: 'default' | 'agri';
  muted?: boolean;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: 16 },
        visible: { opacity: 1, x: 0 },
      }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-baseline justify-between gap-6 border-b border-border/60 bg-surface/70 px-4 py-2.5 backdrop-blur"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
        {label}
      </span>
      <span
        className={cn(
          'text-right font-mono tabular-nums',
          accent === 'display' && 'font-display text-lg tracking-tech-tight',
          accent === 'big' && 'text-base',
          accent === 'default' && 'text-[12px]',
          muted ? 'text-text-muted' : 'text-text-primary',
          tone === 'agri' && 'text-agri',
        )}
      >
        {value}
      </span>
    </motion.div>
  );
}
