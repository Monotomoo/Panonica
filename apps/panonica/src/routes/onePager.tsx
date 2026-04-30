import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  Clipboard,
  Download,
  FileText,
  Image as ImageIcon,
  Loader2,
  Mail,
  Printer,
  Share2,
} from 'lucide-react';
import { cn } from '@paladian/ui';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DnaGlyph } from '@/components/DnaGlyph';
import { Sparkline } from '@/components/Sparkline';
import { useConfigStore } from '@/store/configStore';

/**
 * One-Pager · the ultimate leave-behind.
 *
 * A single A4 document designed so perfectly it gets saved, forwarded,
 * printed, pinned. Dense but scannable · every key number and visual on one
 * page · paper-cream aesthetic that prints clean.
 *
 * Toolbar (hidden in print) has: Print · Download PDF · Download PNG ·
 * Email Ivan · Share Deal Room. The document itself is pure paper — no
 * Panonica chrome, no dark mode.
 */

const FILENAME_BASE = `Kopanica-Beravci-OnePager-${new Date().toISOString().slice(0, 10)}`;

export function OnePagerRoute() {
  const [exportState, setExportState] = useState<'idle' | 'pdf' | 'png'>('idle');
  const [toast, setToast] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const config = useConfigStore();

  /* ============================= QR CODE ============================= */

  useEffect(() => {
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/`
        : 'https://panonica.hr/';
    QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 220,
      color: { dark: '#0f0f10', light: '#fafaf7' },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, []);

  const fireToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  /* ============================ EXPORT PDF ============================ */

  const exportPdf = async () => {
    if (!paperRef.current || exportState !== 'idle') return;
    setExportState('pdf');
    try {
      const canvas = await html2canvas(paperRef.current, {
        backgroundColor: '#fafaf7',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgWidthMm = 210;
      const pageHeightMm = 297;
      const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const imgData = canvas.toDataURL('image/jpeg', 0.94);
      pdf.addImage(
        imgData,
        'JPEG',
        0,
        0,
        imgWidthMm,
        Math.min(imgHeightMm, pageHeightMm),
        undefined,
        'FAST',
      );
      pdf.setProperties({
        title: 'Kopanica-Beravci · Agrivoltaic Zone · One-Pager',
        author: 'Panonica · Paladina Investments',
        subject: '30 MW · 80.3 ha · Velika Kopanica',
        keywords: 'solar, agrivoltaic, croatia, kopanica, paladina, one-pager',
        creator: 'Panonica v0.1.0',
      });
      pdf.save(`${FILENAME_BASE}.pdf`);
      fireToast('Downloaded · A4 PDF');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[onepager-pdf]', err);
      fireToast('PDF generation failed');
    } finally {
      setExportState('idle');
    }
  };

  /* ============================ EXPORT PNG ============================ */

  const exportPng = async () => {
    if (!paperRef.current || exportState !== 'idle') return;
    setExportState('png');
    try {
      const canvas = await html2canvas(paperRef.current, {
        backgroundColor: '#fafaf7',
        scale: 3,
        useCORS: true,
        logging: false,
      });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${FILENAME_BASE}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      fireToast('Downloaded · PNG');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[onepager-png]', err);
      fireToast('PNG generation failed');
    } finally {
      setExportState('idle');
    }
  };

  /* ============================ OTHER ACTIONS ============================ */

  const printPage = () => {
    window.print();
  };

  const emailIvan = () => {
    const subject = encodeURIComponent('Kopanica-Beravci · one-pager');
    const body = encodeURIComponent(
      `Ivane,

One-pager attached · 30 MW · 80.3 ha · IRR 11.4% · exit year 10 at €30M.

The live deal room (same data, interactive) is at the QR code on the bottom-right.

Tomo · Panonica
`,
    );
    window.open(`mailto:ivan@paladina.hr?subject=${subject}&body=${body}`);
  };

  const shareDealRoom = () => {
    window.dispatchEvent(new CustomEvent('panonica:deal-room-generate'));
  };

  /* ============================ RENDER ============================ */

  return (
    <section className="relative flex min-h-full justify-center overflow-y-auto px-10 py-8">
      {/* Print-only CSS · hides chrome + paper centered at A4 */}
      <style>{`
        @media print {
          body, html { background: #fafaf7 !important; }
          .panonica-shell-hide-in-print { display: none !important; }
          .panonica-paper { box-shadow: none !important; margin: 0 !important; }
          @page { size: A4 portrait; margin: 0; }
        }
      `}</style>

      {/* Toolbar · hidden in print */}
      <div
        className={cn(
          'panonica-shell-hide-in-print sticky top-4 z-10 mr-6 flex h-fit flex-col gap-2 rounded-lg border border-border bg-surface/60 p-3 backdrop-blur',
          'font-mono text-[10px] uppercase tracking-[0.22em]',
        )}
      >
        <div className="mb-1 text-[9px] uppercase tracking-[0.26em] text-text-muted">
          leave-behind · A4
        </div>
        <ToolbarBtn onClick={printPage} icon={Printer} label="print" tone="pulse" />
        <ToolbarBtn
          onClick={exportPdf}
          icon={exportState === 'pdf' ? Loader2 : Download}
          label={exportState === 'pdf' ? 'compiling…' : 'pdf'}
          tone="sun"
          busy={exportState === 'pdf'}
        />
        <ToolbarBtn
          onClick={exportPng}
          icon={exportState === 'png' ? Loader2 : ImageIcon}
          label={exportState === 'png' ? 'capturing…' : 'png'}
          tone="agri"
          busy={exportState === 'png'}
        />
        <ToolbarBtn onClick={emailIvan} icon={Mail} label="email" tone="signal" />
        <ToolbarBtn onClick={shareDealRoom} icon={Share2} label="deal room" tone="agri" />
      </div>

      {/* The paper · A4 portrait */}
      <div className="panonica-paper-wrap flex-shrink-0">
        <motion.div
          ref={paperRef}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="panonica-paper relative rounded-sm"
          style={{
            width: '680px',
            minHeight: '960px',
            background: '#fafaf7',
            color: '#0f0f10',
            boxShadow:
              '0 32px 60px -20px rgba(124,92,255,0.18), 0 20px 40px -10px rgba(0,0,0,0.5)',
            padding: '32px 38px',
          }}
        >
          {/* ========== HEADER ========== */}
          <PaperHeader />

          {/* ========== HERO NUMBERS ========== */}
          <div className="mt-5 grid grid-cols-4 gap-3">
            <HeroNum label="Phase 1" value="30" unit="MW" tone="#7C5CFF" sub="queue-approved" />
            <HeroNum label="Total CAPEX" value="€21" unit="M" tone="#FFB800" sub="€700k / MW" />
            <HeroNum label="Equity IRR" value="11.4" unit="%" tone="#4ADE80" sub="25-yr model" />
            <HeroNum label="Exit EV · Y10" value="€30" unit="M" tone="#FFB800" sub="6.5% cap rate" />
          </div>

          {/* ========== THESIS LINE ========== */}
          <div className="mt-5 border-t border-black/10 pt-4">
            <p className="font-serif text-[12px] italic leading-snug text-black/80">
              "You are not building a solar farm. You are warehousing grid rights and subsidy
              eligibility for a 25-year window that closes in 2028. The net-metering collapse of
              January 2026 made utility-scale agrivoltaic the only serious Croatian solar segment.
              Kopanica-Beravci is the anchor position."
            </p>
          </div>

          {/* ========== TWO-COLUMN BODY ========== */}
          <div className="mt-5 grid grid-cols-2 gap-6">
            {/* LEFT · Why + Moat */}
            <div className="flex flex-col gap-5">
              <Section title="Why this deal · now">
                <Bullet>Net metering ended <strong>2026-01-01</strong>. Rooftop IRR 18% → 8%. Utility-scale became the only viable segment.</Bullet>
                <Bullet>OIEH estimates <strong>2,500 MW</strong> of free grid capacity regionally · Slavonia holds 1,180 MW. Window closes ~28 months.</Bullet>
                <Bullet>Ivan Paladina has held parcel since <strong>2019</strong> via IGH bond recovery. UPU amendment in consultation.</Bullet>
              </Section>

              <Section title="The infrastructure moat">
                <Bullet><strong>A3 motorway</strong> · exit cloverleaf 0.3 km from parcel W edge</Bullet>
                <Bullet><strong>D7 state road</strong> · direct border along S edge (0 km)</Bullet>
                <Bullet><strong>MP13C railway</strong> · Kopanica-Beravci station 0.7 km E</Bullet>
                <Bullet><strong>HV line + gas pipeline</strong> · both already on-site · no MV cable build</Bullet>
                <Bullet><strong>HOPS queue #14</strong> of 62 · TS Slavonski Brod 1 · Q3 2027 connection</Bullet>
                <Bullet><strong>BiH border 11 km</strong> · cross-border export optionality · +€380k/yr upside</Bullet>
              </Section>
            </div>

            {/* RIGHT · Funding + Competitive */}
            <div className="flex flex-col gap-5">
              <Section title="Funding stack · 75% non-dilutive">
                <FundingRow label="FZOEU OI-2026-03" amount="€4.2 M" deadline="T−88 d" accent="#FFB800" />
                <FundingRow label="NPOO C1.2.R1-I1" amount="€8.4 M" deadline="T−165 d" accent="#7C5CFF" />
                <FundingRow label="HBOR Zeleni kredit" amount="€3.2 M" deadline="drawdown" accent="#4ADE80" />
                <div className="mt-2 flex items-baseline justify-between border-t border-black/15 pt-2 font-mono text-[10px]">
                  <span className="uppercase tracking-[0.22em] text-black/60">Total non-dilutive</span>
                  <span className="font-display text-lg tabular-nums text-black">€15.8 M · 75%</span>
                </div>
              </Section>

              <Section title="Competitive position">
                <div className="grid grid-cols-2 gap-2">
                  <CompStat label="Rank · by IRR" value="#6 / 18" tone="#7C5CFF" />
                  <CompStat label="IRR percentile" value="top 33%" tone="#4ADE80" />
                  <CompStat label="CAPEX efficiency" value="−€20k / MW vs median" tone="#4ADE80" />
                  <CompStat label="Avg moat vs market" value="+4.6 pts" tone="#FFB800" />
                </div>
                <Bullet>8-axis strategic radar outperforms market on transport, on-site infra, export optionality, agri-PV bonus.</Bullet>
              </Section>

              <Section title="Unit economics">
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[10px] tabular-nums text-black/80">
                  <span className="text-black/60">DSCR · Y1</span><span className="text-right">1.78 ×</span>
                  <span className="text-black/60">Payback</span><span className="text-right">7.4 yr</span>
                  <span className="text-black/60">NPV (25 yr · 8%)</span><span className="text-right">€30.4 M</span>
                  <span className="text-black/60">Equity MoM · Y10</span><span className="text-right">7.8 ×</span>
                  <span className="text-black/60">Annual yield</span><span className="text-right">39.2 GWh</span>
                  <span className="text-black/60">Performance ratio</span><span className="text-right">84.3%</span>
                  <span className="text-black/60">CO₂ avoided</span><span className="text-right">34k t / yr</span>
                  <span className="text-black/60">LCOE</span><span className="text-right">€42 / MWh</span>
                </div>
              </Section>
            </div>
          </div>

          {/* ========== TIMELINE STRIP ========== */}
          <div className="mt-5 border-t border-black/10 pt-4">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-black/60">
                25-year clock
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-black/50">
                development → operation → exit
              </span>
            </div>
            <div className="relative">
              <div className="relative h-[3px] rounded-full bg-black/10">
                <div className="absolute left-0 h-full rounded-full bg-black/70" style={{ width: '2%' }} />
                <TimelineNode pct={2} label="2026 · design" color="#7C5CFF" />
                <TimelineNode pct={8} label="2026 · UPU" color="#7C5CFF" />
                <TimelineNode pct={17} label="2027 · COD" color="#4ADE80" />
                <TimelineNode pct={32} label="2034 · refi" color="#FFB800" />
                <TimelineNode pct={40} label="2036 · exit" color="#FF3D71" />
                <TimelineNode pct={100} label="2051 · EOL" color="#0f0f10" />
              </div>
            </div>
          </div>

          {/* ========== MINI CHARTS + DNA + QR ========== */}
          <div className="mt-5 grid grid-cols-[1.2fr_1fr_1fr] gap-4">
            {/* Revenue stream */}
            <div className="flex flex-col gap-1 rounded-sm border border-black/10 bg-white/40 p-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-black/60">
                revenue · 25-year curve
              </span>
              <Sparkline
                values={revenueSparkline()}
                tone="agri"
                width={210}
                height={48}
                strokeWidth={1.8}
              />
              <div className="mt-0.5 flex items-baseline justify-between font-mono text-[9px] text-black/60">
                <span>Y1 · €2.1M</span>
                <span className="text-black">Y25 · €3.0M (real)</span>
              </div>
            </div>

            {/* DNA Glyph */}
            <div className="flex flex-col items-center gap-1 rounded-sm border border-black/10 bg-white/40 p-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-black/60">
                deal DNA
              </span>
              <DnaGlyph config={config} size={86} paper />
              <span className="font-mono text-[9px] text-black/50">
                {config.capacityMW} MW · {config.tracking}
              </span>
            </div>

            {/* QR → live deal room */}
            <div className="flex flex-col items-center gap-1 rounded-sm border border-black/10 bg-white/40 p-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-black/60">
                scan · live
              </span>
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR · panonica.hr" className="h-[86px] w-[86px]" />
              ) : (
                <div className="h-[86px] w-[86px] animate-pulse rounded-sm bg-black/10" />
              )}
              <span className="font-mono text-[9px] text-black/50">panonica.hr</span>
            </div>
          </div>

          {/* ========== FOOTER ========== */}
          <div className="mt-5 flex items-end justify-between border-t border-black/15 pt-3">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[8px] uppercase tracking-[0.26em] text-black/50">
                Tomo · Panonica · Pannonian Solar Intelligence
              </span>
              <span className="font-mono text-[8px] text-black/40">
                Sources · HROTE · HOPS queue Q3 2026 · FZOEU OI-2026-03 · HBOR Zeleni · modeled IRR from 30 MW base case on 80.3 ha Posavina Fluvisol · 25-yr PPA · 6.5% exit cap. All numbers reconcile with Ribić Breg benchmark scaled to site.
              </span>
            </div>
            <div className="flex flex-col items-end gap-0.5 text-right">
              <span className="font-display text-[10px] uppercase tracking-[0.32em] text-black/70">
                panonica_
              </span>
              <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-black/40">
                HR-AGRI-2026-KOPANICA-01
              </span>
              <span className="font-mono text-[8px] text-black/40">
                {new Date().toISOString().slice(0, 10)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="panonica-shell-hide-in-print fixed bottom-6 left-1/2 z-[50] -translate-x-1/2 rounded-md border border-agri/40 bg-agri/15 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-agri backdrop-blur"
          >
            <Check className="mr-2 inline h-3 w-3" strokeWidth={2.5} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ============================ SUB-COMPONENTS ============================ */

function PaperHeader() {
  return (
    <div className="flex items-baseline justify-between border-b border-black/15 pb-3">
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-black/55">
          PANONICA · INVESTMENT ONE-PAGER
        </span>
        <h1 className="font-display text-[28px] uppercase leading-none tracking-[0.01em] text-black">
          Kopanica-Beravci
        </h1>
        <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-black/55">
          80.3 ha · Općina Velika Kopanica · Brodsko-Posavska županija · HR
        </span>
      </div>
      <div className="flex flex-col items-end gap-0.5 text-right">
        <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-black/55">
          Paladina Investments
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/55">
          45.1348°N · 18.4130°E
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/55">
          {new Date().toISOString().slice(0, 10)} · prepared for Ivan Paladina
        </span>
      </div>
    </div>
  );
}

function HeroNum({
  label,
  value,
  unit,
  tone,
  sub,
}: {
  label: string;
  value: string;
  unit: string;
  tone: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-sm border border-black/10 bg-white/50 p-2.5">
      <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-black/55">
        {label}
      </span>
      <div className="flex items-baseline gap-1" style={{ color: tone }}>
        <span className="font-display text-[32px] leading-none tracking-tight tabular-nums">
          {value}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em]">{unit}</span>
      </div>
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-black/55">
        {sub}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h2 className="font-display text-[13px] uppercase tracking-[0.1em] text-black">
        {title}
      </h2>
      <div className="flex flex-col gap-0.5 font-serif text-[11px] leading-snug text-black/80">
        {children}
      </div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-1.5 font-serif text-[11px] leading-snug text-black/80">
      <span className="mt-1 inline-block h-[3px] w-[3px] shrink-0 rounded-full bg-black/60" />
      <span className="flex-1">{children}</span>
    </div>
  );
}

function FundingRow({
  label,
  amount,
  deadline,
  accent,
}: {
  label: string;
  amount: string;
  deadline: string;
  accent: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-black/8 pb-1 last:border-0">
      <div className="flex items-baseline gap-2">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ background: accent }}
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/75">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-[14px] tabular-nums text-black">{amount}</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/55">
          {deadline}
        </span>
      </div>
    </div>
  );
}

function CompStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="flex flex-col gap-0 rounded-sm bg-white/50 px-2 py-1.5">
      <span className="font-mono text-[8.5px] uppercase tracking-[0.22em] text-black/55">
        {label}
      </span>
      <span className="font-display text-[13px] tabular-nums" style={{ color: tone }}>
        {value}
      </span>
    </div>
  );
}

function TimelineNode({ pct, label, color }: { pct: number; label: string; color: string }) {
  return (
    <div
      className="absolute top-1/2 -translate-y-1/2"
      style={{ left: `calc(${pct}% - 4px)` }}
    >
      <span
        className="block h-2 w-2 rounded-full ring-2 ring-white"
        style={{ background: color }}
      />
      <span
        className="absolute top-3 block whitespace-nowrap font-mono text-[8.5px] uppercase tracking-[0.22em] text-black/70"
        style={{
          left: pct > 85 ? 'auto' : '0',
          right: pct > 85 ? '0' : 'auto',
        }}
      >
        {label}
      </span>
    </div>
  );
}

function ToolbarBtn({
  onClick,
  icon: Icon,
  label,
  tone,
  busy,
}: {
  onClick: () => void;
  icon: any;
  label: string;
  tone: 'pulse' | 'sun' | 'agri' | 'signal';
  busy?: boolean;
}) {
  const cls = {
    pulse: 'border-pulse/40 bg-pulse/10 text-pulse hover:bg-pulse/20',
    sun: 'border-sun/40 bg-sun/10 text-sun hover:bg-sun/20',
    agri: 'border-agri/40 bg-agri/10 text-agri hover:bg-agri/20',
    signal: 'border-signal/40 bg-signal/10 text-signal hover:bg-signal/20',
  }[tone];
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={cn(
        'inline-flex items-center gap-2 rounded-sm border px-2.5 py-1.5 transition-colors',
        cls,
        busy && 'cursor-wait opacity-80',
      )}
    >
      <Icon className={cn('h-3 w-3', busy && 'animate-spin')} strokeWidth={1.8} />
      {label}
    </button>
  );
}

/* ============================ DATA HELPERS ============================ */

/** 25-year revenue curve (nominal) — PPA inflated 1.5%/yr from €2.1M base. */
function revenueSparkline(): number[] {
  const base = 2.094;
  const escalation = 1.015;
  const degradation = 0.996;
  const values: number[] = [];
  let ppa = base;
  let prod = 1;
  for (let y = 1; y <= 25; y++) {
    ppa *= escalation;
    prod *= degradation;
    values.push(ppa * prod);
  }
  return values;
}
