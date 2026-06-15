import { ChevronLeft, PencilLine, FloppyDisk, XCircle, Printer, Shield, Eye, FileEdit, BadgeCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEmployeeStore } from '@/store/useEmployeeStore';

interface ActionBarProps {
  employeeId: string;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export function ActionBar({ employeeId, onEdit, onSave, onCancel }: ActionBarProps) {
  const navigate = useNavigate();
  const profile = useEmployeeStore((s) => s.profile);
  const isEditMode = useEmployeeStore((s) => s.isEditMode);
  const permission = useEmployeeStore((s) => s.permission);
  const fieldChangesCount = useEmployeeStore((s) => s.fieldChanges.length);
  const newContractsCount = useEmployeeStore((s) => s.newContracts.length);
  const deletedCount = useEmployeeStore((s) => s.deletedAttachmentIds.length);
  const isSaving = useEmployeeStore((s) => s.isSaving);

  const totalChanges = fieldChangesCount + newContractsCount + deletedCount;
  const forceReadonly = !permission.canEdit;

  const handlePrint = () => {
    window.open(`/employee/${employeeId}/print`, '_blank', 'width=900,height=1200');
  };

  const statusBadge = profile?.work.status
    ? {
        在职: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        试用期: 'bg-sky-100 text-sky-700 border-sky-200',
        离职: 'bg-slate-100 text-slate-600 border-slate-200',
        停薪留职: 'bg-amber-100 text-amber-700 border-amber-200',
      }[profile.work.status]
    : '';

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_0_rgba(15,23,42,0.02),0_8px_24px_-12px_rgba(15,23,42,0.08)]">
      <div className="max-w-[1400px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-5 min-w-0 flex-1">
            <button
              onClick={() => navigate('/')}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title="返回员工列表"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">返回列表</span>
            </button>

            <div className="h-8 w-px bg-slate-200 shrink-0 hidden md:block" />

            {profile && (
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={profile.basic.avatar}
                    alt={profile.basic.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-md"
                  />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${profile.work.status === '在职' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-slate-900 truncate">
                      {profile.basic.name}
                    </h1>
                    <span
                      className={`shrink-0 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${statusBadge}`}
                    >
                      {profile.work.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                    <span className="font-mono tracking-tight">工号 {profile.basic.employeeId}</span>
                    <span className="hidden sm:inline">·</span>
                    <span className="hidden sm:inline truncate">{profile.work.department}</span>
                    <span className="hidden md:inline">·</span>
                    <span className="hidden md:inline truncate">{profile.work.position}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/70 text-xs font-medium text-slate-600">
              {forceReadonly ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  只读模式
                </>
              ) : isEditMode ? (
                <>
                  <FileEdit className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-slate-800">编辑中</span>
                  {totalChanges > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-md bg-amber-400 text-amber-950 font-bold">
                      {totalChanges}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                  已发布
                </>
              )}
            </div>

            {forceReadonly && (
              <span
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-xs font-medium text-rose-700 border border-rose-100"
                title={`当前角色：${permission.role}，无编辑权限`}
              >
                <Shield className="w-3.5 h-3.5" />
                {permission.role}
              </span>
            )}

            <button
              onClick={handlePrint}
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 transition-all"
              title="打印A4档案摘要"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">打印档案</span>
            </button>

            {!forceReadonly && !isEditMode && (
              <button
                onClick={onEdit}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-br from-indigo-700 to-indigo-800 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
              >
                <PencilLine className="w-4 h-4" />
                <span>编辑</span>
              </button>
            )}

            {isEditMode && (
              <>
                <button
                  onClick={onCancel}
                  disabled={isSaving}
                  className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">取消</span>
                </button>
                <button
                  onClick={onSave}
                  disabled={isSaving || totalChanges === 0}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0 disabled:shadow-none"
                >
                  <FloppyDisk className="w-4 h-4" />
                  <span>保存{totalChanges > 0 ? ` (${totalChanges})` : ''}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
