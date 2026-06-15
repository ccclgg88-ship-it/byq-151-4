import { Eye } from 'lucide-react';
import dayjs from 'dayjs';
import type { ContractRecord, ContractStatus } from '@/types/employee';
import { computeContractStatus, formatDate } from '@/utils/dateUtils';

interface ContractTableProps {
  contracts: ContractRecord[];
  onRowClick: (contract: ContractRecord) => void;
}

const STATUS_STYLES: Record<ContractStatus, string> = {
  生效中: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  即将到期: 'bg-amber-50 text-amber-700 border-amber-200',
  已过期: 'bg-slate-100 text-slate-600 border-slate-200',
  已解除: 'bg-rose-50 text-rose-700 border-rose-200',
};

export function ContractTable({ contracts, onRowClick }: ContractTableProps) {
  if (contracts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-16 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-slate-600 font-medium">暂无合同记录</p>
        <p className="text-slate-400 text-sm mt-1">编辑模式下可新增合同</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">合同编号</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">类型</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">起止日期</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">签约主体</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contracts.map((contract) => {
              const { status, daysLeft } = computeContractStatus(contract);
              const isExpiringSoon = status === '即将到期';
              return (
                <tr
                  key={contract.id}
                  onClick={() => onRowClick(contract)}
                  className={`group cursor-pointer transition-all duration-200 ${
                    isExpiringSoon
                      ? 'bg-amber-50/60 hover:bg-amber-50'
                      : 'hover:bg-indigo-50/40'
                  }`}
                >
                  <td className="px-5 py-4">
                    <span className="font-mono text-sm font-semibold text-slate-800">
                      {contract.contractNo}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {contract.type}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm text-slate-700">
                      {formatDate(contract.startDate)} ~ {formatDate(contract.endDate)}
                    </div>
                    {isExpiringSoon && daysLeft > 0 && (
                      <div className="mt-1 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-xs font-medium text-amber-700">还剩 {daysLeft} 天</span>
                      </div>
                    )}
                    {status === '已过期' && (
                      <div className="mt-1 text-xs text-slate-500">
                        过期 {Math.abs(daysLeft)} 天
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-slate-700">{contract.signParty}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[status]}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowClick(contract);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all duration-200 border border-transparent hover:border-slate-200"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        查看
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
