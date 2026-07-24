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
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  PenTool, 
  Download, 
  RefreshCw, 
  Eye, 
  Undo,
  FileCheck
} from 'lucide-react';

const STAGES = [
  { num: 1, name: 'Incoming Material' },
  { num: 2, name: 'Powder Coating' },
  { num: 3, name: 'Busbar Fabrication' },
  { num: 4, name: 'Fabrication Structure' },
  { num: 5, name: 'Busbar Assembly' },
  { num: 6, name: 'Wiring' },
  { num: 7, name: 'Electrical Testing' },
  { num: 8, name: 'Functional Testing' },
  { num: 9, name: 'Earthing' },
  { num: 10, name: 'Final Dispatch' },
  { num: 11, name: 'Signature Collection' },
  { num: 12, name: 'Final Approval' },
];

export function InspectionWizardClient({ projectId }: { projectId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isRole } = useAuth();
  const { isOnline, addToMutationQueue, addToMediaQueue } = useSync();

  const [activeStage, setActiveStage] = useState<number>(1);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [remarks, setRemarks] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Media states
  const [photoPreviews, setPhotoPreviews] = useState<Record<string, string>>({});
  
  // Signature pad states
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

  const { data: checklists } = useQuery({
    queryKey: ['checklists'],
    queryFn: async () => {
      const res = await fetch('/api/projects'); // Mocking templates config pull
      // Checklist templates are static, we pre-filled them in mockDb
      // We'll call /api/inspections or local retrieval. For client runtime, we can simulate fetching
      const templatesRes = await fetch('/api/factories'); // Pull general settings
      const dbRes = await fetch(`/api/inspections?projectId=${projectId}`); // Pull check info
      return []; // templates will resolve dynamically from project details
    }
  });

  // Checklist template finder for the active stage
  const activeChecklist = getChecklistTemplateForStage(activeStage);

  // Initial stage alignment on load
  useEffect(() => {
    if (project) {
      setActiveStage(project.currentStage);
    }
  }, [project]);

  // Load existing answers if available
  useEffect(() => {
    if (inspections) {
      const currentInspection = inspections.find((i: any) => i.stage === activeStage);
      if (currentInspection) {
        setAnswers(currentInspection.answers || {});
        setRemarks(currentInspection.remarks || '');
        if (activeStage === 11 && currentInspection.signatureUrl) {
          setSignatureSaved(currentInspection.signatureUrl);
        }
      } else {
        setAnswers({});
        setRemarks('');
        setSignatureSaved(null);
      }
      setValidationErrors({});
    }
  }, [activeStage, inspections]);

  // Signature Canvas Listeners
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#111827';

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureSaved(null);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setSignatureSaved(dataUrl);
  };

  // Image Upload handler (Simulation with base64 compression)
  const handleImageChange = (fieldId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      
      // Store preview locally
      setPhotoPreviews(prev => ({ ...prev, [fieldId]: base64 }));
      
      // Set value to answers
      // If offline, we generate a temporary photo identifier which will map on sync
      const tempId = `temp_photo_${Date.now()}`;
      setAnswers(prev => ({ ...prev, [fieldId]: tempId }));
      
      // Queue media item in IndexedDB media_queue
      addToMediaQueue(tempId, 'photo', base64, `${projectId}_${activeStage}`);
    };
    reader.readAsDataURL(file);
  };

  // Dynamic Validation checking
  const handleFieldChange = (fieldId: string, value: any, validationRules?: any) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));

    // Reset validation for this field
    if (validationErrors[fieldId]) {
      setValidationErrors(prev => {
        const copy = { ...prev };
        delete copy[fieldId];
        return copy;
      });
    }

    // Bounds checking
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

  // Stepper state checks
  const isStageLocked = (stageNum: number) => {
    if (!project) return true;
    if (user?.role === 'Super Admin' || user?.role === 'Factory Admin') return false; // Admin bypass
    
    // Non-admins can only click stages up to the project's current active stage
    return stageNum > project.currentStage;
  };

  const isStagePassed = (stageNum: number) => {
    return inspections?.some((i: any) => i.stage === stageNum && i.status === 'passed') || false;
  };

  // Submission handler
  const saveInspectionMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (!isOnline) {
        // Offline: save to IndexedDB queue and return mock success
        const tempId = `mut_${Date.now()}`;
        await addToMutationQueue('SAVE_INSPECTION', '/api/inspections', payload);
        return { success: true, offline: true };
      }

      // Online: send request directly
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
      if (!data.offline && activeStage < 12) {
        setActiveStage(prev => prev + 1);
      }
    },
    onError: (err: any) => {
      alert(`Error saving stage: ${err.message}`);
    }
  });

  const handleSubmit = (status: 'passed' | 'failed') => {
    // 1. Validation check
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

    // 2. Format signature payload
    let signatureUrl = signatureSaved;
    let tempSignatureId = undefined;

    if (activeStage === 11) {
      if (!signatureSaved) {
        alert('Please draw and confirm your digital signature first.');
        return;
      }
      if (signatureSaved.startsWith('data:image')) {
        // Base64 signature
        tempSignatureId = `sig_${Date.now()}`;
        addToMediaQueue(tempSignatureId, 'signature', signatureSaved, `${projectId}_11`);
        signatureUrl = null; // Will be set on server side upload
      }
    }

    // 3. Compile payload
    const payload = {
      projectId,
      stage: activeStage,
      checklistId: activeChecklist.id,
      status,
      answers,
      remarks,
      signatureUrl,
      tempSignatureId,
    };

    saveInspectionMutation.mutate(payload);
  };

  if (loadingProject || loadingInspections) {
    return (
      <NavigationLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <RefreshCw className="h-10 w-10 text-primary animate-spin" />
          <p className="text-sm text-text-muted mt-4">Loading manufacturing checklists...</p>
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

  return (
    <NavigationLayout>
      <div className="space-y-6">
        
        {/* Offline Alert Banner */}
        {!isOnline && (
          <div className="p-3 bg-amber-500 text-white rounded-lg flex items-center space-x-2 text-sm font-semibold shadow-md animate-bounce">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span>Offline Mode Active. Inspections and media uploads will be cached locally in IndexedDB and synchronized automatically.</span>
          </div>
        )}

        {/* Back Link & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => router.push('/projects')}
              className="p-2 border border-border-custom hover:bg-accent/5 rounded-lg cursor-pointer touch-target"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{project.name}</h1>
              <p className="text-xs text-text-muted">Workflow control & sequential checklists</p>
            </div>
          </div>
          
          {/* Certificate Downloader on Approval */}
          {project.status === 'completed' && (
            <Link
              href={`/api/reports/pdf?projectId=${project.id}`}
              target="_blank"
              className="inline-flex items-center bg-accent hover:bg-black text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer touch-target shadow"
            >
              <FileCheck className="mr-2 h-4 w-4" />
              Download QA Release Certificate
            </Link>
          )}
        </div>

        {/* ======================================================== */}
        {/* 1. HORIZONTAL WORKFLOW STEPPER */}
        {/* ======================================================== */}
        <div className="bg-bg-surface border border-border-custom rounded-2xl p-4 shadow-sm">
          <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-thin">
            {STAGES.map((s) => {
              const isActive = activeStage === s.num;
              const isLocked = isStageLocked(s.num);
              const isPassed = isStagePassed(s.num);
              
              return (
                <button
                  key={s.num}
                  disabled={isLocked && activeStage !== s.num}
                  onClick={() => setActiveStage(s.num)}
                  className={`flex flex-col items-center min-w-[90px] p-2 rounded-xl transition-all border cursor-pointer touch-target ${
                    isActive 
                      ? 'border-primary bg-primary/10 shadow-sm' 
                      : isPassed 
                        ? 'border-green-500 bg-green-500/5'
                        : isLocked 
                          ? 'border-border-custom opacity-50 cursor-not-allowed'
                          : 'border-border-custom hover:border-text-base'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    isActive 
                      ? 'bg-primary text-white' 
                      : isPassed 
                        ? 'bg-green-500 text-white'
                        : 'bg-accent/10 text-text-muted'
                  }`}>
                    {isLocked ? <Lock className="h-3.5 w-3.5" /> : s.num}
                  </div>
                  <span className="text-[10px] font-semibold mt-1.5 text-center line-clamp-1 w-20">{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. ACTIVE STAGE INSPECTION CHECKLIST */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Checklist Form Card */}
          <div className="lg:col-span-2 bg-bg-surface border border-border-custom rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded">STAGE {activeStage}</span>
                <h2 className="font-bold text-lg">{activeChecklist.name}</h2>
              </div>
              <p className="text-sm text-text-muted mt-1">{activeChecklist.description}</p>
            </div>

            <div className="space-y-4 border-t border-border-custom pt-4">
              {activeChecklist.fields.map((f: any) => (
                <div key={f.id} className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </label>

                  {/* 1. Numerical Input */}
                  {f.type === 'numerical' && (
                    <div className="space-y-1">
                      <input
                        type="number"
                        step="any"
                        value={answers[f.id] || ''}
                        onChange={(e) => handleFieldChange(f.id, e.target.value, f.validationRules)}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary ${
                          validationErrors[f.id] ? 'border-red-500 bg-red-500/5' : 'border-border-custom bg-bg-base'
                        }`}
                        placeholder="Enter numerical verification value"
                      />
                      {validationErrors[f.id] && (
                        <p className="text-xs text-red-500 font-semibold">{validationErrors[f.id]}</p>
                      )}
                    </div>
                  )}

                  {/* 2. Dropdown field */}
                  {f.type === 'dropdown' && (
                    <select
                      value={answers[f.id] || ''}
                      onChange={(e) => handleFieldChange(f.id, e.target.value)}
                      className="w-full px-3 py-2 border border-border-custom bg-bg-base rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
                    >
                      <option value="">Select option</option>
                      {f.options?.map((o: any) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  )}

                  {/* 3. Text field */}
                  {f.type === 'text' && (
                    <input
                      type="text"
                      value={answers[f.id] || ''}
                      onChange={(e) => handleFieldChange(f.id, e.target.value)}
                      className="w-full px-3 py-2 border border-border-custom bg-bg-base rounded-lg text-sm focus:outline-none"
                      placeholder="Specify findings"
                    />
                  )}

                  {/* 4. Photo Attachment upload field */}
                  {f.type === 'image' && (
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center px-4 py-2 border border-dashed border-primary/50 bg-primary/5 rounded-lg text-xs font-semibold text-primary cursor-pointer hover:bg-primary/10 transition-colors touch-target">
                        <Camera className="h-4 w-4 mr-2" />
                        <span>Capture photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(f.id, e)}
                          className="hidden"
                        />
                      </label>

                      {photoPreviews[f.id] && (
                        <div className="relative h-14 w-14 rounded-lg overflow-hidden border border-border-custom shadow-inner">
                          <img src={photoPreviews[f.id]} className="h-full w-full object-cover" alt="preview" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Remarks Box */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Inspection Comments / Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Record defect description or general notes..."
                  className="w-full px-3 py-2 border border-border-custom bg-bg-base rounded-lg text-sm focus:outline-none focus:border-primary min-h-[60px]"
                />
              </div>

              {/* Signatures Collection Canvas for Stage 11 */}
              {activeStage === 11 && (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Digital Signature Capture Pad</label>
                  
                  {signatureSaved ? (
                    <div className="border border-border-custom bg-accent/5 rounded-lg p-4 flex flex-col items-center">
                      <img src={signatureSaved} alt="Saved signature" className="max-h-[80px]" />
                      <button 
                        onClick={clearSignature}
                        className="mt-2 text-xs font-bold text-red-500 flex items-center hover:underline cursor-pointer"
                      >
                        <Undo className="h-3 w-3 mr-1" />
                        Clear signature and re-draw
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <canvas
                        ref={canvasRef}
                        width={400}
                        height={150}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full border border-dashed border-text-muted bg-white rounded-lg cursor-crosshair h-[150px]"
                      />
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={clearSignature}
                          className="px-3 py-1.5 border border-border-custom hover:bg-accent/5 rounded-md text-xs font-semibold cursor-pointer"
                        >
                          Clear canvas
                        </button>
                        <button
                          type="button"
                          onClick={saveSignature}
                          className="px-3 py-1.5 bg-accent hover:bg-black text-white rounded-md text-xs font-semibold cursor-pointer"
                        >
                          Confirm & Save Signature
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stepper Submission Controls */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border-custom">
              {activeStage > 1 && (
                <button
                  onClick={() => setActiveStage(prev => prev - 1)}
                  className="px-4 py-2 border border-border-custom rounded-lg text-sm font-semibold hover:bg-accent/5 cursor-pointer touch-target flex items-center justify-center"
                >
                  <ChevronLeft className="mr-1.5 h-4 w-4" />
                  Previous Stage
                </button>
              )}
              
              <button
                onClick={() => handleSubmit('failed')}
                disabled={saveInspectionMutation.isPending}
                className="px-4 py-2 border border-red-500 text-red-600 hover:bg-red-500/5 rounded-lg text-sm font-semibold transition-colors cursor-pointer touch-target flex items-center justify-center"
              >
                Log Stage Defect (FAIL)
              </button>

              <button
                onClick={() => handleSubmit('passed')}
                disabled={saveInspectionMutation.isPending}
                className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer touch-target shadow flex items-center justify-center"
              >
                {saveInspectionMutation.isPending ? 'Saving...' : activeStage === 12 ? 'Approve & Release Panel' : 'Approve & Next Stage'}
                <ChevronRight className="ml-1.5 h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Workflow Side Legend Panel */}
          <div className="bg-bg-surface border border-border-custom rounded-2xl p-6 shadow-sm h-fit space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-text-muted">Workflow Progress Checklist</h3>
            <div className="space-y-3">
              {STAGES.map((s) => {
                const isPassed = isStagePassed(s.num);
                const isActive = activeStage === s.num;
                
                return (
                  <div key={s.num} className="flex items-center text-sm">
                    {isPassed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    ) : isActive ? (
                      <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center mr-2 flex-shrink-0 animate-pulse">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border border-border-custom bg-accent/5 mr-2 flex-shrink-0"></div>
                    )}
                    <span className={`font-medium ${isActive ? 'text-primary font-bold' : isPassed ? 'text-green-600' : 'text-text-muted'}`}>
                      Stage {s.num}: {s.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </NavigationLayout>
  );
}

// Client checklist structure pre-sets
function getChecklistTemplateForStage(stageNum: number) {
  const chkMap: Record<number, any> = {
    1: {
      id: 'chk-1',
      name: 'Incoming Material Checklist',
      description: 'Verify dimensions and check for visual anomalies.',
      fields: [
        { id: 'sheet_thickness', label: 'Steel Sheet Thickness (mm)', type: 'numerical', required: true, validationRules: { min: 1.5, max: 3.0 } },
        { id: 'busbar_grade', label: 'Copper Grade Certification Verified', type: 'dropdown', required: true, options: ['Yes', 'No'] },
        { id: 'switchgear_visual', label: 'Switchgear Visual Inspection', type: 'dropdown', required: true, options: ['No Defect', 'Minor Defect', 'Rejected'] }
      ]
    },
    2: {
      id: 'chk-2',
      name: 'Powder Coating Verification',
      description: 'Check Dry Film Thickness (DFT) and adhesion checks.',
      fields: [
        { id: 'dft_microns', label: 'Dry Film Thickness (DFT) in Microns', type: 'numerical', required: true, validationRules: { min: 60, max: 120 } },
        { id: 'cross_hatch', label: 'Adhesion Cross-Hatch Test Rating', type: 'dropdown', required: true, options: ['5B (Perfect)', '4B (Good)', '3B (Chipped)', 'Fail'] },
        { id: 'coating_attachment', label: 'Coating surface visual attachment', type: 'image', required: false }
      ]
    },
    3: {
      id: 'chk-3',
      name: 'Busbar Fabrication Checklist',
      description: 'Check dimensions and bending angles.',
      fields: [
        { id: 'busbar_width', label: 'Busbar Width (mm)', type: 'numerical', required: true, validationRules: { min: 20, max: 100 } },
        { id: 'bending_angle', label: 'Bending Angle (Degrees)', type: 'numerical', required: true, validationRules: { min: 89, max: 91 } },
        { id: 'tin_plating', label: 'Tin Plating Quality', type: 'dropdown', required: true, options: ['Satisfactory', 'Uneven Plating', 'No Plating'] }
      ]
    },
    4: {
      id: 'chk-4',
      name: 'Fabrication Structure Check',
      description: 'Check overall structural dimensions and welding.',
      fields: [
        { id: 'height_mm', label: 'Overall Height (mm)', type: 'numerical', required: true },
        { id: 'width_mm', label: 'Overall Width (mm)', type: 'numerical', required: true },
        { id: 'welding_quality', label: 'Welding Penetration & Grinding Check', type: 'dropdown', required: true, options: ['Pass', 'Fail'] }
      ]
    },
    5: {
      id: 'chk-5',
      name: 'Busbar Assembly Clearance & Torque',
      description: 'Torque values and electrical clearance spacing.',
      fields: [
        { id: 'torque_nm', label: 'Torque Value (Nm)', type: 'numerical', required: true, validationRules: { min: 40, max: 60 } },
        { id: 'phase_clearance', label: 'Phase-to-Phase Clearance (mm)', type: 'numerical', required: true, validationRules: { min: 19, max: 30 } }
      ]
    },
    6: {
      id: 'chk-6',
      name: 'Wiring Routing & Crimping',
      description: 'Ferrules match schematics, bundle neatness, crimp testing.',
      fields: [
        { id: 'wire_sleeves', label: 'Ferrule Sleeves Match Wiring Schedule', type: 'dropdown', required: true, options: ['Yes', 'No'] },
        { id: 'crimp_test', label: 'Crimping Pull Test', type: 'dropdown', required: true, options: ['Pass', 'Fail'] }
      ]
    },
    7: {
      id: 'chk-7',
      name: 'Electrical Insulation & Megger Tests',
      description: 'Insulation resistance measurements and frequency withstand voltage.',
      fields: [
        { id: 'megger_val', label: 'Insulation Resistance Phase-Earth (MΩ)', type: 'numerical', required: true, validationRules: { min: 100, max: 99999 } },
        { id: 'withstand_v', label: 'Power Frequency Withstand Voltage (kV)', type: 'numerical', required: true, validationRules: { min: 2.0, max: 2.5 } }
      ]
    },
    8: {
      id: 'chk-8',
      name: 'Functional Interlock & Tripping Tests',
      description: 'Test circuit breaker trips and PLC signal lines.',
      fields: [
        { id: 'shunt_tripping', label: 'Breaker Shunt Tripping Verification', type: 'dropdown', required: true, options: ['Pass', 'Fail'] },
        { id: 'plc_io_signal', label: 'PLC Signal Verification', type: 'dropdown', required: true, options: ['Verified', 'Not Checked', 'Failed'] }
      ]
    },
    9: {
      id: 'chk-9',
      name: 'Earthing System Integrity Check',
      description: 'Chassis ground bar continuity checks.',
      fields: [
        { id: 'earth_resistance', label: 'Earth Path Resistance (Ω)', type: 'numerical', required: true, validationRules: { min: 0.0, max: 0.1 } },
        { id: 'earth_labels', label: 'Green/Yellow Earth Symbol Affixed', type: 'dropdown', required: true, options: ['Yes', 'No'] }
      ]
    },
    10: {
      id: 'chk-10',
      name: 'Final Pre-dispatch Inspection',
      description: 'Door seals, drawings, cleaning, nameplate checklist.',
      fields: [
        { id: 'gasket_seal', label: 'Door Neoprene Gasket Sealing', type: 'dropdown', required: true, options: ['Air-tight Seal', 'Uneven Seal', 'Rework Required'] },
        { id: 'accessories_included', label: 'Panel Keys and Drawing Pocket Included', type: 'dropdown', required: true, options: ['Yes', 'No'] },
        { id: 'cleaning', label: 'Final Internal & External Cleaning', type: 'dropdown', required: true, options: ['Pass', 'Fail'] }
      ]
    },
    11: {
      id: 'chk-11',
      name: 'Signature Collection Template',
      description: 'Collect digital signatures on tablet.',
      fields: [
        { id: 'inspector_signed', label: 'Inspector Confirmed Sign-off', type: 'dropdown', required: true, options: ['Yes', 'No'] }
      ]
    },
    12: {
      id: 'chk-12',
      name: 'Final Administrative Approval',
      description: 'Final Release sign-off.',
      fields: [
        { id: 'approved_for_shipping', label: 'Shipment Approved', type: 'dropdown', required: true, options: ['Yes', 'No'] }
      ]
    }
  };

  return chkMap[stageNum] || { id: 'chk-err', name: 'Checklist Template', description: '', fields: [] };
}
