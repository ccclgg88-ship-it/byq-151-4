import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ContractTable } from './ContractTable';
import { ContractDetailModal } from './ContractDetailModal';
import { ContractFormModal } from './ContractFormModal';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import type { ContractRecord } from '@/types/employee';

export function ContractTab() {
  const { profile, isEditMode } = useEmployeeStore();
  const [detailContract, setDetailContract] = useState<ContractRecord | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);

  const contracts = profile?.contracts ?? [];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800">合同信息</h2>
          <p className="text-sm text-slate-500 mt-1">
            共 {contracts.length} 份合同记录
          </p>
        </div>
        {isEditMode && (
          <button
            onClick={() => setShowFormModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/30 transition-all duration-200 active:scale-[0.98]"
          >
            <Plus className="w-4.5 h-4.5" />
            新增合同
          </button>
        )}
      </div>

      <ContractTable
        contracts={contracts}
        onRowClick={(contract) => setDetailContract(contract)}
      />

      {detailContract && (
        <ContractDetailModal
          contract={detailContract}
          onClose={() => setDetailContract(null)}
        />
      )}

      {showFormModal && (
        <ContractFormModal
          onClose={() => setShowFormModal(false)}
        />
      )}
    </div>
  );
}
