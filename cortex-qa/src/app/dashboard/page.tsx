'use client';

import React from 'react';
import NavigationLayout from '@/components/NavigationLayout';
import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
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
      <div className="space-y-6 max-w-4xl mx-auto pb-10 px-2">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-base">Install Dashboard</h1>
            <p className="text-xs text-text-muted mt-0.5 font-medium">
              Field installation health
            </p>
          </div>

          <button className="h-10 w-10 flex items-center justify-center border border-border-custom bg-bg-surface hover:bg-accent/5 rounded-full text-text-muted transition-colors cursor-pointer touch-target shadow-sm">
            <Bell className="h-4 w-4" />
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
            {/* Active Sites */}
            <div className="p-4 bg-bg-surface border border-border-custom rounded-2xl shadow-sm">
              <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Active Sites</div>
              <div className="text-2xl font-black mt-2 text-[#9A3412]">{metrics?.totalProjects ?? 0}</div>
            </div>

            {/* Stages Done */}
            <div className="p-4 bg-bg-surface border border-border-custom rounded-2xl shadow-sm">
              <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Stages Done</div>
              <div className="text-2xl font-black mt-2 text-green-600">{metrics?.stagesDone ?? 0}</div>
            </div>

            {/* In Progress */}
            <div className="p-4 bg-bg-surface border border-border-custom rounded-2xl shadow-sm">
              <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">In Progress</div>
              <div className="text-2xl font-black mt-2 text-[#9A3412]">{metrics?.inProgressStages ?? 0}</div>
            </div>

            {/* Pending */}
            <div className="p-4 bg-bg-surface border border-border-custom rounded-2xl shadow-sm">
              <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Pending</div>
              <div className="text-2xl font-black mt-2 text-[#9A3412]">{metrics?.pendingStages ?? 0}</div>
            </div>
          </div>
        )}

        {/* 2. INSTALL COMPLETION CARD */}
        {loadingMetrics ? (
          <div className="h-32 bg-bg-surface border border-border-custom rounded-2xl animate-pulse"></div>
        ) : (
          <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4 shadow-sm">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Install Completion</div>
              <div className="text-4xl font-black mt-2 text-white flex items-baseline">
                <span>{metrics?.installCompletionRate ?? 0}</span>
                <span className="text-sm font-semibold text-green-400 ml-1">%</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${metrics?.installCompletionRate ?? 0}%` }}
                ></div>
              </div>
              <div className="text-xs text-slate-400 font-semibold">
                {metrics?.stagesDone ?? 0} of {metrics?.totalStages ?? 0} stages completed
              </div>
            </div>
          </div>
        )}

        {/* 3. PANEL SERIAL NUMBERS */}
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
                    <div className="text-xs text-text-muted mt-0.5">{project.description || 'MCC'}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-block px-2.5 py-0.5 text-[10px] bg-orange-50 text-[#B45309] rounded-md font-bold border border-orange-100/50">
                      {project.serialNumber || 'VIREON-INST-2026-010'}
                    </span>
                    <span className="inline-block px-2.5 py-0.5 text-[10px] bg-green-50 text-green-700 rounded-md font-bold border border-green-100/50 uppercase">
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
