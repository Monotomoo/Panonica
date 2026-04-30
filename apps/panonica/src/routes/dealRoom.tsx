import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Calendar,
  Clock,
  DollarSign,
  Download,
  ExternalLink,
  Gauge,
  Gift,
  Leaf,
  Map,
  Play,
  Sparkles,
  SunMedium,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { cn } from '@paladian/ui';
import { decodePayload, type DealRoomPayload } from '@/lib/dealRoom';
import { useProjectStore } from '@/store/projectStore';
import { useConfigStore } from '@/store/configStore';
import { useScenariosStore } from '@/store/scenariosStore';
import { deriveBuilderBom, deriveBuilderFinance } from '@/lib/builderDerive';
import { DnaGlyph } from '@/components/DnaGlyph';
import { useLangStore, tr } from '@/store/langStore';

/**
 * Deal Room · personalized read-only landing.
 *
 * Decodes the hash segment of the URL into a full project payload,
 * hydrates the stores, and renders a beautiful welcome page with:
 *   - Personal greeting · to · from · message
 *   - Huge DNA glyph
 *   - 8 live key metrics
 *   - Timeline of next 18 months
 *   - 6 navigation CTAs to explore the rest of the app
 *   - Download Thesis PDF + Spec Sheet PDF links
 *
 * URL schema: /deal-room/:encoded
 * The encoded payload is base64url(JSON).
 */
export function DealRoomRoute() {
  const { encoded } = useParams<{ encoded: string }>();
  const [payload, setPayload] = useState<DealRoomPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lang = useLangStore((s) => s.lang);

  const hydrateProject = useProjectStore((s) => s.hydrate);
  const hydrateConfig = useConfigStore((s) => s.hydrate);
  const loadScenarios = useScenariosStore((s) => s.load);

  useEffect(() => {
    if (!encoded) {
      setError('No deal room payload in URL');
      return;
    }
    const parsed = decodePayload(encoded);
    if (!parsed) {
      setError('This deal room link is invalid or corrupted');
      return;
    }
    setPayload(parsed);
    // Hydrate stores so /build, /configurator etc. reflect this state
    hydrateProject(parsed.project);
    hydrateConfig(parsed.config);
    // Write scenarios directly to sessionStorage then reload store
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem('panonica.scenarios.v1', JSON.stringify(parsed.scenarios));
        loadScenarios();
      } catch {
        // ignore
      }
    }
  }, [encoded, hydrateProject, hydrateConfig, loadScenarios]);

  const project = useProjectStore();
  const config = useConfigStore();
  const bom = useMemo(() => (payload ? deriveBuilderBom(project) : null), [payload, project]);
  const finance = useMemo(() => (bom ? deriveBuilderFinance(project, bom) : null), [project, bom]);

  if (error) {
    return (
      <section className="relative flex min-h-full flex-col items-center justify-center gap-6 overflow-hidden px-12 py-24 text-center">
        {/* Ambient backdrop */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute right-[15%] top-[15%] h-[320px] w-[320px] rounded-full bg-spark/10 blur-[140px]" />
          <div className="absolute left-[15%] bottom-[20%] h-[240px] w-[240px] rounded-full bg-pulse/10 blur-[100px]" />
          <div className="grid-bg absolute inset-0 opacity-20" />
        </div>

        <div className="relative z-10 flex max-w-lg flex-col items-center gap-5">
          <div className="relative flex items-center justify-center">
            <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-full border border-spark/50 bg-spark/10">
              <Gift className="h-7 w-7 text-spark" strokeWidth={1.4} />
              <span className="absolute inset-0 animate-ping rounded-full border border-spark/30" />
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-text-muted">
              panonica · deal room · private
            </span>
            <h1 className="font-display text-[clamp(1.8rem,3vw,2.6rem)] uppercase tracking-tech-tight text-spark">
              link didn't decode
            </h1>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">
              {error}
            </p>
          </div>

          <div className="w-full rounded-lg border border-border bg-surface/40 p-5 text-left">
            <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.24em] text-text-muted">
              what to try
            </div>
            <ul className="space-y-1.5 font-mono text-[11px] leading-relaxed text-text-secondary">
              <li>· Copy the full URL again from the original message — nothing truncated after <code className="rounded bg-canvas px-1 text-text-primary">/deal-room/</code>.</li>
              <li>· Ask the sender to regenerate the link (press <kbd className="rounded border border-border-bright bg-surface px-1">⌘K</kbd> → "Generate Deal Room link").</li>
              <li>· Some email clients wrap long URLs — try opening the link in a fresh browser tab directly.</li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-md border border-pulse/40 bg-pulse/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-pulse transition-colors hover:bg-pulse/20"
            >
              open live panonica
              <ArrowRight className="h-3 w-3" strokeWidth={1.8} />
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-md border border-border-bright bg-surface/60 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary transition-colors hover:border-pulse hover:text-pulse"
            >
              retry decode
            </button>
          </div>

          <p className="max-w-md font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted/70">
            deal rooms are encoded into the URL itself · no server needed · no account required · works offline.
          </p>
        </div>
      </section>
    );
  }

  if (!payload || !bom || !finance) {
    return (
      <section className="flex min-h-full items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full border border-pulse/40" />
            <Gift className="h-5 w-5 text-pulse" strokeWidth={1.6} />
          </div>
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">
            unpacking deal room · hydrating state…
          </div>
        </div>
      </section>
    );
  }

  const createdAgoMin = Math.floor((Date.now() - new Date(payload.createdAt).getTime()) / 60000);
  const createdLabel =
    createdAgoMin < 1 ? 'just now' :
    createdAgoMin < 60 ? `${createdAgoMin} min ago` :
    createdAgoMin < 1440 ? `${Math.floor(createdAgoMin / 60)} h ago` :
    `${Math.floor(createdAgoMin / 1440)} d ago`;

  return (
    <section className="flex min-h-full flex-col gap-0 overflow-hidden">
      {/* HERO · personalized welcome */}
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-pulse/5 via-canvas to-canvas px-12 py-16">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <motion.div
            className="absolute right-[5%] top-[10%] h-[420px] w-[420px] rounded-full bg-pulse/15 blur-[140px]"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <div className="grid-bg absolute inset-0 opacity-30" />
        </div>

        <div className="relative z-10 grid grid-cols-[1.3fr_1fr] gap-10">
          <div className="flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-text-muted"
            >
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-pulse/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-pulse" />
              </span>
              <span>deal room · private · generated {createdLabel}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[clamp(2.4rem,5vw,4.4rem)] font-light uppercase leading-[0.96] tracking-tech-tight text-text-primary"
            >
              {payload.to ? (
                <>
                  <span className="text-text-muted">{tr('welcome,', 'dobrodošli,', lang)}</span>
                  <br />
                  <span className="text-pulse">{payload.to.split('@')[0]}</span>
                </>
              ) : (
                <>
                  <span className="text-pulse">{project.site.projectName || 'Kopanica-Beravci Agrivoltaic Zone'}</span>
                  <br />
                  <span className="text-text-muted">{tr('live deal room', 'živa soba dogovora', lang)}</span>
                </>
              )}
            </motion.h1>

            {payload.message && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="max-w-xl font-editorial text-[clamp(1.1rem,1.6vw,1.5rem)] font-light italic leading-[1.4] text-text-secondary"
              >
                {payload.message}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-[0.26em] text-text-muted"
            >
              <span>project · {project.site.projectName || 'Kopanica-Beravci'}</span>
              <span>·</span>
              <span>owner · {project.site.ownerEntity}</span>
              <span>·</span>
              <span>{project.site.areaHa} ha · {(project.generation.capacityDcKw / 1000).toFixed(1)} MW</span>
              <span>·</span>
              <span className="text-pulse">from · {payload.from}</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.0, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-pulse/30 bg-surface/40 p-6 backdrop-blur"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-text-muted">
              your deal DNA
            </span>
            <DnaGlyph config={config} size={240} />
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
              unique signature of your configuration
            </span>
          </motion.div>
        </div>
      </div>

      {/* KEY METRICS · 8 tiles */}
      <div className="border-b border-border px-12 py-10">
        <div className="mb-6 flex items-baseline justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
              <Sparkles className="h-3.5 w-3.5 text-pulse" strokeWidth={1.8} />
              the deal at a glance · 8 numbers
            </div>
            <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
              what the model says today
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <KeyMetric label="CAPEX" value={`€${(finance.capexEur / 1_000_000).toFixed(1)}M`} icon={DollarSign} tone="sun" big />
          <KeyMetric label="IRR · equity" value={`${finance.irrPct.toFixed(1)}%`} icon={TrendingUp} tone={finance.irrPct >= 10 ? 'agri' : 'sun'} big />
          <KeyMetric label="Exit EV · Y10" value={`€${(finance.exitEvEur / 1_000_000).toFixed(0)}M`} icon={ArrowRight} tone="sun" big />
          <KeyMetric label="Equity MoM" value={`${finance.equityMom.toFixed(2)}×`} icon={Sparkles} tone="agri" big />
          <KeyMetric label="Annual yield" value={`${finance.annualYieldGwh.toFixed(1)} GWh`} icon={SunMedium} tone="agri" />
          <KeyMetric label="DSCR · Y1" value={`${finance.dscrY1.toFixed(2)}×`} icon={Activity} tone={finance.dscrY1 >= 1.3 ? 'agri' : 'sun'} />
          <KeyMetric label="Payback" value={`${finance.paybackYears} yr`} icon={Clock} tone="pulse" />
          <KeyMetric label="CO₂ avoided" value={`${(project.esgExit.crcfCarbonCreditAnnualTco2 / 1000).toFixed(0)}k t/yr`} icon={Leaf} tone="agri" />
        </div>
      </div>

      {/* STORY BEATS · short narrative */}
      <div className="border-b border-border bg-surface/20 px-12 py-10">
        <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Calendar className="h-3.5 w-3.5 text-agri" strokeWidth={1.8} />
          the story · 3 beats
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StoryBeat
            label="01 · the window"
            title="Net metering ended 2026-01-01"
            body="Household rooftop IRR collapsed 18% → 8%. Utility-scale + agrivoltaic became the only serious Croatian solar play. 2,520 MW free grid corridor · closing in ~28 months."
            tone="pulse"
          />
          <StoryBeat
            label="02 · the asset"
            title={`${project.site.areaHa} ha · ${(project.generation.capacityDcKw / 1000).toFixed(1)} MW Phase 1`}
            body={`At the intersection of pan-European corridors X and Vc · 11 km to BiH border · HV line + gas pipeline on-site. Owned free-and-clear by ${project.site.ownerEntity}.`}
            tone="agri"
          />
          <StoryBeat
            label="03 · the math"
            title={`€${(finance.exitEvEur / 1_000_000).toFixed(0)}M exit at Y10 · ${finance.equityMom.toFixed(1)}× MoM`}
            body={`€${(finance.capexEur / 1_000_000).toFixed(1)}M CAPEX · 75% stackable non-dilutive (FZOEU + NPOO + HBOR) · DSCR ${finance.dscrY1.toFixed(2)}× · sheep under panels + CAP eco-scheme.`}
            tone="sun"
          />
        </div>
      </div>

      {/* EXPLORE · 6 destinations */}
      <div className="border-b border-border px-12 py-10">
        <div className="mb-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Map className="h-3.5 w-3.5 text-pulse" strokeWidth={1.8} />
          {tr('explore · click any · everything loaded from your link', 'istraži · klikni bilo što · sve je učitano iz tvog linka', lang)}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <ExploreCard to="/context" label="Context" body="The macro argument · why now · why Kopanica-Beravci" tone="pulse" />
          <ExploreCard to="/corridor" label="Corridor" body="Transport + borders + Paladina's 2023 deck cited" tone="signal" />
          <ExploreCard to="/land" label="Land" body="Polygon · soil · hydrology · regulatory 10-gate" tone="agri" />
          <ExploreCard to="/build" label="Project Builder" body="Full EPC spec · 16 sections · 120 fields · live BoM" tone="sun" />
          <ExploreCard to="/roi" label="Finance" body="7-tab workbook · Monte Carlo · Tornado · DSCR · Exit" tone="agri" />
          <ExploreCard to="/timeline" label="Time Machine" body="Scrub Year 0 → 25 · watch the deal evolve" tone="pulse" />
        </div>
      </div>

      {/* ACTIONS · downloads + Mission Control */}
      <div className="border-b border-border bg-surface/20 px-12 py-10">
        <div className="mb-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Download className="h-3.5 w-3.5 text-sun" strokeWidth={1.8} />
          take-aways · downloads + spectacle
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Link
            to="/thesis"
            className="group flex flex-col items-start gap-2 rounded-lg border border-sun/30 bg-sun/5 px-5 py-4 transition-all hover:bg-sun/10 hover:shadow-glow-pulse"
          >
            <Download className="h-4 w-4 text-sun" strokeWidth={1.8} />
            <span className="font-display text-base uppercase tracking-tech-tight text-sun">
              Investor Thesis PDF
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              4-page branded dossier · click · download
            </span>
          </Link>
          <Link
            to="/build"
            className="group flex flex-col items-start gap-2 rounded-lg border border-pulse/30 bg-pulse/5 px-5 py-4 transition-all hover:bg-pulse/10 hover:shadow-glow-pulse"
          >
            <Download className="h-4 w-4 text-pulse" strokeWidth={1.8} />
            <span className="font-display text-base uppercase tracking-tech-tight text-pulse">
              Engineering Spec Sheet
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              A4 tender-grade · 7 sections · all 120 inputs
            </span>
          </Link>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('panonica:mission-control-toggle'))}
            className="group flex flex-col items-start gap-2 rounded-lg border border-agri/30 bg-agri/5 px-5 py-4 text-left transition-all hover:bg-agri/10 hover:shadow-glow-pulse"
          >
            <Play className="h-4 w-4 text-agri" strokeWidth={1.8} />
            <span className="font-display text-base uppercase tracking-tech-tight text-agri">
              Mission Control
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              fullscreen · all metrics · pulsing live
            </span>
          </button>
        </div>
      </div>

      {/* FOOTER · tenant info */}
      <div className="px-12 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          <span>
            {payload.tenant} · {payload.to} · {new Date(payload.createdAt).toLocaleString('en-GB')}
          </span>
          <span>
            panonica · pannonian solar intelligence · read-only · offline-safe
          </span>
          <a
            href={`mailto:${payload.to.includes('@') ? payload.to : ''}?subject=${encodeURIComponent('Re · ' + (project.site.projectName || 'Kopanica-Beravci') + ' deal room')}`}
            className="inline-flex items-center gap-1.5 text-pulse underline-offset-4 hover:underline"
          >
            reply
            <ExternalLink className="h-2.5 w-2.5" strokeWidth={1.8} />
          </a>
        </div>
      </div>
    </section>
  );
}

/* =============================== HELPERS =============================== */

function KeyMetric({ label, value, icon: Icon, tone, big }: { label: string; value: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; tone: 'pulse' | 'sun' | 'agri' | 'signal' | 'spark'; big?: boolean }) {
  const toneCls = { pulse: 'text-pulse border-pulse/30 bg-pulse/5', sun: 'text-sun border-sun/30 bg-sun/5', agri: 'text-agri border-agri/30 bg-agri/5', signal: 'text-signal border-signal/30 bg-signal/5', spark: 'text-spark border-spark/30 bg-spark/5' }[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn('flex flex-col gap-2 rounded-lg border bg-surface/40 p-4', toneCls)}
    >
      <div className="flex items-center justify-between">
        <Icon className={cn('h-4 w-4', toneCls.split(' ')[0])} strokeWidth={1.8} />
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
          {label}
        </span>
      </div>
      <span className={cn('font-display tracking-tech-tight', big ? 'text-3xl' : 'text-xl', toneCls.split(' ')[0])}>
        {value}
      </span>
    </motion.div>
  );
}

function StoryBeat({ label, title, body, tone }: { label: string; title: string; body: string; tone: 'pulse' | 'sun' | 'agri' }) {
  const toneCls = { pulse: 'text-pulse border-pulse/30', sun: 'text-sun border-sun/30', agri: 'text-agri border-agri/30' }[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className={cn('flex flex-col gap-3 rounded-lg border bg-surface/40 p-5', toneCls)}
    >
      <span className={cn('font-mono text-[9px] uppercase tracking-[0.24em]', toneCls.split(' ')[0])}>
        {label}
      </span>
      <h3 className="font-display text-lg uppercase tracking-tech-tight text-text-primary">
        {title}
      </h3>
      <p className="font-mono text-[11px] leading-relaxed text-text-secondary">{body}</p>
    </motion.div>
  );
}

function ExploreCard({ to, label, body, tone }: { to: string; label: string; body: string; tone: 'pulse' | 'sun' | 'agri' | 'signal' }) {
  const toneCls = { pulse: 'border-pulse/30 bg-pulse/5 text-pulse', sun: 'border-sun/30 bg-sun/5 text-sun', agri: 'border-agri/30 bg-agri/5 text-agri', signal: 'border-signal/30 bg-signal/5 text-signal' }[tone];
  return (
    <Link
      to={to}
      className={cn('group flex flex-col gap-2 rounded-lg border bg-surface/40 p-5 transition-all hover:shadow-glow-pulse', toneCls)}
    >
      <div className="flex items-center justify-between">
        <span className={cn('font-display text-lg uppercase tracking-tech-tight', toneCls.split(' ')[2])}>
          {label}
        </span>
        <ArrowRight className={cn('h-3.5 w-3.5 transition-transform group-hover:translate-x-1', toneCls.split(' ')[2])} strokeWidth={1.8} />
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
        {body}
      </span>
    </Link>
  );
}
