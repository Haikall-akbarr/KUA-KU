// app/admin/layout.tsx  <-- PASTE INI DI SINI

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
// Impor hook dan daftar peran dari Context
import { useAuth, ADMIN_ROLES } from '@/context/AuthContext';
// Asumsi Anda punya komponen sidebar
import { AdminSidebar } from '@/components/admin/AdminSidebar'; 
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userRole, loading } = useAuth(); // Memanggil hook
  const router = useRouter();

  React.useEffect(() => {
    // 1. Tunggu sampai loading selesai
    if (loading) {
      return;
    }

    // 2. Cek apakah user adalah admin
    if (!user || !userRole || !ADMIN_ROLES.includes(userRole)) {
      // 3. Jika bukan, tendang ke /login
      console.log('AdminLayout: Akses Ditolak. Mengarahkan ke /login');
      router.push('/login');
    } else {
      // 4. Jika ya, izinkan akses
      console.log('AdminLayout: Akses Diberikan.');
    }
  }, [user, userRole, loading, router]);

  // Selama loading ATAU jika user bukan admin (sebelum di-tendang),
  // tampilkan spinner
  if (loading || !user || !userRole || !ADMIN_ROLES.includes(userRole)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // 5. Jika user adalah admin, tampilkan layout admin
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8 lg:p-10">{children}</main>
    </div>
  );
}