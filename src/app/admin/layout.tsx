
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Loader2 } from 'lucide-react';

const ADMIN_ROLES = ['Staff KUA', 'Kepala KUA', 'Administrator'];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && (!user || !userRole || !ADMIN_ROLES.includes(userRole))) {
      router.push('/login');
    }
  }, [user, userRole, loading, router]);

  if (loading || !user || !userRole || !ADMIN_ROLES.includes(userRole)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8 lg:p-10">{children}</main>
    </div>
  );
}
