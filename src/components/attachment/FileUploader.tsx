import { useCallback, useRef, useState } from 'react';
import { UploadCloud, FilePlus, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import type { AttachmentCategory } from '@/types/employee';
import { detectFileType, fileToBase64 } from '@/utils/fileUtils';
import { todayStr } from '@/utils/dateUtils';

interface FileUploaderProps {
  currentCategory: AttachmentCategory;
  onUploadComplete?: (count: number) => void;
  onUploadError?: (message: string) => void;
}

interface PendingFile {
  id: string;
  file: File;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  message?: string;
}

function detectCategoryByFilename(filename: string): AttachmentCategory {
  const lower = filename.toLowerCase();
  if (lower.includes('身份证') || lower.includes('idcard') || lower.includes('id_card')) {
    return '身份证';
  }
  if (
    lower.includes('学历') ||
    lower.includes('毕业') ||
    lower.includes('学位') ||
    lower.includes('证书') ||
    lower.includes('diploma') ||
    lower.includes('degree') ||
    lower.includes('certificate')
  ) {
    return '学历证书';
  }
  if (
    lower.includes('离职') ||
    lower.includes('解除') ||
    lower.includes('终止') ||
    lower.includes('resign') ||
    lower.includes('terminate') ||
    lower.includes('dismiss')
  ) {
    return '离职证明';
  }
  return '其他';
}

export function FileUploader({
  currentCategory,
  onUploadComplete,
  onUploadError,
}: FileUploaderProps) {
  const addAttachment = useEmployeeStore((s) => s.addAttachment);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);

  const processFile = useCallback(
    async (file: File, pendingId: string) => {
      try {
        setPendingFiles((prev) =>
          prev.map((p) =>
            p.id === pendingId ? { ...p, status: 'uploading', progress: 20 } : p
          )
        );

        const fileType = detectFileType(file.name);
        const autoCategory = detectCategoryByFilename(file.name);
        const category =
          autoCategory !== '其他' ? autoCategory : currentCategory;

        let url = `#${fileType}`;
        if (fileType === 'image') {
          url = await fileToBase64(file);
        }

        setPendingFiles((prev) =>
          prev.map((p) =>
            p.id === pendingId ? { ...p, progress: 70 } : p
          )
        );

        addAttachment({
          name: file.name,
          category,
          fileType,
          size: file.size,
          uploadDate: todayStr(),
          url,
        });

        setPendingFiles((prev) =>
          prev.map((p) =>
            p.id === pendingId
              ? { ...p, status: 'success', progress: 100 }
              : p
          )
        );

        setTimeout(() => {
          setPendingFiles((prev) => prev.filter((p) => p.id !== pendingId));
        }, 1500);
      } catch (err) {
        setPendingFiles((prev) =>
          prev.map((p) =>
            p.id === pendingId
              ? {
                  ...p,
                  status: 'error',
                  progress: 0,
                  message: err instanceof Error ? err.message : '上传失败',
                }
              : p
          )
        );
        onUploadError?.(`${file.name} 上传失败`);
      }
    },
    [addAttachment, currentCategory, onUploadError]
  );

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      const newPending: PendingFile[] = fileArray.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        status: 'uploading',
        progress: 5,
      }));

      setPendingFiles((prev) => [...prev, ...newPending]);
      newPending.forEach((p) => processFile(p.file, p.id));

      onUploadComplete?.(fileArray.length);
    },
    [processFile, onUploadComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removePending = (id: string) => {
    setPendingFiles((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/80 scale-[1.01]'
            : 'border-slate-300 bg-slate-50/50 hover:border-indigo-400 hover:bg-indigo-50/40'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,.pdf"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
              isDragging
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-indigo-600 border border-slate-200 shadow-sm'
            }`}
          >
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              拖拽文件到此处，或
              <span className="text-indigo-600 mx-1">点击选择文件</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              支持 JPG、PNG、GIF、PDF 等格式，单文件不超过 20MB，可多选上传
            </p>
          </div>
        </div>
      </div>

      {pendingFiles.length > 0 && (
        <div className="space-y-2">
          {pendingFiles.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm animate-[fadeInUp_0.2s_ease-out]"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                {p.status === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : p.status === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                ) : (
                  <FilePlus className="w-5 h-5 text-indigo-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 truncate">
                  {p.file.name}
                </div>
                <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      p.status === 'success'
                        ? 'bg-emerald-500'
                        : p.status === 'error'
                          ? 'bg-rose-500'
                          : 'bg-indigo-600'
                    }`}
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
                {p.message && (
                  <div className="text-xs text-rose-600 mt-1">
                    {p.message}
                  </div>
                )}
              </div>

              <button
                onClick={() => removePending(p.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
