import { useEffect, useRef, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  Link as LinkIcon,
  Upload,
  X,
} from 'lucide-react';
import { cn } from '@paladian/ui';
import { useScenariosStore, encodeForUrl, decodeFromUrl } from '@/store/scenariosStore';

/**
 * Share controls for Scenarios Lab.
 *   · Copy JSON to clipboard
 *   · Download JSON file
 *   · Generate shareable URL (base64url in hash · self-decodable)
 *   · Import from pasted JSON
 *
 * Also auto-imports from `#share=…` URL hash on mount.
 */
export function ScenarioShareControls() {
  const scenarios = useScenariosStore((s) => s.scenarios);
  const exportJSON = useScenariosStore((s) => s.exportJSON);
  const importJSON = useScenariosStore((s) => s.importJSON);

  const filledCount = Object.values(scenarios).filter(Boolean).length;
  const [toast, setToast] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<'agri' | 'spark'>('agri');
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const importRef = useRef<HTMLTextAreaElement>(null);

  // Auto-import from URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#share=')) return;
    const encoded = hash.slice('#share='.length);
    const decoded = decodeFromUrl(encoded);
    if (!decoded) {
      setToastTone('spark');
      setToast('Invalid share link');
      setTimeout(() => setToast(null), 2800);
      return;
    }
    const res = importJSON(decoded);
    if (res.ok) {
      setToastTone('agri');
      setToast(`Imported ${res.count} scenario${res.count === 1 ? '' : 's'} from link`);
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } else {
      setToastTone('spark');
      setToast(`Import failed · ${res.error}`);
    }
    setTimeout(() => setToast(null), 3200);
  }, [importJSON]);

  const fireToast = (msg: string, tone: 'agri' | 'spark' = 'agri') => {
    setToastTone(tone);
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const handleCopy = async () => {
    if (filledCount === 0) return fireToast('No scenarios to copy', 'spark');
    try {
      await navigator.clipboard.writeText(exportJSON());
      fireToast(`Copied JSON · ${filledCount} scenario${filledCount === 1 ? '' : 's'}`);
    } catch {
      fireToast('Clipboard blocked by browser', 'spark');
    }
  };

  const handleDownload = () => {
    if (filledCount === 0) return fireToast('No scenarios to export', 'spark');
    const json = exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `panonica-scenarios-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    fireToast(`Downloaded · ${a.download}`);
  };

  const handleShareLink = async () => {
    if (filledCount === 0) return fireToast('No scenarios to share', 'spark');
    const json = exportJSON();
    const encoded = encodeForUrl(json);
    const url = `${window.location.origin}/scenarios#share=${encoded}`;
    try {
      await navigator.clipboard.writeText(url);
      fireToast(`Copied share link · ${(url.length / 1024).toFixed(1)} KB`);
    } catch {
      fireToast('Clipboard blocked · URL too long?', 'spark');
    }
  };

  const handleImportOpen = () => {
    setImportOpen(true);
    setImportText('');
    setTimeout(() => importRef.current?.focus(), 80);
  };

  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    const res = importJSON(importText.trim());
    if (res.ok) {
      fireToast(`Imported ${res.count} scenario${res.count === 1 ? '' : 's'}`);
      setImportOpen(false);
      setImportText('');
    } else {
      fireToast(`Import failed · ${res.error}`, 'spark');
    }
  };

  return (
    <>
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleCopy}
          disabled={filledCount === 0}
          className="inline-flex items-center gap-1.5 rounded-md border border-border-bright bg-surface px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary transition-colors hover:border-pulse hover:text-pulse disabled:opacity-40"
          title="Copy JSON to clipboard"
        >
          <Copy className="h-3 w-3" strokeWidth={1.8} />
          copy
        </button>
        <button
          onClick={handleDownload}
          disabled={filledCount === 0}
          className="inline-flex items-center gap-1.5 rounded-md border border-border-bright bg-surface px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary transition-colors hover:border-pulse hover:text-pulse disabled:opacity-40"
          title="Download as JSON file"
        >
          <Download className="h-3 w-3" strokeWidth={1.8} />
          .json
        </button>
        <button
          onClick={handleShareLink}
          disabled={filledCount === 0}
          className="inline-flex items-center gap-1.5 rounded-md border border-pulse/40 bg-pulse/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-pulse transition-all hover:bg-pulse/15 hover:shadow-glow-pulse disabled:opacity-40"
          title="Copy shareable URL with embedded scenarios"
        >
          <LinkIcon className="h-3 w-3" strokeWidth={1.8} />
          share link
        </button>
        <button
          onClick={handleImportOpen}
          className="inline-flex items-center gap-1.5 rounded-md border border-border-bright bg-surface px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary transition-colors hover:border-agri hover:text-agri"
          title="Paste scenarios JSON to load"
        >
          <Upload className="h-3 w-3" strokeWidth={1.8} />
          import
        </button>
      </div>

      {/* Import modal */}
      {importOpen && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center"
          style={{ background: 'rgba(10,10,11,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setImportOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[min(560px,92vw)] overflow-hidden rounded-xl border border-border-bright bg-surface/95 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-border bg-canvas/60 px-5 py-3">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                <Upload className="h-3.5 w-3.5 text-agri" strokeWidth={1.8} />
                import scenarios
              </div>
              <button
                onClick={() => setImportOpen(false)}
                className="rounded-md border border-border-bright bg-surface p-1.5 text-text-muted transition-colors hover:border-spark hover:text-spark"
              >
                <X className="h-3 w-3" strokeWidth={1.8} />
              </button>
            </div>
            <div className="flex flex-col gap-3 px-5 py-4">
              <p className="font-mono text-[11px] leading-relaxed text-text-secondary">
                Paste scenarios JSON exported from another session. Replaces current A/B/C.
                Share links auto-import on visit.
              </p>
              <textarea
                ref={importRef}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={8}
                spellCheck={false}
                placeholder='{"v":1,"scenarios":{"A":{...},"B":null,"C":null}}'
                className="w-full resize-none rounded-md border border-border-bright bg-canvas px-3 py-2 font-mono text-[11px] text-text-primary outline-none placeholder:text-text-muted focus:border-agri"
              />
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                  {importText.length > 0 ? `${(importText.length / 1024).toFixed(1)} KB pasted` : '\u00A0'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setImportOpen(false)}
                    className="rounded-md border border-border-bright bg-surface px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted transition-colors hover:text-text-secondary"
                  >
                    cancel
                  </button>
                  <button
                    onClick={handleImportSubmit}
                    disabled={!importText.trim()}
                    className="inline-flex items-center gap-1.5 rounded-md border border-agri/40 bg-agri/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-agri transition-colors hover:bg-agri/20 disabled:opacity-40"
                  >
                    <Check className="h-3 w-3" strokeWidth={2} />
                    load
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={cn(
            'fixed bottom-6 left-1/2 z-[97] -translate-x-1/2 rounded-md border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] backdrop-blur',
            toastTone === 'agri' ? 'border-agri/40 bg-agri/15 text-agri' : 'border-spark/40 bg-spark/15 text-spark',
          )}
        >
          <Check className="mr-2 inline h-3 w-3" strokeWidth={2.5} />
          {toast}
        </div>
      )}
    </>
  );
}
