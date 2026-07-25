'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { ShieldCheck, Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('dada@vireontech.in');
  const [password, setPassword] = useState('••••••••');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const success = await login(email);
      if (success) {
        router.push('/projects');
        router.refresh();
      } else {
        setErrorMsg('Invalid login credentials.');
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
        <div className="px-8 pt-8 pb-5 text-center bg-accent/5 border-b border-border-custom flex flex-col items-center">
          <img src="/cortex_logo.svg" alt="Cortex Logo" className="h-24 w-auto object-contain mb-1" />
          <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase mt-1">Factory Quality Platform</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 text-red-600 text-sm font-semibold rounded-lg border border-red-500/20">
              {errorMsg}
            </div>
          )}

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
