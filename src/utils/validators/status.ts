/**
 * Validasi Status Pendaftaran
 * Sesuai dokumentasi backend - Section Validasi Tampilan Frontend
 */

export interface StatusValidationResult {
  isValid: boolean;
  message: string;
}

/**
 * Validasi Status Transition
 */
export const validateStatusTransition = (
  currentStatus: string,
  newStatus: string,
  userRole: string
): StatusValidationResult => {
  // Status yang valid
  const validStatuses = [
    'Draft',
    'Disetujui',
    'Menunggu Penugasan',
    'Penghulu Ditugaskan',
    'Selesai',
    'Ditolak'
  ];

  if (!validStatuses.includes(newStatus)) {
    return {
      isValid: false,
      message: 'Status tidak valid'
    };
  }

  // Flow status yang diizinkan
  const allowedTransitions: Record<string, string[]> = {
    'Draft': ['Disetujui', 'Ditolak'],
    'Disetujui': ['Menunggu Penugasan', 'Ditolak'],
    'Menunggu Penugasan': ['Penghulu Ditugaskan'],
    'Penghulu Ditugaskan': ['Selesai'],
    'Selesai': [], // Final status
    'Ditolak': [] // Final status
  };

  const allowed = allowedTransitions[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    return {
      isValid: false,
      message: `Tidak bisa mengubah status dari "${currentStatus}" ke "${newStatus}"`
    };
  }

  // Role-based validation
  if (newStatus === 'Disetujui' && userRole !== 'staff') {
    return {
      isValid: false,
      message: 'Hanya staff yang dapat menyetujui pendaftaran'
    };
  }

  if (newStatus === 'Penghulu Ditugaskan' && userRole !== 'kepala_kua') {
    return {
      isValid: false,
      message: 'Hanya kepala KUA yang dapat menugaskan penghulu'
    };
  }

  return {
    isValid: true,
    message: 'Status transition valid'
  };
};

