'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { isPenghulu } from '@/lib/role-guards';
import { RegistrationDetailView } from '@/components/admin/RegistrationDetailView';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function PenghuluRegistrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { userRole, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    
    if (!isPenghulu(userRole)) {
      router.push('/penghulu');
      return;
    }
  }, [userRole, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <RegistrationDetailView 
        registrationId={resolvedParams.id}
        onBack={() => router.push('/penghulu/jadwal')}
      />
    </div>
  );
}

