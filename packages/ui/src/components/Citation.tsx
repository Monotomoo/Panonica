import type { ReactNode } from 'react';
import { cn } from '../cn';

export interface CitationProps {
  index: number;
  children?: ReactNode;
  href?: string;
  className?: string;
}

/**
 * Wikipedia-style numbered footnote badge.
 * Used throughout Concessio source lists and the Kupari dossier.
 */
export function Citation({ index, children, href, className }: CitationProps) {
  const content = (
    <sup
      className={cn(
        'ml-0.5 inline-flex h-[1.25em] items-center rounded-sm px-1 font-mono text-[10px] tracking-tight',
        'bg-surface-raised text-text-secondary transition-colors',
        'hover:bg-pulse/15 hover:text-pulse',
        className,
      )}
    >
      [{index}]{children ? <span className="ml-1">{children}</span> : null}
    </sup>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="no-underline">
        {content}
      </a>
    );
  }
  return content;
}
