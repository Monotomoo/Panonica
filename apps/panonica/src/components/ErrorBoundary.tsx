import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, ArrowLeft, Clipboard, RefreshCw } from 'lucide-react';
import { cn } from '@paladian/ui';

/**
 * ErrorBoundary — the demo-day safety net.
 *
 * A crash inside any wrapped subtree renders a branded fallback instead of
 * taking down the entire app. Keeps the shell (nav + palette + Mission
 * Control + Deal Room modal) intact so Tomo can recover gracefully.
 *
 * Usage:
 *   <ErrorBoundary scope="route" label="Finance">
 *     <RoiRoute />
 *   </ErrorBoundary>
 */

interface Props {
  children: ReactNode;
  /** Human label shown in the fallback · e.g. "Builder", "Finance" */
  label?: string;
  /** Optional classification affecting the visual accent */
  scope?: 'route' | 'overlay' | 'widget';
  /** Fires when the boundary catches an error · for telemetry hooks later */
  onCatch?: (err: Error, info: ErrorInfo) => void;
}

interface State {
  error: Error | null;
  info: ErrorInfo | null;
  resetKey: number;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: null, resetKey: 0 };

  static getDerivedStateFromError(err: Error): Partial<State> {
    return { error: err };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error(`[ErrorBoundary${this.props.label ? ' · ' + this.props.label : ''}]`, err, info);
    this.setState({ info });
    this.props.onCatch?.(err, info);
  }

  reset = () => {
    this.setState({ error: null, info: null, resetKey: this.state.resetKey + 1 });
  };

  copyReport = async () => {
    const { error, info } = this.state;
    if (!error) return;
    const report = [
      `Panonica ErrorBoundary · ${this.props.label ?? 'unknown'}`,
      `When: ${new Date().toISOString()}`,
      `Message: ${error.message}`,
      ``,
      `Stack:`,
      error.stack ?? '(no stack)',
      ``,
      `Component stack:`,
      info?.componentStack ?? '(no component stack)',
      ``,
      `Route: ${typeof window !== 'undefined' ? window.location.pathname : '?'}`,
      `UA: ${typeof navigator !== 'undefined' ? navigator.userAgent : '?'}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(report);
    } catch {
      /* clipboard blocked */
    }
  };

  render() {
    const { error } = this.state;
    const { children, label = 'this section', scope = 'route' } = this.props;

    if (!error) return <span key={this.state.resetKey}>{children}</span>;

    return (
      <div className={cn(
        'flex min-h-[420px] flex-col items-center justify-center gap-5 px-8 py-12',
        scope === 'overlay' ? 'fixed inset-0 z-[150] bg-canvas/95 backdrop-blur-2xl' : '',
      )}>
        <div className="flex max-w-[520px] flex-col items-center gap-5 text-center">
          <div className="flex items-center justify-center">
            <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-spark/50 bg-spark/10">
              <AlertTriangle className="h-6 w-6 text-spark" strokeWidth={1.6} />
              <span className="absolute inset-0 animate-ping rounded-full border border-spark/30" />
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-text-muted">
              panonica · error boundary caught a crash
            </span>
            <h2 className="font-display text-2xl uppercase tracking-tech-tight text-spark">
              {label} hit a snag
            </h2>
            <p className="font-mono text-[11px] leading-relaxed text-text-secondary">
              The shell is still alive · nav / command palette / mission control all work.
              Try again, or skip to another section.
            </p>
          </div>

          <div className="rounded-md border border-border bg-surface/40 p-3">
            <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
              error
            </div>
            <code className="block break-words font-mono text-[10px] leading-relaxed text-text-primary">
              {error.message || String(error)}
            </code>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={this.reset}
              className="inline-flex items-center gap-2 rounded-md border border-pulse/40 bg-pulse/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-pulse transition-colors hover:bg-pulse/20"
            >
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.8} />
              retry
            </button>
            <button
              onClick={() => {
                window.location.href = '/';
              }}
              className="inline-flex items-center gap-2 rounded-md border border-border-bright bg-surface/60 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary transition-colors hover:border-pulse hover:text-pulse"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
              back to hero
            </button>
            <button
              onClick={this.copyReport}
              className="inline-flex items-center gap-2 rounded-md border border-border-bright bg-surface/60 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted transition-colors hover:border-agri hover:text-agri"
              title="Copy a full error report to clipboard"
            >
              <Clipboard className="h-3.5 w-3.5" strokeWidth={1.8} />
              copy report
            </button>
          </div>

          <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
            <span>press</span>
            <kbd className="rounded border border-border-bright bg-surface px-1.5 py-0.5">⌘K</kbd>
            <span>to jump anywhere</span>
          </div>
        </div>
      </div>
    );
  }
}
