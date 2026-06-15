import { Timeline } from 'antd';
import { Calendar, User, StickyNote, ArrowRight } from 'lucide-react';
import type { ChangeRecord, EventType } from '@/types/employee';
import { formatDateCN, getRelativeDateLabel } from '@/utils/dateUtils';

interface EventTimelineProps {
  changes: ChangeRecord[];
}

const EVENT_COLORS: Record<EventType, { dot: string; bg: string; border: string; text: string }> = {
  入职: {
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    text: 'text-emerald-700',
  },
  转正: {
    dot: 'bg-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    text: 'text-blue-700',
  },
  调岗: {
    dot: 'bg-purple-500',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    text: 'text-purple-700',
  },
  晋升: {
    dot: 'bg-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    text: 'text-amber-700',
  },
  降职: {
    dot: 'bg-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    text: 'text-orange-700',
  },
  离职: {
    dot: 'bg-rose-500',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    text: 'text-rose-700',
  },
  薪资调整: {
    dot: 'bg-teal-500',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    text: 'text-teal-700',
  },
  其他: {
    dot: 'bg-slate-400',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-600',
  },
};

export function EventTimeline({ changes }: EventTimelineProps) {
  if (changes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-16 text-center">
        <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
          <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-slate-700 font-semibold text-base">暂无符合条件的异动记录</p>
        <p className="text-slate-400 text-sm mt-1.5">请尝试切换筛选条件查看其他类型的记录</p>
      </div>
    );
  }

  const timelineItems = changes.map((change, index) => {
    const colors = EVENT_COLORS[change.eventType];
    const isLast = index === changes.length - 1;

    return {
      key: change.id,
      dot: (
        <div
          className={`relative -left-0.5 w-5 h-5 rounded-full ${colors.dot} ring-4 ring-white shadow-lg shadow-slate-900/5 flex items-center justify-center`}
        >
          <div className="w-2 h-2 rounded-full bg-white/80" />
        </div>
      ),
      children: (
        <div className={`pb-8 ${isLast ? 'pb-0' : ''}`}>
          <div className={`ml-4 p-5 rounded-2xl ${colors.bg} border ${colors.border} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className={`text-lg font-bold ${colors.text} flex items-center gap-2`}>
                  {change.eventType}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDateCN(change.effectiveDate)}</span>
                  </div>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-400 font-medium">
                    {getRelativeDateLabel(change.effectiveDate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/80 rounded-xl p-4 mb-3 border border-white">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
                {change.fieldName}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium line-through decoration-slate-400">
                  {change.oldValue}
                </span>
                <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                  <ArrowRight className={`w-4 h-4 ${colors.text}`} />
                </div>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg ${colors.bg} ${colors.text} text-sm font-bold border ${colors.border}`}>
                  {change.newValue}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-4 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium">{change.operator}</span>
              </div>
              {change.remark && (
                <div className="flex items-start gap-1.5 text-slate-500 flex-1 min-w-[200px]">
                  <StickyNote className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{change.remark}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    };
  });

  return (
    <div className="relative">
      <div className="absolute left-2.5 top-2 bottom-2 w-0.5 rounded-full bg-gradient-to-b from-indigo-500 via-indigo-300 to-transparent" />
      <div className="pl-0">
        <Timeline
          items={timelineItems}
          mode="left"
          className="event-timeline"
          style={{ paddingLeft: 0 }}
        />
      </div>
    </div>
  );
}
