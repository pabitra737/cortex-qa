'use client';

import React, { useState } from 'react';
import NavigationLayout from '@/components/NavigationLayout';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Clipboard, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

async function fetchProjects() {
  const res = await fetch('/api/projects');
  if (!res.ok) throw new Error('Failed to load projects');
  const data = await res.json();
  return data.projects;
}

export default function TasksPage() {
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Active' | 'Done'>('All');

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  // Calculate counts based on projects database
  const totalCount = projects?.length || 0;
  const pendingCount = (projects || []).filter((p: any) => p.status === 'pending').length;
  const activeCount = (projects || []).filter((p: any) => p.status === 'active').length;
  const doneCount = (projects || []).filter((p: any) => p.status === 'completed').length;

  // Filter projects list
  const filteredProjects = (projects || []).filter((p: any) => {
    if (filter === 'Pending') return p.status === 'pending';
    if (filter === 'Active') return p.status === 'active';
    if (filter === 'Done') return p.status === 'completed';
    return true;
  });

  return (
    <NavigationLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-base">Tasks</h1>
          <p className="text-sm text-text-muted mt-1">All assigned tasks</p>
        </div>

        {/* Filter Pills Row */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* 1. All */}
          <button
            onClick={() => setFilter('All')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all touch-target cursor-pointer ${
              filter === 'All'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-border-custom text-text-muted hover:bg-accent/5'
            }`}
          >
            <span>All</span>
            <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              filter === 'All' ? 'bg-primary text-white' : 'bg-accent/5 text-text-muted'
            }`}>
              {totalCount}
            </span>
          </button>

          {/* 2. Pending */}
          <button
            onClick={() => setFilter('Pending')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all touch-target cursor-pointer ${
              filter === 'Pending'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-border-custom text-text-muted hover:bg-accent/5'
            }`}
          >
            <span>Pending</span>
            <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              filter === 'Pending' ? 'bg-primary text-white' : 'bg-accent/5 text-text-muted'
            }`}>
              {pendingCount}
            </span>
          </button>

          {/* 3. Active */}
          <button
            onClick={() => setFilter('Active')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all touch-target cursor-pointer ${
              filter === 'Active'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-border-custom text-text-muted hover:bg-accent/5'
            }`}
          >
            <span>Active</span>
            <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              filter === 'Active' ? 'bg-primary text-white' : 'bg-accent/5 text-text-muted'
            }`}>
              {activeCount}
            </span>
          </button>

          {/* 4. Done */}
          <button
            onClick={() => setFilter('Done')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all touch-target cursor-pointer ${
              filter === 'Done'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-border-custom text-text-muted hover:bg-accent/5'
            }`}
          >
            <span>Done</span>
            <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              filter === 'Done' ? 'bg-primary text-white' : 'bg-accent/5 text-text-muted'
            }`}>
              {doneCount}
            </span>
          </button>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="space-y-3 pt-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-bg-surface border border-border-custom rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          /* Empty State exactly matching the screenshot */
          <div className="flex flex-col items-center justify-center py-20 px-4 space-y-4">
            <div className="h-20 w-20 rounded-full bg-accent/5 flex items-center justify-center">
              <Clipboard className="h-10 w-10 text-text-muted/60" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-xl text-text-base">No tasks found</h3>
              <p className="text-sm text-text-muted">Tasks assigned to you will appear here.</p>
            </div>
          </div>
        ) : (
          /* Tasks List view if they exist */
          <div className="space-y-4 pt-4">
            {filteredProjects.map((project: any) => (
              <Link
                key={project.id}
                href={project.status === 'completed' ? `/api/reports/pdf?projectId=${project.id}` : `/inspections/${project.id}`}
                target={project.status === 'completed' ? '_blank' : '_self'}
                className="block"
              >
                <div className="bg-bg-surface border border-border-custom rounded-2xl p-5 flex items-center justify-between hover:border-primary/45 hover:shadow-sm transition-all duration-200 cursor-pointer">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-text-base">{project.name}</h3>
                    <p className="text-xs text-text-muted font-medium">S/N: {project.serialNumber || 'VIREON-MCC-415V-2026-001'}</p>
                    <p className="text-xs text-primary font-bold">Dwg. No: {project.drawingNumber || '040'}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {project.status === 'completed' ? (
                      <span className="inline-flex items-center px-3 py-1 bg-green-500/10 text-green-600 text-xs font-bold rounded-full border border-green-500/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 bg-amber-500/10 text-amber-600 text-xs font-bold rounded-full border border-amber-500/20">
                        <Clock className="h-3 w-3 mr-1 animate-pulse" />
                        Stage {project.currentStage}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </NavigationLayout>
  );
}
