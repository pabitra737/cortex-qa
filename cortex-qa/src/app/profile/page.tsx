'use client';

import React from 'react';
import NavigationLayout from '@/components/NavigationLayout';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { User, LogOut, Edit3, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Get name initial
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'V';

  // Get permissions description based on role
  const getPermissionsDescription = () => {
    if (!user) return 'Loading...';
    switch (user.role) {
      case 'Super Admin':
        return 'Full system access: create projects, manage users, assign tasks, edit templates, generate reports.';
      case 'QA Manager':
        return 'Manager access: review and approve checklists, register projects, configure templates, generate compliance reports.';
      case 'QA Inspector':
        return 'Inspector access: execute stage quality checks, submit images and digital signatures, record inspection logs.';
      default:
        return 'Standard operator access: view assigned checklists, inspect logs, sync local queue entries.';
    }
  };

  return (
    <NavigationLayout>
      <div className="space-y-6 max-w-lg mx-auto">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-base">Profile</h1>
        </div>

        {/* Profile Card Container */}
        <div className="bg-bg-surface border border-border-custom rounded-2xl p-6 md:p-8 shadow-sm relative flex flex-col items-center justify-center">
          
          {/* Edit Profile Button */}
          <button className="absolute top-5 right-5 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark transition-colors cursor-pointer touch-target shadow-sm">
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit Profile</span>
          </button>

          {/* Circle Avatar badge */}
          <div className="h-20 w-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-4">
            <span className="text-3xl font-black text-primary">{initial}</span>
          </div>

          {/* Header text */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-text-base">{user?.name || 'Vireon Admin'}</h2>
            <p className="text-xs text-text-muted mt-0.5 font-medium">{user?.email || 'factory@vireontech.in'}</p>
            <span className="mt-2.5 inline-block px-3 py-1 bg-purple-500/10 text-purple-600 text-xs font-bold rounded-full border border-purple-500/20">
              {user?.role || 'Administrator'}
            </span>
          </div>

          {/* Details Table */}
          <div className="border-t border-border-custom mt-6 pt-6 space-y-4 w-full">
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted font-medium">Name</span>
              <span className="text-text-base font-bold">{user?.name || 'Vireon Admin'}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted font-medium">Email</span>
              <span className="text-text-base font-bold">{user?.email || 'factory@vireontech.in'}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted font-medium">Role</span>
              <span className="text-text-base font-bold">{user?.role || 'Administrator'}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted font-medium">Status</span>
              <span className="text-text-base font-bold text-green-600">
                {user?.status ? (user.status.charAt(0).toUpperCase() + user.status.slice(1)) : 'Active'}
              </span>
            </div>

          </div>

          {/* Permissions section */}
          <div className="border-t border-border-custom mt-6 pt-6 w-full text-left space-y-2">
            <h4 className="font-bold text-sm text-text-base">Role Permissions</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              {getPermissionsDescription()}
            </p>
          </div>

        </div>

        {/* Action button */}
        <div className="space-y-4">
          <button
            onClick={handleLogout}
            className="w-full py-3.5 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 font-bold rounded-2xl text-center transition-colors cursor-pointer touch-target shadow-sm flex items-center justify-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
          
          <span className="text-[10px] text-text-muted/65 text-center mt-6 block uppercase tracking-wider font-bold">
            Vireon QA v1.0 - Vireontech Global Private Limited
          </span>
        </div>

      </div>
    </NavigationLayout>
  );
}
