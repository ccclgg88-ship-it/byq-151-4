import { useMemo } from 'react';
import type { AttachmentCategory, AttachmentFile } from '@/types/employee';

interface FileCategoryTabsProps {
  activeCategory: AttachmentCategory;
  attachments: AttachmentFile[];
  onCategoryChange: (category: AttachmentCategory) => void;
}

const CATEGORIES: AttachmentCategory[] = [
  '身份证',
  '学历证书',
  '离职证明',
  '其他',
];

export function FileCategoryTabs({
  activeCategory,
  attachments,
  onCategoryChange,
}: FileCategoryTabsProps) {
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORIES.forEach((c) => {
      counts[c] = attachments.filter((a) => a.category === c).length;
    });
    return counts;
  }, [attachments]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {CATEGORIES.map((category) => {
        const isActive = activeCategory === category;
        const count = categoryCounts[category] || 0;
        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-indigo-700 text-white shadow-md shadow-indigo-500/30 scale-105'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50'
            }`}
          >
            <span>{category}</span>
            <span
              className={`min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
