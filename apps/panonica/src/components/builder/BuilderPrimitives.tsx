/**
 * Shared form primitives for the Builder IDE.
 * Compact, dense, technical-feeling. No emojis. All inputs live-bind to Zustand.
 */

import type { ReactNode } from 'react';
import { cn } from '@paladian/ui';

/* ========================== FIELD CONTAINER =========================== */

export function Field({ label, unit, hint, required, children }: { label: string; unit?: string; hint?: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          {label}{required && <span className="ml-1 text-spark">*</span>}
        </span>
        {unit && (
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
            {unit}
          </span>
        )}
      </div>
      {children}
      {hint && (
        <span className="font-mono text-[9px] leading-relaxed text-text-muted">
          {hint}
        </span>
      )}
    </label>
  );
}

/* ============================== NUMERIC =============================== */

export function NumInput({ value, onChange, min, max, step, placeholder, size = 'md', tone = 'default' }: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'default' | 'pulse' | 'sun' | 'agri' | 'signal';
}) {
  const sizeCls = { sm: 'h-7 text-[11px]', md: 'h-8 text-[12px]', lg: 'h-9 text-sm' }[size];
  const toneCls = {
    default: 'border-border-bright focus:border-pulse',
    pulse: 'border-pulse/40 text-pulse',
    sun: 'border-sun/40 text-sun',
    agri: 'border-agri/40 text-agri',
    signal: 'border-signal/40 text-signal',
  }[tone];
  return (
    <input
      type="number"
      value={Number.isFinite(value) ? value : 0}
      min={min}
      max={max}
      step={step ?? 0.01}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      placeholder={placeholder}
      className={cn(
        'w-full rounded-sm border bg-canvas px-2.5 font-mono tabular-nums text-text-primary outline-none transition-colors',
        sizeCls,
        toneCls,
      )}
    />
  );
}

/* ============================== TEXT ================================= */

export function TextInput({ value, onChange, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-sm border border-border-bright bg-canvas px-2.5 py-1.5 font-mono text-[12px] text-text-primary outline-none transition-colors focus:border-pulse"
    />
  );
}

/* ============================== SELECT =============================== */

export function Select<T extends string>({ value, onChange, options }: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="w-full rounded-sm border border-border-bright bg-canvas px-2 py-1.5 font-mono text-[11px] text-text-primary outline-none focus:border-pulse"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/* ============================ SEGMENTED ============================== */

export function Segmented<T extends string>({ value, onChange, options, size = 'md' }: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  size?: 'sm' | 'md';
}) {
  const sizeCls = size === 'sm' ? 'px-2 py-1 text-[9px]' : 'px-3 py-1.5 text-[10px]';
  return (
    <div className="flex gap-0.5 rounded-sm border border-border bg-surface/60 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'flex-1 rounded-sm font-mono uppercase tracking-[0.18em] transition-colors',
            sizeCls,
            value === o.value ? 'bg-pulse/15 text-pulse' : 'text-text-secondary hover:bg-surface hover:text-text-primary',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ============================= TOGGLE ================================ */

export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        'inline-flex items-center gap-2 rounded-sm border bg-canvas px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors',
        value ? 'border-agri/40 text-agri bg-agri/5' : 'border-border-bright text-text-muted hover:text-text-secondary',
      )}
    >
      <span className={cn('inline-block h-1.5 w-1.5 rounded-full', value ? 'bg-agri shadow-[0_0_4px_rgb(74_222_128)]' : 'bg-border-bright')} />
      {label ?? (value ? 'enabled' : 'disabled')}
    </button>
  );
}

/* ============================== CHIPS ================================ */

export function ChipGroup<T extends string>({ value, onChange, options }: {
  value: T[];
  onChange: (v: T[]) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => {
        const active = value.includes(o.value);
        return (
          <button
            key={o.value}
            onClick={() => {
              if (active) onChange(value.filter((x) => x !== o.value));
              else onChange([...value, o.value]);
            }}
            className={cn(
              'inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] transition-colors',
              active ? 'border-pulse/40 bg-pulse/10 text-pulse' : 'border-border-bright bg-surface/60 text-text-muted hover:text-text-secondary',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ============================ SECTION BODY ============================= */

export function SectionBody({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto px-8 py-8">
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h2 className="font-display text-2xl uppercase tracking-tech-tight text-text-primary">
          {title}
        </h2>
        {subtitle && (
          <p className="font-mono text-[11px] text-text-secondary">{subtitle}</p>
        )}
      </div>
      <div className="flex flex-col gap-6">{children}</div>
    </div>
  );
}

export function FieldRow({ children, cols = 2 }: { children: ReactNode; cols?: 1 | 2 | 3 | 4 }) {
  const gridCls = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' }[cols];
  return (
    <div className={cn('grid gap-4', gridCls)}>
      {children}
    </div>
  );
}

export function FieldGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-md border border-border bg-surface/30 p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-pulse">
        {title}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

/* ============================ DERIVED DISPLAY ========================== */

export function Derived({ label, value, sub, tone = 'default' }: {
  label: string;
  value: string;
  sub?: string;
  tone?: 'default' | 'pulse' | 'sun' | 'agri' | 'signal' | 'spark';
}) {
  const toneCls = {
    default: 'text-text-primary',
    pulse: 'text-pulse',
    sun: 'text-sun',
    agri: 'text-agri',
    signal: 'text-signal',
    spark: 'text-spark',
  }[tone];
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-dashed border-border bg-canvas/40 px-3 py-2">
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
        {label}
      </span>
      <span className={cn('font-mono text-sm tabular-nums', toneCls)}>{value}</span>
      {sub && (
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
          {sub}
        </span>
      )}
    </div>
  );
}
