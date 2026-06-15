import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { ToastMessage } from '@/types/employee';

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const STYLE_MAP: Record<ToastMessage['type'], { bg: string; icon: typeof CheckCircle2 }> = {
  success: { bg: 'bg-emerald-600 text-white shadow-emerald-500/30', icon: CheckCircle2 },
  error: { bg: 'bg-rose-600 text-white shadow-rose-500/30', icon: XCircle },
  warning: { bg: 'bg-amber-500 text-white shadow-amber-500/30', icon: AlertTriangle },
  info: { bg: 'bg-indigo-700 text-white shadow-indigo-500/30', icon: Info },
};

export function Toast({ toasts, onRemove }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 w-80 max-w-[calc(100vw-3rem)]">
      {toasts.map((t, idx) => {
        const style = STYLE_MAP[t.type];
        const Icon = style.icon;
        return (
          <div
            key={t.id}
            className={`${style.bg} rounded-xl shadow-lg px-4 py-3 flex items-start gap-3 animate-[fadeIn_0.25s_ease-out]`}
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="flex-1 text-sm leading-relaxed">{t.message}</p>
            <button
              onClick={() => onRemove(t.id)}
              className="shrink-0 opacity-80 hover:opacity-100 transition-opacity"
              aria-label="关闭通知"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
