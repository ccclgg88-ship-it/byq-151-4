import { useState, useEffect } from 'react';
import { X, FileSignature, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { ContractType, ContractStatus } from '@/types/employee';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { todayStr, addYears } from '@/utils/dateUtils';

interface ContractFormModalProps {
  onClose: () => void;
}

const CONTRACT_TYPES: ContractType[] = ['劳动合同', '实习协议', '劳务合同', '续签合同'];
const CONTRACT_STATUSES: ContractStatus[] = ['生效中', '即将到期', '已过期', '已解除'];

interface FormState {
  contractNo: string;
  type: ContractType;
  startDate: string;
  endDate: string;
  signParty: string;
  status: ContractStatus;
  remark: string;
}

interface FormErrors {
  contractNo?: string;
  startDate?: string;
  endDate?: string;
  signParty?: string;
}

export function ContractFormModal({ onClose }: ContractFormModalProps) {
  const { addContract, profile } = useEmployeeStore();
  const [form, setForm] = useState<FormState>({
    contractNo: `HT-${todayStr().replace(/-/g, '')}-${String((profile?.contracts.length ?? 0) + 1).padStart(3, '0')}`,
    type: '劳动合同',
    startDate: todayStr(),
    endDate: addYears(todayStr(), 3),
    signParty: '上海星辰科技有限公司',
    status: '生效中',
    remark: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

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

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.contractNo.trim()) {
      newErrors.contractNo = '请输入合同编号';
    }
    if (!form.startDate) {
      newErrors.startDate = '请选择开始日期';
    }
    if (!form.endDate) {
      newErrors.endDate = '请选择结束日期';
    }
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      newErrors.endDate = '结束日期不能早于开始日期';
    }
    if (!form.signParty.trim()) {
      newErrors.signParty = '请输入签约主体';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!validate()) return;

    addContract({
      contractNo: form.contractNo.trim(),
      type: form.type,
      startDate: form.startDate,
      endDate: form.endDate,
      signParty: form.signParty.trim(),
      status: form.status,
      remark: form.remark.trim() || undefined,
    });
    onClose();
  };

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (submitted) validate();
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 rounded-xl border text-sm text-slate-800 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-4 ${
      hasError
        ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100 bg-rose-50/30'
        : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-100 hover:border-slate-300'
    }`;

  const labelClass = 'block text-sm font-semibold text-slate-700 mb-2';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl shadow-slate-900/10 animate-[modalIn_0.25s_ease-out] overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="relative px-7 pt-7 pb-5 border-b border-slate-100 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-600/20 flex items-center justify-center">
                <FileSignature className="w-5.5 h-5.5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">新增合同</h3>
                <p className="text-sm text-slate-500 mt-0.5">请填写合同基本信息</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-7 py-6">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelClass}>
                  合同编号 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.contractNo}
                  onChange={(e) => updateField('contractNo', e.target.value)}
                  placeholder="如 HT-20240315-001"
                  className={`${inputClass(!!errors.contractNo)} font-mono`}
                />
                {errors.contractNo && (
                  <div className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.contractNo}
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>合同类型</label>
                <select
                  value={form.type}
                  onChange={(e) => updateField('type', e.target.value as ContractType)}
                  className={inputClass(false)}
                >
                  {CONTRACT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>状态</label>
                <select
                  value={form.status}
                  onChange={(e) => updateField('status', e.target.value as ContractStatus)}
                  className={inputClass(false)}
                >
                  {CONTRACT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  开始日期 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => updateField('startDate', e.target.value)}
                  className={inputClass(!!errors.startDate)}
                />
                {errors.startDate && (
                  <div className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.startDate}
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>
                  结束日期 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => updateField('endDate', e.target.value)}
                  className={inputClass(!!errors.endDate)}
                />
                {errors.endDate && (
                  <div className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.endDate}
                  </div>
                )}
              </div>

              <div className="col-span-2">
                <label className={labelClass}>
                  签约主体 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.signParty}
                  onChange={(e) => updateField('signParty', e.target.value)}
                  placeholder="请输入公司名称"
                  className={inputClass(!!errors.signParty)}
                />
                {errors.signParty && (
                  <div className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.signParty}
                  </div>
                )}
              </div>

              <div className="col-span-2">
                <label className={labelClass}>备注说明</label>
                <textarea
                  value={form.remark}
                  onChange={(e) => updateField('remark', e.target.value)}
                  placeholder="选填，填写合同补充说明..."
                  rows={3}
                  className={`${inputClass(false)} resize-none`}
                />
              </div>
            </div>

            <div className="flex items-start gap-2 p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100/80">
              <CheckCircle2 className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-700 leading-relaxed">
                合同保存后将自动计算到期提醒。30天内到期的合同会标记为「即将到期」，过期合同标记为「已过期」。
              </p>
            </div>
          </div>
        </form>

        <div className="px-7 py-5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all duration-200"
          >
            取消
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/30 transition-all duration-200 active:scale-[0.98]"
          >
            提交保存
          </button>
        </div>
      </div>
    </div>
  );
}
