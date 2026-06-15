import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';

interface LoadingErrorProps {
  isLoading: boolean;
  error: string | null;
  loadingText?: string;
  onRetry?: () => void;
}

export function LoadingError({
  isLoading,
  error,
  loadingText = '正在加载员工档案...',
  onRetry,
}: LoadingErrorProps) {
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500">
        <div className="relative">
          <Loader2 className="w-14 h-14 text-indigo-600 animate-spin" />
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full -z-10" />
        </div>
        <p className="mt-6 text-sm font-medium tracking-wide">{loadingText}</p>
        <div className="mt-5 flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-rose-50 border-2 border-rose-100 flex items-center justify-center mb-5">
          <AlertCircle className="w-10 h-10 text-rose-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">数据加载失败</h3>
        <p className="text-sm text-slate-600 max-w-md leading-relaxed mb-6">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:bg-indigo-800 hover:-translate-y-0.5 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            重新加载
          </button>
        )}
      </div>
    );
  }

  return null;
}
