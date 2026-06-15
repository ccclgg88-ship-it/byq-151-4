import { useState, useMemo, useRef, useEffect, type ReactNode } from 'react';
import { UserCircle2, FileSignature, GitBranchHorizontal, Paperclip } from 'lucide-react';
import type { TabKey } from '@/types/employee';

interface TabItem {
  key: TabKey;
  label: string;
  icon: typeof UserCircle2;
  badge?: number | string;
  content: ReactNode;
}

interface TabContainerProps {
  tabs: Omit<TabItem, 'icon'>[];
}

const ICON_MAP: Record<TabKey, typeof UserCircle2> = {
  basic: UserCircle2,
  contract: FileSignature,
  change: GitBranchHorizontal,
  attachment: Paperclip,
};

export function TabContainer({ tabs }: TabContainerProps) {
  const [active, setActive] = useState<TabKey>('basic');
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const tabRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({} as Record<TabKey, HTMLButtonElement | null>);
  const navRef = useRef<HTMLDivElement>(null);

  const enrichedTabs: TabItem[] = useMemo(
    () => tabs.map((t) => ({ ...t, icon: ICON_MAP[t.key] })),
    [tabs]
  );

  useEffect(() => {
    const el = tabRefs.current[active];
    if (el && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      setIndicator({
        left: rect.left - navRect.left,
        width: rect.width,
      });
    }
  }, [active, tabs]);

  useEffect(() => {
    const handler = () => {
      const el = tabRefs.current[active];
      if (el && navRef.current) {
        const navRect = navRef.current.getBoundingClientRect();
        const rect = el.getBoundingClientRect();
        setIndicator({
          left: rect.left - navRect.left,
          width: rect.width,
        });
      }
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [active]);

  return (
    <div className="w-full">
      <nav
        ref={navRef}
        className="relative flex items-center gap-1 px-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto"
      >
        {enrichedTabs.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              ref={(el) => (tabRefs.current[t.key] = el)}
              onClick={() => setActive(t.key)}
              className={`relative z-10 shrink-0 flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-colors ${
                isActive ? 'text-indigo-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              <span>{t.label}</span>
              {t.badge !== undefined && (
                <span
                  className={`shrink-0 min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-bold flex items-center justify-center ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
        <div
          className="absolute bottom-0 h-[3px] rounded-t bg-gradient-to-r from-indigo-600 to-indigo-500 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ left: indicator.left, width: indicator.width }}
        />
      </nav>

      <div className="mt-5 w-full">
        {enrichedTabs.map((t) => (
          <div
            key={t.key}
            style={{
              display: active === t.key ? 'block' : 'none',
            }}
            className="animate-[fadeInUp_0.3s_ease-out]"
          >
            {t.content}
          </div>
        ))}
      </div>
    </div>
  );
}
