import { useMemo } from 'react';
import { UserCircle2, Building2, Mail, Phone, Hash } from 'lucide-react';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { AvatarUploader } from './AvatarUploader';
import { InfoForm } from './InfoForm';
import { cn } from '@/lib/utils';

export function BasicInfoTab() {
  const profile = useEmployeeStore((s) => s.profile);
  const isEditMode = useEmployeeStore((s) => s.isEditMode);
  const fieldChanges = useEmployeeStore((s) => s.fieldChanges);

  const basicChangeCount = useMemo(
    () => fieldChanges.filter((c) => c.fieldKey.startsWith('basic.')).length,
    [fieldChanges]
  );

  const workChangeCount = useMemo(
    () => fieldChanges.filter((c) => c.fieldKey.startsWith('work.')).length,
    [fieldChanges]
  );

  const statusBadge = profile?.work.status
    ? {
        在职: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        试用期: 'bg-sky-100 text-sky-700 border-sky-200',
        离职: 'bg-slate-100 text-slate-600 border-slate-200',
        停薪留职: 'bg-amber-100 text-amber-700 border-amber-200',
      }[profile.work.status]
    : '';

  return (
    <div className="w-full">
      <div className={cn(
        'grid gap-5',
        'lg:grid-cols-[300px_1fr]',
        'xl:grid-cols-[340px_1fr]'
      )}>
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-[#1e3a8a] via-[#1e3a8a] to-[#2a4a9e] rounded-2xl shadow-lg shadow-[#1e3a8a]/15 overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-300 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="relative p-6 pt-8">
              <AvatarUploader />

              {profile && (
                <div className="mt-6 text-center">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-white">
                      {profile.basic.name}
                    </h2>
                    <span
                      className={cn(
                        'shrink-0 px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-white/10 text-white border-white/20'
                      )}
                    >
                      {profile.work.status}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center justify-center gap-2 text-white/70 text-sm">
                    <Hash className="w-3.5 h-3.5" />
                    <span className="font-mono tracking-tight">{profile.basic.employeeId}</span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
                      <Building2 className="w-3.5 h-3.5 shrink-0 text-white/50" />
                      <span className="truncate max-w-[240px]">{profile.work.department}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
                      <UserCircle2 className="w-3.5 h-3.5 shrink-0 text-white/50" />
                      <span>{profile.work.position}</span>
                      <span className="text-white/40">·</span>
                      <span>{profile.work.level}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-5 border-t border-white/10">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {profile?.basic.email ? profile.basic.email.split('@')[0].length : '—'}
                    </div>
                    <div className="text-xs text-white/50 mt-0.5">司龄年数</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-300">
                      {basicChangeCount + workChangeCount || '0'}
                    </div>
                    <div className="text-xs text-white/50 mt-0.5">待变更项</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {profile && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1e3a8a]" />
                  快速联系
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <a
                  href={`mailto:${profile.basic.email}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-[#1e3a8a]/5 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#1e3a8a]/10 flex items-center justify-center group-hover:bg-[#1e3a8a] transition-colors">
                    <Mail className="w-4 h-4 text-[#1e3a8a] group-hover:text-white transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">邮箱</div>
                    <div className="text-sm font-medium text-slate-800 truncate">{profile.basic.email}</div>
                  </div>
                </a>

                <a
                  href={`tel:${profile.basic.phone}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-amber-50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                    <Phone className="w-4 h-4 text-amber-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">手机</div>
                    <div className="text-sm font-medium text-slate-800 font-mono">{profile.basic.phone}</div>
                  </div>
                </a>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="w-9 h-9 rounded-lg bg-slate-200 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">紧急联系</div>
                    <div className="text-sm font-medium text-slate-800 truncate">
                      {profile.basic.emergencyContact}
                      <span className="ml-2 font-mono text-slate-500">{profile.basic.emergencyPhone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isEditMode && (basicChangeCount > 0 || workChangeCount > 0) && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200/60 shadow-sm p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0">
                  <span className="text-amber-600 text-lg font-bold">!</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-amber-800">变更统计</div>
                  <div className="mt-2 space-y-1.5">
                    {basicChangeCount > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-amber-700">基本信息</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-800 font-bold">
                          {basicChangeCount} 项
                        </span>
                      </div>
                    )}
                    {workChangeCount > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-amber-700">工作信息</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-800 font-bold">
                          {workChangeCount} 项
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-amber-600/80 leading-relaxed">
                    请确认修改内容后点击右上角「保存」按钮提交变更。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <InfoForm />
        </div>
      </div>
    </div>
  );
}
