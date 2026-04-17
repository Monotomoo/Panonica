import type { ReactNode } from 'react';
import { cn } from '../cn';

export interface ShellProps {
  statusBar: ReactNode;
  sideNav?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Persistent app shell. Panonica uses the sideNav slot; Concessio renders
 * without it for a cleaner editorial canvas.
 */
export function Shell({ statusBar, sideNav, children, className }: ShellProps) {
  return (
    <div className={cn('flex h-screen w-screen flex-col bg-canvas text-text-primary', className)}>
      {statusBar}
      <div className="flex min-h-0 flex-1">
        {sideNav}
        <main className="relative flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
