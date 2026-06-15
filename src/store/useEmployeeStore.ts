import { create } from 'zustand';
import type {
  EmployeeProfile,
  EmployeeBasicInfo,
  EmployeeWorkInfo,
  ContractRecord,
  AttachmentFile,
  FieldChange,
  UserPermission,
  EventType,
} from '@/types/employee';
import { mockEmployee, BASIC_FIELD_LABELS, WORK_FIELD_LABELS } from '@/data/mockEmployee';
import { generateId } from '@/utils/fileUtils';

interface EmployeeState {
  profile: EmployeeProfile | null;
  originalProfile: EmployeeProfile | null;
  permission: UserPermission;
  isEditMode: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  fieldChanges: FieldChange[];
  newContracts: ContractRecord[];
  deletedAttachmentIds: string[];
  activeEventFilter: EventType | 'all';
  pendingAttachmentUploads: AttachmentFile[];

  loadProfile: (employeeId: string, forceFail?: boolean) => Promise<void>;
  toggleEditMode: (enabled: boolean) => void;
  setPermission: (permission: UserPermission) => void;
  updateBasicField: <K extends keyof EmployeeBasicInfo>(
    key: K,
    value: EmployeeBasicInfo[K]
  ) => void;
  updateWorkField: <K extends keyof EmployeeWorkInfo>(
    key: K,
    value: EmployeeWorkInfo[K]
  ) => void;
  addContract: (contract: Omit<ContractRecord, 'id'>) => void;
  deleteAttachment: (id: string) => void;
  addAttachment: (attachment: Omit<AttachmentFile, 'id'>) => void;
  setActiveEventFilter: (filter: EventType | 'all') => void;
  saveAll: () => Promise<{ success: boolean; message: string }>;
  cancelEdit: () => void;
  setError: (err: string | null) => void;
  clearError: () => void;
  hasUnsavedChanges: () => boolean;
}

const initialPermission: UserPermission = {
  role: 'HR专员',
  canEdit: true,
  canViewAllFields: true,
};

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  profile: null,
  originalProfile: null,
  permission: initialPermission,
  isEditMode: false,
  isLoading: false,
  isSaving: false,
  error: null,
  fieldChanges: [],
  newContracts: [],
  deletedAttachmentIds: [],
  activeEventFilter: 'all',
  pendingAttachmentUploads: [],

  loadProfile: async (employeeId, forceFail = false) => {
    set({ isLoading: true, error: null });
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (forceFail) {
      set({
        isLoading: false,
        error: `加载员工 ${employeeId} 档案失败：网络连接超时，请稍后重试。`,
      });
      return;
    }

    const profile = deepClone(mockEmployee);
    set({
      profile,
      originalProfile: deepClone(profile),
      isLoading: false,
      error: null,
    });
  },

  toggleEditMode: (enabled) => {
    const { permission } = get();
    if (enabled && !permission.canEdit) return;
    set({ isEditMode: enabled });
  },

  setPermission: (permission) => set({ permission }),

  updateBasicField: (key, value) => {
    const { profile, originalProfile, fieldChanges } = get();
    if (!profile || !originalProfile) return;

    const newBasic = { ...profile.basic, [key]: value };
    const newProfile = { ...profile, basic: newBasic };

    const fieldKey = `basic.${String(key)}`;
    const label = BASIC_FIELD_LABELS[fieldKey] || String(key);
    const originalValue = String(originalProfile.basic[key] ?? '');
    const newValue = String(value ?? '');

    let newChanges = fieldChanges.filter((c) => c.fieldKey !== fieldKey);
    if (originalValue !== newValue) {
      newChanges = [
        ...newChanges,
        { fieldKey, label, oldValue: originalValue, newValue },
      ];
    }

    set({ profile: newProfile, fieldChanges: newChanges });
  },

  updateWorkField: (key, value) => {
    const { profile, originalProfile, fieldChanges } = get();
    if (!profile || !originalProfile) return;

    const newWork = { ...profile.work, [key]: value };
    const newProfile = { ...profile, work: newWork };

    const fieldKey = `work.${String(key)}`;
    const label = WORK_FIELD_LABELS[fieldKey] || String(key);
    const originalValue = String(originalProfile.work[key] ?? '');
    const newValue = String(value ?? '');

    let newChanges = fieldChanges.filter((c) => c.fieldKey !== fieldKey);
    if (originalValue !== newValue) {
      newChanges = [
        ...newChanges,
        { fieldKey, label, oldValue: originalValue, newValue },
      ];
    }

    set({ profile: newProfile, fieldChanges: newChanges });
  },

  addContract: (contract) => {
    const { profile, newContracts } = get();
    if (!profile) return;
    const withId = { ...contract, id: generateId('C') };
    set({
      profile: { ...profile, contracts: [...profile.contracts, withId] },
      newContracts: [...newContracts, withId],
    });
  },

  deleteAttachment: (id) => {
    const { profile, deletedAttachmentIds, pendingAttachmentUploads } = get();
    if (!profile) return;
    set({
      profile: {
        ...profile,
        attachments: profile.attachments.filter((a) => a.id !== id),
      },
      deletedAttachmentIds: deletedAttachmentIds.includes(id)
        ? deletedAttachmentIds
        : [...deletedAttachmentIds, id],
      pendingAttachmentUploads: pendingAttachmentUploads.filter(
        (a) => a.id !== id
      ),
    });
  },

  addAttachment: (attachment) => {
    const { profile, pendingAttachmentUploads } = get();
    if (!profile) return;
    const withId = { ...attachment, id: generateId('A') };
    set({
      profile: {
        ...profile,
        attachments: [...profile.attachments, withId],
      },
      pendingAttachmentUploads: [...pendingAttachmentUploads, withId],
    });
  },

  setActiveEventFilter: (filter) => set({ activeEventFilter: filter }),

  saveAll: async () => {
    const { fieldChanges, newContracts, deletedAttachmentIds } = get();
    set({ isSaving: true });
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const success = Math.random() > 0.05;
    set({ isSaving: false });

    if (!success) {
      return {
        success: false,
        message: '保存失败：服务器响应异常，请稍后重试。您的修改未丢失。',
      };
    }

    const totalChanges =
      fieldChanges.length + newContracts.length + deletedAttachmentIds.length;

    set((state) => ({
      originalProfile: deepClone(state.profile),
      isEditMode: false,
      fieldChanges: [],
      newContracts: [],
      deletedAttachmentIds: [],
      pendingAttachmentUploads: [],
    }));

    return {
      success: true,
      message: `保存成功！共提交 ${totalChanges} 项变更：${fieldChanges.length} 项字段修改，${newContracts.length} 份新增合同，${deletedAttachmentIds.length} 项附件删除。`,
    };
  },

  cancelEdit: () => {
    const { originalProfile } = get();
    if (!originalProfile) return;
    set({
      profile: deepClone(originalProfile),
      isEditMode: false,
      fieldChanges: [],
      newContracts: [],
      deletedAttachmentIds: [],
      pendingAttachmentUploads: [],
    });
  },

  setError: (err) => set({ error: err }),
  clearError: () => set({ error: null }),

  hasUnsavedChanges: () => {
    const { fieldChanges, newContracts, deletedAttachmentIds, pendingAttachmentUploads } = get();
    return (
      fieldChanges.length > 0 ||
      newContracts.length > 0 ||
      deletedAttachmentIds.length > 0 ||
      pendingAttachmentUploads.length > 0
    );
  },
}));
