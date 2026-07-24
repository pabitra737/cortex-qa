'use client';

import React from 'react';
import NavigationLayout from '@/components/NavigationLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Check, Loader2, Factory, ShieldCheck } from 'lucide-react';

async function fetchFactories() {
  const res = await fetch('/api/factories');
  if (!res.ok) throw new Error('Failed to load factories');
  return (await res.json()).factories;
}

export default function FactoriesPage() {
  const queryClient = useQueryClient();

  const { data: factories, isLoading } = useQuery({
    queryKey: ['factories'],
    queryFn: fetchFactories,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async ({ id, settings }: { id: string; settings: any }) => {
      const res = await fetch('/api/factories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, settings }),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factories'] });
      alert('Factory settings successfully updated.');
    },
  });

  const handleToggle = (factory: any, settingKey: string) => {
    const updatedSettings = {
      ...factory.settings,
      [settingKey]: !factory.settings[settingKey],
    };
    updateSettingsMutation.mutate({ id: factory.id, settings: updatedSettings });
  };

  return (
    <NavigationLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Factory Settings</h1>
          <p className="text-sm text-text-muted mt-1">Configure multi-tenant workflow and quality control constraints.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {factories?.map((f: any) => (
              <div key={f.id} className="bg-bg-surface border border-border-custom rounded-2xl p-6 shadow-sm space-y-6">
                
                {/* Factory Detail */}
                <div className="flex items-center space-x-4 border-b border-border-custom pb-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <Factory className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{f.name}</h2>
                    <p className="text-xs text-text-muted">{f.location}</p>
                  </div>
                </div>

                {/* Configurations Toggles */}
                <div className="space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-text-muted flex items-center">
                    <Settings className="h-4 w-4 mr-1 text-primary" />
                    Quality Enforcement Constraints
                  </h3>

                  {/* Toggle 1 */}
                  <div className="flex items-center justify-between p-4 bg-bg-base rounded-xl border border-border-custom">
                    <div className="space-y-0.5 max-w-[70%]">
                      <div className="font-bold text-sm">Allow Stage Skipping</div>
                      <div className="text-xs text-text-muted">Permit engineers to register out-of-order stage updates. If disabled, sequence checking is enforced.</div>
                    </div>
                    <button
                      onClick={() => handleToggle(f, 'allowStageSkipping')}
                      className={`w-12 h-6 rounded-full relative transition-colors duration-200 cursor-pointer ${
                        f.settings.allowStageSkipping ? 'bg-primary' : 'bg-accent/20'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-[4px] transition-transform duration-200 ${
                        f.settings.allowStageSkipping ? 'translate-x-7' : 'translate-x-1.5'
                      }`} />
                    </button>
                  </div>

                  {/* Toggle 2 */}
                  <div className="flex items-center justify-between p-4 bg-bg-base rounded-xl border border-border-custom">
                    <div className="space-y-0.5 max-w-[70%]">
                      <div className="font-bold text-sm">Require Double Approval</div>
                      <div className="text-xs text-text-muted">Mandate that both QA Inspector and QA Manager log approvals before release.</div>
                    </div>
                    <button
                      onClick={() => handleToggle(f, 'requireDoubleApproval')}
                      className={`w-12 h-6 rounded-full relative transition-colors duration-200 cursor-pointer ${
                        f.settings.requireDoubleApproval ? 'bg-primary' : 'bg-accent/20'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-[4px] transition-transform duration-200 ${
                        f.settings.requireDoubleApproval ? 'translate-x-7' : 'translate-x-1.5'
                      }`} />
                    </button>
                  </div>

                </div>

                {/* Audit Release label */}
                <div className="flex items-center space-x-1 text-[10px] text-green-600 font-semibold bg-green-500/10 p-2.5 rounded-lg border border-green-500/10">
                  <ShieldCheck className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span>Tenant policy changes will write to system audit logs.</span>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </NavigationLayout>
  );
}
