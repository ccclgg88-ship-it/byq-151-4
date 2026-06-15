export interface EmployeeBasicInfo {
  employeeId: string;
  name: string;
  gender: '男' | '女';
  birthDate: string;
  idCard: string;
  phone: string;
  email: string;
  emergencyContact: string;
  emergencyPhone: string;
  address: string;
  avatar: string;
}

export interface EmployeeWorkInfo {
  department: string;
  position: string;
  level: string;
  supervisor: string;
  hireDate: string;
  regularDate: string;
  status: '在职' | '试用期' | '离职' | '停薪留职';
}

export type ContractType = '劳动合同' | '实习协议' | '劳务合同' | '续签合同';
export type ContractStatus = '生效中' | '即将到期' | '已过期' | '已解除';

export interface ContractRecord {
  id: string;
  contractNo: string;
  type: ContractType;
  startDate: string;
  endDate: string;
  signParty: string;
  status: ContractStatus;
  remark?: string;
}

export type EventType = '入职' | '转正' | '调岗' | '晋升' | '降职' | '离职' | '薪资调整' | '其他';

export interface ChangeRecord {
  id: string;
  eventType: EventType;
  effectiveDate: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  operator: string;
  remark?: string;
}

export type AttachmentCategory = '身份证' | '学历证书' | '离职证明' | '其他';
export type FileType = 'image' | 'pdf' | 'other';

export interface AttachmentFile {
  id: string;
  name: string;
  category: AttachmentCategory;
  fileType: FileType;
  size: number;
  uploadDate: string;
  url: string;
}

export interface EmployeeProfile {
  basic: EmployeeBasicInfo;
  work: EmployeeWorkInfo;
  contracts: ContractRecord[];
  changes: ChangeRecord[];
  attachments: AttachmentFile[];
}

export interface FieldChange {
  fieldKey: string;
  label: string;
  oldValue: string;
  newValue: string;
}

export type UserRole = 'HR专员' | '部门经理' | '高管';

export interface UserPermission {
  role: UserRole;
  canEdit: boolean;
  canViewAllFields: boolean;
}

export type TabKey = 'basic' | 'contract' | 'change' | 'attachment';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
