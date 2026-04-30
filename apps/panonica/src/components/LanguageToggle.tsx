import { useLangStore } from '@/store/langStore';
import { cn } from '@paladian/ui';

/**
 * EN ↔ HR flag-style toggle. Mounts in StatusBar rightSlot. Only affects
 * Ivan-facing screens: Hero / Thesis / Deal Room.
 */
export function LanguageToggle() {
  const lang = useLangStore((s) => s.lang);
  const toggle = useLangStore((s) => s.toggle);
  return (
    <button
      onClick={toggle}
      title={lang === 'en' ? 'Switch to Croatian · Ivan-facing screens' : 'Prebaci na engleski · Ivan-facing screens'}
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border border-border-bright bg-surface/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] transition-colors hover:border-pulse',
        lang === 'hr' ? 'text-agri' : 'text-text-muted hover:text-pulse',
      )}
    >
      <span className={cn('tabular-nums', lang === 'en' ? 'text-text-primary' : 'opacity-50')}>
        en
      </span>
      <span className="opacity-50">·</span>
      <span className={cn('tabular-nums', lang === 'hr' ? 'text-text-primary' : 'opacity-50')}>
        hr
      </span>
    </button>
  );
}
