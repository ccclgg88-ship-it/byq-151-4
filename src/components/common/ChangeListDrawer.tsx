import { X, ArrowRight, FilePlus, Trash2, Upload, CheckCircle } from 'lucide-react';
import type { FieldChange, ContractRecord, AttachmentFile } from '@/types/employee';

interface ChangeListDrawerProps {
  open: boolean;
  fieldChanges: FieldChange[];
  newContracts: ContractRecord[];
  deletedAttachmentIds: string[];
  pendingUploads: AttachmentFile[];
  isSaving: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ChangeListDrawer({
  open,
  fieldChanges,
  newContracts,
  deletedAttachmentIds,
  pendingUploads,
  isSaving,
  onClose,
  onConfirm,
}: ChangeListDrawerProps) {
  if (!open) return null;

  const totalCount =
    fieldChanges.length +
    newContracts.length +
    deletedAttachmentIds.length +
    pendingUploads.length;

  return (
    <div className="fixed inset-0 z-[80]">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-[slideRight_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        <header className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">变更清单确认</h2>
            <p className="text-xs text-slate-500 mt-1">
              共 <span className="font-semibold text-indigo-600">{totalCount}</span> 项变更待提交
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
            disabled={isSaving}
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {fieldChanges.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                字段修改（{fieldChanges.length}）
              </h3>
              <div className="space-y-2">
                {fieldChanges.map((c) => (
                  <div
                    key={c.fieldKey}
                    className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3"
                  >
                    <div className="text-xs font-semibold text-amber-900 mb-1.5">{c.label}</div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="flex-1 px-2 py-1 bg-white rounded-md border border-slate-200 text-slate-500 line-through truncate">
                        {c.oldValue || '-'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="flex-1 px-2 py-1 bg-white rounded-md border border-amber-300 text-slate-900 font-medium truncate">
                        {c.newValue || '-'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {newContracts.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <FilePlus className="w-4 h-4 text-emerald-500" />
                新增合同（{newContracts.length}）
              </h3>
              <div className="space-y-2">
                {newContracts.map((c) => (
                  <div
                    key={c.id}
                    className="bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-3 text-sm"
                  >
                    <div className="font-semibold text-emerald-900">{c.contractNo}</div>
                    <div className="text-slate-600 mt-0.5">
                      {c.type} · {c.startDate} ~ {c.endDate}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {pendingUploads.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-500" />
                新增附件（{pendingUploads.length}）
              </h3>
              <div className="space-y-2">
                {pendingUploads.map((a) => (
                  <div
                    key={a.id}
                    className="bg-indigo-50/60 border border-indigo-200/60 rounded-xl p-3 text-sm flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="text-slate-800 truncate">{a.name}</span>
                    <span className="ml-auto text-xs text-slate-500 shrink-0">
                      {a.category}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {deletedAttachmentIds.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-500" />
                删除附件（{deletedAttachmentIds.length}）
              </h3>
              <div className="bg-rose-50/60 border border-rose-200/60 rounded-xl p-3 text-sm text-rose-800">
                将永久删除 <span className="font-semibold">{deletedAttachmentIds.length}</span> 个附件文件
              </div>
            </section>
          )}

          {totalCount === 0 && (
            <div className="py-16 text-center text-slate-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无待提交的变更</p>
            </div>
          )}
        </div>

        <footer className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            继续编辑
          </button>
          <button
            onClick={onConfirm}
            disabled={isSaving || totalCount === 0}
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-br from-indigo-700 to-indigo-800 text-white shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 hover:shadow-indigo-500/40 disabled:opacity-60 disabled:hover:translate-y-0 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
                保存中...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                确认保存
              </>
            )}
          </button>
        </footer>
      </aside>
    </div>
  );
}
