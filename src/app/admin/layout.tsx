// app/admin/layout.tsx  <-- PASTE INI DI SINI

'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  const pathname = usePathname();

  // Check if current path is staff route (staff has its own layout)
  const isStaffRoute = pathname?.startsWith('/admin/staff');

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
      console.log('AdminLayout: Akses Diberikan untuk role:', userRole);

      // 5. Role-based redirect untuk staff (hanya jika bukan di route staff)
      if (userRole === 'staff' && !isStaffRoute) {
        // Redirect staff ke dashboard khusus mereka
        console.log('AdminLayout: Mengarahkan staff ke /admin/staff');
        router.push('/admin/staff');
      }
    }
  }, [user, userRole, loading, router, isStaffRoute]);  

  // Selama loading ATAU jika user bukan admin (sebelum di-tendang),
  // tampilkan spinner
  if (loading || !user || !userRole || !ADMIN_ROLES.includes(userRole)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Jika di route staff, biarkan StaffLayout handle sendiri (tidak render AdminSidebar)
  if (isStaffRoute) {
    return <>{children}</>;
  }

  // 5. Jika user adalah admin, tampilkan layout admin
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8 lg:p-10">{children}</main>
    </div>
  );
}