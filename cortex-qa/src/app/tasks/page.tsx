'use client';

import React, { useState } from 'react';
import NavigationLayout from '@/components/NavigationLayout';
import { Building2, Layers, Clipboard, AlertCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  subtitle: string;
  location?: string;
  stage?: string;
  dueDate: 'today' | 'week' | 'overdue';
  dueText: string;
}

const MOCK_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Complete Panel Preparation stage',
    subtitle: 'ACME Manufacturing - Bhiwadi',
    location: 'Sites Bhiwadi',
    stage: 'Stage 4/13',
    dueDate: 'today',
    dueText: 'Due today'
  },
  {
    id: 'task-2',
    title: 'Collect 6 months bills — Reliance Jamnagar',
    subtitle: 'Awaiting client documents',
    dueDate: 'week',
    dueText: 'This week'
  }
];

export default function TasksPage() {
  const [filter, setFilter] = useState<'All' | 'Today' | 'This week' | 'Overdue'>('All');

  // Filter tasks list
  const filteredTasks = MOCK_TASKS.filter((task) => {
    if (filter === 'Today') return task.dueDate === 'today';
    if (filter === 'This week') return task.dueDate === 'week';
    if (filter === 'Overdue') return task.dueDate === 'overdue';
    return true;
  });

  return (
    <NavigationLayout>
      <div className="space-y-6 max-w-4xl mx-auto px-2 pb-10">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-base">My Tasks</h1>
          <p className="text-xs text-text-muted mt-0.5 font-medium">Installation assignments</p>
        </div>

        {/* Filter Pills Row */}
        <div className="flex flex-wrap gap-2.5 items-center">
          {(['All', 'Today', 'This week', 'Overdue'] as const).map((tab) => {
            const isActive = filter === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#B45309] text-[#B45309] bg-orange-50/50'
                    : 'border-border-custom text-text-muted hover:bg-accent/5'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 space-y-4 bg-bg-surface border border-border-custom rounded-2xl shadow-sm">
            <div className="h-14 w-14 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
              <Clipboard className="h-6 w-6 text-[#B45309]" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-text-base">No tasks found</h3>
              <p className="text-xs text-text-muted">No assignments in this category.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-bg-surface border border-border-custom rounded-2xl p-5 flex items-center justify-between hover:border-[#B45309]/40 hover:shadow-sm transition-all duration-200"
              >
                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm text-text-base leading-snug">{task.title}</h3>
                  <p className="text-xs text-text-muted font-medium">{task.subtitle}</p>
                  
                  {/* Metadata Row */}
                  {(task.location || task.stage) && (
                    <div className="flex items-center space-x-4 pt-1 text-[11px] text-text-muted/80 font-medium">
                      {task.location && (
                        <div className="flex items-center space-x-1">
                          <Building2 className="h-3 w-3 text-text-muted/60" />
                          <span>{task.location}</span>
                        </div>
                      )}
                      {task.stage && (
                        <div className="flex items-center space-x-1">
                          <Layers className="h-3 w-3 text-text-muted/60" />
                          <span>{task.stage}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Due Date Badge */}
                <div>
                  <span className="inline-flex items-center px-3 py-1 bg-orange-50 text-[#B45309] text-[10px] font-bold rounded-full border border-orange-100/50">
                    {task.dueText}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </NavigationLayout>
  );
}
