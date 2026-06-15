import { useState } from 'react';
import { Eye, Download, Trash2, FileText } from 'lucide-react';
import type { AttachmentFile } from '@/types/employee';
import { formatFileSize } from '@/utils/fileUtils';
import { formatDate } from '@/utils/dateUtils';

interface FileCardProps {
  file: AttachmentFile;
  isEditMode: boolean;
  onPreview: (file: AttachmentFile) => void;
  onDownload: (file: AttachmentFile) => void;
  onDelete: (file: AttachmentFile) => void;
}

export function FileCard({
  file,
  isEditMode,
  onPreview,
  onDownload,
  onDelete,
}: FileCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const truncateName = (name: string, maxLen = 18) => {
    if (name.length <= maxLen) return name;
    const ext = name.split('.').pop() || '';
    const base = name.slice(0, name.length - ext.length - 1);
    const truncated = base.slice(0, maxLen - ext.length - 4);
    return `${truncated}...${ext}`;
  };

  return (
    <div
      className="group relative bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
        {file.fileType === 'image' ? (
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50">
            <div className="relative">
              <FileText className="w-16 h-16 text-rose-500" strokeWidth={1.2} />
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-rose-600 tracking-wider">
                PDF
              </span>
            </div>
          </div>
        )}

        <div
          className={`absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center gap-3 transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            onClick={() => onPreview(file)}
            className="w-10 h-10 rounded-full bg-white/95 text-slate-700 flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
            title="预览"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDownload(file)}
            className="w-10 h-10 rounded-full bg-white/95 text-slate-700 flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
            title="下载"
          >
            <Download className="w-5 h-5" />
          </button>
          {isEditMode && (
            <button
              onClick={() => onDelete(file)}
              className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg hover:bg-rose-600 hover:scale-110 transition-all duration-200"
              title="删除"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="absolute top-2 right-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 backdrop-blur-sm text-slate-600 shadow-sm">
            {file.category}
          </span>
        </div>
      </div>

      <div className="p-3 space-y-1.5">
        <div
          className="text-sm font-medium text-slate-800 truncate"
          title={file.name}
        >
          {truncateName(file.name)}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{formatDate(file.uploadDate)}</span>
          <span className="font-mono">{formatFileSize(file.size)}</span>
        </div>
      </div>
    </div>
  );
}
