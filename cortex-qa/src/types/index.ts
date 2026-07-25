export type UserRole =
  | 'Super Admin'
  | 'Factory Admin'
  | 'QA Manager'
  | 'QA Engineer'
  | 'QA Inspector'
  | 'Operator'
  | 'Customer';

export interface TenantFactory {
  id: string;
  name: string;
  location: string;
  settings: {
    allowStageSkipping: boolean;
    requireDoubleApproval: boolean;
    companyLogoUrl?: string;
  };
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  factoryId: string; // "all" for Super Admin
  status: 'active' | 'inactive';
  permissions: string[];
  createdAt: string;
}

export interface Project {
  id: string;
  factoryId: string;
  name: string;
  description: string;
  engineerIds: string[];
  inspectorIds: string[];
  assignedInspectorName?: string;
  serialNumber?: string;
  drawingNumber?: string;
  tags?: string[];
  status: 'pending' | 'active' | 'completed';
  currentStage: number; // 1 to 12
  createdAt: string;
  updatedAt: string;
  customerName?: string;
  customerEmail?: string;
  poNumber?: string;
  poDate?: string;
  panelType?: string;
  panelRating?: string;
  panelThicknessBody?: string;
  panelThicknessGland?: string;
  panelThicknessMounting?: string;
  panelThicknessDoor?: string;
  cableEntry?: string;
  wireSizeControl?: string;
  wireSizePower?: string;
}

export interface ProductSpec {
  dimensions?: string;
  voltageRating?: string;
  currentRating?: string;
  ipRating?: string;
}

export interface Product {
  id: string;
  factoryId: string;
  name: string;
  sku: string;
  specifications: ProductSpec;
  batches: string[];
  createdAt: string;
}

export interface Inspection {
  id: string; // e.g. projectId_stage
  projectId: string;
  factoryId: string;
  stage: number; // 1 to 12
  checklistId: string;
  inspectorId: string;
  status: 'pending' | 'passed' | 'failed';
  answers: Record<string, any>;
  signatureUrl?: string;
  approvedBy?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistField {
  id: string;
  label: string;
  type: 'numerical' | 'dropdown' | 'image' | 'text';
  required: boolean;
  options?: string[];
  validationRules?: {
    min?: number;
    max?: number;
  };
}

export interface ChecklistTemplate {
  id: string;
  factoryId: string;
  name: string;
  description: string;
  stage: number; // 1 to 12
  fields: ChecklistField[];
  createdAt: string;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  type: 'upload' | 'download' | 'conflict_resolved';
  status: 'success' | 'failed';
  details: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface DashboardMetrics {
  totalProjects: number;
  pendingInspections: number;
  completedReports: number;
  activeUsers: number;
  stageCompletionRates: Record<number, number>; // stage -> percentage
  monthlyTrend: Array<{ month: string; passed: number; failed: number }>;
  defectsByStage: Record<string, number>;
  totalInspections?: number;
  completedInspections?: number;
  failedInspections?: number;
  pendingInspectionsCount?: number;
  passRate?: number;
  stagesDone?: number;
  inProgressStages?: number;
  pendingStages?: number;
  totalStages?: number;
  installCompletionRate?: number;
}
