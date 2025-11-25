/**
 * Registration Status Constants
 * Sesuai dengan flow status sederhana SimNikah (4 tahap)
 * 
 * Flow:
 * 1. Draft → Menunggu Penugasan (User submit)
 * 2. Menunggu Penugasan → Penghulu Ditugaskan (Kepala KUA assign)
 * 3. Penghulu Ditugaskan → Selesai (Staff/Kepala KUA complete)
 */

// Status Constants (6 Status Utama)
export const REGISTRATION_STATUS = {
  DRAFT: 'Draft',
  DISETUJUI: 'Disetujui',
  MENUNGGU_PENUGASAN: 'Menunggu Penugasan',
  PENGHULU_DITUGASKAN: 'Penghulu Ditugaskan',
  SELESAI: 'Selesai',
  DITOLAK: 'Ditolak',
} as const;

// Type untuk status
export type RegistrationStatus = typeof REGISTRATION_STATUS[keyof typeof REGISTRATION_STATUS];

// Status yang valid
export const VALID_STATUSES: RegistrationStatus[] = [
  REGISTRATION_STATUS.DRAFT,
  REGISTRATION_STATUS.DISETUJUI,
  REGISTRATION_STATUS.MENUNGGU_PENUGASAN,
  REGISTRATION_STATUS.PENGHULU_DITUGASKAN,
  REGISTRATION_STATUS.SELESAI,
  REGISTRATION_STATUS.DITOLAK,
];

// Status yang bisa ditolak
export const REJECTABLE_STATUSES: RegistrationStatus[] = [
  REGISTRATION_STATUS.MENUNGGU_PENUGASAN,
];

// Status yang memerlukan aksi user
export const USER_ACTION_STATUSES: RegistrationStatus[] = [
  REGISTRATION_STATUS.DRAFT,
];

// Status yang memerlukan aksi staff
export const STAFF_ACTION_STATUSES: RegistrationStatus[] = [
  REGISTRATION_STATUS.PENGHULU_DITUGASKAN, // Complete nikah
];

// Status yang memerlukan aksi penghulu
export const PENGHULU_ACTION_STATUSES: RegistrationStatus[] = [
  // Penghulu hanya lihat alamat (jika di luar KUA)
];

// Status yang memerlukan aksi kepala KUA
export const KEPALA_KUA_ACTION_STATUSES: RegistrationStatus[] = [
  REGISTRATION_STATUS.MENUNGGU_PENUGASAN, // Assign penghulu
];

// Status yang final (tidak bisa diubah lagi)
export const FINAL_STATUSES: RegistrationStatus[] = [
  REGISTRATION_STATUS.SELESAI,
  REGISTRATION_STATUS.DITOLAK,
];

// Status flow order (untuk progress tracking)
export const STATUS_FLOW_ORDER: RegistrationStatus[] = [
  REGISTRATION_STATUS.DRAFT,
  REGISTRATION_STATUS.MENUNGGU_PENUGASAN,
  REGISTRATION_STATUS.PENGHULU_DITUGASKAN,
  REGISTRATION_STATUS.SELESAI,
];

/**
 * Get status info for display (badge variant, icon, label, color)
 */
export function getStatusInfo(status: RegistrationStatus | string) {
  switch (status) {
    case REGISTRATION_STATUS.DRAFT:
      return {
        variant: 'outline' as const,
        label: 'Draft',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        description: 'Formulir masih dalam tahap pengisian',
      };
    case REGISTRATION_STATUS.DISETUJUI:
      return {
        variant: 'default' as const,
        label: 'Disetujui',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        description: 'Pendaftaran telah disetujui oleh staff, menunggu penugasan penghulu',
      };
    case REGISTRATION_STATUS.MENUNGGU_PENUGASAN:
      return {
        variant: 'secondary' as const,
        label: 'Menunggu Penugasan',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        description: 'Menunggu Kepala KUA untuk menugaskan Penghulu',
      };
    case REGISTRATION_STATUS.PENGHULU_DITUGASKAN:
      return {
        variant: 'default' as const,
        label: 'Penghulu Ditugaskan',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        description: 'Penghulu sudah ditugaskan, siap untuk pelaksanaan nikah',
      };
    case REGISTRATION_STATUS.SELESAI:
      return {
        variant: 'outline' as const,
        label: 'Selesai',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        description: 'Pendaftaran nikah sudah selesai, nikah telah dilaksanakan',
      };
    case REGISTRATION_STATUS.DITOLAK:
      return {
        variant: 'destructive' as const,
        label: 'Ditolak',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        description: 'Pendaftaran ditolak, silakan perbaiki dan daftar ulang',
      };
    default:
      // Handle old statuses for backward compatibility
      if (typeof status === 'string') {
        return {
          variant: 'outline' as const,
          label: status,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          description: 'Status tidak diketahui',
        };
      }
      return {
        variant: 'outline' as const,
        label: 'Unknown',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        description: 'Status tidak diketahui',
      };
  }
}

/**
 * Get next possible statuses from current status
 */
export function getNextStatuses(currentStatus: RegistrationStatus): RegistrationStatus[] {
  switch (currentStatus) {
    case REGISTRATION_STATUS.DRAFT:
      return [REGISTRATION_STATUS.DISETUJUI, REGISTRATION_STATUS.DITOLAK];
    case REGISTRATION_STATUS.DISETUJUI:
      return [REGISTRATION_STATUS.MENUNGGU_PENUGASAN, REGISTRATION_STATUS.DITOLAK];
    case REGISTRATION_STATUS.MENUNGGU_PENUGASAN:
      return [REGISTRATION_STATUS.DITOLAK]; // Penghulu Ditugaskan hanya via assign endpoint
    case REGISTRATION_STATUS.PENGHULU_DITUGASKAN:
      return [REGISTRATION_STATUS.SELESAI, REGISTRATION_STATUS.DITOLAK];
    case REGISTRATION_STATUS.SELESAI:
      return []; // Final status
    case REGISTRATION_STATUS.DITOLAK:
      return []; // Final status
    default:
      return [];
  }
}

/**
 * Check if status transition is valid
 */
export function isValidTransition(
  fromStatus: RegistrationStatus,
  toStatus: RegistrationStatus
): boolean {
  const nextStatuses = getNextStatuses(fromStatus);
  return nextStatuses.includes(toStatus);
}

/**
 * Get progress percentage based on status
 */
export function getStatusProgress(status: RegistrationStatus): number {
  const index = STATUS_FLOW_ORDER.indexOf(status);
  if (index === -1) return 0;
  return ((index + 1) / STATUS_FLOW_ORDER.length) * 100;
}
