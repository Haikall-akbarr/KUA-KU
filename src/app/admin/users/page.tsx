
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UsersTable } from '@/components/admin/UsersTable';
import { AddUserDialog } from '@/components/admin/AddUserDialog';
import { getAllStaff, getAllPenghulu, handleApiError } from '@/lib/simnikah-api';
import type { User } from '@/lib/admin-data';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';

export default function UsersPage() {
  const router = useRouter();
  const { userRole } = useAuth();
  
  // Hanya kepala_kua yang bisa mengakses halaman ini
  useEffect(() => {
    if (userRole !== 'kepala_kua') {
      router.push('/admin');
    }
  }, [userRole, router]);
  
  // Jika bukan kepala_kua, jangan render konten
  if (userRole !== 'kepala_kua') {
    return (
      <div className="space-y-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Akses Ditolak</AlertTitle>
          <AlertDescription>
            Hanya Kepala KUA yang dapat mengakses halaman ini.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch staff and penghulu in parallel
        const [staffResponse, penghuluResponse] = await Promise.all([
          getAllStaff().catch(err => {
            console.warn('⚠️ Failed to fetch staff:', err);
            console.warn('⚠️ Staff error details:', {
              message: err.message,
              status: err.response?.status,
              data: err.response?.data
            });
            // Return empty structure sesuai format response
            return { success: false, data: [] };
          }),
          getAllPenghulu().catch(err => {
            console.warn('⚠️ Failed to fetch penghulu:', err);
            console.warn('⚠️ Penghulu error details:', {
              message: err.message,
              status: err.response?.status,
              data: err.response?.data
            });
            // Return empty structure sesuai format response
            return { success: false, data: [] };
          }),
        ]);

        console.log('📥 Staff Response:', staffResponse);
        console.log('📥 Penghulu Response:', penghuluResponse);

        // Map staff data - handle both structures: data as array or data.staff
        const staffArray = Array.isArray(staffResponse.data)
          ? staffResponse.data
          : (staffResponse.data?.staff || []);
        
        const staffList: User[] = staffArray.map((staff: any) => ({
          id: staff.user_id || staff.id?.toString() || `staff_${Date.now()}`,
          name: staff.nama_lengkap || staff.nama || '',
          email: staff.email || '',
          role: 'Staff KUA' as const,
          createdAt: staff.created_at || staff.createdAt || new Date().toISOString(),
        }));

        // Map penghulu data - handle both structures: data as array or data.penghulu
        const penghuluArray = Array.isArray(penghuluResponse.data)
          ? penghuluResponse.data
          : (penghuluResponse.data?.penghulu || []);
        
        const penghuluList: User[] = penghuluArray.map((penghulu: any) => ({
          id: penghulu.user_id || penghulu.id?.toString() || `penghulu_${Date.now()}`,
          name: penghulu.nama_lengkap || penghulu.nama || '',
          email: penghulu.email || '',
          role: 'Penghulu' as const,
          createdAt: penghulu.created_at || penghulu.createdAt || new Date().toISOString(),
        }));

        // Combine and sort by creation date
        const allUsers = [...staffList, ...penghuluList].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setUsers(allUsers);
      } catch (err) {
        console.error('Error loading users:', err);
        const errorMessage = handleApiError(err);
        setError(errorMessage);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h1>
          <p className="text-muted-foreground">
            Lihat, tambah, dan kelola akun untuk staf, penghulu, dan kepala KUA.
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Memuat data pengguna...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h1>
        <p className="text-muted-foreground">
          Lihat, tambah, dan kelola akun untuk staf, penghulu, dan kepala KUA.
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <AddUserDialog>
        <UsersTable data={users} />
      </AddUserDialog>
    </div>
  );
}
