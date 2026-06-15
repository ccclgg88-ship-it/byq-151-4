import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { useToast } from '@/hooks/useToast';
import { useDirtyCheck } from '@/hooks/useDirtyCheck';
import { ActionBar } from '@/components/common/ActionBar';
import { TabContainer } from '@/components/common/TabContainer';
import { Toast } from '@/components/common/Toast';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ChangeListDrawer } from '@/components/common/ChangeListDrawer';
import { LoadingError } from '@/components/common/LoadingError';
import { BasicInfoTab } from '@/components/basic/BasicInfoTab';
import { ContractTab } from '@/components/contract/ContractTab';
import { ChangeTab } from '@/components/change/ChangeTab';
import { AttachmentTab } from '@/components/attachment/AttachmentTab';
import type { TabKey } from '@/types/employee';

const DEFAULT_EMPLOYEE_ID = 'EMP20210315';

export default function EmployeeProfilePage() {
  const { id } = useParams<{ id: string }>();
  const employeeId = id || DEFAULT_EMPLOYEE_ID;

  const loadProfile = useEmployeeStore((s) => s.loadProfile);
  const profile = useEmployeeStore((s) => s.profile);
  const isLoading = useEmployeeStore((s) => s.isLoading);
  const isSaving = useEmployeeStore((s) => s.isSaving);
  const error = useEmployeeStore((s) => s.error);
  const isEditMode = useEmployeeStore((s) => s.isEditMode);
  const toggleEditMode = useEmployeeStore((s) => s.toggleEditMode);
  const saveAll = useEmployeeStore((s) => s.saveAll);
  const cancelEdit = useEmployeeStore((s) => s.cancelEdit);
  const setError = useEmployeeStore((s) => s.setError);
  const clearError = useEmployeeStore((s) => s.clearError);
  const hasUnsavedChanges = useEmployeeStore((s) => s.hasUnsavedChanges());
  const fieldChanges = useEmployeeStore((s) => s.fieldChanges);
  const newContracts = useEmployeeStore((s) => s.newContracts);
  const deletedAttachmentIds = useEmployeeStore((s) => s.deletedAttachmentIds);
  const pendingAttachmentUploads = useEmployeeStore((s) => s.pendingAttachmentUploads);

  const { toasts, removeToast, success, error: showError } = useToast();

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showChangeDrawer, setShowChangeDrawer] = useState(false);

  useDirtyCheck(isEditMode && hasUnsavedChanges);

  useEffect(() => {
    loadProfile(employeeId);
    return () => {
      toggleEditMode(false);
      setError(null);
    };
  }, [employeeId, loadProfile, toggleEditMode, setError]);

  const handleEdit = () => {
    toggleEditMode(true);
    success('已进入编辑模式，修改完成后请点击保存');
  };

  const handleSaveRequest = () => {
    const total =
      fieldChanges.length +
      newContracts.length +
      deletedAttachmentIds.length +
      pendingAttachmentUploads.length;
    if (total === 0) {
      showError('暂无可保存的变更');
      return;
    }
    setShowChangeDrawer(true);
  };

  const handleConfirmSave = async () => {
    const result = await saveAll();
    setShowChangeDrawer(false);
    if (result.success) {
      success(result.message);
    } else {
      showError(result.message);
    }
  };

  const handleCancelRequest = () => {
    if (hasUnsavedChanges) {
      setShowCancelConfirm(true);
    } else {
      cancelEdit();
    }
  };

  const handleConfirmCancel = () => {
    cancelEdit();
    setShowCancelConfirm(false);
    success('已取消编辑，所有未保存的修改已恢复');
  };

  const handleRetry = () => {
    clearError();
    loadProfile(employeeId);
  };

  const tabs = [
    { key: 'basic' as TabKey, label: '基本信息', content: <BasicInfoTab /> },
    {
      key: 'contract' as TabKey,
      label: '合同信息',
      badge: profile?.contracts.length,
      content: <ContractTab />,
    },
    {
      key: 'change' as TabKey,
      label: '异动记录',
      badge: profile?.changes.length,
      content: <ChangeTab />,
    },
    {
      key: 'attachment' as TabKey,
      label: '附件资料',
      badge: profile?.attachments.length,
      content: <AttachmentTab />,
    },
  ];

  if (isLoading || error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <LoadingError
          isLoading={isLoading}
          error={error}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <ActionBar
        employeeId={employeeId}
        onEdit={handleEdit}
        onSave={handleSaveRequest}
        onCancel={handleCancelRequest}
      />

      <main className="max-w-[1400px] mx-auto px-6 py-6 sm:py-8">
        <TabContainer tabs={tabs} />
      </main>

      <Toast toasts={toasts} onRemove={removeToast} />

      <ConfirmDialog
        open={showCancelConfirm}
        title="取消编辑？"
        description="您有未保存的修改，确定要取消吗？\n\n所有未保存的内容将会丢失。"
        confirmText="确认取消"
        cancelText="继续编辑"
        variant="warning"
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelConfirm(false)}
      />

      <ChangeListDrawer
        open={showChangeDrawer}
        fieldChanges={fieldChanges}
        newContracts={newContracts}
        deletedAttachmentIds={deletedAttachmentIds}
        pendingUploads={pendingAttachmentUploads}
        isSaving={isSaving}
        onClose={() => !isSaving && setShowChangeDrawer(false)}
        onConfirm={handleConfirmSave}
      />
    </div>
  );
}
