import { useMemo, useState } from 'react';
import { Paperclip, Inbox } from 'lucide-react';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import type { AttachmentCategory, AttachmentFile } from '@/types/employee';
import { triggerDownload } from '@/utils/fileUtils';
import { FileCategoryTabs } from './FileCategoryTabs';
import { FileCard } from './FileCard';
import { FilePreviewModal } from './FilePreviewModal';
import { FileUploader } from './FileUploader';
import { useToast } from '@/hooks/useToast';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export function AttachmentTab() {
  const attachments = useEmployeeStore((s) => s.profile?.attachments ?? []);
  const isEditMode = useEmployeeStore((s) => s.isEditMode);
  const deleteAttachment = useEmployeeStore((s) => s.deleteAttachment);

  const { success, warning } = useToast();

  const [activeCategory, setActiveCategory] = useState<AttachmentCategory>('身份证');
  const [previewFile, setPreviewFile] = useState<AttachmentFile | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<AttachmentFile | null>(null);

  const filteredAttachments = useMemo(() => {
    return attachments.filter((a) => a.category === activeCategory);
  }, [attachments, activeCategory]);

  const handlePreview = (file: AttachmentFile) => {
    setPreviewFile(file);
    setPreviewOpen(true);
  };

  const handleDownload = (file: AttachmentFile) => {
    if (file.url.startsWith('#')) {
      warning(`文件「${file.name}」为演示数据，暂无法下载`);
      return;
    }
    triggerDownload(file.url, file.name);
    success(`已开始下载「${file.name}」`);
  };

  const handleDeleteRequest = (file: AttachmentFile) => {
    setDeleteConfirm(file);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm) {
      deleteAttachment(deleteConfirm.id);
      success(`已删除附件「${deleteConfirm.name}」`);
      if (previewFile?.id === deleteConfirm.id) {
        setPreviewOpen(false);
        setPreviewFile(null);
      }
    }
    setDeleteConfirm(null);
  };

  const handleUploadComplete = (count: number) => {
    success(`成功上传 ${count} 个文件`);
  };

  const handleUploadError = (message: string) => {
    warning(message);
  };

  return (
    <div className="space-y-6 animate-[fadeInUp_0.3s_ease-out]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Paperclip className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">附件资料</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              共 <span className="font-semibold text-indigo-600">{attachments.length}</span> 个附件
            </p>
          </div>
        </div>
      </div>

      <FileCategoryTabs
        activeCategory={activeCategory}
        attachments={attachments}
        onCategoryChange={setActiveCategory}
      />

      {isEditMode && (
        <FileUploader
          currentCategory={activeCategory}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            当前分类 <span className="font-semibold text-slate-700">{activeCategory}</span> 共{' '}
            <span className="font-semibold text-indigo-600">{filteredAttachments.length}</span> 个文件
          </span>
        </div>

        {filteredAttachments.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredAttachments.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                isEditMode={isEditMode}
                onPreview={handlePreview}
                onDownload={handleDownload}
                onDelete={handleDeleteRequest}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700 mb-1">
              暂无「{activeCategory}」类附件
            </h3>
            <p className="text-xs text-slate-500 max-w-xs">
              {isEditMode
                ? '通过上方上传区域添加文件，或切换到其他分类查看'
                : '点击右上角「编辑」按钮后可上传附件'}
            </p>
          </div>
        )}
      </div>

      <FilePreviewModal
        open={previewOpen}
        file={previewFile}
        isEditMode={isEditMode}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewFile(null);
        }}
        onDownload={handleDownload}
        onDelete={handleDeleteRequest}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        title="确认删除附件？"
        description={`确定要删除附件「${deleteConfirm?.name ?? ''}」吗？\n\n此操作仅在保存后生效，取消编辑可恢复。`}
        confirmText="确认删除"
        cancelText="取消"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
