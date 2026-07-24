'use client';

import React, { useState } from 'react';
import NavigationLayout from '@/components/NavigationLayout';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Plus,
  Bell
} from 'lucide-react';
import Link from 'next/link';
import { Project } from '@/types';

async function fetchProjects() {
  const res = await fetch('/api/projects');
  if (!res.ok) throw new Error('Failed to load projects');
  const data = await res.json();
  return data.projects;
}

export default function ProjectsPage() {
  const [search, setSearch] = useState('');

  const { data: projects, isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  const filteredProjects = projects?.filter((p: Project) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <NavigationLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        
        {/* Helper Guidance Notice Box */}
        <div className="p-4 bg-bg-surface border border-border-custom rounded-2xl text-center text-sm font-medium text-text-muted shadow-sm">
          Tap a project to assign a field inspector to the full project. Inspector assignment now applies at the project level.
        </div>

        {/* Header with Title and Bell + New Project buttons */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text-base">Projects</h1>
            <p className="text-sm text-text-muted mt-0.5">
              {projects?.filter((p: Project) => p.status !== 'completed').length || 0} panels in progress
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2.5 border border-border-custom bg-bg-surface rounded-full hover:bg-accent/5 cursor-pointer touch-target relative">
              <Bell className="h-5 w-5 text-text-base" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full"></span>
            </button>
            <Link
              href="/projects/new"
              className="inline-flex items-center bg-primary hover:bg-primary-dark text-white font-bold text-sm px-5 py-2.5 rounded-full transition-colors cursor-pointer touch-target shadow"
            >
              <Plus className="mr-1 h-5 w-5 stroke-[3px]" />
              New Project
            </Link>
          </div>
        </div>

        {/* Filter search bar */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search panels by project name..."
            className="w-full pl-10 pr-3 py-2 border border-border-custom bg-bg-surface rounded-xl text-sm focus:outline-none focus:border-primary"
          />
        </div>

        {/* Projects List (Stacked Cards) */}
        {loadingProjects ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-bg-surface border border-border-custom rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects?.map((project: Project) => {
              const completedStages = project.currentStage - 1;
              const progressPct = (completedStages / 12) * 100;
              
              return (
                <Link
                  key={project.id}
                  href={project.status === 'completed' ? `/api/reports/pdf?projectId=${project.id}` : `/inspections/${project.id}`}
                  target={project.status === 'completed' ? '_blank' : '_self'}
                  className="block"
                >
                  <div className="bg-bg-surface border border-border-custom rounded-2xl p-5 flex items-center justify-between hover:border-primary/40 hover:shadow-sm transition-all duration-200 cursor-pointer">
                    
                    {/* Left Column (Text Info & Tags) */}
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-text-base">{project.name}</h3>
                      <div className="text-xs text-text-muted font-medium">
                        S/N: {project.serialNumber || 'VIREON-MCC-415V-2026-001'}
                      </div>
                      <div className="text-xs text-primary font-bold">
                        Dwg. No: {project.drawingNumber || '040'}
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {project.tags?.map((tag: string) => (
                          <span key={tag} className="px-3 py-1 bg-accent/5 border border-border-custom rounded-full text-xs font-semibold text-text-muted">
                            {tag}
                          </span>
                        )) || (
                          <>
                            <span className="px-3 py-1 bg-accent/5 border border-border-custom rounded-full text-xs font-semibold text-text-muted">MCC</span>
                            <span className="px-3 py-1 bg-accent/5 border border-border-custom rounded-full text-xs font-semibold text-text-muted">Pending</span>
                            <span className="px-3 py-1 bg-accent/5 border border-border-custom rounded-full text-xs font-semibold text-text-muted">415V</span>
                          </>
                        )}
                      </div>

                      {/* Assigned Inspector */}
                      <div className="text-xs text-text-muted pt-2 font-medium">
                        Assigned to <span className="font-bold text-text-base">{project.assignedInspectorName || 'Mihir Bajpai'}</span>
                      </div>
                    </div>

                    {/* Right Column (Circular Progress Ring) */}
                    <div className="relative flex items-center justify-center h-16 w-16 flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-accent/5"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-primary-light animate-draw"
                          strokeDasharray={`${progressPct}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="absolute text-xs font-bold text-text-base">
                        {completedStages}/12
                      </span>
                    </div>

                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </NavigationLayout>
  );
}
