/**
 * Penghulu Service Layer
 * Handles all API calls related to Penghulu dashboard functionality
 * API Base: https://simnikah-api-production-5583.up.railway.app
 */

import { getAssignedRegistrations as getAssignedRegistrationsAPI, handleApiError } from './simnikah-api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://simnikah-api-production-5583.up.railway.app';

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
    // Call API to get assigned registrations
    const response = await getAssignedRegistrationsAPI().catch((err) => {
      console.error('❌ Error calling getAssignedRegistrationsAPI:', err);
      // Return empty structure to prevent crash
      return { success: false, data: [] };
    });
    
    console.log('🔍 API Response for assigned registrations:', response);
    
    // Check if response is valid (not HTML error page)
    if (!response || (typeof response === 'string' && response.trim().startsWith('<'))) {
      console.warn('⚠️ API returned HTML instead of JSON, using cached data');
      const cached = getCachedAssignedRegistrations();
      return cached.length > 0 ? cached : [];
    }
    
    // Map API response to AssignedRegistration format
    if (response && response.data && Array.isArray(response.data)) {
      const mappedRegs: AssignedRegistration[] = response.data.map((reg: any) => ({
        id: reg.nomor_pendaftaran || reg.id || `reg_${Date.now()}`,
        nomor_pendaftaran: reg.nomor_pendaftaran || reg.id || '',
        status_pendaftaran: reg.status_pendaftaran || reg.status || 'Menunggu Verifikasi Penghulu',
        tanggal_nikah: reg.tanggal_nikah || reg.weddingDate || '',
        waktu_nikah: reg.waktu_nikah || reg.weddingTime || '',
        tempat_nikah: reg.tempat_nikah || reg.weddingLocation || '',
        calon_suami: {
          nama_lengkap: reg.calon_suami?.nama_lengkap || reg.groomName || '',
          nik: reg.calon_suami?.nik || reg.groomNik || ''
        },
        calon_istri: {
          nama_lengkap: reg.calon_istri?.nama_lengkap || reg.brideName || '',
          nik: reg.calon_istri?.nik || reg.brideNik || ''
        }
      }));
      
      // Cache the results
      cacheAssignedRegistrations(mappedRegs);
      return mappedRegs;
    }
    
    // If response.data is array directly (not wrapped)
    if (Array.isArray(response.data)) {
      const mappedRegs: AssignedRegistration[] = response.data.map((reg: any) => ({
        id: reg.nomor_pendaftaran || reg.id || `reg_${Date.now()}`,
        nomor_pendaftaran: reg.nomor_pendaftaran || reg.id || '',
        status_pendaftaran: reg.status_pendaftaran || reg.status || 'Menunggu Verifikasi Penghulu',
        tanggal_nikah: reg.tanggal_nikah || reg.weddingDate || '',
        waktu_nikah: reg.waktu_nikah || reg.weddingTime || '',
        tempat_nikah: reg.tempat_nikah || reg.weddingLocation || '',
        calon_suami: {
          nama_lengkap: reg.calon_suami?.nama_lengkap || reg.groomName || '',
          nik: reg.calon_suami?.nik || reg.groomNik || ''
        },
        calon_istri: {
          nama_lengkap: reg.calon_istri?.nama_lengkap || reg.brideName || '',
          nik: reg.calon_istri?.nik || reg.brideNik || ''
        }
      }));
      
      cacheAssignedRegistrations(mappedRegs);
      return mappedRegs;
    }
    
    // Fallback to cached data if API returns empty or unexpected format
    const cached = getCachedAssignedRegistrations();
    if (cached.length > 0) {
      console.log('📦 Using cached registrations:', cached.length);
      return cached;
    }
    
    return [];
  } catch (error: any) {
    console.error('❌ Error fetching assigned registrations:', error);
    
    // Check if error is due to HTML response
    if (error.message && error.message.includes('Unexpected token')) {
      console.warn('⚠️ API returned invalid JSON (possibly HTML error page), using cached data');
    }
    // Fallback to cached data
    const cached = getCachedAssignedRegistrations();
    if (cached.length > 0) {
      console.log('📦 Using cached registrations due to error:', cached.length);
      return cached;
    }
    
    // If no cache, try localStorage as last resort
    const allRegs = JSON.parse(localStorage.getItem('marriageRegistrations') || '[]');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const penguluProfile = localStorage.getItem('penghulu_profile');
    const currentPenghulu = penguluProfile ? JSON.parse(penguluProfile) : null;
    
    console.log('🔍 Loading from localStorage as fallback...');
    
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
    try {
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
    } catch (fallbackError: any) {
      // If there's an error in the fallback API call, return cached data
      console.error('❌ Error in fallback API call:', fallbackError);
      return getCachedAssignedRegistrations();
    }
  }
};

/**
 * 4.4 Get Penghulu Schedule
 * GET /simnikah/penghulu-jadwal/:tanggal
 */
/**
 * 4.4 Get Penghulu Schedule (DEPRECATED)
 * 
 * NOTE: Endpoint /simnikah/penghulu-jadwal/:tanggal tidak ada di dokumentasi API.
 * Gunakan getWeddingsByDate dari simnikah-api.ts sebagai gantinya.
 * 
 * @deprecated Use getWeddingsByDate from simnikah-api.ts instead
 */
export const getPenguluSchedule = async (tanggal: string): Promise<PenguluSchedule[]> => {
  console.warn('⚠️ getPenguluSchedule is deprecated. Use getWeddingsByDate from simnikah-api.ts instead.');
  return [];
};

// Removed: verifyDocumentsLocal function - verification feature has been removed

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

// Removed: completeVerification function - verification feature has been removed

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
