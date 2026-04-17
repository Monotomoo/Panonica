import { NavLink } from 'react-router-dom';
import type { ComponentType, SVGProps } from 'react';
import { cn } from '../cn';

export interface SideNavItem {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export interface SideNavProps {
  items: SideNavItem[];
  footer?: React.ReactNode;
  className?: string;
}

export function SideNav({ items, footer, className }: SideNavProps) {
  return (
    <aside
      className={cn(
        'flex h-full w-[208px] shrink-0 flex-col justify-between border-r border-border bg-surface/40',
        className,
      )}
    >
      <nav className="flex flex-col gap-1 p-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-md px-3 py-2 text-[12px] tracking-tight transition-colors',
                isActive
                  ? 'bg-surface-raised text-text-primary'
                  : 'text-text-secondary hover:bg-surface-raised/60 hover:text-text-primary',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute inset-y-1.5 left-0 w-[2px] rounded-r-full bg-pulse shadow-glow-pulse" />
                )}
                <item.icon className="h-4 w-4" strokeWidth={1.75} />
                <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      {footer && (
        <div className="border-t border-border p-4 text-[11px] text-text-muted">{footer}</div>
      )}
    </aside>
  );
}
