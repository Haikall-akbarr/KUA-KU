'use client';

import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { 
  REGISTRATION_STATUS, 
  getStatusInfo, 
  getNextStatuses,
  isValidTransition,
  type RegistrationStatus 
} from '@/lib/registration-status';
import { 
  updateStatusPendaftaran,
  PENGHULU_RELATED_STATUSES,
  ASSIGN_ONLY_STATUSES,
  handleApiError 
} from '@/lib/simnikah-api';
import { useToast } from '@/hooks/use-toast';

interface StatusDropdownProps {
  registrationId: string;
  currentStatus: RegistrationStatus;
  userRole: string | null;
  onStatusChange?: (newStatus: RegistrationStatus) => void;
}

export function StatusDropdown({ 
  registrationId, 
  currentStatus, 
  userRole,
  onStatusChange 
}: StatusDropdownProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  
  // Get all available statuses for dropdown (sesuai flow sederhana)
  const getAvailableStatuses = (): RegistrationStatus[] => {
    // Status yang bisa diupdate via endpoint fleksibel (sesuai flow baru)
    const flexibleStatuses: RegistrationStatus[] = [
      REGISTRATION_STATUS.DRAFT,
      REGISTRATION_STATUS.MENUNGGU_PENUGASAN,
      REGISTRATION_STATUS.SELESAI,
      REGISTRATION_STATUS.DITOLAK,
    ];
    
    let filteredStatuses: RegistrationStatus[] = [];
    
    // Filter based on user role permissions
    if (userRole === 'staff') {
      // Staff TIDAK BOLEH mengubah status melalui dropdown
      // Staff hanya bisa approve/reject melalui tombol di halaman /admin/staff
      // Menggunakan endpoint POST /simnikah/staff/approve/:id
      // Dropdown untuk staff hanya menampilkan status saat ini (read-only)
      filteredStatuses = [currentStatus as RegistrationStatus];
    } else if (userRole === 'penghulu') {
      // Penghulu bisa update ke: Selesai, Ditolak (jika diperlukan)
      // Tidak bisa update status lain
      filteredStatuses = [
        REGISTRATION_STATUS.SELESAI,
        REGISTRATION_STATUS.DITOLAK,
      ];
    } else if (userRole === 'kepala_kua') {
      // Kepala KUA bisa update ke: Draft, Selesai, Ditolak
      // "Menunggu Penugasan" hanya bisa diubah via assign-penghulu (tidak muncul di dropdown)
      // "Penghulu Ditugaskan" hanya via assign-penghulu endpoint (tidak muncul di dropdown)
      filteredStatuses = flexibleStatuses.filter(status => 
        status !== REGISTRATION_STATUS.PENGHULU_DITUGASKAN &&
        status !== REGISTRATION_STATUS.MENUNGGU_PENUGASAN
      );
    } else {
      // Default: return all flexible statuses (kecuali Penghulu Ditugaskan dan Menunggu Penugasan)
      filteredStatuses = flexibleStatuses.filter(status => 
        status !== REGISTRATION_STATUS.PENGHULU_DITUGASKAN &&
        status !== REGISTRATION_STATUS.MENUNGGU_PENUGASAN
      );
    }
    
    // Always include current status if not already in the list (avoid duplicates)
    if (!filteredStatuses.includes(currentStatus)) {
      filteredStatuses.push(currentStatus);
    }
    
    // Remove any duplicates using Set to ensure unique keys
    return Array.from(new Set(filteredStatuses));
  };

  const availableStatuses = getAvailableStatuses();
  const statusInfo = getStatusInfo(currentStatus);

  const handleStatusChange = async (newStatus: RegistrationStatus) => {
    if (newStatus === currentStatus) return;

    // Validasi: cek apakah status terkait penghulu (tidak bisa diupdate manual)
    if (PENGHULU_RELATED_STATUSES.includes(newStatus as any)) {
      toast({
        title: 'Status Tidak Bisa Diubah',
        description: `Status "${getStatusInfo(newStatus).label}" otomatis setelah assign penghulu dan tidak bisa diupdate manual`,
        variant: 'destructive',
      });
      return;
    }

    // Validasi: jika ingin mengubah ke "Penghulu Ditugaskan", harus via assign-penghulu
    if (newStatus === REGISTRATION_STATUS.PENGHULU_DITUGASKAN) {
      toast({
        title: 'Akses Ditolak',
        description: `Status "${getStatusInfo(newStatus).label}" hanya bisa diubah oleh Kepala KUA melalui endpoint assign-penghulu. Gunakan endpoint POST /simnikah/pendaftaran/:id/assign-penghulu untuk menugaskan penghulu.`,
        variant: 'destructive',
      });
      return;
    }

    // Validasi: jika current status adalah "Menunggu Penugasan"
    // Hanya bisa diubah ke "Penghulu Ditugaskan" via assign-penghulu endpoint
    // Tidak bisa diubah ke status lain melalui endpoint fleksibel
    if (currentStatus === REGISTRATION_STATUS.MENUNGGU_PENUGASAN) {
      toast({
        title: 'Akses Ditolak',
        description: `Status "${getStatusInfo(currentStatus).label}" hanya bisa diubah oleh Kepala KUA melalui endpoint assign-penghulu. Gunakan endpoint POST /simnikah/pendaftaran/:id/assign-penghulu untuk menugaskan penghulu.`,
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);
    let apiCallSuccess = false;
    
    try {
      // Flow sederhana: Gunakan endpoint fleksibel untuk semua update status
      // Kecuali untuk complete nikah (bisa gunakan endpoint khusus atau fleksibel)
      
      // Jika update ke "Selesai" dari "Penghulu Ditugaskan", bisa gunakan complete-nikah
      // Tapi untuk fleksibilitas, kita gunakan update-status saja
      
      await updateStatusPendaftaran(registrationId, {
        status: newStatus, // Backend mengharapkan 'status' dengan huruf kecil (flow baru)
        catatan: `Status diupdate dari "${getStatusInfo(currentStatus).label}" ke "${getStatusInfo(newStatus).label}"`,
      });
      apiCallSuccess = true;

      // Show success message
      toast({
        title: 'Status Berhasil Diubah',
        description: `Status berhasil diubah menjadi "${getStatusInfo(newStatus).label}"`,
      });

      if (onStatusChange) {
        onStatusChange(newStatus);
      } else {
        // Reload page to reflect changes
        window.location.reload();
      }
    } catch (error: any) {
      console.error('❌ Error updating status:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response,
        status: error.status || error.response?.status,
        data: error.response?.data
      });
      
      // Extract error message
      let errorMessage = 'Gagal mengubah status';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status) {
        errorMessage = `Error ${error.response.status}: ${error.response.statusText || 'Request failed'}`;
      }
      
      // Handle specific error cases
      const statusCode = error.status || error.response?.status;
      if (statusCode === 403) {
        toast({
          title: 'Akses Ditolak',
          description: errorMessage || 'Status ini hanya bisa diubah oleh Kepala KUA melalui menu Assign Penghulu',
          variant: 'destructive',
        });
      } else if (statusCode === 400) {
        toast({
          title: 'Status Tidak Valid',
          description: errorMessage || 'Status yang dipilih tidak valid',
          variant: 'destructive',
        });
      } else if (statusCode === 401) {
        toast({
          title: 'Tidak Terautentikasi',
          description: 'Sesi Anda telah berakhir. Silakan login kembali.',
          variant: 'destructive',
        });
      } else if (statusCode === 404) {
        toast({
          title: 'Data Tidak Ditemukan',
          description: 'Pendaftaran tidak ditemukan. Silakan refresh halaman.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Gagal Mengubah Status',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Disable dropdown jika current status adalah "Menunggu Penugasan"
  // Karena hanya bisa diubah via assign-penghulu endpoint
  const isDisabled = isUpdating || currentStatus === REGISTRATION_STATUS.MENUNGGU_PENUGASAN;

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentStatus}
        onValueChange={handleStatusChange}
        disabled={isDisabled}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue>
            <Badge variant={statusInfo.variant} className="flex items-center w-fit">
              {statusInfo.label}
            </Badge>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableStatuses.map((status, index) => {
            const info = getStatusInfo(status);
            const isCurrentStatus = status === currentStatus;
            const isPenghuluStatus = PENGHULU_RELATED_STATUSES.includes(status as any);
            const isDisabled = isCurrentStatus || (isPenghuluStatus && userRole !== 'kepala_kua');
            
            // Use combination of status and index to ensure unique key
            return (
              <SelectItem 
                key={`${status}-${index}`} 
                value={status}
                disabled={isDisabled}
              >
                <div className="flex items-center gap-2">
                  <Badge variant={info.variant} className="text-xs">
                    {info.label}
                  </Badge>
                  {isCurrentStatus && <span className="text-xs text-gray-500">(Saat ini)</span>}
                  {isPenghuluStatus && userRole !== 'kepala_kua' && (
                    <span className="text-xs text-orange-600">(Hanya Kepala KUA)</span>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
    </div>
  );
}

