'use client';

import React from 'react';
import NavigationLayout from '@/components/NavigationLayout';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Get name initial
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'D';

  // Get dynamic badge label
  const getBadgeLabel = () => {
    if (!user) return 'Loading...';
    if (user.email === 'dada@vireontech.in') return 'Administrator - Forward Deployment';
    switch (user.role) {
      case 'Super Admin':
        return 'Administrator - Factory Quality';
      case 'QA Manager':
        return 'QA Manager - Quality Assurance';
      case 'QA Inspector':
        return 'QA Inspector - Factory Inspection';
      case 'Operator':
        return 'Operator - Production Line';
      case 'Customer':
        return 'Customer Representative';
      default:
        return `${user.role} - Team Member`;
    }
  };

  return (
    <NavigationLayout>
      <div className="space-y-6 max-w-4xl mx-auto px-2">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-base">Profile</h1>
        </div>

        {/* Profile Card Container */}
        <div className="bg-bg-surface border border-border-custom rounded-2xl p-6 md:p-8 shadow-sm relative">
          
          {/* Edit Profile Button */}
          <div className="absolute top-6 right-6">
            <button className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#B45309] hover:bg-[#9C4207] text-white text-xs font-semibold rounded-full transition-colors cursor-pointer shadow-sm border border-[#B45309]">
              <Pencil className="h-3 w-3 text-white" />
              <span>Edit</span>
            </button>
          </div>

          {/* Circle Avatar badge & Top Info */}
          <div className="flex flex-col items-center justify-center pt-4">
            <div className="h-16 w-16 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center mb-3">
              <span className="text-xl font-bold text-[#B45309]">{initial}</span>
            </div>

            {/* Header text */}
            <div className="text-center">
              <h2 className="text-lg font-bold text-text-base">{user?.name || 'Dwaipayan Das'}</h2>
              <p className="text-xs text-text-muted mt-0.5 font-medium">{user?.email || 'dada@vireontech.in'}</p>
              <div className="mt-2.5 inline-block px-3.5 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-full text-xs font-semibold">
                {getBadgeLabel()}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="border-t border-border-custom mt-8 pt-6 space-y-4 w-full max-w-2xl mx-auto">
            
            <div className="flex justify-between items-center text-sm py-1 border-b border-gray-50 pb-3">
              <span className="text-text-muted font-medium">Name</span>
              <span className="text-text-base font-semibold">{user?.name || 'Dwaipayan Das'}</span>
            </div>

            <div className="flex justify-between items-center text-sm py-1 border-b border-gray-50 pb-3">
              <span className="text-text-muted font-medium">Email</span>
              <span className="text-text-base font-semibold">{user?.email || 'dada@vireontech.in'}</span>
            </div>

            <div className="flex justify-between items-center text-sm py-1 border-b border-gray-50 pb-3">
              <span className="text-text-muted font-medium">Role</span>
              <span className="text-text-base font-semibold">
                {user?.role === 'Super Admin' ? 'Administrator' : (user?.role || 'Administrator')}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm py-1 border-b border-gray-50 pb-3">
              <span className="text-text-muted font-medium">Company</span>
              <span className="text-text-base font-semibold">Vireontech Global Pvt Ltd</span>
            </div>

            <div className="flex justify-between items-center text-sm py-1 pb-1">
              <span className="text-text-muted font-medium">Status</span>
              <span className="text-text-base font-semibold">
                {user?.status ? (user.status.charAt(0).toUpperCase() + user.status.slice(1)) : 'Active'}
              </span>
            </div>

          </div>

          {/* Sign Out Button */}
          <div className="mt-8 w-full max-w-2xl mx-auto">
            <button
              onClick={handleLogout}
              className="w-full py-2 bg-red-50 hover:bg-red-100/70 border border-red-200 text-red-600 font-bold rounded-lg text-center transition-colors cursor-pointer text-sm"
            >
              Sign Out
            </button>
          </div>

        </div>

        {/* Footer Text */}
        <div className="text-center mt-6">
          <span className="text-[10.5px] text-text-muted/65 font-medium tracking-wide">
            Cortex Install QA v0.2 - Vireontech Global Pvt Ltd
          </span>
        </div>

      </div>
    </NavigationLayout>
  );
}
