import { useEffect } from 'react';
import { X, FileText, Calendar, Building2, Hash, StickyNote } from 'lucide-react';
import type { ContractRecord, ContractStatus } from '@/types/employee';
import { computeContractStatus, formatDateCN } from '@/utils/dateUtils';

interface ContractDetailModalProps {
  contract: ContractRecord;
  onClose: () => void;
}

const STATUS_STYLES: Record<ContractStatus, string> = {
  生效中: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100',
  即将到期: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-100',
  已过期: 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-100',
  已解除: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-100',
};

export function ContractDetailModal({ contract, onClose }: ContractDetailModalProps) {
  const { status, daysLeft } = computeContractStatus(contract);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const fieldItems = [
    { icon: Hash, label: '合同编号', value: contract.contractNo, mono: true },
    { icon: FileText, label: '合同类型', value: contract.type },
    { icon: Calendar, label: '开始日期', value: formatDateCN(contract.startDate) },
    { icon: Calendar, label: '结束日期', value: formatDateCN(contract.endDate) },
    { icon: Building2, label: '签约主体', value: contract.signParty },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-slate-900/10 animate-[modalIn_0.25s_ease-out] overflow-hidden"
      >
        <div className="relative px-7 pt-7 pb-5 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-800">合同详情</h3>
              <p className="text-sm text-slate-500 mt-1">
                {contract.type} · {contract.contractNo}
              </p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold border ring-4 ${STATUS_STYLES[status]}`}>
              {status}
            </span>
            {status === '即将到期' && daysLeft > 0 && (
              <span className="text-sm font-medium text-amber-700">
                距离到期还有 {daysLeft} 天
              </span>
            )}
            {status === '已过期' && (
              <span className="text-sm font-medium text-slate-500">
                已过期 {Math.abs(daysLeft)} 天
              </span>
            )}
          </div>
        </div>

        <div className="px-7 py-6 space-y-5">
          <div className="grid grid-cols-1 gap-4">
            {fieldItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/60 hover:bg-slate-50 transition-colors duration-200"
                >
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      {item.label}
                    </div>
                    <div className={`mt-1 text-sm font-semibold text-slate-800 ${item.mono ? 'font-mono' : ''}`}>
                      {item.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {contract.remark && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/40 border border-amber-100/80">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 rounded-xl bg-white shadow-sm border border-amber-100 flex items-center justify-center">
                  <StickyNote className="w-4.5 h-4.5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                    备注说明
                  </div>
                  <div className="mt-1.5 text-sm text-amber-900 leading-relaxed">
                    {contract.remark}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-7 py-5 bg-slate-50/60 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all duration-200 active:scale-[0.98]"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
