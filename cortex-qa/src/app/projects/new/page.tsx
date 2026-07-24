'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NavigationLayout from '@/components/NavigationLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserProfile } from '@/types';
import { 
  ChevronLeft,
  Loader2
} from 'lucide-react';

async function fetchUsers() {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error('Failed to load users');
  const data = await res.json();
  return data.users;
}

export default function NewProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch users for the inspector dropdown
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  // Form states
  const [name, setName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [poDate, setPoDate] = useState('');
  const [panelType, setPanelType] = useState('MCC');
  const [panelRating, setPanelRating] = useState('415V');
  const [drawingNumber, setDrawingNumber] = useState('');
  
  // Panel Thickness
  const [thicknessBody, setThicknessBody] = useState('2.0');
  const [thicknessGland, setThicknessGland] = useState('2.0');
  const [thicknessMounting, setThicknessMounting] = useState('2.0');
  const [thicknessDoor, setThicknessDoor] = useState('1.6');

  // Cable & Wire
  const [cableEntry, setCableEntry] = useState('Bottom Cable Entry');
  const [wireControl, setWireControl] = useState('1.5 sqmm');
  const [wirePower, setWirePower] = useState('4 sqmm');

  // Field Inspector Assignment
  const [inspectorId, setInspectorId] = useState('');

  const createProjectMutation = useMutation({
    mutationFn: async (payload: unknown) => {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create project');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      router.push('/projects');
    },
    onError: (err: Error) => {
      alert(`Error creating project: ${err.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !customerName || !customerEmail) {
      alert('Please fill in all required fields.');
      return;
    }

    const payload = {
      name,
      description: `Project for ${customerName}`,
      customerName,
      customerEmail,
      poNumber,
      poDate,
      panelType,
      panelRating,
      drawingNumber,
      panelThicknessBody: thicknessBody,
      panelThicknessGland: thicknessGland,
      panelThicknessMounting: thicknessMounting,
      panelThicknessDoor: thicknessDoor,
      cableEntry,
      wireSizeControl: wireControl,
      wireSizePower: wirePower,
      inspectorIds: inspectorId ? [inspectorId] : [],
      // Assign logged-in user as engineer by default
      engineerIds: [] 
    };

    createProjectMutation.mutate(payload);
  };

  const inspectors = users?.filter((u: UserProfile) => u.role === 'QA Inspector' || u.role === 'QA Manager' || u.role === 'QA Engineer') || [];

  return (
    <NavigationLayout>
      <div className="max-w-xl mx-auto pb-12">
        
        {/* Back Link */}
        <Link href="/projects" className="inline-flex items-center text-xs font-bold text-text-muted hover:text-text-base mb-6 transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Projects
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-text-base">New Project</h1>
          <p className="text-sm text-text-muted mt-1 font-medium">
            Create a panel and auto-generate QA checklist
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-bg-surface border border-border-custom rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Panel Run / Project Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Project Name / Panel Run Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ACME MCC Panel Run"
                className="w-full px-3 py-2 border border-border-custom bg-bg-base rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
              />
            </div>

            {/* Customer Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                className="w-full px-3 py-2 border border-border-custom bg-bg-base rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
              />
            </div>

            {/* Customer Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Customer Email <span className="text-red-500">*</span>
              </label>
              <div className="text-[10px] text-text-muted -mt-1">For receiving QA reports</div>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Enter customer email"
                className="w-full px-3 py-2 border border-border-custom bg-bg-base rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
              />
            </div>

            {/* PO Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">PO Number</label>
                <input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  placeholder="e.g., PO-2026-045"
                  className="w-full px-3 py-2 border border-border-custom bg-bg-base rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">PO Date</label>
                <input
                  type="date"
                  value={poDate}
                  onChange={(e) => setPoDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border-custom bg-bg-base rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
                />
              </div>
            </div>

            {/* Panel Type & Rating */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Panel Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={panelType}
                  onChange={(e) => setPanelType(e.target.value)}
                  className="w-full px-3 py-2 border border-border-custom bg-bg-base rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
                >
                  <option value="MCC">MCC</option>
                  <option value="PCC">PCC</option>
                  <option value="APFC">APFC</option>
                  <option value="DB">DB</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Panel Rating</label>
                <select
                  value={panelRating}
                  onChange={(e) => setPanelRating(e.target.value)}
                  className="w-full px-3 py-2 border border-border-custom bg-bg-base rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
                >
                  <option value="415V">415V</option>
                  <option value="440V">440V</option>
                  <option value="800A">800A</option>
                  <option value="1600A">1600A</option>
                  <option value="IP54">IP54</option>
                  <option value="IP65">IP65</option>
                </select>
              </div>
            </div>

            {/* Drawing Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Dwg. No. (Drawing Reference)</label>
              <input
                type="text"
                value={drawingNumber}
                onChange={(e) => setDrawingNumber(e.target.value)}
                placeholder="e.g., DRG-2026-001"
                className="w-full px-3 py-2 border border-border-custom bg-bg-base rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
              />
            </div>

            {/* Panel Thickness (MM) */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted block">Panel Thickness (mm)</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-text-muted font-bold">Body</span>
                  <input
                    type="text"
                    value={thicknessBody}
                    onChange={(e) => setThicknessBody(e.target.value)}
                    placeholder="e.g., 2.0"
                    className="w-full px-3 py-1.5 border border-border-custom bg-bg-base rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-text-muted font-bold">Gland Plate</span>
                  <input
                    type="text"
                    value={thicknessGland}
                    onChange={(e) => setThicknessGland(e.target.value)}
                    placeholder="e.g., 2.0"
                    className="w-full px-3 py-1.5 border border-border-custom bg-bg-base rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-text-muted font-bold">Mounting Plate</span>
                  <input
                    type="text"
                    value={thicknessMounting}
                    onChange={(e) => setThicknessMounting(e.target.value)}
                    placeholder="e.g., 2.0"
                    className="w-full px-3 py-1.5 border border-border-custom bg-bg-base rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-text-muted font-bold">Door</span>
                  <input
                    type="text"
                    value={thicknessDoor}
                    onChange={(e) => setThicknessDoor(e.target.value)}
                    placeholder="e.g., 1.6"
                    className="w-full px-3 py-1.5 border border-border-custom bg-bg-base rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Cable Entry */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Cable Entry</label>
              <select
                value={cableEntry}
                onChange={(e) => setCableEntry(e.target.value)}
                className="w-full px-3 py-2 border border-border-custom bg-bg-base rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
              >
                <option value="Top Cable Entry">Top Cable Entry</option>
                <option value="Bottom Cable Entry">Bottom Cable Entry</option>
                <option value="Both Top and Bottom">Both Top and Bottom</option>
              </select>
            </div>

            {/* Wire Size */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Wire Size (Control)</label>
                <input
                  type="text"
                  value={wireControl}
                  onChange={(e) => setWireControl(e.target.value)}
                  placeholder="e.g., 1.5 sqmm"
                  className="w-full px-3 py-2 border border-border-custom bg-bg-base rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Wire Size (Power)</label>
                <input
                  type="text"
                  value={wirePower}
                  onChange={(e) => setWirePower(e.target.value)}
                  placeholder="e.g., 4 sqmm"
                  className="w-full px-3 py-2 border border-border-custom bg-bg-base rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
                />
              </div>
            </div>

            {/* Field Inspector Assignment */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Assign Field Inspector</label>
              <select
                value={inspectorId}
                onChange={(e) => setInspectorId(e.target.value)}
                className="w-full px-3 py-2 border border-border-custom bg-bg-base rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
              >
                <option value="">Do not assign inspector yet</option>
                {inspectors.map((u: UserProfile) => (
                  <option key={u.uid} value={u.uid}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>

            {/* Auto Generation Notification Banner */}
            <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl border border-blue-500/20 text-xs font-semibold leading-relaxed">
              Auto-generation: The panel serial number and all 12 inspection stages with their checklists are generated automatically on creation.
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={createProjectMutation.isPending}
              className="w-full flex items-center justify-center bg-primary hover:bg-primary-dark text-white font-bold rounded-lg text-sm px-4 py-3 transition-colors cursor-pointer touch-target shadow-md disabled:opacity-50 mt-4"
            >
              {createProjectMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Creating Project...
                </>
              ) : (
                'Create Project'
              )}
            </button>

          </form>
        </div>

      </div>
    </NavigationLayout>
  );
}
