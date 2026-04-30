import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUp,
  MessageCircleQuestion,
  Settings2,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { cn } from '@paladian/ui';
import { useConfigStore } from '@/store/configStore';
import {
  AI_PATTERNS,
  DEFAULT_SUGGESTIONS,
  FALLBACK_RESPONSE,
  matchPrompt,
  type AiAction,
  type AiResponse,
} from '@/mock/ai';

interface Exchange {
  id: number;
  role: 'user' | 'assistant';
  prompt?: string;
  response?: AiResponse;
  typedParagraphs?: number; // how many paragraphs have been revealed
}

/**
 * AI Assist drawer. Slide-in from the right.
 * Opens on:
 *   - Floating action button (FAB, bottom-right)
 *   - 'panonica:ai-open' window event (fired from Command Palette)
 *   - Keyboard shortcut (handled globally elsewhere · Cmd+/ reserved for later)
 *
 * Responds via pure pattern-match in mock/ai.ts. Supports actions that
 * mutate the configurator store (e.g. "double battery" bumps slider).
 */
export function AiAssist() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [thread, setThread] = useState<Exchange[]>([]);
  const [nextId, setNextId] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const configStore = useConfigStore();
  const setConfig = useConfigStore((s) => s.set);
  const setScenario = useConfigStore((s) => s.setScenario);

  // Open on event
  useEffect(() => {
    const h = (e: Event) => {
      const detail = (e as CustomEvent<{ prompt?: string }>).detail;
      setOpen(true);
      if (detail?.prompt) {
        setInput(detail.prompt);
        setTimeout(() => handleSubmit(detail.prompt!), 120);
      }
    };
    window.addEventListener('panonica:ai-open', h as EventListener);
    return () => window.removeEventListener('panonica:ai-open', h as EventListener);
  }, []);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open]);

  // Auto-scroll
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread]);

  const applyActions = (actions?: AiAction[]) => {
    if (!actions) return;
    for (const a of actions) {
      switch (a.kind) {
        case 'setCapacity':
          setConfig('capacityMW', a.value);
          break;
        case 'setBattery':
          setConfig('battery', a.value);
          break;
        case 'setTracking':
          setConfig('tracking', a.value);
          break;
        case 'setUnderPanel':
          setConfig('underPanel', a.value);
          break;
        case 'setScenario':
          setScenario(a.value);
          break;
        case 'navigate':
          navigate(a.path);
          break;
      }
    }
  };

  const handleSubmit = (overridePrompt?: string) => {
    const prompt = (overridePrompt ?? input).trim();
    if (!prompt) return;

    const userEx: Exchange = { id: nextId, role: 'user', prompt };
    const res = matchPrompt(prompt, configStore);
    const assistantEx: Exchange = {
      id: nextId + 1,
      role: 'assistant',
      response: res,
      typedParagraphs: 0,
    };

    setThread((t) => [...t, userEx, assistantEx]);
    setNextId((n) => n + 2);
    setInput('');

    // Apply any state mutations immediately
    applyActions(res.actions);

    // Reveal paragraphs progressively
    res.paragraphs.forEach((_, idx) => {
      setTimeout(() => {
        setThread((t) =>
          t.map((e) =>
            e.id === assistantEx.id
              ? { ...e, typedParagraphs: Math.max(e.typedParagraphs ?? 0, idx + 1) }
              : e,
          ),
        );
      }, 280 + idx * 700);
    });
  };

  const handleReset = () => {
    setThread([]);
    setInput('');
  };

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setOpen(true)}
            className="group fixed bottom-6 right-6 z-[80] inline-flex items-center gap-2 rounded-full border border-pulse/40 bg-surface/90 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-pulse shadow-glow-pulse backdrop-blur transition-all hover:bg-pulse/10 hover:shadow-[0_0_24px_rgba(124,92,255,0.5)]"
            title="Ask Panonica AI · Cmd+K → 'Ask AI'"
          >
            <Sparkles className="h-4 w-4 animate-pulse-dot" strokeWidth={1.8} />
            <span>Ask AI</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[90]"
            onClick={() => setOpen(false)}
          >
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(10, 10, 11, 0.5)', backdropFilter: 'blur(6px)' }}
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 flex h-full w-[min(480px,94vw)] flex-col border-l border-border bg-surface/95 shadow-2xl backdrop-blur-2xl"
              style={{ boxShadow: '-20px 0 60px -20px rgba(124, 92, 255, 0.35)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border bg-canvas/70 px-5 py-4 backdrop-blur">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-pulse" strokeWidth={1.8} />
                  <div className="flex flex-col">
                    <span className="font-display text-sm uppercase tracking-tech-tight text-text-primary">
                      Panonica AI
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                      deal-aware · deterministic · scripted for demo
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {thread.length > 0 && (
                    <button
                      onClick={handleReset}
                      className="rounded-md border border-border-bright bg-surface px-2 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted transition-colors hover:border-spark hover:text-spark"
                    >
                      clear
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-md border border-border-bright bg-surface p-1.5 text-text-muted transition-colors hover:border-pulse hover:text-pulse"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={1.8} />
                  </button>
                </div>
              </div>

              {/* Thread */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
                {thread.length === 0 && (
                  <div className="flex h-full flex-col justify-between gap-6">
                    <div className="flex flex-col gap-3 pt-4">
                      <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.24em] text-text-muted">
                        <MessageCircleQuestion className="h-3 w-3 text-pulse" strokeWidth={1.8} />
                        try asking
                      </div>
                      <div className="flex flex-col gap-2">
                        {DEFAULT_SUGGESTIONS.map((s, i) => (
                          <motion.button
                            key={s}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 + i * 0.04 }}
                            onClick={() => handleSubmit(s)}
                            className="group flex items-center gap-2 rounded-md border border-border bg-surface/50 px-3 py-2 text-left font-mono text-[11px] text-text-secondary transition-all hover:border-pulse hover:bg-pulse/5 hover:text-pulse"
                          >
                            <Sparkles className="h-3 w-3 shrink-0 text-text-muted transition-colors group-hover:text-pulse" strokeWidth={1.8} />
                            {s}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-md border border-border bg-surface/30 p-4 font-mono text-[10px] leading-relaxed text-text-muted">
                      <span className="text-text-primary">Demo mode · scripted responses.</span>
                      <br />
                      Each answer cites real project numbers, triggers live configurator changes
                      when relevant ("double battery" actually moves the slider), and suggests
                      follow-up questions. In production this binds to a Claude API key.
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-5">
                  {thread.map((ex) => (
                    <div key={ex.id} className={cn('flex gap-3', ex.role === 'user' && 'flex-row-reverse')}>
                      <div
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                          ex.role === 'user' ? 'bg-surface-raised text-text-secondary' : 'bg-pulse/15 text-pulse',
                        )}
                      >
                        {ex.role === 'user' ? (
                          <User className="h-3.5 w-3.5" strokeWidth={1.8} />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
                        )}
                      </div>

                      <div className={cn('flex flex-1 flex-col gap-2', ex.role === 'user' && 'items-end')}>
                        {ex.role === 'user' && ex.prompt && (
                          <div className="rounded-md border border-border bg-surface/60 px-3 py-2 font-mono text-[12px] text-text-primary">
                            {ex.prompt}
                          </div>
                        )}

                        {ex.role === 'assistant' && ex.response && (
                          <div className="flex flex-col gap-3">
                            {ex.response.paragraphs.slice(0, ex.typedParagraphs ?? 0).map((p, pi) => (
                              <motion.p
                                key={pi}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="font-mono text-[12px] leading-relaxed text-text-secondary"
                              >
                                {p}
                              </motion.p>
                            ))}

                            {(ex.typedParagraphs ?? 0) < ex.response.paragraphs.length && (
                              <motion.span
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.2, repeat: Infinity }}
                                className="font-mono text-[10px] uppercase tracking-[0.22em] text-pulse"
                              >
                                thinking…
                              </motion.span>
                            )}

                            {(ex.typedParagraphs ?? 0) === ex.response.paragraphs.length && (
                              <>
                                {ex.response.actions && ex.response.actions.length > 0 && (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-2 rounded-md border border-agri/30 bg-agri/5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-agri"
                                  >
                                    <Settings2 className="h-3 w-3" strokeWidth={1.8} />
                                    <span>applied · {ex.response.actions.length} configurator {ex.response.actions.length === 1 ? 'change' : 'changes'}</span>
                                  </motion.div>
                                )}

                                {ex.response.citations && ex.response.citations.length > 0 && (
                                  <div className="flex flex-col gap-1">
                                    {ex.response.citations.map((c, ci) => (
                                      <span
                                        key={ci}
                                        className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted"
                                      >
                                        † {c}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {ex.response.followUps && ex.response.followUps.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {ex.response.followUps.map((f) => (
                                      <button
                                        key={f}
                                        onClick={() => handleSubmit(f)}
                                        className="rounded-sm border border-border bg-surface/50 px-2.5 py-1 font-mono text-[10px] text-text-secondary transition-colors hover:border-pulse hover:text-pulse"
                                      >
                                        {f}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="border-t border-border bg-canvas/70 p-3 backdrop-blur">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                  }}
                  className="flex items-center gap-2 rounded-md border border-border-bright bg-surface px-3 py-2 transition-colors focus-within:border-pulse"
                >
                  <input
                    autoFocus
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about the deal, the model, the risk…"
                    className="flex-1 border-0 bg-transparent font-mono text-[12px] text-text-primary outline-none placeholder:text-text-muted"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-pulse/15 text-pulse transition-all hover:bg-pulse/25 disabled:opacity-40"
                  >
                    <ArrowUp className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </form>
                <div className="mt-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                  <span>
                    {AI_PATTERNS.length} patterns · deterministic · demo-safe
                  </span>
                  <span>
                    esc to close
                  </span>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
