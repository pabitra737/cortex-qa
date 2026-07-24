'use client';

import React, { useState } from 'react';
import NavigationLayout from '@/components/NavigationLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserRole } from '@/types';
import { 
  UserPlus, 
  Loader2, 
  X, 
  Plus, 
  Mail, 
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

async function fetchUsers() {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error('Failed to fetch users');
  return (await res.json()).users;
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser, hasPermission } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Admin' | 'Inspector'>('All');
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('QA Inspector');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const createUserMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create user profile');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleCloseModal();
    },
    onError: (err: any) => {
      alert(`User creation failed: ${err.message}`);
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update user profile');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleCloseModal();
    },
    onError: (err: any) => {
      alert(`User update failed: ${err.message}`);
    }
  });

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('QA Inspector');
    setStatus('active');
  };

  const handleCardClick = (selectedUser: any) => {
    setEditingUser(selectedUser);
    setName(selectedUser.name);
    setEmail(selectedUser.email);
    setRole(selectedUser.role);
    setStatus(selectedUser.status);
    setModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    
    if (editingUser) {
      updateUserMutation.mutate({
        uid: editingUser.uid,
        name,
        role,
        status
      });
    } else {
      createUserMutation.mutate({
        name,
        email,
        role,
        factoryId: currentUser?.factoryId || 'factory-1'
      });
    }
  };

  // Filter users list based on search bar and role filters
  const filteredUsers = (users || []).filter((u: any) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                          u.email.toLowerCase().includes(search.toLowerCase());
    if (roleFilter === 'Admin') {
      return matchesSearch && (u.role === 'Super Admin' || u.role === 'Factory Admin');
    }
    if (roleFilter === 'Inspector') {
      return matchesSearch && (u.role === 'QA Inspector' || u.role === 'QA Manager' || u.role === 'QA Engineer' || u.role === 'Operator' || u.role === 'Customer');
    }
    return matchesSearch;
  });

  // Helper to map role to stylized badge
  const renderRoleBadge = (userRole: string) => {
    switch (userRole) {
      case 'Super Admin':
      case 'Factory Admin':
        return (
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
            Admin
          </span>
        );
      case 'QA Manager':
      case 'QA Engineer':
        return (
          <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 rounded-full text-xs font-semibold">
            Field Engineer
          </span>
        );
      case 'QA Inspector':
        return (
          <span className="px-3 py-1 bg-purple-500/10 text-purple-600 rounded-full text-xs font-semibold">
            Inspector
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-500/10 text-gray-600 rounded-full text-xs font-semibold">
            {userRole}
          </span>
        );
    }
  };

  const isEditable = hasPermission('manage:users');

  return (
    <NavigationLayout>
      <div className="space-y-6 max-w-4xl mx-auto pb-10">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text-base">Team Members</h1>
            <p className="text-sm text-text-muted mt-1 font-medium">
              {users?.length || 0} users registered
            </p>
          </div>
          
          {currentUser && (
            <span className="px-3.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
              {currentUser.role === 'Super Admin' || currentUser.role === 'Factory Admin' ? 'Admin' : currentUser.role}
            </span>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center bg-bg-surface border border-border-custom rounded-2xl px-4 py-3 shadow-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="flex-1 bg-transparent border-none text-sm text-text-base placeholder-text-muted focus:outline-none focus:ring-0"
          />
          <Mail className="h-4 w-4 text-emerald-500 ml-2" />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3">
          {(['All', 'Admin', 'Inspector'] as const).map((filter) => {
            const isSelected = roleFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setRoleFilter(filter)}
                className={`px-5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer touch-target ${
                  isSelected 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-border-custom bg-bg-surface text-text-muted hover:text-text-base'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Users stacked list */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((u: any) => {
              const initial = u.name ? u.name.charAt(0).toUpperCase() : 'U';
              const isActive = u.status === 'active';
              
              return (
                <div 
                  key={u.uid}
                  onClick={() => handleCardClick(u)}
                  className="bg-bg-surface border border-border-custom rounded-2xl p-4 flex items-center justify-between hover:border-primary/20 transition-all shadow-sm cursor-pointer"
                >
                  
                  {/* Left info column */}
                  <div className="flex items-center space-x-4">
                    
                    {/* Circle Avatar with brown border */}
                    <div className="h-12 w-12 rounded-full border border-primary/40 bg-primary/5 flex items-center justify-center font-bold text-primary text-lg">
                      <span>{initial}</span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-1.5">
                        <h3 className="font-bold text-text-base text-base">{u.name}</h3>
                        <span className={`inline-block w-2 h-2 rounded-full ${
                          isActive ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <p className="text-xs text-text-muted">{u.email}</p>
                    </div>

                  </div>

                  {/* Right actions/role column */}
                  <div className="flex items-center space-x-3">
                    {renderRoleBadge(u.role)}
                    <ChevronRight className="h-5 w-5 text-text-muted/60" />
                  </div>

                </div>
              );
            })}

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-text-muted font-medium text-sm">
                No team members match your search criteria.
              </div>
            )}
          </div>
        )}

        {/* Floating Action Button for user creation */}
        {isEditable && (
          <button
            onClick={() => {
              setEditingUser(null);
              setName('');
              setEmail('');
              setRole('QA Inspector');
              setStatus('active');
              setModalOpen(true);
            }}
            className="fixed bottom-24 right-6 w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full flex items-center justify-center shadow-lg transition-all z-40 cursor-pointer hover:scale-105 active:scale-95 touch-target"
            title="Add Member"
          >
            <Plus className="h-6 w-6" />
          </button>
        )}

        {/* Modal for staff creation / editing / viewing */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-bg-surface border border-border-custom w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
              
              <div className="px-6 py-4 border-b border-border-custom flex justify-between items-center bg-accent/5">
                <div className="flex items-center space-x-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  <span className="font-bold text-lg">
                    {editingUser ? (isEditable ? 'Edit Staff Profile' : 'Staff Profile Details') : 'Add New Staff Profile'}
                  </span>
                </div>
                <button onClick={handleCloseModal} className="p-1 rounded-md hover:bg-accent/10 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Full Name</label>
                  <input
                    type="text"
                    required
                    disabled={!isEditable}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter staff name"
                    className="w-full px-3 py-2 border border-border-custom bg-bg-base rounded-lg text-sm focus:outline-none focus:border-primary disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Email Address</label>
                  <input
                    type="email"
                    required
                    disabled={!isEditable || !!editingUser}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter work email"
                    className="w-full px-3 py-2 border border-border-custom bg-bg-base rounded-lg text-sm focus:outline-none focus:border-primary disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Assigned Quality Role</label>
                  <select
                    disabled={!isEditable}
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-border-custom bg-bg-base rounded-lg text-sm focus:outline-none focus:border-primary font-medium disabled:opacity-60"
                  >
                    <option value="QA Inspector">QA Inspector</option>
                    <option value="QA Engineer">QA Engineer</option>
                    <option value="QA Manager">QA Manager</option>
                    <option value="Factory Admin">Factory Admin</option>
                  </select>
                </div>

                {editingUser && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Account Status</label>
                    <select
                      disabled={!isEditable || editingUser.uid === currentUser?.uid}
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                      className="w-full px-3 py-2 border border-border-custom bg-bg-base rounded-lg text-sm focus:outline-none focus:border-primary font-medium disabled:opacity-60"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    {editingUser.uid === currentUser?.uid && (
                      <span className="text-[10px] text-text-muted block mt-1">You cannot deactivate your own account.</span>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t border-border-custom flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-border-custom rounded-lg text-sm font-semibold hover:bg-accent/5 cursor-pointer touch-target"
                  >
                    {isEditable ? 'Cancel' : 'Close'}
                  </button>
                  {isEditable && (
                    <button
                      type="submit"
                      disabled={createUserMutation.isPending || updateUserMutation.isPending}
                      className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer touch-target shadow disabled:opacity-50"
                    >
                      {createUserMutation.isPending || updateUserMutation.isPending ? 'Saving...' : 'Save Profile'}
                    </button>
                  )}
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </NavigationLayout>
  );
}
