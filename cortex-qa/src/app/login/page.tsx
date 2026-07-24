'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { UserRole } from '@/types';
import { ShieldCheck, Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('inspector@cortex.com');
  const [role, setRole] = useState<UserRole>('QA Inspector');
  const [password, setPassword] = useState('••••••••');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill mock account on role select
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = e.target.value as UserRole;
    setRole(selectedRole);
    
    switch (selectedRole) {
      case 'Super Admin':
        setEmail('admin@cortex.com');
        break;
      case 'QA Manager':
        setEmail('manager@cortex.com');
        break;
      case 'QA Inspector':
        setEmail('inspector@cortex.com');
        break;
      case 'Operator':
        setEmail('operator@cortex.com');
        break;
      case 'Customer':
        setEmail('customer@cortex.com');
        break;
      default:
        setEmail('inspector@cortex.com');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const success = await login(email, role);
      if (success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setErrorMsg('Invalid login credentials or role mismatch.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'System login failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative Brand Accent Circles */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-primary/5 -top-40 -left-40 blur-3xl"></div>
      <div className="absolute w-[500px] h-[500px] rounded-full bg-primary-light/5 -bottom-40 -right-40 blur-3xl"></div>

      <div className="w-full max-w-md bg-bg-surface border border-border-custom rounded-2xl shadow-xl overflow-hidden z-10">
        
        {/* Banner Logo */}
        <div className="px-8 pt-8 pb-4 text-center bg-accent/5 border-b border-border-custom">
          <div className="inline-flex items-center justify-center p-3.5 bg-primary/10 text-primary rounded-2xl mb-3">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">CORTEX-QA</h1>
          <p className="text-sm text-text-muted mt-1">Enterprise Factory Quality Management Platform</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 text-red-600 text-sm font-semibold rounded-lg border border-red-500/20">
              {errorMsg}
            </div>
          )}

          {/* Role selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Account Quality Role</label>
            <select
              value={role}
              onChange={handleRoleChange}
              className="w-full px-3 py-2 border border-border-custom bg-bg-base rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
            >
              <option value="QA Inspector">QA Inspector (Amit Patel)</option>
              <option value="QA Manager">QA Manager (Suresh Raina)</option>
              <option value="Super Admin">Super Admin (Rajesh Kumar)</option>
              <option value="Operator">Operator (Vijay Mistry)</option>
              <option value="Customer">Customer (TATA Rep)</option>
            </select>
          </div>

          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter corporate email"
                className="w-full pl-10 pr-3 py-2 border border-border-custom bg-bg-base rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Password</label>
              <a href="#" className="text-xs text-primary font-semibold hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-3 py-2 border border-border-custom bg-bg-base rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg text-sm px-4 py-2.5 transition-colors cursor-pointer touch-target shadow-md disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Signing in...
              </>
            ) : (
              'Sign In to Workspace'
            )}
          </button>

          {/* Testing info panel */}
          <div className="text-[11px] text-text-muted text-center pt-2 border-t border-border-custom">
            Secure browser cookie and JWT token validation layer active.
          </div>
        </form>

      </div>
    </div>
  );
}
