'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/projects');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-bg-base flex flex-col justify-center items-center">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
      <span className="text-sm font-semibold text-text-muted mt-4">Directing to CORTEX-QA workspace...</span>
    </div>
  );
}
