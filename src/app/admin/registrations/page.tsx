
'use client';

import { RegistrationsTable } from '@/components/admin/RegistrationsTable';
import { type MarriageRegistration } from '@/lib/admin-data';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { isStaffOrKepalaKUA, getUnauthorizedMessage } from '@/lib/role-guards';
import { getAllRegistrations, handleApiError } from '@/lib/simnikah-api';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function RegistrationsPage() {
  const { userRole, loading: authLoading } = useAuth();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<MarriageRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffNotifications, setStaffNotifications] = useState<any[]>([]);

  // Role guard - hanya Staff atau Kepala KUA
  useEffect(() => {
    if (authLoading) return;
    
    if (!isStaffOrKepalaKUA(userRole)) {
      console.warn('RegistrationsPage: Akses ditolak. Role:', userRole);
      router.push('/admin');
      return;
    }
  }, [userRole, authLoading, router]);

  // Load data from API - Sederhana sesuai struktur backend
  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const response = await getAllRegistrations({
        page: 1,
        limit: 1000,
      });
      
      // Struktur response: { success, data: [...] } (data sudah array dari getAllRegistrations)
      const registrationsArray = Array.isArray(response.data) ? response.data : [];
      
      if (response.success && registrationsArray.length > 0) {
        // Map langsung sesuai struktur backend
        const mappedRegs: MarriageRegistration[] = registrationsArray.map((reg: any) => ({
          id: reg.nomor_pendaftaran || reg.id,
          groomName: reg.calon_suami?.nama_lengkap || 'Data tidak tersedia',
          brideName: reg.calon_istri?.nama_lengkap || 'Data tidak tersedia',
          registrationDate: reg.tanggal_pendaftaran || reg.created_at,
          weddingDate: reg.tanggal_nikah || '',
          weddingTime: reg.waktu_nikah || '',
          weddingLocation: reg.tempat_nikah || '',
          status: reg.status_pendaftaran || 'Menunggu Penugasan',
          penghulu: reg.penghulu?.nama_lengkap || reg.penghulu?.nama || null,
        }));
        
        // Sort by registration date (newest first)
        mappedRegs.sort((a, b) => {
          const dateA = new Date(a.registrationDate).getTime();
          const dateB = new Date(b.registrationDate).getTime();
          return dateB - dateA;
        });
        
        setRegistrations(mappedRegs);
      } else {
        setRegistrations([]);
      }
    } catch (error: any) {
      console.error("Failed to load registration data:", error);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  // Load registrations on mount
  useEffect(() => {
    if (isStaffOrKepalaKUA(userRole)) {
      loadRegistrations();
    }
  }, [userRole]);

  // Load staff notifications
  useEffect(() => {
    try {
      const stored = localStorage.getItem('staff_notifications');
      const notifications = stored ? JSON.parse(stored) : [];
      setStaffNotifications(Array.isArray(notifications) ? notifications : []);
    } catch (e) {
      console.error('Error loading staff notifications:', e);
      setStaffNotifications([]);
    }
  }, []);

  // Show unauthorized message if not Staff or Kepala KUA
  if (!authLoading && !isStaffOrKepalaKUA(userRole)) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Akses Ditolak</AlertTitle>
          <AlertDescription>
            {getUnauthorizedMessage('GET_ALL_REGISTRATIONS')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading || authLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {staffNotifications.length > 0 && (
        <div>
          <Alert>
            <AlertTitle>Terdapat pendaftaran baru</AlertTitle>
            <AlertDescription>
              {`Ada ${staffNotifications.length} pendaftaran baru yang menunggu verifikasi.`}
            </AlertDescription>
          </Alert>
        </div>
      )}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pendaftaran Nikah</h1>
        <p className="text-muted-foreground">
          Verifikasi, setujui, dan kelola semua pendaftaran nikah yang masuk.
        </p>
      </div>
      <RegistrationsTable data={registrations} />
    </div>
  );
}
