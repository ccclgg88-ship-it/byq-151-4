import { useMemo } from 'react';
import { Mail, Phone, MapPin, User, Calendar, Building2, Briefcase, Award, UserCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import type { EmployeeBasicInfo, EmployeeWorkInfo, FieldChange } from '@/types/employee';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { cn } from '@/lib/utils';

type BasicKey = keyof EmployeeBasicInfo;
type WorkKey = keyof EmployeeWorkInfo;

interface FieldConfig {
  key: BasicKey | WorkKey;
  label: string;
  type?: 'text' | 'date' | 'select' | 'email' | 'tel' | 'textarea';
  icon?: typeof User;
  placeholder?: string;
  options?: string[];
  section: 'basic' | 'work';
  colSpan?: number;
  fullWidth?: boolean;
}

const BASIC_FIELDS: FieldConfig[] = [
  { key: 'employeeId', label: '工号', icon: User, section: 'basic', placeholder: '请输入工号' },
  { key: 'name', label: '姓名', icon: User, section: 'basic', placeholder: '请输入姓名' },
  { key: 'gender', label: '性别', type: 'select', icon: User, section: 'basic', options: ['男', '女'] },
  { key: 'birthDate', label: '出生日期', type: 'date', icon: Calendar, section: 'basic' },
  { key: 'idCard', label: '身份证号', icon: User, section: 'basic', placeholder: '请输入18位身份证号' },
  { key: 'phone', label: '手机号', type: 'tel', icon: Phone, section: 'basic', placeholder: '请输入11位手机号' },
  { key: 'email', label: '邮箱', type: 'email', icon: Mail, section: 'basic', placeholder: '请输入邮箱地址' },
  { key: 'emergencyContact', label: '紧急联系人', icon: UserCheck, section: 'basic', placeholder: '请输入紧急联系人姓名' },
  { key: 'emergencyPhone', label: '紧急联系电话', type: 'tel', icon: Phone, section: 'basic', placeholder: '请输入紧急联系电话' },
  { key: 'address', label: '现住址', type: 'textarea', icon: MapPin, section: 'basic', fullWidth: true, placeholder: '请输入详细住址' },
];

const WORK_FIELDS: FieldConfig[] = [
  { key: 'department', label: '部门', icon: Building2, section: 'work', placeholder: '请输入部门' },
  { key: 'position', label: '岗位', icon: Briefcase, section: 'work', placeholder: '请输入岗位' },
  { key: 'level', label: '职级', icon: Award, section: 'work', placeholder: '请输入职级' },
  { key: 'supervisor', label: '直属上级', icon: UserCheck, section: 'work', placeholder: '请输入直属上级姓名' },
  { key: 'hireDate', label: '入职日期', type: 'date', icon: Calendar, section: 'work' },
  { key: 'regularDate', label: '转正日期', type: 'date', icon: CheckCircle2, section: 'work' },
  { key: 'status', label: '在职状态', type: 'select', icon: Clock, section: 'work', options: ['在职', '试用期', '离职', '停薪留职'] },
];

const STATUS_STYLES: Record<string, string> = {
  在职: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  试用期: 'bg-sky-100 text-sky-700 border-sky-200',
  离职: 'bg-slate-100 text-slate-600 border-slate-200',
  停薪留职: 'bg-amber-100 text-amber-700 border-amber-200',
};

interface FormFieldProps {
  config: FieldConfig;
  value: string;
  isEditMode: boolean;
  fieldChange?: FieldChange;
  onChange: (value: string) => void;
}

function FormField({ config, value, isEditMode, fieldChange, onChange }: FormFieldProps) {
  const Icon = config.icon;
  const isChanged = !!fieldChange;

  const renderDisplay = () => {
    if (!value) {
      return <span className="text-slate-400">—</span>;
    }

    if (config.key === 'status') {
      return (
        <span
          className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold border',
            STATUS_STYLES[value] || 'bg-slate-100 text-slate-700 border-slate-200'
          )}
        >
          {value}
        </span>
      );
    }

    if (config.type === 'email') {
      return (
        <a
          href={`mailto:${value}`}
          className="text-[#1e3a8a] font-semibold hover:underline break-all"
          onClick={(e) => isEditMode && e.preventDefault()}
        >
          {value}
        </a>
      );
    }

    if (config.type === 'tel') {
      return (
        <a
          href={`tel:${value}`}
          className="text-[#1e3a8a] font-semibold hover:underline font-mono"
          onClick={(e) => isEditMode && e.preventDefault()}
        >
          {value}
        </a>
      );
    }

    return (
      <span className={cn(
        'font-semibold text-slate-900 break-words',
        config.type === 'textarea' && 'whitespace-pre-wrap'
      )}>
        {value}
      </span>
    );
  };

  const renderEdit = () => {
    const baseInputClass = cn(
      'w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all duration-200 outline-none bg-white',
      'placeholder:text-slate-400',
      isChanged
        ? 'border-amber-400 ring-2 ring-amber-400/30 focus:border-amber-500 focus:ring-amber-400/40'
        : 'border-slate-200 hover:border-slate-300 focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20',
      config.type === 'textarea' && 'resize-none min-h-[80px]'
    );

    if (config.type === 'select') {
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClass}
        >
          <option value="">请选择</option>
          {config.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (config.type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={config.placeholder}
          rows={3}
          className={baseInputClass}
        />
      );
    }

    return (
      <input
        type={config.type || 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={config.placeholder}
        className={baseInputClass}
      />
    );
  };

  return (
    <div
      className={cn(
        'group relative',
        config.fullWidth ? 'xl:col-span-3 lg:col-span-2' : ''
      )}
    >
      <label className="flex items-center gap-1.5 mb-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
        <span className="text-xs font-medium text-slate-500">{config.label}</span>
        {isChanged && (
          <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">
            已修改
          </span>
        )}
      </label>

      <div className="relative">
        {isEditMode ? renderEdit() : renderDisplay()}
      </div>

      {isEditMode && isChanged && fieldChange && (
        <div className="absolute z-30 left-0 top-full mt-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          <div className="relative bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl whitespace-nowrap max-w-xs">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-slate-400 mb-0.5">原值</div>
                <div className="font-medium whitespace-pre-wrap break-words">
                  {fieldChange.oldValue || '（空）'}
                </div>
              </div>
            </div>
            <div className="absolute -top-1 left-4 w-2 h-2 bg-slate-900 rotate-45" />
          </div>
        </div>
      )}
    </div>
  );
}

interface SectionProps {
  title: string;
  subtitle?: string;
  fields: FieldConfig[];
  values: Partial<EmployeeBasicInfo> | Partial<EmployeeWorkInfo>;
  isEditMode: boolean;
  fieldChangesMap: Map<string, FieldChange>;
  prefix: 'basic' | 'work';
  onChange: (key: string, value: string) => void;
}

function FormSection({ title, subtitle, fields, values, isEditMode, fieldChangesMap, prefix, onChange }: SectionProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#1e3a8a] to-[#3b5998]" />
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1e3a8a]/5 text-[#1e3a8a] text-xs font-medium">
            {fields.filter(f => f.key !== 'avatar').length} 项字段
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className={cn(
          'grid gap-x-6 gap-y-5',
          'grid-cols-1',
          'md:grid-cols-2',
          'xl:grid-cols-3'
        )}>
          {fields.map((config) => {
            const fieldKey = `${prefix}.${String(config.key)}`;
            const value = String((values as Record<string, unknown>)[config.key] ?? '');
            const fieldChange = fieldChangesMap.get(fieldKey);

            return (
              <FormField
                key={fieldKey}
                config={config}
                value={value}
                isEditMode={isEditMode}
                fieldChange={fieldChange}
                onChange={(v) => onChange(String(config.key), v)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function InfoForm() {
  const profile = useEmployeeStore((s) => s.profile);
  const isEditMode = useEmployeeStore((s) => s.isEditMode);
  const fieldChanges = useEmployeeStore((s) => s.fieldChanges);
  const updateBasicField = useEmployeeStore((s) => s.updateBasicField);
  const updateWorkField = useEmployeeStore((s) => s.updateWorkField);

  const fieldChangesMap = useMemo(() => {
    const map = new Map<string, FieldChange>();
    fieldChanges.forEach((c) => map.set(c.fieldKey, c));
    return map;
  }, [fieldChanges]);

  const handleBasicChange = (key: string, value: string) => {
    updateBasicField(key as BasicKey, value as never);
  };

  const handleWorkChange = (key: string, value: string) => {
    updateWorkField(key as WorkKey, value as never);
  };

  if (!profile) return null;

  return (
    <div className="space-y-5">
      <FormSection
        title="基本信息"
        subtitle="员工个人基础档案资料"
        fields={BASIC_FIELDS}
        values={profile.basic}
        isEditMode={isEditMode}
        fieldChangesMap={fieldChangesMap}
        prefix="basic"
        onChange={handleBasicChange}
      />

      <FormSection
        title="工作信息"
        subtitle="员工任职及劳动合同相关信息"
        fields={WORK_FIELDS}
        values={profile.work}
        isEditMode={isEditMode}
        fieldChangesMap={fieldChangesMap}
        prefix="work"
        onChange={handleWorkChange}
      />
    </div>
  );
}
