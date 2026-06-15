import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { formatDateCN, formatDate } from '@/utils/dateUtils';
import { formatFileSize } from '@/utils/fileUtils';
import { Building2, UserCircle2, FileSignature, GitBranch, ClipboardList, Loader2 } from 'lucide-react';

const DEFAULT_EMPLOYEE_ID = 'EMP20210315';

export default function EmployeePrintPage() {
  const { id } = useParams<{ id: string }>();
  const employeeId = id || DEFAULT_EMPLOYEE_ID;

  const loadProfile = useEmployeeStore((s) => s.loadProfile);
  const profile = useEmployeeStore((s) => s.profile);
  const isLoading = useEmployeeStore((s) => s.isLoading);
  const error = useEmployeeStore((s) => s.error);

  const [printDate] = useState(() => formatDateCN(new Date().toISOString().slice(0, 10)));
  const [hasPrinted, setHasPrinted] = useState(false);

  useEffect(() => {
    loadProfile(employeeId);
  }, [employeeId, loadProfile]);

  useEffect(() => {
    if (profile && !isLoading && !hasPrinted) {
      const timer = setTimeout(() => {
        window.print();
        setHasPrinted(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [profile, isLoading, hasPrinted]);

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="mt-4 text-sm text-slate-600">正在准备打印数据...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <p className="text-sm text-rose-600">{error}</p>
      </div>
    );
  }

  const recentChanges = [...profile.changes]
    .sort(
      (a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
    )
    .slice(0, 10);

  const totalAttachmentsSize = profile.attachments.reduce((sum, a) => sum + a.size, 0);

  return (
    <div className="print-root min-h-screen bg-slate-100 py-8 px-4">
      <style>{`
        @media print {
          .print-root {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-page {
            width: 210mm !important;
            min-height: 297mm !important;
            padding: 20mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            page-break-after: always;
          }
          .print-page:last-child {
            page-break-after: auto;
          }
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="no-print flex justify-center gap-4 mb-6">
        <button
          onClick={() => window.print()}
          className="px-6 py-2.5 bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:bg-indigo-800 transition-colors"
        >
          打印档案
        </button>
        <button
          onClick={() => window.close()}
          className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-300 transition-colors"
        >
          关闭窗口
        </button>
      </div>

      <div className="print-page mx-auto bg-white shadow-2xl rounded-none" style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}>
        <header className="pb-6 mb-6 border-b-2 border-slate-900">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-5 h-5 text-indigo-700" />
                <h1 className="text-xl font-bold text-slate-900 tracking-wide" style={{ fontFamily: '"Noto Serif SC", serif' }}>
                  上海星辰科技有限公司
                </h1>
              </div>
              <p className="text-sm text-slate-600">员工档案摘要 · HR 管理系统</p>
            </div>
            <div className="text-right text-xs text-slate-500 space-y-1">
              <div>打印日期：{printDate}</div>
              <div>档案编号：HR-ARC-{profile.basic.employeeId}</div>
            </div>
          </div>
        </header>

        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
            <UserCircle2 className="w-4 h-4 text-indigo-700" />
            <h2 className="text-base font-bold text-slate-900">一、基本信息</h2>
          </div>
          <div className="grid grid-cols-3 gap-x-8 gap-y-3 text-sm">
            <div className="col-span-3 flex gap-6 pb-4 border-b border-dashed border-slate-200">
              <img
                src={profile.basic.avatar}
                alt={profile.basic.name}
                className="w-24 h-32 object-cover rounded-lg border border-slate-200"
              />
              <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-3 content-start">
                <InfoItem label="姓名" value={profile.basic.name} strong />
                <InfoItem label="工号" value={profile.basic.employeeId} mono />
                <InfoItem label="性别" value={profile.basic.gender} />
                <InfoItem label="出生日期" value={formatDateCN(profile.basic.birthDate)} />
                <InfoItem label="身份证号" value={profile.basic.idCard} mono />
                <InfoItem label="在职状态" value={profile.work.status} />
              </div>
            </div>
            <InfoItem label="手机号" value={profile.basic.phone} mono />
            <InfoItem label="邮箱" value={profile.basic.email} />
            <InfoItem label="部门" value={profile.work.department} />
            <InfoItem label="紧急联系人" value={profile.basic.emergencyContact} />
            <InfoItem label="紧急电话" value={profile.basic.emergencyPhone} mono />
            <InfoItem label="岗位" value={profile.work.position} />
            <InfoItem label="职级" value={profile.work.level} />
            <InfoItem label="直属上级" value={profile.work.supervisor} />
            <InfoItem label="入职日期" value={formatDateCN(profile.work.hireDate)} />
            <InfoItem label="转正日期" value={formatDateCN(profile.work.regularDate)} />
            <InfoItem label="现住址" value={profile.basic.address} full />
          </div>
        </section>

        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
            <FileSignature className="w-4 h-4 text-indigo-700" />
            <h2 className="text-base font-bold text-slate-900">二、合同信息</h2>
          </div>
          <div className="overflow-hidden border border-slate-300 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="px-3 py-2.5 text-left font-semibold border-b border-slate-300">合同编号</th>
                  <th className="px-3 py-2.5 text-left font-semibold border-b border-slate-300">类型</th>
                  <th className="px-3 py-2.5 text-left font-semibold border-b border-slate-300">期限</th>
                  <th className="px-3 py-2.5 text-left font-semibold border-b border-slate-300">状态</th>
                </tr>
              </thead>
              <tbody>
                {profile.contracts.map((c, idx) => (
                  <tr key={c.id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="px-3 py-2.5 border-b border-slate-200 font-mono text-xs">{c.contractNo}</td>
                    <td className="px-3 py-2.5 border-b border-slate-200">{c.type}</td>
                    <td className="px-3 py-2.5 border-b border-slate-200 text-xs">
                      {formatDate(c.startDate)} ~ {formatDate(c.endDate)}
                    </td>
                    <td className="px-3 py-2.5 border-b border-slate-200">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          c.status === '生效中'
                            ? 'bg-emerald-100 text-emerald-700'
                            : c.status === '即将到期'
                              ? 'bg-amber-100 text-amber-700'
                              : c.status === '已过期'
                                ? 'bg-slate-200 text-slate-600'
                                : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
            <GitBranch className="w-4 h-4 text-indigo-700" />
            <h2 className="text-base font-bold text-slate-900">三、最近异动记录</h2>
          </div>
          <div className="space-y-0">
            {recentChanges.map((c, idx) => (
              <div
                key={c.id}
                className="flex gap-4 py-3 border-b border-dashed border-slate-200 last:border-b-0"
              >
                <div className="shrink-0 w-14 text-right">
                  <div className="text-[11px] font-mono text-slate-400 leading-tight">
                    {formatDate(c.effectiveDate).slice(0, 7)}
                  </div>
                  <div className="text-xs font-bold text-slate-600">
                    {formatDate(c.effectiveDate).slice(8)}
                  </div>
                </div>
                <div className="shrink-0 relative flex flex-col items-center">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      idx === 0 ? 'bg-indigo-600 ring-4 ring-indigo-100' : 'bg-slate-300'
                    }`}
                  />
                  {idx < recentChanges.length - 1 && (
                    <div className="w-px flex-1 bg-slate-200 mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {c.eventType}
                    </span>
                    <span className="text-sm font-medium text-slate-800">{c.fieldName}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-600 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-slate-100 rounded line-through text-slate-500">
                      {c.oldValue}
                    </span>
                    <span className="text-slate-400">→</span>
                    <span className="px-1.5 py-0.5 bg-emerald-50 rounded text-emerald-700 font-medium">
                      {c.newValue}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">操作人：{c.operator}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
            <ClipboardList className="w-4 h-4 text-indigo-700" />
            <h2 className="text-base font-bold text-slate-900">四、附件清单</h2>
          </div>
          <div className="grid grid-cols-4 gap-3 text-xs">
            {(['身份证', '学历证书', '离职证明', '其他'] as const).map((cat) => {
              const items = profile.attachments.filter((a) => a.category === cat);
              const size = items.reduce((s, a) => s + a.size, 0);
              return (
                <div
                  key={cat}
                  className="border border-slate-200 rounded-lg p-3 bg-slate-50"
                >
                  <div className="font-semibold text-slate-700 mb-2">{cat}</div>
                  <div className="space-y-1">
                    {items.length === 0 ? (
                      <div className="text-slate-400">无</div>
                    ) : (
                      items.slice(0, 3).map((a) => (
                        <div key={a.id} className="truncate text-slate-600">
                          · {a.name}
                        </div>
                      ))
                    )}
                    {items.length > 3 && (
                      <div className="text-slate-400">等 {items.length} 个文件</div>
                    )}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200 text-slate-500 flex justify-between">
                    <span>{items.length} 个</span>
                    <span className="font-mono">{formatFileSize(size)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-xs text-slate-500 text-right">
            附件总计：{profile.attachments.length} 个文件 · {formatFileSize(totalAttachmentsSize)}
          </div>
        </section>

        <footer className="pt-6 mt-8 border-t border-slate-300">
          <div className="grid grid-cols-3 gap-8 text-xs text-slate-500">
            <div>
              <div className="mb-1 pb-1 border-b border-dashed border-slate-300 h-6" />
              <div className="text-center">HR 经办人签字</div>
            </div>
            <div>
              <div className="mb-1 pb-1 border-b border-dashed border-slate-300 h-6" />
              <div className="text-center">部门经理签字</div>
            </div>
            <div>
              <div className="mb-1 pb-1 border-b border-dashed border-slate-300 h-6 text-right" />
              <div className="text-center">日期：{formatDateCN(new Date().toISOString().slice(0, 10))}</div>
            </div>
          </div>
          <div className="mt-6 text-center text-[10px] text-slate-400">
            本档案由 HR 管理系统自动生成 · 编号 HR-ARC-{profile.basic.employeeId} · {printDate}
          </div>
        </footer>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  strong,
  mono,
  full,
}: {
  label: string;
  value: string;
  strong?: boolean;
  mono?: boolean;
  full?: boolean;
}) {
  return (
    <div className={full ? 'col-span-3' : ''}>
      <div className="text-xs text-slate-500 mb-0.5">{label}</div>
      <div
        className={`${strong ? 'font-bold text-slate-900' : 'text-slate-700'} ${mono ? 'font-mono text-xs' : ''} break-all`}
      >
        {value || '-'}
      </div>
    </div>
  );
}
