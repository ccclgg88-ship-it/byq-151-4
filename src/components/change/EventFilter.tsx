import { useEmployeeStore } from '@/store/useEmployeeStore';
import type { EventType } from '@/types/employee';

interface EventFilterProps {
  eventCounts: Record<string, number>;
}

const FILTER_TABS: Array<{ key: EventType | 'all'; label: string }[]> = [
  [
    { key: 'all', label: '全部' },
    { key: '入职', label: '入职' },
    { key: '转正', label: '转正' },
    { key: '调岗', label: '调岗' },
    { key: '晋升', label: '晋升' },
    { key: '降职', label: '降职' },
    { key: '离职', label: '离职' },
    { key: '薪资调整', label: '薪资调整' },
    { key: '其他', label: '其他' },
  ],
];

const ALL_FILTERS: Array<{ key: EventType | 'all'; label: string }> = FILTER_TABS[0];

export function EventFilter({ eventCounts }: EventFilterProps) {
  const { activeEventFilter, setActiveEventFilter } = useEmployeeStore();

  return (
    <div className="flex flex-wrap gap-2">
      {ALL_FILTERS.map((tab) => {
        const isActive = activeEventFilter === tab.key;
        const count = eventCounts[tab.key] ?? 0;
        const isEmpty = count === 0 && tab.key !== 'all';
        return (
          <button
            key={tab.key}
            onClick={() => setActiveEventFilter(tab.key)}
            disabled={isEmpty}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200
              ${isActive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : isEmpty
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md hover:shadow-indigo-100'
              }
            `}
          >
            <span>{tab.label}</span>
            <span
              className={`
                inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-bold transition-colors duration-200
                ${isActive
                  ? 'bg-white/25 text-white'
                  : isEmpty
                    ? 'bg-slate-200 text-slate-400'
                    : 'bg-slate-100 text-slate-500'
                }
              `}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
