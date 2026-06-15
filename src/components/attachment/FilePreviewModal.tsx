import { X, Download, Trash2, FileText, AlertCircle } from 'lucide-react';
import type { AttachmentFile } from '@/types/employee';
import { formatFileSize } from '@/utils/fileUtils';
import { formatDate } from '@/utils/dateUtils';

interface FilePreviewModalProps {
  open: boolean;
  file: AttachmentFile | null;
  isEditMode: boolean;
  onClose: () => void;
  onDownload: (file: AttachmentFile) => void;
  onDelete: (file: AttachmentFile) => void;
}

export function FilePreviewModal({
  open,
  file,
  isEditMode,
  onClose,
  onDownload,
  onDelete,
}: FilePreviewModalProps) {
  if (!open || !file) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 sm:p-8">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-5xl max-h-[90vh] bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-[scaleIn_0.25s_cubic-bezier(0.16,1,0.3,1)]">
        <header className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
              {file.fileType === 'image' ? (
                <img
                  src={file.url}
                  alt=""
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <FileText className="w-5 h-5 text-rose-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white truncate">
                {file.name}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span>{file.category}</span>
                <span>·</span>
                <span>{formatDate(file.uploadDate)}</span>
                <span>·</span>
                <span className="font-mono">{formatFileSize(file.size)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="shrink-0 w-10 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-colors"
            aria-label="关闭预览"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-auto bg-slate-950 flex items-center justify-center p-6 sm:p-10">
          {file.fileType === 'image' ? (
            <img
              src={file.url}
              alt={file.name}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-[fadeIn_0.3s_ease-out]"
            />
          ) : (
            <div className="text-center animate-[fadeInUp_0.3s_ease-out]">
              <div className="w-32 h-40 mx-auto bg-gradient-to-br from-rose-500/20 to-orange-500/20 rounded-2xl border-2 border-dashed border-rose-500/40 flex flex-col items-center justify-center mb-6">
                <FileText className="w-14 h-14 text-rose-400" strokeWidth={1.2} />
                <span className="mt-2 text-xs font-bold text-rose-300 tracking-widest">
                  PDF
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                PDF 文件预览
              </h3>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mb-1">
                <AlertCircle className="w-4 h-4" />
                <span>当前环境未集成 PDF 渲染引擎</span>
              </div>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                请点击下方「下载」按钮，使用本地 PDF 阅读器查看文件完整内容。
              </p>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between gap-4 px-6 py-4 bg-slate-900/90 border-t border-slate-800">
          <div className="text-xs text-slate-500 hidden sm:block">
            按 ESC 键可关闭预览
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => onDownload(file)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              下载文件
            </button>
            {isEditMode && (
              <button
                onClick={() => {
                  onDelete(file);
                  onClose();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                删除文件
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
