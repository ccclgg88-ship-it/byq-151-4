## 1. 架构设计

```mermaid
graph TD
    subgraph 前端应用 (React + Vite)
        A["App入口 / Router"] --> B["全局状态管理层 (Zustand)"]
        A --> C["页面层 (Pages)"]
        C --> D["组件层 (Components)"]
        D --> E["通用UI组件 (UI Kit)"]
        B --> C
        B --> D
    end
    subgraph 数据层
        F["Mock数据 / Types"] --> B
        G["工具函数 (Utils)"] --> D
    end
```

**前端单层架构说明**：由于本需求未提供真实后端，采用纯前端+Mock数据架构。Zustand作为全局状态中心管理员工档案数据、编辑状态、变更记录。所有组件通过store订阅状态，避免props drilling。

## 2. 技术描述

- **前端框架**：React@18（函数组件 + Hooks）
- **开发语言**：TypeScript@5（严格模式）
- **构建工具**：Vite@5
- **样式方案**：Tailwind CSS@3（CSS变量主题）
- **状态管理**：Zustand@4（扁平化store，中间件persist可选）
- **路由**：React Router DOM@6（单页详情路由 `/employee/:id`）
- **UI组件库**：
  - Lucide React（线性图标）
  - Ant Design Timeline（时间轴组件，按需引入）
  - 其余组件自封装（避免引入过重UI库）
- **工具库**：
  - dayjs（日期格式化与计算，尤其合同到期天数）
  - react-easy-crop（头像裁剪预览）
- **后端**：无（纯前端Mock）
- **数据库**：无（Mock数据写在TS文件中）

## 3. 路由定义

| 路由路径 | 页面组件 | 用途 |
|----------|----------|------|
| `/` | `RedirectPage` | 重定向到默认员工档案页（演示用） |
| `/employee/:employeeId` | `EmployeeProfilePage` | 员工档案详情主页 |
| `/employee/:employeeId/print` | `EmployeePrintPage` | A4档案打印预览页（独立路由，方便打印） |

## 4. 类型定义（TypeScript）

```typescript
// ========== 员工基本信息 ==========
interface EmployeeBasicInfo {
  employeeId: string;        // 工号
  name: string;              // 姓名
  gender: '男' | '女';
  birthDate: string;         // YYYY-MM-DD
  idCard: string;            // 身份证号
  phone: string;             // 手机号
  email: string;
  emergencyContact: string;  // 紧急联系人姓名+关系
  emergencyPhone: string;    // 紧急联系电话
  address: string;           // 现住址
  avatar: string;            // 头像URL(base64或链接)
}

interface EmployeeWorkInfo {
  department: string;        // 部门
  position: string;          // 岗位
  level: string;             // 职级
  supervisor: string;        // 直属上级姓名
  hireDate: string;          // 入职日期
  regularDate: string;       // 转正日期
  status: '在职' | '试用期' | '离职' | '停薪留职';
}

// ========== 合同信息 ==========
interface ContractRecord {
  id: string;
  contractNo: string;        // 合同编号
  type: '劳动合同' | '实习协议' | '劳务合同' | '续签合同';
  startDate: string;
  endDate: string;
  signParty: string;         // 签约主体（公司全称）
  status: '生效中' | '即将到期' | '已过期' | '已解除';
  remark?: string;
}

// ========== 异动记录 ==========
type EventType = '入职' | '转正' | '调岗' | '晋升' | '降职' | '离职' | '薪资调整' | '其他';

interface ChangeRecord {
  id: string;
  eventType: EventType;
  effectiveDate: string;
  fieldName: string;         // 变更字段名，如"岗位"
  oldValue: string;
  newValue: string;
  operator: string;          // 操作人姓名
  remark?: string;
}

// ========== 附件资料 ==========
type AttachmentCategory = '身份证' | '学历证书' | '离职证明' | '其他';
type FileType = 'image' | 'pdf' | 'other';

interface AttachmentFile {
  id: string;
  name: string;              // 文件名
  category: AttachmentCategory;
  fileType: FileType;
  size: number;              // bytes
  uploadDate: string;
  url: string;               // 预览URL
}

// ========== 组合：完整员工档案 ==========
interface EmployeeProfile {
  basic: EmployeeBasicInfo;
  work: EmployeeWorkInfo;
  contracts: ContractRecord[];
  changes: ChangeRecord[];
  attachments: AttachmentFile[];
}

// ========== 编辑态：变更记录项 ==========
interface FieldChange {
  fieldKey: string;          // 如"basic.phone"
  label: string;             // 中文显示名，如"手机号"
  oldValue: string;
  newValue: string;
}

// ========== 用户权限 ==========
interface UserPermission {
  role: 'HR专员' | '部门经理' | '高管';
  canEdit: boolean;
  canViewAllFields: boolean;
}
```

## 5. 目录结构（模块组织）

```
src/
├── main.tsx                     # 入口文件
├── App.tsx                      # 路由配置
├── types/
│   └── employee.ts              # 所有TS类型定义
├── data/
│   └── mockEmployee.ts          # Mock员工档案数据
├── store/
│   └── useEmployeeStore.ts      # Zustand全局状态
├── hooks/
│   ├── useDirtyCheck.ts         # 离开页面脏检查Hook
│   ├── useUnsavedChanges.ts     # 未保存变更追踪Hook
│   └── useToast.ts              # Toast通知Hook
├── utils/
│   ├── dateUtils.ts             # 日期/到期计算
│   ├── fileUtils.ts             # 文件大小格式化
│   └── printUtils.ts            # 打印辅助
├── components/
│   ├── common/
│   │   ├── ActionBar.tsx        # 顶部快捷操作栏
│   │   ├── TabContainer.tsx     # Tab切换容器（保留未保存状态）
│   │   ├── Toast.tsx            # Toast消息
│   │   ├── ConfirmDialog.tsx    # 二次确认弹窗
│   │   ├── ChangeListDrawer.tsx # 变更清单抽屉
│   │   └── LoadingError.tsx     # 加载失败+重试
│   ├── basic/
│   │   ├── BasicInfoTab.tsx     # 基本信息Tab主组件
│   │   ├── InfoForm.tsx         # 信息表单（可编辑/只读切换）
│   │   └── AvatarUploader.tsx   # 头像上传+裁剪
│   ├── contract/
│   │   ├── ContractTab.tsx      # 合同Tab
│   │   ├── ContractTable.tsx    # 合同列表
│   │   ├── ContractDetailModal.tsx # 详情弹窗
│   │   └── ContractFormModal.tsx   # 新增合同弹窗
│   ├── change/
│   │   ├── ChangeTab.tsx        # 异动Tab
│   │   ├── EventTimeline.tsx    # 时间轴（基于AntD Timeline封装）
│   │   └── EventFilter.tsx      # 事件筛选器
│   └── attachment/
│       ├── AttachmentTab.tsx    # 附件Tab
│       ├── FileCategoryTabs.tsx # 分类次级Tab
│       ├── FileCard.tsx         # 文件卡片
│       ├── FilePreviewModal.tsx # 预览弹窗
│       └── FileUploader.tsx     # 上传区域
└── pages/
    ├── EmployeeProfilePage.tsx  # 详情主页
    └── EmployeePrintPage.tsx    # A4打印页
```

## 6. 关键技术决策说明

### 6.1 Zustand Store 设计

Store需保存：完整档案数据、编辑模式标记、各Tab未保存的草稿数据、变更清单、当前权限、加载/错误状态。

核心动作：
- `loadProfile(employeeId)`：异步加载（模拟网络请求，内置延迟，可返回失败用于演示重试）
- `toggleEditMode(enabled)`：切换编辑模式
- `updateBasicField(key, value)`：更新基本信息字段，自动记录变更
- `updateWorkField(key, value)`：更新工作信息字段
- `addContract(contract)`：新增合同
- `deleteAttachment(id)`：删除附件
- `saveAll()`：保存所有变更（模拟API调用），成功后清空变更清单
- `cancelEdit()`：还原为原始数据，清空变更清单
- `setError/clearError`：错误状态管理

### 6.2 Tab切换不丢失未保存内容的实现

方案：各Tab组件内部将编辑态（表单值）维护在自身state中，而非依赖store的"唯一真相"。切换Tab时组件不卸载。

实现方式：`TabContainer`组件使用`display: none/block`切换内容（而非条件渲染卸载），或使用React Router `Outlet` + `key` 控制。推荐前者更轻量。

### 6.3 合同到期自动标记

- 渲染合同时，使用 `dayjs(endDate).diff(dayjs(), 'day')` 计算剩余天数
- 剩余天数 ∈ (0, 30]：状态标记为「即将到期」，徽章橙色
- 剩余天数 ≤ 0：标记为「已过期」，徽章灰色/红色
- 计算结果只用于展示，不修改原始数据（纯函数计算）

### 6.4 打印A4摘要页

- 独立路由 `/employee/:id/print`，页面加载后自动调用 `window.print()`
- 使用 CSS `@media print` 规则：隐藏无关元素，设置页面尺寸 `@page { size: A4; margin: 20mm; }`
- 打印内容：员工基本信息卡片 + 合同列表（简化版）+ 最近10条异动记录

### 6.5 脏检查（离开页面提示）

自定义Hook `useDirtyCheck(hasUnsavedChanges: boolean)`：
- 绑定 `window.onbeforeunload` 事件（浏览器刷新/关闭）
- 监听 React Router `useBeforeUnload`（路由切换）
- 当 `hasUnsavedChanges` 为true时，触发浏览器默认提示或自定义弹窗
