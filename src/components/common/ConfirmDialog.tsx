import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT = {
  danger: {
    iconBg: 'bg-rose-100 text-rose-600',
    btn: 'bg-rose-600 hover:bg-rose-700 text-white',
  },
  warning: {
    iconBg: 'bg-amber-100 text-amber-600',
    btn: 'bg-amber-500 hover:bg-amber-600 text-white',
  },
  info: {
    iconBg: 'bg-indigo-100 text-indigo-600',
    btn: 'bg-indigo-700 hover:bg-indigo-800 text-white',
  },
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'warning',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;
  const v = VARIANT[variant];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-[scaleIn_0.2s_cubic-bezier(0.16,1,0.3,1)]">
        <div className="flex items-start gap-4">
          <div className={`w-11 h-11 shrink-0 rounded-full ${v.iconBg} flex items-center justify-center`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 mb-1.5">{title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 rounded-xl text-sm font-medium shadow-md transition-all hover:-translate-y-0.5 ${v.btn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
