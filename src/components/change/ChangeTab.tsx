import { useMemo } from 'react';
import { EventFilter } from './EventFilter';
import { EventTimeline } from './EventTimeline';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import type { ChangeRecord } from '@/types/employee';

export function ChangeTab() {
  const { profile, activeEventFilter } = useEmployeeStore();
  const allChanges = profile?.changes ?? [];

  const filteredChanges = useMemo(() => {
    const sorted = [...allChanges].sort(
      (a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
    );
    if (activeEventFilter === 'all') return sorted;
    return sorted.filter((c) => c.eventType === activeEventFilter);
  }, [allChanges, activeEventFilter]);

  const eventCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allChanges.length };
    allChanges.forEach((c: ChangeRecord) => {
      counts[c.eventType] = (counts[c.eventType] || 0) + 1;
    });
    return counts;
  }, [allChanges]);

  return (
    <div className="w-full">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-800">异动记录</h2>
        <p className="text-sm text-slate-500 mt-1">
          共 {allChanges.length} 条记录，当前显示 {filteredChanges.length} 条
        </p>
      </div>

      <div className="mb-6">
        <EventFilter eventCounts={eventCounts} />
      </div>

      <EventTimeline changes={filteredChanges} />
    </div>
  );
}
