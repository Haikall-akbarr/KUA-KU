/**
 * Penghulu Service Layer
 * Handles all API calls related to Penghulu dashboard functionality
 * API Base: https://simnikah-api-production.up.railway.app
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://simnikah-api-production.up.railway.app';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// ========== PENGHULU INTERFACES ==========

export interface AssignedRegistration {
  id: string;
  nomor_pendaftaran: string;
  status_pendaftaran: string;
  tanggal_nikah: string;
  waktu_nikah: string;
  tempat_nikah: string;
  calon_suami: {
    nama_lengkap: string;
    nik: string;
  };
  calon_istri: {
    nama_lengkap: string;
    nik: string;
  };
}

export interface PenguluSchedule {
  id: string;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string;
  jumlah_pernikahan: number;
  kapasitas: number;
  lokasi?: string;
}

export interface VerificationDocuments {
  id: string;
  nomor_pendaftaran: string;
  dokumen_suami: string[];
  dokumen_istri: string[];
  dokumen_wali: string[];
  status_verifikasi: string;
}

export interface PenguluProfile {
  id: number;
  nama_lengkap: string;
  nip: string;
  status: string;
  jumlah_nikah: number;
  rating: number;
  email: string;
  no_hp: string;
  alamat?: string;
}

export interface VerificationResult {
  id: string;
  nomor_pendaftaran: string;
  status_verifikasi: 'approved' | 'rejected';
  catatan?: string;
  waktu_verifikasi: string;
}

// ========== API FUNCTIONS ==========

/**
 * 4.6 Get Assigned Registrations
 * GET /simnikah/penghulu/assigned-registrations
 */
export const getAssignedRegistrations = async (): Promise<AssignedRegistration[]> => {
  try {
    // First try to get from localStorage (marriageRegistrations)
    const allRegs = JSON.parse(localStorage.getItem('marriageRegistrations') || '[]');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const penguluProfile = localStorage.getItem('penghulu_profile');
    const currentPenghulu = penguluProfile ? JSON.parse(penguluProfile) : null;
    
    console.log('🔍 Loading registrations...');
    console.log('Current penghulu profile:', currentPenghulu);
    console.log('Total registrations in localStorage:', allRegs.length);
    
    // Filter registrations assigned to this penghulu
    const assignedRegs = allRegs.filter((reg: any) => {
      const penghuluMatch = reg.penghuluId && (
        currentPenghulu?.id 
          ? reg.penghuluId === currentPenghulu.id || reg.penghuluId === currentPenghulu.id.toString()
          : reg.penghuluId === user.id || reg.penghuluId === user.id?.toString()
      );
      
      if (penghuluMatch) {
        console.log(`✅ Matched registration: ${reg.id}, status: ${reg.status}`);
      }
      return penghuluMatch;
    });

    console.log(`📊 Found ${assignedRegs.length} assigned registrations`);

    // Map to expected format
    const mappedRegs = assignedRegs.map((reg: any) => ({
      id: reg.id,
      nomor_pendaftaran: reg.id,
      status_pendaftaran: reg.status,
      tanggal_nikah: reg.weddingDate,
      waktu_nikah: reg.weddingTime || '-',
      tempat_nikah: reg.weddingLocation || '-',
      calon_suami: {
        nama_lengkap: reg.groomName,
        nik: reg.groomNik || '-',
      },
      calon_istri: {
        nama_lengkap: reg.brideName,
        nik: reg.brideNik || '-',
      },
    }));

    // If localStorage has data, return it
    if (mappedRegs.length > 0) {
      console.debug(`✅ Loaded ${mappedRegs.length} registrations from localStorage`);
      return mappedRegs;
    }

    // If no localStorage data, try API
    console.debug('📡 No registrations in localStorage, trying API...');
    const response = await fetch(
      `${API_BASE_URL}/simnikah/penghulu/assigned-registrations`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      console.warn(`⚠️ API returned status ${response.status}, using empty array or cache`);
      return getCachedAssignedRegistrations();
    }

    const data = await response.json();
    const apiRegs = data.data?.registrations || [];
    
    // Cache API results
    if (apiRegs.length > 0) {
      cacheAssignedRegistrations(apiRegs);
    }
    
    return apiRegs;
  } catch (error) {
    console.error('❌ Error fetching assigned registrations:', error);
    // Return cached data as fallback
    const cached = getCachedAssignedRegistrations();
    console.debug(`📦 Returning ${cached.length} cached registrations`);
    return cached;
  }
};

/**
 * 4.4 Get Penghulu Schedule
 * GET /simnikah/penghulu-jadwal/:tanggal
 */
export const getPenguluSchedule = async (tanggal: string): Promise<PenguluSchedule[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/simnikah/penghulu-jadwal/${tanggal}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch schedule: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.jadwal || [];
  } catch (error) {
    console.error('Error fetching schedule:', error);
    throw error;
  }
};

/**
 * 4.5 Verify Documents
 * POST /simnikah/penghulu/verify-documents/:id
 */
export const verifyDocuments = async (
  registrationId: string,
  status: 'approved' | 'rejected',
  catatan?: string
): Promise<VerificationResult> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/simnikah/penghulu/verify-documents/${registrationId}`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status_verifikasi: status,
          catatan: catatan || '',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to verify documents: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error verifying documents:', error);
    throw error;
  }
};

// ========== DATA MANAGEMENT FUNCTIONS ==========

/**
 * Create notification for penghulu
 */
export const createPenguluNotification = (
  type: 'success' | 'error' | 'info',
  message: string
) => {
  const notification = {
    id: Date.now().toString(),
    type,
    message,
    timestamp: new Date().toISOString(),
  };

  try {
    const existing = localStorage.getItem('penghulu_notifications');
    const notifications = existing ? JSON.parse(existing) : [];
    notifications.push(notification);

    // Keep only last 50 notifications
    const recent = notifications.slice(-50);
    localStorage.setItem('penghulu_notifications', JSON.stringify(recent));

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return notification;
  }
};

/**
 * Get all penghulu notifications
 */
export const getPenguluNotifications = () => {
  try {
    const notifications = localStorage.getItem('penghulu_notifications');
    return notifications ? JSON.parse(notifications) : [];
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

/**
 * Clear penghulu notifications
 */
export const clearPenguluNotifications = () => {
  try {
    localStorage.removeItem('penghulu_notifications');
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
};

/**
 * Save verification data to localStorage for offline access
 */
export const saveVerificationData = (
  registrationId: string,
  verificationData: VerificationResult
) => {
  try {
    const existing = localStorage.getItem('penghulu_verifications');
    const verifications = existing ? JSON.parse(existing) : {};
    verifications[registrationId] = {
      ...verificationData,
      saved_at: new Date().toISOString(),
    };
    localStorage.setItem('penghulu_verifications', JSON.stringify(verifications));
  } catch (error) {
    console.error('Error saving verification data:', error);
  }
};

/**
 * Get offline verification data
 */
export const getOfflineVerifications = () => {
  try {
    const data = localStorage.getItem('penghulu_verifications');
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting offline verifications:', error);
    return {};
  }
};

/**
 * Complete verification workflow with notifications
 */
export const completeVerification = async (
  registrationId: string,
  nomor_pendaftaran: string,
  status: 'approved' | 'rejected',
  catatan?: string
): Promise<boolean> => {
  try {
    // Call API
    const result = await verifyDocuments(registrationId, status, catatan);

    // Save verification data
    saveVerificationData(registrationId, result);

    // Create notification
    const message =
      status === 'approved'
        ? `Dokumen ${nomor_pendaftaran} telah disetujui. Status: Menunggu Bimbingan`
        : `Dokumen ${nomor_pendaftaran} telah ditolak. Catatan: ${catatan || 'Lihat detail untuk informasi lebih lanjut'}`;

    createPenguluNotification(
      status === 'approved' ? 'success' : 'error',
      message
    );

    // Update local registrations in both caches
    // Update penghulu_assigned_registrations cache
    const existing = localStorage.getItem('penghulu_assigned_registrations');
    if (existing) {
      const registrations = JSON.parse(existing);
      const updated = registrations.map((reg: AssignedRegistration) =>
        reg.id === registrationId
          ? {
              ...reg,
              status_pendaftaran:
                status === 'approved'
                  ? 'Menunggu Bimbingan'
                  : 'Penolakan Dokumen',
            }
          : reg
      );
      localStorage.setItem(
        'penghulu_assigned_registrations',
        JSON.stringify(updated)
      );
    }

    // Also update the main marriageRegistrations
    const mainRegs = JSON.parse(localStorage.getItem('marriageRegistrations') || '[]');
    const updatedMainRegs = mainRegs.map((reg: any) =>
      reg.id === registrationId
        ? {
            ...reg,
            status:
              status === 'approved'
                ? 'Menunggu Bimbingan'
                : 'Penolakan Dokumen',
            penguluVerificationDate: new Date().toISOString(),
          }
        : reg
    );
    localStorage.setItem('marriageRegistrations', JSON.stringify(updatedMainRegs));

    return true;
  } catch (error) {
    console.error('Error completing verification:', error);
    createPenguluNotification('error', `Gagal memverifikasi dokumen: ${String(error)}`);
    return false;
  }
};

/**
 * Cache assigned registrations
 */
export const cacheAssignedRegistrations = (registrations: AssignedRegistration[]) => {
  try {
    localStorage.setItem(
      'penghulu_assigned_registrations',
      JSON.stringify(registrations)
    );
  } catch (error) {
    console.error('Error caching registrations:', error);
  }
};

/**
 * Get cached assigned registrations
 */
export const getCachedAssignedRegistrations = (): AssignedRegistration[] => {
  try {
    const data = localStorage.getItem('penghulu_assigned_registrations');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting cached registrations:', error);
    return [];
  }
};

/**
 * Cache schedule data
 */
export const cacheSchedule = (tanggal: string, schedule: PenguluSchedule[]) => {
  try {
    const schedules = localStorage.getItem('penghulu_schedules') || '{}';
    const parsed = JSON.parse(schedules);
    parsed[tanggal] = {
      data: schedule,
      cached_at: new Date().toISOString(),
    };
    localStorage.setItem('penghulu_schedules', JSON.stringify(parsed));
  } catch (error) {
    console.error('Error caching schedule:', error);
  }
};

/**
 * Get cached schedule
 */
export const getCachedSchedule = (tanggal: string): PenguluSchedule[] => {
  try {
    const schedules = localStorage.getItem('penghulu_schedules') || '{}';
    const parsed = JSON.parse(schedules);
    return parsed[tanggal]?.data || [];
  } catch (error) {
    console.error('Error getting cached schedule:', error);
    return [];
  }
};

/**
 * Get verification stats
 */
export const getVerificationStats = () => {
  try {
    const registrations = getCachedAssignedRegistrations();
    const verifications = getOfflineVerifications();

    return {
      total_assigned: registrations.length,
      pending_verification: registrations.filter(
        (r) => r.status_pendaftaran === 'Menunggu Verifikasi Penghulu'
      ).length,
      completed_verification: Object.keys(verifications).length,
      approved: Object.values(verifications).filter(
        (v: any) => v.status_verifikasi === 'approved'
      ).length,
      rejected: Object.values(verifications).filter(
        (v: any) => v.status_verifikasi === 'rejected'
      ).length,
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return {
      total_assigned: 0,
      pending_verification: 0,
      completed_verification: 0,
      approved: 0,
      rejected: 0,
    };
  }
};
