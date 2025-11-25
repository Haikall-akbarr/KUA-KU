'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StaffSidebar } from '@/components/admin/staff/StaffSidebar';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, userRole, loading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) {
      return;
    }

    // Check if user is staff
    if (!user || userRole !== 'staff') {
      router.push('/login');
      return;
    }

    setChecking(false);
  }, [user, userRole, loading, router]);

  if (loading || checking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <StaffSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

