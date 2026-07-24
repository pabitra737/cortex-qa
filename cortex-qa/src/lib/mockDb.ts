import { TenantFactory, UserProfile, Project, Product, ChecklistTemplate, Inspection, AuditLog, SyncLog } from '@/types';

// Declare global type for hot-reloads in Next.js
declare global {
  var __cortex_mock_db: {
    factories: TenantFactory[];
    users: UserProfile[];
    projects: Project[];
    products: Product[];
    checklists: ChecklistTemplate[];
    inspections: Inspection[];
    auditLogs: AuditLog[];
    syncLogs: SyncLog[];
  } | undefined;
}

const DEFAULT_FACTORIES: TenantFactory[] = [
  {
    id: 'factory-1',
    name: 'Vireon Panels Bangalore',
    location: 'Bangalore, IN',
    settings: {
      allowStageSkipping: false,
      requireDoubleApproval: true,
      companyLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'factory-2',
    name: 'Vireon Switchgear Chennai',
    location: 'Chennai, IN',
    settings: {
      allowStageSkipping: true,
      requireDoubleApproval: false,
      companyLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100'
    },
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_USERS: UserProfile[] = [
  {
    uid: 'user-1',
    email: 'admin@cortex.com',
    name: 'Rajesh Kumar',
    role: 'Super Admin',
    factoryId: 'all',
    status: 'active',
    permissions: ['*'],
    createdAt: new Date().toISOString()
  },
  {
    uid: 'user-2',
    email: 'manager@cortex.com',
    name: 'Suresh Raina',
    role: 'QA Manager',
    factoryId: 'factory-1',
    status: 'active',
    permissions: ['read:all', 'write:inspections', 'approve:inspections', 'manage:projects'],
    createdAt: new Date().toISOString()
  },
  {
    uid: 'user-3',
    email: 'inspector@cortex.com',
    name: 'Amit Patel',
    role: 'QA Inspector',
    factoryId: 'factory-1',
    status: 'active',
    permissions: ['read:all', 'write:inspections'],
    createdAt: new Date().toISOString()
  },
  {
    uid: 'user-4',
    email: 'operator@cortex.com',
    name: 'Vijay Mistry',
    role: 'Operator',
    factoryId: 'factory-1',
    status: 'active',
    permissions: ['read:all'],
    createdAt: new Date().toISOString()
  },
  {
    uid: 'user-5',
    email: 'customer@cortex.com',
    name: 'TATA Power Inspector',
    role: 'Customer',
    factoryId: 'factory-1',
    status: 'active',
    permissions: ['read:all', 'sign:report'],
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    factoryId: 'factory-1',
    name: 'Standard 415V MCC Panel',
    sku: 'MCC-415-STD',
    specifications: {
      voltageRating: '415V',
      currentRating: '800A',
      ipRating: 'IP54',
      dimensions: '2000 x 800 x 600 mm'
    },
    batches: ['BATCH-2026-A', 'BATCH-2026-B'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-2',
    factoryId: 'factory-1',
    name: 'PCC Power Control Center Panel',
    sku: 'PCC-1600-HD',
    specifications: {
      voltageRating: '415V',
      currentRating: '1600A',
      ipRating: 'IP65',
      dimensions: '2200 x 1000 x 800 mm'
    },
    batches: ['BATCH-2026-C'],
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    factoryId: 'factory-1',
    name: 'ACME',
    description: 'High-voltage MCC Panels supply for Metro Expansion Project.',
    engineerIds: ['user-2'],
    inspectorIds: ['user-3'],
    assignedInspectorName: 'Mihir Bajpai',
    serialNumber: 'VIREON-MCC-415V-2026-001',
    drawingNumber: '040',
    tags: ['MCC', 'Pending', '415V'],
    status: 'active',
    currentStage: 4, // Represents 3 completed stages
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'proj-2',
    factoryId: 'factory-1',
    name: 'Reliance',
    description: 'Custom IP65 Heavy Duty Panel batch.',
    engineerIds: ['user-2'],
    inspectorIds: ['user-3'],
    assignedInspectorName: 'Mihir Bajpai',
    serialNumber: 'VIREON-FF-415V-2026-001',
    drawingNumber: 'DRG-01-002',
    tags: ['Fire Fighting', 'Pending', '415V'],
    status: 'active',
    currentStage: 1, // Represents 0 completed stages
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const DEFAULT_CHECKLISTS: ChecklistTemplate[] = [
  {
    id: 'chk-1',
    factoryId: 'factory-1',
    name: 'Incoming Material Checklist',
    description: 'Quality checks on sheets, copper busbars, wire runs and breakers.',
    stage: 1,
    fields: [
      { id: 'sheet_thickness', label: 'Steel Sheet Thickness (mm)', type: 'numerical', required: true, validationRules: { min: 1.5, max: 3.0 } },
      { id: 'busbar_grade', label: 'Copper Grade Certification Verified', type: 'dropdown', required: true, options: ['Yes', 'No'] },
      { id: 'switchgear_visual', label: 'Switchgear Visual Inspection', type: 'dropdown', required: true, options: ['No Defect', 'Minor Defect', 'Rejected'] }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'chk-2',
    factoryId: 'factory-1',
    name: 'Powder Coating Verification',
    description: 'Checks for steel pretreatment and powder coat quality.',
    stage: 2,
    fields: [
      { id: 'dft_microns', label: 'Dry Film Thickness (DFT) in Microns', type: 'numerical', required: true, validationRules: { min: 60, max: 120 } },
      { id: 'cross_hatch', label: 'Adhesion Cross-Hatch Test Rating', type: 'dropdown', required: true, options: ['5B (Perfect)', '4B (Good)', '3B (Chipped)', 'Fail'] },
      { id: 'finish_uniformity', label: 'Surface Uniformity', type: 'dropdown', required: true, options: ['Excellent', 'Acceptable', 'Rework Required'] }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'chk-3',
    factoryId: 'factory-1',
    name: 'Busbar Fabrication Checklist',
    description: 'Check cutting, bending, and punching of copper bars.',
    stage: 3,
    fields: [
      { id: 'busbar_width', label: 'Busbar Width (mm)', type: 'numerical', required: true, validationRules: { min: 20, max: 100 } },
      { id: 'bending_angle', label: 'Bending Angle (Degrees)', type: 'numerical', required: true, validationRules: { min: 89, max: 91 } },
      { id: 'tin_plating', label: 'Tin Plating Quality', type: 'dropdown', required: true, options: ['Satisfactory', 'Uneven Plating', 'No Plating'] }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'chk-4',
    factoryId: 'factory-1',
    name: 'Fabrication Structure Check',
    description: 'Enclosure structural assembly verification.',
    stage: 4,
    fields: [
      { id: 'height_mm', label: 'Overall Height (mm)', type: 'numerical', required: true },
      { id: 'width_mm', label: 'Overall Width (mm)', type: 'numerical', required: true },
      { id: 'welding_quality', label: 'Welding Penetration & Grinding Check', type: 'dropdown', required: true, options: ['Pass', 'Fail'] }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'chk-5',
    factoryId: 'factory-1',
    name: 'Busbar Assembly Clearance & Torque',
    description: 'Verification of clearance spacing and electrical contact torquing.',
    stage: 5,
    fields: [
      { id: 'torque_nm', label: 'Torque Value (Nm)', type: 'numerical', required: true, validationRules: { min: 40, max: 60 } },
      { id: 'phase_clearance', label: 'Phase-to-Phase Clearance (mm)', type: 'numerical', required: true, validationRules: { min: 19, max: 30 } },
      { id: 'phase_earth_clearance', label: 'Phase-to-Earth Clearance (mm)', type: 'numerical', required: true, validationRules: { min: 19, max: 30 } }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'chk-6',
    factoryId: 'factory-1',
    name: 'Wiring Routing & Crimping',
    description: 'Checking wiring paths, ferrule labels, and terminal lugs.',
    stage: 6,
    fields: [
      { id: 'wire_sleeves', label: 'Ferrule Sleeves Match Wiring Schedule', type: 'dropdown', required: true, options: ['Yes', 'No'] },
      { id: 'crimp_test', label: 'Crimping Pull Test', type: 'dropdown', required: true, options: ['Pass', 'Fail'] },
      { id: 'bundling_aesthetic', label: 'Wiring Bundle & Dressing Neatness', type: 'dropdown', required: true, options: ['Excellent', 'Good', 'Needs Rework'] }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'chk-7',
    factoryId: 'factory-1',
    name: 'Electrical Insulation & Megger Tests',
    description: 'Dielectric strength and high voltage isolation testing.',
    stage: 7,
    fields: [
      { id: 'megger_val', label: 'Insulation Resistance Phase-Earth (MΩ)', type: 'numerical', required: true, validationRules: { min: 100, max: 99999 } },
      { id: 'withstand_v', label: 'Power Frequency Withstand Voltage (kV)', type: 'numerical', required: true, validationRules: { min: 2.0, max: 2.5 } }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'chk-8',
    factoryId: 'factory-1',
    name: 'Functional Interlock & Tripping Tests',
    description: 'Switchgear control sequence checks.',
    stage: 8,
    fields: [
      { id: 'shunt_tripping', label: 'Breaker Shunt Tripping Verification', type: 'dropdown', required: true, options: ['Pass', 'Fail'] },
      { id: 'plc_io_signal', label: 'PLC Signal Verification', type: 'dropdown', required: true, options: ['Verified', 'Not Checked', 'Failed'] }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'chk-9',
    factoryId: 'factory-1',
    name: 'Earthing System Integrity Check',
    description: 'Grounding continuity checks.',
    stage: 9,
    fields: [
      { id: 'earth_resistance', label: 'Earth Path Resistance (Ω)', type: 'numerical', required: true, validationRules: { min: 0.0, max: 0.1 } },
      { id: 'earth_labels', label: 'Green/Yellow Earth Symbol Affixed', type: 'dropdown', required: true, options: ['Yes', 'No'] }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'chk-10',
    factoryId: 'factory-1',
    name: 'Final Pre-dispatch Inspection',
    description: 'Inspection of nameplates, door gaskets, keys, and panel cleaning.',
    stage: 10,
    fields: [
      { id: 'gasket_seal', label: 'Door Neoprene Gasket Sealing', type: 'dropdown', required: true, options: ['Air-tight Seal', 'Uneven Seal', 'Rework Required'] },
      { id: 'accessories_included', label: 'Panel Keys and Drawing Pocket Included', type: 'dropdown', required: true, options: ['Yes', 'No'] },
      { id: 'cleaning', label: 'Final Internal & External Cleaning', type: 'dropdown', required: true, options: ['Pass', 'Fail'] }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'chk-11',
    factoryId: 'factory-1',
    name: 'Signature Collection Template',
    description: 'Digital signature log.',
    stage: 11,
    fields: [
      { id: 'inspector_signed', label: 'Inspector Confirmed Sign-off', type: 'dropdown', required: true, options: ['Yes', 'No'] }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'chk-12',
    factoryId: 'factory-1',
    name: 'Final Administrative Approval',
    description: 'Platform signoff & generation of QA Certificate.',
    stage: 12,
    fields: [
      { id: 'approved_for_shipping', label: 'Shipment Approved', type: 'dropdown', required: true, options: ['Yes', 'No'] }
    ],
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_INSPECTIONS: Inspection[] = [
  // Metro Line: Completed stages 1-6
  {
    id: 'proj-1_1',
    projectId: 'proj-1',
    factoryId: 'factory-1',
    stage: 1,
    checklistId: 'chk-1',
    inspectorId: 'user-3',
    status: 'passed',
    answers: { sheet_thickness: 2.1, busbar_grade: 'Yes', switchgear_visual: 'No Defect' },
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'user-2'
  },
  {
    id: 'proj-1_2',
    projectId: 'proj-1',
    factoryId: 'factory-1',
    stage: 2,
    checklistId: 'chk-2',
    inspectorId: 'user-3',
    status: 'passed',
    answers: { dft_microns: 85, cross_hatch: '5B (Perfect)', finish_uniformity: 'Excellent' },
    createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'user-2'
  },
  {
    id: 'proj-1_3',
    projectId: 'proj-1',
    factoryId: 'factory-1',
    stage: 3,
    checklistId: 'chk-3',
    inspectorId: 'user-3',
    status: 'passed',
    answers: { busbar_width: 50, bending_angle: 90, tin_plating: 'Satisfactory' },
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'user-2'
  },
  {
    id: 'proj-1_4',
    projectId: 'proj-1',
    factoryId: 'factory-1',
    stage: 4,
    checklistId: 'chk-4',
    inspectorId: 'user-3',
    status: 'passed',
    answers: { height_mm: 2002, width_mm: 801, welding_quality: 'Pass' },
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'user-2'
  },
  {
    id: 'proj-1_5',
    projectId: 'proj-1',
    factoryId: 'factory-1',
    stage: 5,
    checklistId: 'chk-5',
    inspectorId: 'user-3',
    status: 'passed',
    answers: { torque_nm: 52, phase_clearance: 22, phase_earth_clearance: 22 },
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'user-2'
  },
  {
    id: 'proj-1_6',
    projectId: 'proj-1',
    factoryId: 'factory-1',
    stage: 6,
    checklistId: 'chk-6',
    inspectorId: 'user-3',
    status: 'passed',
    answers: { wire_sleeves: 'Yes', crimp_test: 'Pass', bundling_aesthetic: 'Excellent' },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'user-2'
  },
  // TATA Steel: Completed stages 1-10 (awaiting signature)
  {
    id: 'proj-2_1',
    projectId: 'proj-2',
    factoryId: 'factory-1',
    stage: 1,
    checklistId: 'chk-1',
    inspectorId: 'user-3',
    status: 'passed',
    answers: { sheet_thickness: 2.3, busbar_grade: 'Yes', switchgear_visual: 'No Defect' },
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'user-2'
  },
  {
    id: 'proj-2_2',
    projectId: 'proj-2',
    factoryId: 'factory-1',
    stage: 2,
    checklistId: 'chk-2',
    inspectorId: 'user-3',
    status: 'passed',
    answers: { dft_microns: 90, cross_hatch: '5B (Perfect)', finish_uniformity: 'Excellent' },
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'user-2'
  },
  {
    id: 'proj-2_3',
    projectId: 'proj-2',
    factoryId: 'factory-1',
    stage: 3,
    checklistId: 'chk-3',
    inspectorId: 'user-3',
    status: 'passed',
    answers: { busbar_width: 80, bending_angle: 90, tin_plating: 'Satisfactory' },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'user-2'
  },
  {
    id: 'proj-2_4',
    projectId: 'proj-2',
    factoryId: 'factory-1',
    stage: 4,
    checklistId: 'chk-4',
    inspectorId: 'user-3',
    status: 'passed',
    answers: { height_mm: 2200, width_mm: 1000, welding_quality: 'Pass' },
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'user-2'
  },
  {
    id: 'proj-2_5',
    projectId: 'proj-2',
    factoryId: 'factory-1',
    stage: 5,
    checklistId: 'chk-5',
    inspectorId: 'user-3',
    status: 'passed',
    answers: { torque_nm: 55, phase_clearance: 25, phase_earth_clearance: 24 },
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'user-2'
  },
  {
    id: 'proj-2_6',
    projectId: 'proj-2',
    factoryId: 'factory-1',
    stage: 6,
    checklistId: 'chk-6',
    inspectorId: 'user-3',
    status: 'passed',
    answers: { wire_sleeves: 'Yes', crimp_test: 'Pass', bundling_aesthetic: 'Excellent' },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'user-2'
  },
  {
    id: 'proj-2_7',
    projectId: 'proj-2',
    factoryId: 'factory-1',
    stage: 7,
    checklistId: 'chk-7',
    inspectorId: 'user-3',
    status: 'passed',
    answers: { megger_val: 500, withstand_v: 2.2 },
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'user-2'
  },
  {
    id: 'proj-2_8',
    projectId: 'proj-2',
    factoryId: 'factory-1',
    stage: 8,
    checklistId: 'chk-8',
    inspectorId: 'user-3',
    status: 'passed',
    answers: { shunt_tripping: 'Pass', plc_io_signal: 'Verified' },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'user-2'
  },
  {
    id: 'proj-2_9',
    projectId: 'proj-2',
    factoryId: 'factory-1',
    stage: 9,
    checklistId: 'chk-9',
    inspectorId: 'user-3',
    status: 'passed',
    answers: { earth_resistance: 0.04, earth_labels: 'Yes' },
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'user-2'
  },
  {
    id: 'proj-2_10',
    projectId: 'proj-2',
    factoryId: 'factory-1',
    stage: 10,
    checklistId: 'chk-10',
    inspectorId: 'user-3',
    status: 'passed',
    answers: { gasket_seal: 'Air-tight Seal', accessories_included: 'Yes', cleaning: 'Pass' },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'user-2'
  }
];

const DEFAULT_AUDIT: AuditLog[] = [
  {
    id: 'log-1',
    userId: 'user-3',
    userName: 'Amit Patel',
    action: 'INSPECTION_SUBMIT',
    details: 'Completed Powder Coating Inspection (Stage 2) for Metro Line Substation Project.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-2',
    userId: 'user-2',
    userName: 'Suresh Raina',
    action: 'STAGE_APPROVED',
    details: 'Approved stage 2 for project Metro Line Substation.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_SYNCS: SyncLog[] = [
  {
    id: 'sync-1',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    type: 'upload',
    status: 'success',
    details: 'Successfully synchronized 3 mutations. Media uploads complete.'
  }
];

export function getMockDb(): {
  factories: TenantFactory[];
  users: UserProfile[];
  projects: Project[];
  products: Product[];
  checklists: ChecklistTemplate[];
  inspections: Inspection[];
  auditLogs: AuditLog[];
  syncLogs: SyncLog[];
} {
  if (typeof window === 'undefined') {
    // Server-side
    if (!globalThis.__cortex_mock_db) {
      globalThis.__cortex_mock_db = {
        factories: JSON.parse(JSON.stringify(DEFAULT_FACTORIES)),
        users: JSON.parse(JSON.stringify(DEFAULT_USERS)),
        projects: JSON.parse(JSON.stringify(DEFAULT_PROJECTS)),
        products: JSON.parse(JSON.stringify(DEFAULT_PRODUCTS)),
        checklists: JSON.parse(JSON.stringify(DEFAULT_CHECKLISTS)),
        inspections: JSON.parse(JSON.stringify(DEFAULT_INSPECTIONS)),
        auditLogs: JSON.parse(JSON.stringify(DEFAULT_AUDIT)),
        syncLogs: JSON.parse(JSON.stringify(DEFAULT_SYNCS))
      };
    }
    return globalThis.__cortex_mock_db;
  } else {
    // Client-side (in case it gets loaded on client, return or store in localStorage)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cortex_mock_db');
      if (stored) {
        return JSON.parse(stored);
      }
      const data = {
        factories: DEFAULT_FACTORIES,
        users: DEFAULT_USERS,
        projects: DEFAULT_PROJECTS,
        products: DEFAULT_PRODUCTS,
        checklists: DEFAULT_CHECKLISTS,
        inspections: DEFAULT_INSPECTIONS,
        auditLogs: DEFAULT_AUDIT,
        syncLogs: DEFAULT_SYNCS
      };
      localStorage.setItem('cortex_mock_db', JSON.stringify(data));
      return data;
    }
    return {
      factories: [],
      users: [],
      projects: [],
      products: [],
      checklists: [],
      inspections: [],
      auditLogs: [],
      syncLogs: []
    };
  }
}

export function saveMockDb(db: any) {
  if (typeof window === 'undefined') {
    globalThis.__cortex_mock_db = db;
  } else {
    localStorage.setItem('cortex_mock_db', JSON.stringify(db));
  }
}
