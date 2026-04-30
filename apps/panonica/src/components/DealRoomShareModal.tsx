import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import QRCode from 'qrcode';
import {
  Check,
  Copy,
  ExternalLink,
  FileText,
  Gift,
  Mail,
  QrCode,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { cn } from '@paladian/ui';
import { useProjectStore } from '@/store/projectStore';
import { useConfigStore } from '@/store/configStore';
import { useScenariosStore } from '@/store/scenariosStore';
import { buildDealRoomUrl, encodePayload, type DealRoomPayload } from '@/lib/dealRoom';

/**
 * Share-Deal-Room modal · triggered via:
 *   - Command Palette ("Generate Deal Room link")
 *   - window event 'panonica:deal-room-generate'
 *
 * Encodes current project + config + scenarios state into a URL,
 * renders a QR code, provides copy / email / open actions.
 */
export function DealRoomShareModal() {
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState('Ivan Paladina');
  const [from, setFrom] = useState('Panonica · Tomo');
  const [message, setMessage] = useState('Live snapshot of the Kopanica-Beravci deal as we discussed. Click anywhere to explore.');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const project = useProjectStore();
  const config = useConfigStore((s) => ({
    activeScenario: s.activeScenario,
    capacityMW: s.capacityMW,
    panelHeight: s.panelHeight,
    rowSpacing: s.rowSpacing,
    tracking: s.tracking,
    battery: s.battery,
    underPanel: s.underPanel,
    panelId: s.panelId,
    inverterId: s.inverterId,
    dcAcRatio: s.dcAcRatio,
    batteryChem: s.batteryChem,
    mvKv: s.mvKv,
    gcr: s.gcr,
    fenceHeightM: s.fenceHeightM,
    cctvCount: s.cctvCount,
  }));
  const scenarios = useScenariosStore((s) => s.scenarios);

  useEffect(() => {
    const h = () => setOpen(true);
    window.addEventListener('panonica:deal-room-generate', h);
    return () => window.removeEventListener('panonica:deal-room-generate', h);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const payload: DealRoomPayload = {
    v: 1,
    createdAt: new Date().toISOString(),
    tenant: project.site.ownerEntity || 'Paladina Investments',
    project,
    config,
    scenarios,
    to,
    from,
    message,
  };
  const encoded = encodePayload(payload);
  const url = typeof window !== 'undefined' ? buildDealRoomUrl(encoded) : '';
  const urlSizeKb = (url.length / 1024).toFixed(1);

  // Generate QR · fall back gracefully if URL too long for QR spec
  const [qrError, setQrError] = useState<string | null>(null);
  useEffect(() => {
    if (!open || !url) return;
    setQrError(null);
    setQrDataUrl(null);
    // QR v40 max · ~2.9 KB at L error correction. Our compressed URL is ~5 KB
    // and the origin adds another ~20 bytes, so we need L at minimum.
    QRCode.toDataURL(url, {
      errorCorrectionLevel: 'L',
      margin: 2,
      width: 360,
      color: { dark: '#FAFAFA', light: '#0A0A0B' },
    }).then(setQrDataUrl).catch((e) => {
      setQrError(url.length > 2800 ? `URL ${urlSizeKb} KB · exceeds QR capacity. Use copy or email.` : 'QR generation failed');
    });
  }, [open, url, urlSizeKb]);

  const fireToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      fireToast(`Link copied · ${urlSizeKb} KB`);
    } catch {
      fireToast('Clipboard blocked');
    }
  };

  const openInNewTab = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const mailto = () => {
    const subject = encodeURIComponent(`${project.site.projectName || 'Kopanica-Beravci'} · your deal room link`);
    const body = encodeURIComponent(`${message}\n\n${url}\n\nFrom · ${from}`);
    window.open(`mailto:${to.includes('@') ? to : ''}?subject=${subject}&body=${body}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[180] flex items-center justify-center"
          style={{ background: 'rgba(10,10,11,0.78)', backdropFilter: 'blur(10px)' }}
        >
          <motion.div
            initial={{ scale: 0.94, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 4, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-[min(880px,94vw)] max-h-[92vh] overflow-hidden overflow-y-auto rounded-xl border border-pulse/30 bg-surface/95 shadow-2xl backdrop-blur-2xl"
            style={{ boxShadow: '0 40px 100px -30px rgba(124,92,255,0.45)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-canvas/60 px-6 py-4">
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-pulse" strokeWidth={1.6} />
                <div className="flex flex-col">
                  <span className="font-display text-lg uppercase tracking-tech-tight text-text-primary">
                    deal room
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-text-muted">
                    shareable read-only url · encoded state · works offline
                  </span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md border border-border-bright bg-surface p-1.5 text-text-muted transition-colors hover:border-spark hover:text-spark"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.8} />
              </button>
            </div>

            {/* Body */}
            <div className="grid grid-cols-[1fr_1fr] gap-0">
              {/* LEFT — personalization */}
              <div className="flex flex-col gap-4 border-r border-border px-6 py-5">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                    to (name or email)
                  </label>
                  <input
                    type="text"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Ivan Paladina"
                    className="rounded-sm border border-border-bright bg-canvas px-3 py-2 font-mono text-[12px] text-text-primary outline-none focus:border-pulse"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                    from
                  </label>
                  <input
                    type="text"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="rounded-sm border border-border-bright bg-canvas px-3 py-2 font-mono text-[12px] text-text-primary outline-none focus:border-pulse"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                    greeting
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="resize-none rounded-sm border border-border-bright bg-canvas px-3 py-2 font-mono text-[11px] leading-relaxed text-text-primary outline-none focus:border-pulse"
                  />
                </div>

                <div className="mt-auto rounded-md border border-border bg-surface/40 p-3 font-mono text-[10px] leading-relaxed text-text-muted">
                  <span className="text-text-primary">What's in this link:</span>
                  <br />
                  Full project (16 sections) · live configurator state · saved scenarios A/B/C.
                  The recipient opens a read-only landing page with everything you just saw.
                  <br />
                  <span className="text-pulse">Link size · {urlSizeKb} KB</span>
                </div>
              </div>

              {/* RIGHT — QR + actions */}
              <div className="flex flex-col gap-4 bg-canvas/50 px-6 py-5">
                <div className="flex flex-col items-center gap-2 rounded-md border border-pulse/30 bg-surface/40 p-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                    <QrCode className="mr-1 inline h-3 w-3" strokeWidth={1.8} />
                    scan from ivan's phone
                  </span>
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Deal Room QR code"
                      className="h-[220px] w-[220px] rounded-sm border border-border bg-canvas"
                    />
                  ) : qrError ? (
                    <div className="flex h-[220px] w-[220px] flex-col items-center justify-center gap-2 rounded-sm border border-sun/30 bg-sun/5 p-4 text-center font-mono text-[9px] uppercase tracking-[0.22em] text-sun">
                      <QrCode className="h-6 w-6" strokeWidth={1.4} />
                      {qrError}
                    </div>
                  ) : (
                    <div className="flex h-[220px] w-[220px] items-center justify-center rounded-sm border border-border bg-canvas font-mono text-[10px] text-text-muted">
                      generating…
                    </div>
                  )}
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                    M-level redundancy · offline-safe
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={copyUrl}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-agri/40 bg-agri/10 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-agri transition-all hover:bg-agri/20 hover:shadow-glow-pulse"
                  >
                    <Copy className="h-3.5 w-3.5" strokeWidth={1.8} />
                    copy deal room URL
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={openInNewTab}
                      className="inline-flex items-center justify-center gap-2 rounded-md border border-border-bright bg-surface px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary transition-colors hover:border-pulse hover:text-pulse"
                    >
                      <ExternalLink className="h-3 w-3" strokeWidth={1.8} />
                      open now
                    </button>
                    <button
                      onClick={mailto}
                      className="inline-flex items-center justify-center gap-2 rounded-md border border-border-bright bg-surface px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary transition-colors hover:border-sun hover:text-sun"
                    >
                      <Mail className="h-3 w-3" strokeWidth={1.8} />
                      email
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* URL preview */}
            <div className="flex items-center gap-3 border-t border-border bg-canvas/60 px-6 py-3">
              <FileText className="h-3.5 w-3.5 shrink-0 text-text-muted" strokeWidth={1.8} />
              <span className="truncate font-mono text-[10px] text-text-muted">{url.slice(0, 140)}…</span>
            </div>
          </motion.div>

          {toast && (
            <div className="pointer-events-none fixed bottom-6 left-1/2 z-[200] -translate-x-1/2 rounded-md border border-agri/40 bg-agri/15 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-agri backdrop-blur">
              <Check className="mr-2 inline h-3 w-3" strokeWidth={2.5} />
              {toast}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
