'use client';

import React, { useState } from 'react';
import NavigationLayout from '@/components/NavigationLayout';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, ChevronRight } from 'lucide-react';
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
    (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
    (p.serialNumber && p.serialNumber.toLowerCase().includes(search.toLowerCase()))
  );

  const getProjectSub = (project: Project) => {
    if (project.name.includes('ACME')) {
      return 'Bhiwadi, Rajasthan · MCC';
    }
    return 'Jamnagar Refinery · APFC';
  };

  return (
    <NavigationLayout>
      <div className="space-y-6 max-w-4xl mx-auto px-2 pb-10">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-base">Installations</h1>
            <p className="text-xs text-text-muted mt-0.5 font-medium">
              {projects?.filter((p: Project) => p.status !== 'completed').length || 0} active sites
            </p>
          </div>
          <div>
            <Link
              href="/projects/new"
              className="h-10 w-10 bg-[#B45309] hover:bg-[#9C4207] text-white rounded-full flex items-center justify-center shadow-md transition-colors cursor-pointer touch-target"
            >
              <Plus className="h-5 w-5 stroke-[2.5px]" />
            </Link>
          </div>
        </div>

        {/* Filter search bar */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client, site, or serial..."
            className="w-full pl-10 pr-3 py-2.5 border border-border-custom bg-bg-surface rounded-xl text-sm focus:outline-none focus:border-primary font-medium"
          />
        </div>

        {/* Projects List (Stacked Cards) */}
        {loadingProjects ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-bg-surface border border-border-custom rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredProjects?.length === 0 ? (
          <div className="py-12 bg-bg-surface border border-border-custom rounded-2xl text-center text-text-muted text-sm font-semibold">
            No active installations found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects?.map((project: Project) => {
              const completedStages = project.currentStage - 1;
              const progressPct = (completedStages / 13) * 100;
              
              return (
                <Link
                  key={project.id}
                  href={project.status === 'completed' ? `/api/reports/pdf?projectId=${project.id}` : `/inspections/${project.id}`}
                  target={project.status === 'completed' ? '_blank' : '_self'}
                  className="block"
                >
                  <div className="bg-bg-surface border border-border-custom rounded-2xl p-5 flex flex-col justify-between hover:border-[#B45309]/40 hover:shadow-sm transition-all duration-200 cursor-pointer relative overflow-hidden">
                    
                    {/* Top Content Row */}
                    <div className="flex justify-between items-start w-full">
                      <div className="space-y-1">
                        <h3 className="font-bold text-base text-text-base leading-snug">{project.name}</h3>
                        <p className="text-xs text-text-muted font-medium">{getProjectSub(project)}</p>
                        
                        {/* Serial Number Badge */}
                        <div className="pt-1">
                          <span className="inline-block px-2.5 py-0.5 text-[9px] font-bold bg-orange-50 text-[#B45309] border border-orange-100/50 rounded">
                            {project.serialNumber || 'VIREON-INST-2026-010'}
                          </span>
                        </div>

                        {/* Inspector Assignment */}
                        <div className="text-[11px] text-text-muted pt-2.5 font-medium">
                          Inspector: <span className="font-semibold text-text-base">{project.assignedInspectorName || 'Unassigned'}</span>
                        </div>
                      </div>

                      {/* Right Chevron */}
                      <div className="text-text-muted hover:text-text-base transition-colors pt-1">
                        <ChevronRight className="h-5 w-5 stroke-[1.5px]" />
                      </div>
                    </div>

                    {/* Progress details & Bar */}
                    <div className="w-full mt-4">
                      <div className="text-[10px] text-text-muted font-bold text-right mb-1.5 pr-0.5">
                        {completedStages}/13 stages
                      </div>
                      
                      {/* Edge-to-edge bottom progress bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
                        <div
                          className="h-full bg-[#B45309] transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>
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
