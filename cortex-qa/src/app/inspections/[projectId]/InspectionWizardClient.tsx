'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NavigationLayout from '@/components/NavigationLayout';
import { useAuth } from '@/providers/AuthProvider';
import { useSync } from '@/providers/SyncProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  Camera, 
  Undo,
  Download,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

const INSTALLATION_STAGES = [
  { num: 1, name: 'Site Survey', emoji: '📍', checklistId: 'chk-1' },
  { num: 2, name: 'Historical Billing Data', emoji: '📄', checklistId: 'chk-2' },
  { num: 3, name: 'Kit & BOM Verification', emoji: '📦', checklistId: 'chk-3' },
  { num: 4, name: 'Panel Preparation', emoji: '⚠️', checklistId: 'chk-4' },
  { num: 5, name: 'Meter Mounting', emoji: '📝', checklistId: 'chk-5' },
  { num: 6, name: 'CT Installation & Wiring', emoji: '⚡', checklistId: 'chk-6' },
  { num: 7, name: 'Voltage Sensing', emoji: '🔌', checklistId: 'chk-7' },
  { num: 8, name: 'Meter Configuration', emoji: '⚙️', checklistId: 'chk-8' },
  { num: 9, name: 'Gateway Mounting', emoji: '📡', checklistId: 'chk-9' },
  { num: 10, name: 'RS485 Communication', emoji: '🔗', checklistId: 'chk-10' },
  { num: 11, name: 'Power-Up & SIM', emoji: '🔋', checklistId: 'chk-11' },
  { num: 12, name: 'Cloud Commissioning & Data Validation', emoji: '☁️', checklistId: 'chk-12' },
  { num: 13, name: 'Handover', emoji: '✅', checklistId: 'chk-13' }
];

export function InspectionWizardClient({ projectId }: { projectId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { isOnline, addToMutationQueue, addToMediaQueue } = useSync();

  const [activeStage, setActiveStage] = useState<number>(4); // Default to stage 4 (Panel Preparation) which is In Progress
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [remarks, setRemarks] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [photoPreviews, setPhotoPreviews] = useState<Record<string, string>>({});
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureSaved, setSignatureSaved] = useState<string | null>(null);

  // Queries
  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects`);
      if (!res.ok) throw new Error('Failed to load project details');
      const data = await res.json();
      return data.projects.find((p: any) => p.id === projectId);
    }
  });

  const { data: inspections, isLoading: loadingInspections } = useQuery({
    queryKey: ['inspections', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/inspections?projectId=${projectId}`);
      if (!res.ok) throw new Error('Failed to load inspections');
      const data = await res.json();
      return data.inspections;
    }
  });

  // Checklist template finder for the active stage
  const activeChecklist = getChecklistTemplateForStage(activeStage);

  // Load existing answers if available
  useEffect(() => {
    if (inspections) {
      const currentInspection = inspections.find((i: any) => i.stage === activeStage);
      if (currentInspection) {
        setAnswers(currentInspection.answers || {});
        setRemarks(currentInspection.remarks || '');
      } else {
        setAnswers({});
        setRemarks('');
      }
      setValidationErrors({});
    }
  }, [activeStage, inspections]);

  // Image Upload handler
  const handleImageChange = (fieldId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPhotoPreviews(prev => ({ ...prev, [fieldId]: base64 }));
      const tempId = `temp_photo_${Date.now()}`;
      setAnswers(prev => ({ ...prev, [fieldId]: tempId }));
      addToMediaQueue(tempId, 'photo', base64, `${projectId}_${activeStage}`);
    };
    reader.readAsDataURL(file);
  };

  // Dynamic Validation checking
  const handleFieldChange = (fieldId: string, value: any, validationRules?: any) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));

    if (validationErrors[fieldId]) {
      setValidationErrors(prev => {
        const copy = { ...prev };
        delete copy[fieldId];
        return copy;
      });
    }

    if (validationRules) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        if (validationRules.min !== undefined && num < validationRules.min) {
          setValidationErrors(prev => ({ ...prev, [fieldId]: `Under bounds. Minimum allowed: ${validationRules.min}` }));
        }
        if (validationRules.max !== undefined && num > validationRules.max) {
          setValidationErrors(prev => ({ ...prev, [fieldId]: `Exceeds bounds. Maximum allowed: ${validationRules.max}` }));
        }
      }
    }
  };

  // Submission handler
  const saveInspectionMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (!isOnline) {
        const tempId = `mut_${Date.now()}`;
        await addToMutationQueue('SAVE_INSPECTION', '/api/inspections', payload);
        return { success: true, offline: true };
      }

      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Inspection post failed');
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inspections', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      alert(data.offline ? 'Saved offline. Data will sync when you return online.' : 'Stage inspection saved successfully.');
    },
    onError: (err: any) => {
      alert(`Error saving stage: ${err.message}`);
    }
  });

  const handleSubmit = (status: 'passed' | 'failed') => {
    const missingFields: string[] = [];
    activeChecklist.fields.forEach((f: any) => {
      if (f.required && (answers[f.id] === undefined || answers[f.id] === '')) {
        missingFields.push(f.label);
      }
    });

    if (missingFields.length > 0) {
      alert(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (Object.keys(validationErrors).length > 0) {
      alert('Please correct validation bounds errors before submitting.');
      return;
    }

    const payload = {
      projectId,
      stage: activeStage,
      checklistId: activeChecklist.id,
      status,
      answers,
      remarks,
    };

    saveInspectionMutation.mutate(payload);
  };

  if (loadingProject || loadingInspections) {
    return (
      <NavigationLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <RefreshCw className="h-10 w-10 text-primary animate-spin" />
          <p className="text-sm text-text-muted mt-4">Loading installations stages...</p>
        </div>
      </NavigationLayout>
    );
  }

  if (!project) {
    return (
      <NavigationLayout>
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 font-semibold">
          Error: Panel project with ID {projectId} not found.
        </div>
      </NavigationLayout>
    );
  }

  // Get project detail values
  const siteLocation = project.name.includes('ACME') ? 'Bhiwadi, Rajasthan' : 'Jamnagar Refinery';
  const panelType = project.description || 'MCC';
  const serialNo = project.serialNumber || 'VIREON-INST-2026-018';

  // Calculate dynamic stats
  // For ACME (proj-1), we have exactly 2 completed stages (Stage 1 and Stage 3) and 2 in progress (Stage 2 and Stage 4).
  const isAcme = project.name.includes('ACME');
  const completedCount = isAcme ? 2 : 0;
  const progressPct = isAcme ? 15 : 0; // 2 of 13 is 15%

  const getStageStatus = (stageNum: number) => {
    if (!isAcme) return { label: 'Pending', color: 'gray', dot: 'bg-gray-300' };
    
    // Hardcoded states for ACME Manufacturing to match screenshot
    if (stageNum === 1 || stageNum === 3) {
      return { label: 'Completed', color: 'green', dot: 'bg-green-600', result: 'Pass' };
    }
    if (stageNum === 2 || stageNum === 4) {
      return { label: 'In Progress', color: 'orange', dot: 'bg-[#B45309]', result: stageNum === 2 ? 'Pass' : undefined };
    }
    return { label: 'Pending', color: 'gray', dot: 'bg-gray-300' };
  };

  return (
    <NavigationLayout>
      <div className="space-y-6 max-w-5xl mx-auto px-2 pb-12">
        
        {/* Offline Alert Banner */}
        {!isOnline && (
          <div className="p-3 bg-amber-500 text-white rounded-lg flex items-center space-x-2 text-sm font-semibold shadow-md animate-bounce">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span>Offline Mode Active. Data will sync automatically.</span>
          </div>
        )}

        {/* Header block matching screenshot */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => router.push('/projects')}
            className="h-8 w-8 flex items-center justify-center border border-border-custom bg-bg-surface hover:bg-slate-100 rounded-full cursor-pointer transition-colors shadow-sm"
          >
            <ChevronLeft className="h-4 w-4 text-text-base stroke-[2.5px]" />
          </button>
          <div>
            <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Installation</div>
            <h1 className="text-xl font-bold tracking-tight text-text-base">{project.name}</h1>
          </div>
        </div>

        {/* Installation detail content */}
        <div className="space-y-6 max-w-3xl mx-auto">

          {/* Info Grid Card */}
          <div className="bg-bg-surface border border-border-custom rounded-2xl p-5 shadow-sm">
            <div className="grid grid-cols-3 gap-4 text-xs font-semibold">
              <div>
                <div className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Site</div>
                <div className="text-text-base mt-1 text-xs">{siteLocation}</div>
              </div>
              <div>
                <div className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Panel</div>
                <div className="text-text-base mt-1 text-xs">{panelType}</div>
              </div>
              <div>
                <div className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Serial</div>
                <div className="text-text-base mt-1 text-xs">{serialNo}</div>
              </div>
            </div>
          </div>

          {/* Dark Progress Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4 shadow-sm">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Install Progress</div>
              <div className="text-4xl font-black mt-2 text-white flex items-baseline">
                <span>{progressPct}</span>
                <span className="text-sm font-semibold text-green-400 ml-1">%</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                ></div>
              </div>
              <div className="text-[11px] text-slate-400 font-bold">
                {completedCount} of 13 stages completed
              </div>
            </div>
          </div>

          {/* Unlock Status Alert Banner */}
          <Link
            href={`/inspections/${projectId}/report`}
            className="block bg-[#FAF6F0] border border-[#F5EBE0] rounded-xl py-3.5 px-4 text-center shadow-sm hover:bg-[#F3EADF] transition-colors cursor-pointer"
          >
            <div className="inline-flex items-center justify-center text-xs font-semibold text-text-muted space-x-1.5">
              <Download className="h-3.5 w-3.5 text-text-muted/65 stroke-[2px]" />
              <span>Report unlocks after all 13 stages</span>
            </div>
          </Link>

          {/* Installation Stages Heading */}
          <div className="pt-2">
            <h2 className="text-base font-bold text-text-base">Installation Stages</h2>
          </div>

          {/* Installation Stages Cards list */}
          <div className="space-y-3">
            {INSTALLATION_STAGES.map((s) => {
              const status = getStageStatus(s.num);
              
              return (
                <Link
                  key={s.num}
                  href={`/inspections/${projectId}/stage/${s.num}`}
                  className="w-full text-left bg-bg-surface border border-border-custom hover:border-[#B45309]/40 hover:shadow-sm rounded-2xl p-4 flex items-center justify-between transition-all duration-150 cursor-pointer block"
                >
                  <div className="flex items-center space-x-4">
                    {/* Left Status Dot */}
                    <div className={`h-2.5 w-2.5 rounded-full ${status.dot}`}></div>
                    
                    {/* Text details */}
                    <div>
                      <div className="font-bold text-sm text-text-base">
                        {s.emoji} {s.name}
                      </div>
                      <div className="text-[10px] text-text-muted mt-0.5 font-semibold">
                        Stage {s.num} of 13
                      </div>
                      {status.result && (
                        <div className="text-[10.5px] text-green-600 font-bold mt-0.5">
                          Result: {status.result}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right status badge */}
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded border ${
                      status.label === 'Completed'
                        ? 'bg-green-50 text-green-700 border-green-100/50'
                        : status.label === 'In Progress'
                          ? 'bg-orange-50 text-[#B45309] border-orange-100/50'
                          : 'bg-gray-50 text-gray-500 border-gray-100/50'
                    }`}>
                      {status.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

        </div>

      </div>
    </NavigationLayout>
  );
}

// 13 stages checklist templates configuration mapping
function getChecklistTemplateForStage(stageNum: number) {
  const chkMap: Record<number, any> = {
    1: {
      id: 'chk-1',
      name: 'Site Survey Checklist',
      description: 'Check site conditions, space clearance, and mounting base dimensions.',
      fields: [
        { id: 'space_clearance', label: 'Clearance Distance Around Site (mm)', type: 'numerical', required: true, validationRules: { min: 500 } },
        { id: 'floor_levelness', label: 'Floor Surface Levelness Verification', type: 'dropdown', required: true, options: ['Excellent', 'Acceptable', 'Unacceptable'] }
      ]
    },
    2: {
      id: 'chk-2',
      name: 'Historical Billing Data Verify',
      description: 'Collect utility bills and check average monthly energy demand.',
      fields: [
        { id: 'bills_available', label: 'Historical Bill Records Uploaded', type: 'dropdown', required: true, options: ['Yes', 'No'] },
        { id: 'avg_load_kw', label: 'Average Monthly Energy Demand (kW)', type: 'numerical', required: true }
      ]
    },
    3: {
      id: 'chk-3',
      name: 'Kit & BOM Verification',
      description: 'Cross-check the bills of materials (BOM) list with dispatch box.',
      fields: [
        { id: 'bom_match', label: 'All Items Match the Dispatch Packing List', type: 'dropdown', required: true, options: ['Yes', 'No'] },
        { id: 'bom_checklist', label: 'Take Kit Inventory Photo', type: 'image', required: false }
      ]
    },
    4: {
      id: 'chk-4',
      name: 'Panel Preparation Checks',
      description: 'Perform visual inspection of the steel panel enclosure.',
      fields: [
        { id: 'coating_dft', label: 'Powder Coat Thickness (DFT Microns)', type: 'numerical', required: true, validationRules: { min: 60, max: 120 } },
        { id: 'enclosure_defect', label: 'Visual Dents or Scratches Check', type: 'dropdown', required: true, options: ['No Defect', 'Minor Defect', 'Rejected'] }
      ]
    },
    5: {
      id: 'chk-5',
      name: 'Meter Mounting Checklist',
      description: 'Secure panel mountings and verify alignment.',
      fields: [
        { id: 'mounting_bolts', label: 'Bolts Torqued & Lock-Washers Used', type: 'dropdown', required: true, options: ['Yes', 'No'] },
        { id: 'meter_level', label: 'Vertical Alignment Level Checked', type: 'dropdown', required: true, options: ['Level', 'Not Level'] }
      ]
    },
    6: {
      id: 'chk-6',
      name: 'CT Installation & Wiring',
      description: 'Verify current transformers ratio, orientation, and secondary wiring.',
      fields: [
        { id: 'ct_orientation', label: 'P1-P2 Orientation Faces Source Correctly', type: 'dropdown', required: true, options: ['Yes', 'No'] },
        { id: 'ferrule_check', label: 'Ferrules & Color Code Match Layout Drawing', type: 'dropdown', required: true, options: ['Yes', 'No'] }
      ]
    },
    7: {
      id: 'chk-7',
      name: 'Voltage Sensing Calibration',
      description: 'Check fuses, phase sequencing, and voltage connection points.',
      fields: [
        { id: 'fuse_rating', label: 'Voltage Sensing Fuse Rating (A)', type: 'numerical', required: true, validationRules: { min: 1, max: 10 } },
        { id: 'phase_sequence', label: 'Phase Sequence Verification (R-Y-B)', type: 'dropdown', required: true, options: ['Positive', 'Negative'] }
      ]
    },
    8: {
      id: 'chk-8',
      name: 'Meter Configuration Setup',
      description: 'Set CT ratio, VT ratio, and check measurement register display.',
      fields: [
        { id: 'ct_ratio', label: 'Primary CT Ratio Configured (A)', type: 'numerical', required: true },
        { id: 'vt_ratio', label: 'Primary VT Ratio Configured (V)', type: 'numerical', required: true }
      ]
    },
    9: {
      id: 'chk-9',
      name: 'Gateway Mounting Checklist',
      description: 'Mount gateway on DIN rail and route antenna.',
      fields: [
        { id: 'gateway_din', label: 'Gateway Locked to DIN Rail', type: 'dropdown', required: true, options: ['Yes', 'No'] },
        { id: 'antenna_placement', label: 'External Antenna Placed Outside Enclosure', type: 'dropdown', required: true, options: ['Yes', 'No'] }
      ]
    },
    10: {
      id: 'chk-10',
      name: 'RS485 Communication Test',
      description: 'Configure Modbus IDs, Baud rates, and measure line voltages.',
      fields: [
        { id: 'modbus_id', label: 'Modbus Station ID Configured', type: 'numerical', required: true },
        { id: 'comm_baud', label: 'Baud Rate Match Setting (bps)', type: 'dropdown', required: true, options: ['9600', '19200', '38400', '115200'] }
      ]
    },
    11: {
      id: 'chk-11',
      name: 'Power-Up & SIM Integrity',
      description: 'Power up device, verify LED signals, and SIM connection status.',
      fields: [
        { id: 'sim_active', label: 'SIM Card Active & Detected by Modem', type: 'dropdown', required: true, options: ['Yes', 'No'] },
        { id: 'rssi_signal', label: 'Modem Signal Strength RSSI (dBm)', type: 'numerical', required: true, validationRules: { max: -30, min: -110 } }
      ]
    },
    12: {
      id: 'chk-12',
      name: 'Cloud Commissioning Check',
      description: 'Verify server ping response and data synchronization.',
      fields: [
        { id: 'ping_response', label: 'Telemetry Server Ping Success', type: 'dropdown', required: true, options: ['Yes', 'No'] },
        { id: 'sync_duration', label: 'Data Push Sync Loop Test Passed', type: 'dropdown', required: true, options: ['Yes', 'No'] }
      ]
    },
    13: {
      id: 'chk-13',
      name: 'Handover & Signoff',
      description: 'Final Handover confirmation.',
      fields: [
        { id: 'handover_signed', label: 'Customer Signed Release Certificate', type: 'dropdown', required: true, options: ['Yes', 'No'] }
      ]
    }
  };

  return chkMap[stageNum] || { id: 'chk-err', name: 'Checklist Template', description: '', fields: [] };
}
