'use client';

import React from 'react';
import NavigationLayout from '@/components/NavigationLayout';
import { useQuery } from '@tanstack/react-query';
import { 
  Bell
} from 'lucide-react';
import { Project } from '@/types';

async function fetchDashboardMetrics() {
  const res = await fetch('/api/dashboard');
  if (!res.ok) throw new Error('Failed to fetch metrics');
  const data = await res.json();
  return data.metrics;
}

async function fetchProjects() {
  const res = await fetch('/api/projects');
  if (!res.ok) throw new Error('Failed to fetch projects');
  const data = await res.json();
  return data.projects;
}

export default function DashboardPage() {
  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: fetchDashboardMetrics,
  });

  const { data: projects, isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  return (
    <NavigationLayout>
      <div className="space-y-6 max-w-xl mx-auto pb-10">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text-base">QA Dashboard</h1>
            <p className="text-sm text-text-muted mt-1 font-medium">
              Overview of QA process and metrics
            </p>
          </div>
          
          <button className="h-10 w-10 flex items-center justify-center border border-border-custom bg-bg-surface hover:bg-accent/5 rounded-full text-text-muted transition-colors cursor-pointer touch-target shadow-sm">
            <Bell className="h-5 w-5" />
          </button>
        </div>

        {/* 1. METRICS COUNTER GRID (2x2) */}
        {loadingMetrics ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-bg-surface border border-border-custom rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Active Projects */}
            <div className="p-4 bg-bg-surface border border-border-custom rounded-2xl shadow-sm">
              <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Active Projects</div>
              <div className="text-2xl font-black mt-2 text-text-base">{metrics?.totalProjects ?? 0}</div>
            </div>
            
            {/* Completed */}
            <div className="p-4 bg-bg-surface border border-border-custom rounded-2xl shadow-sm">
              <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Completed</div>
              <div className="text-2xl font-black mt-2 text-green-600">{metrics?.completedReports ?? 0}</div>
            </div>
            
            {/* Pending Inspections */}
            <div className="p-4 bg-bg-surface border border-border-custom rounded-2xl shadow-sm">
              <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Pending Inspections</div>
              <div className="text-2xl font-black mt-2 text-amber-500">{metrics?.pendingInspectionsCount ?? 0}</div>
            </div>
            
            {/* Rejected Checks */}
            <div className="p-4 bg-bg-surface border border-border-custom rounded-2xl shadow-sm">
              <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Rejected Checks</div>
              <div className="text-2xl font-black mt-2 text-red-500">{metrics?.failedInspections ?? 0}</div>
            </div>
          </div>
        )}

        {/* 2. QA PASS RATE CARD */}
        {loadingMetrics ? (
          <div className="h-32 bg-bg-surface border border-border-custom rounded-2xl animate-pulse"></div>
        ) : (
          <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4 shadow-sm">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">QA Pass Rate</div>
              <div className="text-4xl font-black mt-2 text-white">{metrics?.passRate ?? 100}%</div>
            </div>
            
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all duration-500" 
                  style={{ width: `${metrics?.passRate ?? 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-green-400 font-semibold">
                {metrics?.completedInspections ?? 0} of {metrics?.totalInspections ?? 0} inspections completed
              </div>
            </div>
          </div>
        )}

        {/* 3. INSPECTION SUMMARY */}
        {loadingMetrics ? (
          <div className="h-48 bg-bg-surface border border-border-custom rounded-2xl animate-pulse"></div>
        ) : (
          <div className="bg-bg-surface border border-border-custom rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-text-base text-base">Inspection Summary</h3>
            <div className="divide-y divide-border-custom text-sm font-semibold">
              <div className="flex justify-between py-3">
                <span className="text-text-base">Total Inspections</span>
                <span className="text-text-base font-bold">{metrics?.totalInspections ?? 0}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-text-base">Completed (Pass)</span>
                <span className="text-green-600 font-bold">{metrics?.completedInspections ?? 0}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-text-base">Rejected (Fail)</span>
                <span className="text-red-500 font-bold">{metrics?.failedInspections ?? 0}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-text-base">Pending / In Progress</span>
                <span className="text-amber-500 font-bold">{metrics?.pendingInspectionsCount ?? 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. PANEL SERIAL NUMBERS */}
        {loadingProjects ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-bg-surface border border-border-custom rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : projects && projects.length === 0 ? (
          <div className="py-12 bg-bg-surface border border-border-custom rounded-2xl text-center text-text-muted text-sm font-semibold">
            No active switchgear panels found.
          </div>
        ) : (
          <div className="bg-bg-surface border border-border-custom rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-text-base text-base">Panel Serial Numbers</h3>
            <div className="divide-y divide-border-custom">
              {projects?.map((project: Project) => (
                <div key={project.id} className="flex justify-between items-center py-3">
                  <div>
                    <div className="font-bold text-text-base text-sm">{project.name}</div>
                    <div className="text-[10px] text-text-muted mt-0.5">Drawing: {project.drawingNumber || '040'}</div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-[11px] font-bold text-primary">{project.serialNumber || 'VIREON-MCC-415V-2026-001'}</div>
                    <span className="inline-block px-2 py-0.5 text-[9px] bg-green-500/10 text-green-600 rounded-full font-bold uppercase">
                      {project.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </NavigationLayout>
  );
}
