'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { PenghuluSidebar } from '@/components/penghulu/PenghuluSidebar';

export default function PenguluLayout({ children }: { children: React.ReactNode }) {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (loading) return;

    // Pastikan hanya role penghulu yang boleh mengakses
    if (!user || !userRole || userRole !== 'penghulu') {
      router.push('/login');
    }
  }, [user, userRole, loading, router]);

  if (loading || !user || !userRole || userRole !== 'penghulu') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <PenghuluSidebar />
      <main className="flex-1 p-4 md:p-8 lg:p-10">{children}</main>
    </div>
  );
}