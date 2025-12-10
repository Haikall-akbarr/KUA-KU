/**
 * SimNikah API Service
 * Complete API functions based on official documentation
 * Base URL: https://simnikah-api-production-5583.up.railway.app
 */

import api from './api';
import { format } from 'date-fns';
import { id as IndonesianLocale } from 'date-fns/locale';

// ============================================
// 📋 TYPE DEFINITIONS
// ============================================

// Authentication Types
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  nama: string;
  role: 'user_biasa' | 'staff' | 'penghulu' | 'kepala_kua';
}

export interface RegisterResponse {
  message: string;
  user: {
    user_id: string;
    username: string;
    email: string;
    nama: string;
    role: string;
  };
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    user_id: string;
    email: string;
    role: string;
    nama: string;
  };
}

export interface ProfileResponse {
  message: string;
  user: {
    user_id: string;
    username: string;
    email: string;
    role: string;
    nama: string;
  };
}

// Marriage Registration Types - New Simplified API
export interface SimpleMarriageRegistrationRequest {
  calon_laki_laki: {
    nama_dan_bin: string;
    pendidikan_akhir: string;
    umur: number;
  };
  calon_perempuan: {
    nama_dan_binti: string;
    pendidikan_akhir: string;
    umur: number;
  };
  lokasi_nikah: {
    tempat_nikah: 'Di KUA' | 'Di Luar KUA';
    tanggal_nikah: string; // YYYY-MM-DD
    waktu_nikah: string; // HH:MM
    alamat_nikah?: string; // Required if tempat_nikah = 'Di Luar KUA'
    alamat_detail?: string; // Optional
    kelurahan?: string; // Optional: will be extracted from geolocation if not provided
    latitude?: number; // Required if tempat_nikah = 'Di Luar KUA': coordinates from map
    longitude?: number; // Required if tempat_nikah = 'Di Luar KUA': coordinates from map
  };
  wali_nikah: {
    nama_dan_bin: string;
    hubungan_wali: string; // Valid values: "Ayah Kandung", "Kakek", "Saudara Laki-Laki Kandung", etc.
  };
}

// Marriage Registration Types - Old Complex API (kept for backward compatibility)
export interface MarriageRegistrationRequest {
  calon_suami: {
    nik: string;
    nama_lengkap: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    alamat: string;
    rt: string;
    rw: string;
    kelurahan: string;
    kecamatan: string;
    kabupaten: string;
    provinsi: string;
    agama: string;
    status: string;
    pekerjaan: string;
    deskripsi_pekerjaan?: string;
    pendidikan: string;
    penghasilan?: number;
    nomor_telepon: string;
    email: string;
    kewarganegaraan: string;
    nomor_paspor?: string;
  };
  calon_istri: {
    nik: string;
    nama_lengkap: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    alamat: string;
    rt: string;
    rw: string;
    kelurahan: string;
    kecamatan: string;
    kabupaten: string;
    provinsi: string;
    agama: string;
    status: string;
    pekerjaan: string;
    deskripsi_pekerjaan?: string;
    pendidikan: string;
    penghasilan?: number;
    nomor_telepon: string;
    email: string;
    kewarganegaraan: string;
    nomor_paspor?: string;
  };
  orang_tua_calon_suami: {
    ayah: {
      status_keberadaan: string;
      nama?: string;
      nik?: string;
      kewarganegaraan?: string;
      agama?: string;
      tempat_lahir?: string;
      negara_asal?: string;
      pekerjaan?: string;
      deskripsi_pekerjaan?: string;
      alamat?: string;
    };
    ibu: {
      status_keberadaan: string;
      nama?: string;
      nik?: string;
      kewarganegaraan?: string;
      agama?: string;
      tempat_lahir?: string;
      negara_asal?: string;
      pekerjaan?: string;
      deskripsi_pekerjaan?: string;
      alamat?: string;
    };
  };
  orang_tua_calon_istri: {
    ayah: {
      status_keberadaan: string;
      nama?: string;
      nik?: string;
      kewarganegaraan?: string;
      agama?: string;
      tempat_lahir?: string;
      negara_asal?: string;
      pekerjaan?: string;
      deskripsi_pekerjaan?: string;
      alamat?: string;
    };
    ibu: {
      status_keberadaan: string;
      nama?: string;
      nik?: string;
      kewarganegaraan?: string;
      agama?: string;
      tempat_lahir?: string;
      negara_asal?: string;
      pekerjaan?: string;
      deskripsi_pekerjaan?: string;
      alamat?: string;
    };
  };
  wali_nikah: {
    nik_wali: string;
    nama_lengkap_wali: string;
    hubungan_wali: string;
    alamat_wali: string;
    nomor_telepon_wali: string;
    agama_wali: string;
    status_wali: string;
  };
  jadwal_dan_lokasi: {
    tanggal_nikah: string;
    waktu_nikah: string;
    lokasi_nikah: string;
    alamat_nikah?: string;
    nomor_dispensasi?: string;
  };
}

export interface RegistrationStatusResponse {
  success: boolean;
  message: string;
  data: {
    has_registration: boolean;
    can_register: boolean;
    registration?: {
      id: number;
      nomor_pendaftaran: string;
      status_pendaftaran: string;
      tanggal_nikah: string;
      waktu_nikah?: string;
      tempat_nikah: string;
      alamat_akad?: string;
      created_at: string;
      calon_suami?: {
        nama_lengkap?: string;
        nama_dan_bin?: string;
        nama?: string;
      };
      calon_istri?: {
        nama_lengkap?: string;
        nama_dan_binti?: string;
        nama?: string;
      };
      penghulu?: {
        nama?: string;
        nama_lengkap?: string;
        id?: number;
      };
    };
  };
}

export interface RegistrationListParams {
  page?: number;
  limit?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  location?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface RegistrationListResponse {
  success: boolean;
  message?: string;
  data: any[]; // Array registrations (sudah di-extract dari data.registrations)
  total?: number;
  page?: number;
  limit?: number;
  total_pages?: number;
}

// Staff Management Types
// Sesuai dokumentasi API endpoint #20
export interface CreateStaffRequest {
  username: string;
  email: string;
  password: string;
  nama: string;
  nip: string;
  jabatan: string;
  no_hp?: string;
  alamat?: string;
}

// Removed: VerifyFormulirRequest and VerifyBerkasRequest - verification feature has been removed

// Penghulu Management Types
export interface CreatePenghuluRequest {
  username: string;
  email: string;
  password: string;
  nama: string;
  nip: string;
  no_hp?: string;
  alamat?: string;
}

// Removed: VerifyDocumentsRequest - verification feature has been removed

// Update Status Types
export interface UpdateStatusRequest {
  status: string; // Backend mengharapkan 'status' dengan huruf kecil (sesuai flow baru)
  catatan?: string;
}

export interface UpdateStatusResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    nomor_pendaftaran: string;
    status_sebelumnya: string;
    status_sekarang: string;
    catatan?: string;
    updated_by: string;
    updated_at: string;
  };
}

// Status yang tidak bisa diupdate via endpoint fleksibel
// "Penghulu Ditugaskan" otomatis setelah assign penghulu
// "Menunggu Penugasan" tidak bisa diubah ke "Penghulu Ditugaskan" via endpoint fleksibel
// Harus menggunakan endpoint assign-penghulu
export const PENGHULU_RELATED_STATUSES = [
  'Penghulu Ditugaskan', // Auto transition setelah assign, tidak bisa diupdate manual
] as const;

// Status yang hanya bisa diubah ke "Penghulu Ditugaskan" via assign-penghulu endpoint
export const ASSIGN_ONLY_STATUSES = [
  'Menunggu Penugasan', // Hanya bisa diubah ke "Penghulu Ditugaskan" via assign-penghulu
] as const;

// Calendar & Schedule Types
export interface CalendarAvailabilityParams {
  bulan?: number;
  tahun?: number;
}

// Old CalendarAvailabilityResponse - kept for backward compatibility
// New one is defined in section 7 below with updated structure
export interface CalendarAvailabilityResponseOld {
  message: string;
  data: {
    bulan: number;
    tahun: number;
    kalender: Array<{
      tanggal: string;
      total_nikah: number;
      nikah_di_kua: number;
      nikah_di_luar_kua: number;
      kapasitas_kua: number;
      sisa_kuota: number;
      status: string;
      warna: string;
    }>;
  };
}

export interface DateAvailabilityResponse {
  message: string;
  data: {
    tanggal: string;
    total_nikah: number;
    nikah_di_kua: number;
    nikah_di_luar_kua: number;
    kapasitas_kua: number;
    sisa_kuota: number;
    status: string;
    tersedia: boolean;
    jadwal_detail: Array<{
      nomor_pendaftaran: string;
      waktu_nikah: string;
      tempat_nikah: string;
      status_pendaftaran: string;
    }>;
  };
}

export interface AssignPenghuluRequest {
  penghulu_id: number;
  catatan?: string;
}

// Note: Bimbingan interfaces removed - feature not in API documentation

// Notification Types
export interface NotificationListParams {
  page?: number;
  limit?: number;
  status?: 'Belum Dibaca' | 'Sudah Dibaca';
  tipe?: 'Info' | 'Success' | 'Warning' | 'Error';
}

// Notification Response sesuai dokumentasi API
export interface NotificationListResponse {
  success: boolean;
  data: Array<{
    id: number;
    judul: string;
    pesan: string;
    tipe: 'Info' | 'Success' | 'Warning' | 'Error';
    status_baca: 'Belum Dibaca' | 'Sudah Dibaca';
    created_at: string;
    link?: string;
  }>;
  // Optional fields untuk backward compatibility
  message?: string;
  notifications?: Array<{
    id: number;
    user_id: string;
    judul: string;
    pesan: string;
    tipe: string;
    status_baca: string;
    link?: string;
    created_at: string;
    updated_at: string;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_page: number;
  };
  unread_count?: number;
}

export interface MarkNotificationReadRequest {
  status_baca: 'Sudah Dibaca';
}

// ============================================
// 1. AUTHENTICATION APIs
// ============================================

/**
 * 1.1 Register User
 * POST /register
 */
export async function registerUser(data: RegisterRequest): Promise<RegisterResponse> {
  try {
    const response = await api.post<RegisterResponse>('/register', data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Register Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 1.2 Login
 * POST /login
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  try {
    // console.log('📤 Login Request:', { username: data.username });
    const response = await api.post('/login', data);
    // console.log('📥 Login Raw Response:', response);
    // console.log('📥 Login Response Data:', response.data);
    
    // Handle different response structures
    let loginData: LoginResponse;
    
    // Log full response for debugging
    // console.log('📥 Full Response Structure:', JSON.stringify(response.data, null, 2));
    
    // Try multiple extraction strategies (order matters - try most common first)
    // Strategy 1: Direct format { token, user, message }
    // Strategy 2: Nested format { data: { token, user }, message }
    // Strategy 3: Success format { success: true, token, user, message }
    // Strategy 4: Any other nested structure
    
    let token: string | null = null;
    let user: any = null;
    
    // Try direct access first (most common)
    if (response.data.token && response.data.user) {
      token = response.data.token;
      user = response.data.user;
    }
    // Try nested data structure
    else if (response.data.data) {
      token = response.data.data.token || null;
      user = response.data.data.user || null;
    }
    // Try if success field exists but token/user are still at root
    else if (response.data.success !== undefined) {
      token = response.data.token || null;
      user = response.data.user || null;
    }
    // Last resort: try any combination
    else {
      token = response.data.token || response.data.data?.token || null;
      user = response.data.user || response.data.data?.user || null;
    }
    
    const message = 
      response.data.message || 
      response.data.data?.message ||
      'Login berhasil';
    
    // Check if response is HTML (error page)
    if (typeof response.data === 'string' && response.data.trim().startsWith('<')) {
      console.error('⚠️ Login API returned HTML instead of JSON');
      throw new Error('API returned HTML error page. Please check the login endpoint.');
    }
    
    // Validate we have required fields
    if (!token || !user) {
      const responseStr = typeof response.data === 'string' 
        ? response.data.substring(0, 200) 
        : JSON.stringify(response.data, null, 2);
      
      console.error('❌ Invalid login response structure:', {
        hasToken: !!token,
        hasUser: !!user,
        responseDataType: typeof response.data,
        responseDataPreview: responseStr,
        responseDataKeys: typeof response.data === 'object' && response.data !== null 
          ? Object.keys(response.data) 
          : 'not an object',
        tokenPath: response.data.token ? 'response.data.token' : 
                   response.data.data?.token ? 'response.data.data.token' : 'not found',
        userPath: response.data.user ? 'response.data.user' : 
                  response.data.data?.user ? 'response.data.data.user' : 'not found',
      });
      throw new Error(`Invalid login response: missing token or user. Token: ${!!token}, User: ${!!user}. Please check console for response structure.`);
    }
    
    loginData = {
      message,
      token,
      user,
    };
    
    // Validate user object
    if (!loginData.user.role || !loginData.user.user_id) {
      console.error('❌ Invalid user object in login response:', loginData.user);
      throw new Error('Invalid user data: missing role or user_id');
    }
    
    // console.log('✅ Login Success:', {
    //   user_id: loginData.user.user_id,
    //   role: loginData.user.role,
    //   nama: loginData.user.nama,
    // });
    
    // Store token in localStorage
    if (typeof window !== 'undefined' && loginData.token) {
      localStorage.setItem('token', loginData.token);
      localStorage.setItem('user', JSON.stringify(loginData.user));
    }
    
    return loginData;
  } catch (error: any) {
    // Extract error information safely
    const errorInfo: any = {
      message: error?.message || 'Unknown error',
      name: error?.name || 'Error',
    };
    
    // Safely extract response data
    if (error?.response) {
      errorInfo.status = error.response.status;
      errorInfo.statusText = error.response.statusText;
      
      // Handle different response data types
      if (error.response.data) {
        if (typeof error.response.data === 'string') {
          // Check if it's HTML
          const trimmed = error.response.data.trim();
          if (trimmed.startsWith('<') || trimmed.startsWith('<!')) {
            errorInfo.dataType = 'HTML';
            errorInfo.dataPreview = trimmed.substring(0, 200);
            console.error('❌ Login Error: API returned HTML instead of JSON');
            const enhancedError: any = new Error('API returned HTML error page. Please check the login endpoint.');
            enhancedError.response = {
              ...error.response,
              data: { error: 'Invalid response format', message: 'Server returned HTML instead of JSON' }
            };
            throw enhancedError;
          } else {
            errorInfo.dataType = 'string';
            errorInfo.data = error.response.data;
          }
        } else if (typeof error.response.data === 'object') {
          errorInfo.dataType = 'object';
          errorInfo.data = error.response.data;
          errorInfo.errorMessage = error.response.data.error || error.response.data.message || 'Unknown error';
        }
      }
    }
    
    // Log error information
    console.error('❌ Login Error:', errorInfo);
    
    // Create a more informative error message
    let errorMessage = error?.message || 'Gagal melakukan login';
    if (errorInfo.errorMessage) {
      errorMessage = errorInfo.errorMessage;
    } else if (errorInfo.status === 401) {
      errorMessage = 'Username atau password salah';
    } else if (errorInfo.status === 403) {
      // Handle 403 Forbidden - usually CORS or API blocking
      const errorData = errorInfo.data;
      if (errorData?.isCorsError || errorData?.message?.toLowerCase().includes('cors')) {
        errorMessage = 'Akses ditolak oleh server API karena CORS policy. Backend API perlu dikonfigurasi untuk mengizinkan request dari domain Vercel. Silakan hubungi administrator backend untuk setup CORS.';
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else {
        errorMessage = 'Akses ditolak oleh server API. Pastikan environment variable NEXT_PUBLIC_API_URL sudah di-set dengan benar di Vercel, dan backend API mengizinkan request dari domain Vercel.';
      }
      console.error('❌ Login Error 403 - CORS or API blocking:', {
        errorData,
        troubleshooting: errorData?.troubleshooting,
      });
    } else if (errorInfo.status === 404) {
      errorMessage = 'Endpoint login tidak ditemukan';
    } else if (errorInfo.status === 502) {
      errorMessage = 'Server API tidak dapat dijangkau. Server mungkin sedang down atau mengalami masalah. Silakan coba lagi nanti.';
    } else if (errorInfo.status === 503) {
      errorMessage = 'Server sedang dalam maintenance. Silakan coba lagi nanti.';
    } else if (errorInfo.status === 504) {
      errorMessage = 'Server tidak merespons dalam waktu yang ditentukan. Silakan coba lagi.';
    } else if (errorInfo.status === 500) {
      // Handle 500 Internal Server Error - show backend error message if available
      const errorData = errorInfo.data;
      if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      } else if (errorData?.detail) {
        errorMessage = `Terjadi kesalahan pada server: ${errorData.detail}`;
      } else {
        errorMessage = 'Terjadi kesalahan pada server API. Silakan coba lagi nanti atau hubungi administrator.';
      }
      console.error('❌ Login Error 500 - Server Error:', {
        errorData,
        backendError: errorData?.backendError,
      });
    } else if (errorInfo.dataType === 'HTML') {
      errorMessage = 'Server mengembalikan halaman error. Silakan coba lagi nanti.';
    }
    
    // Create enhanced error with better message
    const enhancedError: any = new Error(errorMessage);
    enhancedError.originalError = error;
    enhancedError.response = error?.response;
    enhancedError.status = errorInfo.status;
    
    throw enhancedError;
  }
}

/**
 * 1.3 Get Profile
 * GET /profile
 * 
 * Response structure sesuai dokumentasi:
 * {
 *   "success": true,
 *   "message": "Profile berhasil diambil",
 *   "user": {
 *     "user_id": "USR1704067200",
 *     "username": "ahmad123",
 *     "email": "ahmad@example.com",
 *     "nama": "Ahmad Wijaya",
 *     "role": "user_biasa",
 *     "status": "Aktif",
 *     "created_at": "2024-01-01T10:00:00Z"
 *   }
 * }
 */
export async function getProfile(): Promise<ProfileResponse> {
  try {
    // console.log('📤 Get Profile Request');
    const response = await api.get<ProfileResponse>('/profile');
    
    // Check if response is valid
    if (!response.data) {
      throw new Error('Invalid response: response.data is empty');
    }
    
    // Check if response structure matches documentation
    let responseData = response.data as any;
    
    // Handle case where axios wraps data twice
    if (responseData.data && typeof responseData.data === 'object') {
      responseData = responseData.data;
    }
    
    if (typeof responseData === 'string' && responseData.trim().startsWith('<')) {
      throw new Error('API returned HTML instead of JSON. Possible authentication error or server error.');
    }
    
    // Handle API response structure: { success, message, data: { user: {...} } } or { user: {...} }
    let userData = null;
    
    // Check for nested data.user structure
    if (responseData.data?.user) {
      userData = responseData.data.user;
    }
    // Check for top-level user field
    else if (responseData.user) {
      userData = responseData.user;
    }
    // Check if responseData itself is the user object
    else if (responseData.user_id || responseData.email || responseData.username) {
      userData = responseData;
    }
    
    if (!userData) {
      const keys = Object.keys(responseData).join(', ');
      console.warn('Profile response data:', JSON.stringify(responseData, null, 2));
      throw new Error(`Invalid profile response structure. Expected user data but found keys: ${keys}`);
    }
    
    // console.log('✅ Get Profile Response:', userData);
    return {
      message: responseData.message || 'Profile berhasil diambil',
      user: userData,
    };
  } catch (error: any) {
    // Enhanced error logging with better handling of empty response data
    const responseData = error.response?.data;
    const isEmptyObject = responseData && typeof responseData === 'object' && Object.keys(responseData).length === 0;
    
    const errorDetails = {
      message: error.message,
      response: isEmptyObject ? '(empty object)' : responseData,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url || error.request?.responseURL,
      method: error.config?.method?.toUpperCase(),
    };
    
    console.error('❌ Get Profile Error:', errorDetails);
    
    // Determine error message based on status code and response
    let errorMessage = 'Gagal mengambil profil.';
    
    if (error.response?.status === 401) {
      errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
    } else if (error.response?.status === 403) {
      errorMessage = 'Anda tidak memiliki izin untuk mengakses profil.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Profil tidak ditemukan.';
    } else if (error.response?.status === 500) {
      errorMessage = 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
    } else if (error.response?.status) {
      errorMessage = `Gagal mengambil profil (Status: ${error.response.status}).`;
    }
    
    // Try to extract message from response data (handle empty object case)
    if (!isEmptyObject) {
      if (responseData?.error) {
        errorMessage = responseData.error;
      } else if (responseData?.message) {
        errorMessage = responseData.message;
      }
    }
    
    // If no specific message found, use default
    if (!errorMessage || errorMessage === 'Gagal mengambil profil.') {
      errorMessage = error.message || 'Gagal mengambil profil. Pastikan Anda sudah login.';
    }
    
    // Create a more informative error
    const enhancedError = new Error(errorMessage);
    
    // Attach original error for debugging
    (enhancedError as any).originalError = error;
    (enhancedError as any).status = error.response?.status;
    (enhancedError as any).responseData = responseData;
    
    throw enhancedError;
  }
}

// ============================================
// 2. MARRIAGE REGISTRATION APIs
// ============================================

/**
 * 2.1 Create Marriage Registration (New Simplified API)
 * POST /simnikah/pendaftaran
 */
export async function createSimpleMarriageRegistration(
  data: SimpleMarriageRegistrationRequest
): Promise<any> {
  try {
    // console.log('📤 Create Simple Registration Request:', data);
    const response = await api.post('/simnikah/pendaftaran', data);
    // console.log('✅ Create Simple Registration Response:', response.data);
    return response.data;
  } catch (error: any) {
    // Enhanced error handling
    let errorMessage = 'Gagal membuat pendaftaran nikah';
    
    if (error.message?.includes('Failed to parse URL') || error.message?.includes('Invalid URL')) {
      errorMessage = 'Terjadi masalah koneksi atau kesalahan pada server. Detail: ' + (error.response?.data?.message || error.message);
    } else if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error('❌ Create Simple Registration Error:', {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    // Create enhanced error with better message
    const enhancedError: any = new Error(errorMessage);
    enhancedError.response = error.response;
    enhancedError.status = error.response?.status;
    throw enhancedError;
  }
}

/**
 * 14. Create Registration for User (Staff)
 * POST /simnikah/staff/pendaftaran
 * Staff dapat membuat pendaftaran nikah atas nama calon pengantin
 * Role Required: staff, kepala_kua
 */
export interface StaffCreateRegistrationResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    nomor_pendaftaran: string;
    status_pendaftaran: string; // "Disetujui"
    tanggal_nikah: string;
    waktu_nikah: string;
    tempat_nikah: string;
    alamat_akad: string;
    dibuat_oleh_staff: {
      nama: string;
      nip: string;
    };
    akun_user: {
      user_id: string;
      username: string;
      email: string;
      password_default: string;
      catatan: string;
    };
    calon_suami: {
      nama_dan_bin: string;
      pendidikan: string;
      umur: number;
    };
    calon_istri: {
      nama_dan_binti: string;
      pendidikan: string;
      umur: number;
    };
    wali_nikah: {
      nama_dan_bin: string;
      hubungan_wali: string;
    };
    catatan: string;
  };
}

export async function createRegistrationForUser(
  data: SimpleMarriageRegistrationRequest
): Promise<StaffCreateRegistrationResponse> {
  try {
    // console.log('📤 Staff Create Registration Request:', JSON.stringify(data, null, 2));
    const response = await api.post<StaffCreateRegistrationResponse>('/simnikah/staff/pendaftaran', data);
    // console.log('✅ Staff Create Registration Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error: any) {
    console.error('❌ Staff Create Registration Error:', error);
      // console.error('❌ Error Response Status:', error.response?.status);
      // console.error('❌ Error Response Data:', JSON.stringify(error.response?.data, null, 2));
      // console.error('❌ Error Response Headers:', error.response?.headers);
    console.error('❌ Full Error Object:', JSON.stringify(error, null, 2));
    throw error;
  }
}

/**
 * 2.1.1 Create Marriage Registration (Old Complex API - kept for backward compatibility)
 * POST /simnikah/pendaftaran/form-baru
 */
export async function createMarriageRegistration(
  data: MarriageRegistrationRequest
): Promise<any> {
  try {
    const response = await api.post('/simnikah/pendaftaran/form-baru', data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Create Registration Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 2.2 Check Registration Status
 * GET /simnikah/pendaftaran/status
 */
export async function checkRegistrationStatus(): Promise<RegistrationStatusResponse> {
  try {
    const response = await api.get<RegistrationStatusResponse>('/simnikah/pendaftaran/status');
    // console.log('📥 Registration Status Response:', JSON.stringify(response.data, null, 2));
    
    // Log registration data structure for debugging
    if (response.data?.data?.registration) {
      console.log('📋 Registration Data Structure:', {
        hasCalonSuami: !!response.data.data.registration.calon_suami,
        calonSuamiKeys: response.data.data.registration.calon_suami ? Object.keys(response.data.data.registration.calon_suami) : [],
        hasCalonIstri: !!response.data.data.registration.calon_istri,
        calonIstriKeys: response.data.data.registration.calon_istri ? Object.keys(response.data.data.registration.calon_istri) : [],
        hasPenghulu: !!response.data.data.registration.penghulu,
        penghuluKeys: response.data.data.registration.penghulu ? Object.keys(response.data.data.registration.penghulu) : [],
      });
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Check Status Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 2.2.1 Get Detail Pendaftaran by ID
 * GET /simnikah/pendaftaran/:id
 * 
 * Sesuai dokumentasi: Get Detail Pendaftaran by ID
 * Auth Required: ✅ Yes
 * Role Access:
 * - user_biasa: Hanya bisa melihat pendaftaran miliknya sendiri
 * - staff, penghulu, kepala_kua: Bisa melihat semua pendaftaran
 */
export interface RegistrationDetailResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    nomor_pendaftaran: string;
    pendaftar_id: string;
    status_pendaftaran: string;
    tanggal_pendaftaran: string;
    tanggal_nikah: string;
    waktu_nikah: string;
    tempat_nikah: string;
    alamat_akad: string;
    latitude?: number;
    longitude?: number;
    catatan?: string;
    disetujui_oleh?: string;
    disetujui_pada?: string;
    created_at: string;
    updated_at: string;
    calon_suami: {
      id: number;
      user_id: string;
      nik?: string;
      nama_lengkap: string;
      tanggal_lahir?: string;
      jenis_kelamin?: string;
      pendidikan_terakhir?: string;
      created_at: string;
      updated_at: string;
    };
    calon_istri: {
      id: number;
      user_id: string;
      nik?: string;
      nama_lengkap: string;
      tanggal_lahir?: string;
      jenis_kelamin?: string;
      pendidikan_terakhir?: string;
      created_at: string;
      updated_at: string;
    };
    wali_nikah: {
      id: number;
      nama_dan_bin: string;
      hubungan_wali: string;
      created_at: string;
      updated_at: string;
    };
    penghulu?: {
      id: number;
      user_id: string;
      nip: string;
      nama_lengkap: string;
      no_hp?: string;
      email?: string;
      alamat?: string;
      status?: string;
      ditugaskan_oleh?: string;
      ditugaskan_pada?: string;
      created_at: string;
      updated_at: string;
    };
    location?: {
      latitude: number;
      longitude: number;
      has_coordinates: boolean;
      google_maps_url?: string;
      google_maps_directions_url?: string;
      waze_url?: string;
      osm_url?: string;
    };
  };
}

export async function getRegistrationDetail(
  id: string | number
): Promise<RegistrationDetailResponse> {
  try {
    const response = await api.get<RegistrationDetailResponse>(
      `/simnikah/pendaftaran/${id}`
    );
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Get Registration Detail Error:', error.response?.data || error.message);
    
    // Enhanced error handling
    if (error.response?.status === 404) {
      throw new Error('Pendaftaran tidak ditemukan');
    } else if (error.response?.status === 403) {
      throw new Error('Anda tidak memiliki akses untuk melihat pendaftaran ini');
    }
    
    throw error;
  }
}

/**
 * 2.3 Mark As Visited
 * POST /simnikah/pendaftaran/:id/mark-visited
 */
export async function markAsVisited(id: string | number): Promise<any> {
  try {
    console.log('📤 Mark Visited Request:', {
      id,
      endpoint: `/simnikah/pendaftaran/${id}/mark-visited`
    });
    const response = await api.post(`/simnikah/pendaftaran/${id}/mark-visited`, {});
    console.log('✅ Mark Visited Response:', response.data);
    return response.data;
  } catch (error: any) {
    // Log error detail
    console.error('❌ Mark Visited Error Details:', {
      message: error.message,
      response: error.response,
      responseData: error.response?.data,
      responseStatus: error.response?.status,
      requestUrl: error.config?.url,
      fullError: error
    });

    // Extract error message
    let errorMessage = 'Gagal menandai kunjungan';
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.response?.status) {
      errorMessage = `Error ${error.response.status}: ${error.response.statusText || 'Request failed'}`;
    }

    // Create a new error with proper message
    const enhancedError = new Error(errorMessage);
    (enhancedError as any).response = error.response;
    (enhancedError as any).status = error.response?.status;
    throw enhancedError;
  }
}

/**
 * 2.4 Update Wedding Address
 * PUT /simnikah/pendaftaran/:id/alamat
 */
export async function updateWeddingAddress(
  id: string | number,
  alamat_akad: string
): Promise<any> {
  try {
    const response = await api.put(`/simnikah/pendaftaran/${id}/alamat`, { alamat_akad });
    return response.data;
  } catch (error: any) {
    console.error('❌ Update Address Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 2.6 Update Status Fleksibel (Baru)
 * PUT /simnikah/pendaftaran/:id/update-status
 * 
 * Endpoint ini memungkinkan Staff, Penghulu, dan Kepala KUA untuk mengupdate status 
 * pendaftaran secara fleksibel tanpa validasi ketat pada status sebelumnya.
 * 
 * Pembatasan: Status terkait penghulu (Menunggu Penugasan, Penghulu Ditugaskan, 
 * Menunggu Verifikasi Penghulu) TIDAK BISA diupdate via endpoint ini.
 */
export async function updateStatusPendaftaran(
  id: string | number,
  data: UpdateStatusRequest
): Promise<UpdateStatusResponse> {
  try {
    // Validasi di frontend: cek apakah status terkait penghulu
    if (PENGHULU_RELATED_STATUSES.includes(data.status as any)) {
      throw new Error(
        `Status "${data.status}" otomatis setelah assign penghulu dan tidak bisa diupdate manual`
      );
    }
    
    // Validasi: jika current status adalah "Menunggu Penugasan" dan ingin diubah ke "Penghulu Ditugaskan"
    // Harus menggunakan endpoint assign-penghulu, bukan update-status
    if (data.status === 'Penghulu Ditugaskan') {
      throw new Error(
        `Status "Penghulu Ditugaskan" hanya bisa diubah melalui endpoint assign-penghulu. Gunakan POST /simnikah/pendaftaran/:id/assign-penghulu`
      );
    }

    // Request body sesuai flow baru (status dengan huruf kecil)
    const requestBody = {
      status: data.status,
      ...(data.catatan && { catatan: data.catatan })
    };

    // console.log('📤 Update Status Request:', {
    //   id,
    //   status: data.status,
    //   catatan: data.catatan,
    //   requestBody,
    //   endpoint: `/simnikah/pendaftaran/${id}/update-status`
    // });

    const response = await api.put<UpdateStatusResponse>(
      `/simnikah/pendaftaran/${id}/update-status`,
      requestBody
    );
    
    // console.log('✅ Update Status Response:', response.data);
    return response.data;
  } catch (error: any) {
    // Log error detail
    console.error('❌ Update Status Error Details:', {
      message: error.message,
      response: error.response,
      responseData: error.response?.data,
      responseStatus: error.response?.status,
      responseHeaders: error.response?.headers,
      requestUrl: error.config?.url,
      requestData: error.config?.data,
      fullError: error
    });

    // Extract error message
    let errorMessage = 'Gagal mengupdate status';
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.response?.status) {
      errorMessage = `Error ${error.response.status}: ${error.response.statusText || 'Request failed'}`;
    }

    // Create a new error with proper message
    const enhancedError = new Error(errorMessage);
    (enhancedError as any).response = error.response;
    (enhancedError as any).status = error.response?.status;
    throw enhancedError;
  }
}

// Note: getStatusFlow removed - endpoint not in API documentation

/**
 * 2.5 Get All Registrations (Staff/Kepala KUA)
 * GET /simnikah/pendaftaran
 *
 * Response structure backend:
 * {
 *   "success": true,
 *   "data": {
 *     "registrations": [...],
 *     "pagination": {...},
 *     "filters": {...}
 *   }
 * }
 */
export async function getAllRegistrations(
  params?: RegistrationListParams
): Promise<RegistrationListResponse> {
  try {
    const response = await api.get('/simnikah/pendaftaran', { params });
    const responseData = response.data;

    // Struktur backend: data.registrations
    const registrationsArray = responseData.data?.registrations || [];

    return {
      success: responseData.success ?? true,
      message: responseData.message,
      data: registrationsArray,
      total: responseData.data?.pagination?.total_records,
      page: responseData.data?.pagination?.current_page,
      limit: responseData.data?.pagination?.per_page,
      total_pages: responseData.data?.pagination?.total_pages,
    };
  } catch (error: any) {
    console.error('Get Registrations Error:', error.response?.data || error.message);
    throw error;
  }
}


// Note: completeBimbingan and completeNikah removed - not in API documentation
// Use completeMarriage from Penghulu endpoints instead

// ============================================
// 3. STAFF MANAGEMENT APIs
// ============================================

/**
 * 3.1 Create Staff (Kepala KUA Only)
 * POST /simnikah/kepala-kua/staff
 * 
 * Sesuai dokumentasi API endpoint #20
 */
export async function createStaff(data: CreateStaffRequest): Promise<any> {
  try {
    // console.log('📤 Create Staff Request:', data);
    const response = await api.post('/simnikah/kepala-kua/staff', data);
    // console.log('✅ Create Staff Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Create Staff Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 3.2 Approve Registration (Staff Only)
 * POST /simnikah/staff/approve/:id
 * 
 * Sesuai dokumentasi API endpoint #14
 */
export interface ApproveRegistrationRequest {
  status: 'Disetujui' | 'Ditolak';
  catatan?: string;
}

export async function approveRegistration(
  id: string | number,
  data: ApproveRegistrationRequest
): Promise<any> {
  try {
    console.log('📤 Approve Registration Request:', {
      id,
      data,
      endpoint: `/simnikah/staff/approve/${id}`
    });
    const response = await api.post(`/simnikah/staff/approve/${id}`, data);
    console.log('✅ Approve Registration Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Approve Registration Error:', error.response?.data || error.message);
    throw error;
  }
}

// Removed: verifyFormulir and verifyBerkas functions - verification feature has been removed

/**
 * 3.4 Get All Staff (Kepala KUA Only)
 * GET /simnikah/staff
 * 
 * Sesuai dokumentasi API endpoint #11
 * Response structure sesuai dokumentasi:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "user_id": "STF1704067201",
 *       "username": "staff001",
 *       "nama": "Staff Verifikasi",
 *       ...
 *     }
 *   ]
 * }
 */
export async function getAllStaff(): Promise<any> {
  try {
    // console.log('📤 Get All Staff Request');
    const response = await api.get('/simnikah/staff');
    // console.log('✅ Get All Staff Response:', response.data);
    return response.data;
  } catch (error: any) {
    // Log error detail
    console.error('❌ Get All Staff Error Details:', {
      message: error.message,
      response: error.response,
      responseData: error.response?.data,
      responseStatus: error.response?.status,
      responseHeaders: error.response?.headers,
      requestUrl: error.config?.url,
      fullError: error
    });

    // Extract error message
    let errorMessage = 'Gagal mengambil data staff';
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.response?.status) {
      errorMessage = `Error ${error.response.status}: ${error.response.statusText || 'Request failed'}`;
    }

    // Create a new error with proper message
    const enhancedError = new Error(errorMessage);
    (enhancedError as any).response = error.response;
    (enhancedError as any).status = error.response?.status;
    throw enhancedError;
  }
}

/**
 * 3.5 Update Staff
 * PUT /simnikah/staff/:id
 * 
 * Sesuai dokumentasi API endpoint #12
 * Role Required: kepala_kua
 */
export interface UpdateStaffRequest {
  nama_lengkap?: string;
  jabatan?: string;
  bagian?: string;
  status?: string;
  no_hp?: string;
  alamat?: string;
}

export async function updateStaff(
  id: string | number,
  data: UpdateStaffRequest
): Promise<any> {
  try {
    const response = await api.put(`/simnikah/staff/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Update Staff Error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// 4. PENGHULU MANAGEMENT APIs
// ============================================

/**
 * 4.1 Create Penghulu (Kepala KUA Only)
 * POST /simnikah/kepala-kua/penghulu
 * 
 * Sesuai dokumentasi API endpoint #21
 */
export async function createPenghulu(data: CreatePenghuluRequest): Promise<any> {
  try {
    console.log('📤 Create Penghulu Request:', data);
    const response = await api.post('/simnikah/kepala-kua/penghulu', data);
    console.log('✅ Create Penghulu Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Create Penghulu Error:', error.response?.data || error.message);
    throw error;
  }
}

// Removed: verifyDocuments function - verification feature has been removed

/**
 * 4.3 Complete Marriage (Penghulu Only)
 * POST /simnikah/penghulu/complete-marriage/:id
 * 
 * Sesuai dokumentasi API endpoint #19
 */
export async function completeMarriage(
  id: string | number,
  data?: { catatan?: string }
): Promise<any> {
  try {
    console.log('📤 Complete Marriage Request:', {
      id,
      data,
      endpoint: `/simnikah/penghulu/complete-marriage/${id}`
    });
    const response = await api.post(`/simnikah/penghulu/complete-marriage/${id}`, data || {});
    console.log('✅ Complete Marriage Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Complete Marriage Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 4.4 Get Assigned Registrations (Penghulu Only)
 * GET /simnikah/penghulu/assigned-registrations
 * 
 * Sesuai dokumentasi API endpoint #22
 * Role Required: penghulu, kepala_kua
 */
export async function getAssignedRegistrations(): Promise<any> {
  try {
    const response = await api.get('/simnikah/penghulu/assigned-registrations');
    
    console.log('🔍 API Response (raw):', response);
    console.log('🔍 API Response.data:', response.data);
    
    // Validate response is JSON, not HTML
    if (typeof response.data === 'string' && response.data.trim().startsWith('<')) {
      console.error('❌ API returned HTML instead of JSON');
      // Return empty structure instead of throwing to prevent crashes
      return { success: false, data: { registrations: [] } };
    }
    
    // Log structure untuk debugging
    if (response.data?.data?.registrations) {
      console.log('✅ Found registrations:', response.data.data.registrations.length);
    } else if (response.data?.registrations) {
      console.log('✅ Found registrations (direct):', response.data.registrations.length);
    } else {
      console.warn('⚠️ No registrations found in response structure');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Get Assigned Registrations Error:', error.response?.data || error.message);
    
    // Always return empty structure instead of throwing to prevent crashes
    // This allows the page to load even if API fails
    return { success: false, data: { registrations: [] } };
  }
}

/**
 * 4.5 Get Penghulu Profile (Single - for logged in penghulu)
 * GET /simnikah/penghulu
 */
export async function getPenghuluProfile(): Promise<any> {
  try {
    const response = await api.get('/simnikah/penghulu');
    
    // Validate response is JSON, not HTML
    if (typeof response.data === 'string' && response.data.trim().startsWith('<')) {
      console.error('❌ API returned HTML instead of JSON');
      // Return null structure instead of throwing to prevent crashes
      return { success: false, data: null };
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Get Penghulu Profile Error:', error.response?.data || error.message);
    
    // Always return null structure instead of throwing to prevent crashes
    // This allows the page to load even if API fails
    return { success: false, data: null };
  }
}


/**
 * 4.6 Get All Penghulu (Kepala KUA Only)
 * GET /simnikah/penghulu (when called by kepala_kua, returns list)
 * 
 * Response structure sesuai dokumentasi:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "user_id": "PNG1704067202",
 *       "nama_lengkap": "H. Abdul Rahman, S.Ag",
 *       ...
 *     }
 *   ]
 * }
 */
export async function getAllPenghulu(): Promise<any> {
  try {
    // console.log('📤 Get All Penghulu Request');
    const response = await api.get('/simnikah/penghulu');
    // console.log('✅ Get All Penghulu Response:', response.data);
    return response.data;
  } catch (error: any) {
    // Log error detail
    console.error('❌ Get All Penghulu Error Details:', {
      message: error.message,
      response: error.response,
      responseData: error.response?.data,
      responseStatus: error.response?.status,
      requestUrl: error.config?.url,
      fullError: error
    });

    // Extract error message
    let errorMessage = 'Gagal mengambil data penghulu';
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.response?.status) {
      errorMessage = `Error ${error.response.status}: ${error.response.statusText || 'Request failed'}`;
    }

    // Create a new error with proper message
    const enhancedError = new Error(errorMessage);
    (enhancedError as any).response = error.response;
    (enhancedError as any).status = error.response?.status;
    throw enhancedError;
  }
}

/**
 * 4.7 Update Penghulu Profile
 * PUT /simnikah/penghulu/:id
 * 
 * Sesuai dokumentasi API endpoint #20
 * Role Required: kepala_kua
 */
export async function updatePenghuluProfile(
  id: string | number,
  data: { email?: string; no_hp?: string; alamat?: string; nama_lengkap?: string; nip?: string; status?: string }
): Promise<any> {
  try {
    const response = await api.put(`/simnikah/penghulu/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Update Penghulu Profile Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 4.8 Get Today Schedule (Penghulu)
 * GET /simnikah/penghulu/today-schedule
 * 
 * Sesuai dokumentasi API endpoint #23
 * Role Required: penghulu, kepala_kua
 */
export interface TodayScheduleResponse {
  success: boolean;
  data: {
    tanggal: string; // YYYY-MM-DD
    schedule: Array<{
      id: number;
      waktu_nikah: string; // HH:MM
      calon_suami: {
        nama_lengkap: string;
      };
      calon_istri: {
        nama_lengkap: string;
      };
      tempat_nikah: string;
    }>;
    total: number;
  };
}

export async function getTodaySchedule(): Promise<TodayScheduleResponse> {
  try {
    const response = await api.get<TodayScheduleResponse>('/simnikah/penghulu/today-schedule');
    return response.data;
  } catch (error: any) {
    console.error('❌ Get Today Schedule Error:', error.response?.data || error.message);
    throw error;
  }
}

// Note: getPenghuluSchedule removed - endpoint not in API documentation
// Use getWeddingsByDate from Calendar endpoints instead

// ============================================
// 5. CALENDAR & SCHEDULE APIs
// ============================================
// Note: getCalendarAvailability moved to section 7 below with new API signature

// Note: getDateAvailability removed - endpoint not in API documentation
// Use getAvailableTimeSlots or getWeddingsByDate from Calendar endpoints instead

// ============================================
// 5. KEPALA KUA APIs
// ============================================

/**
 * 5.1 Assign Penghulu (Kepala KUA Only)
 * POST /simnikah/pendaftaran/:id/assign-penghulu
 * 
 * Sesuai dokumentasi API endpoint #22
 */
export async function assignPenghulu(
  id: string | number,
  data: AssignPenghuluRequest
): Promise<any> {
  try {
    console.log('📤 Assign Penghulu Request:', {
      id,
      data,
      endpoint: `/simnikah/pendaftaran/${id}/assign-penghulu`
    });
    const response = await api.post(`/simnikah/pendaftaran/${id}/assign-penghulu`, data);
    console.log('✅ Assign Penghulu Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Assign Penghulu Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 5.2 List Available Officers (Kepala KUA Only)
 * GET /simnikah/kepala-kua/penghulu-tersedia
 * 
 * Sesuai dokumentasi API - dengan filter tanggal dan waktu
 */
export interface AvailablePenghuluParams {
  tanggal?: string; // YYYY-MM-DD
  waktu?: string;   // HH:MM
}

export async function getAvailablePenghulu(params?: AvailablePenghuluParams): Promise<any> {
  try {
    console.log('📤 Get Available Penghulu Request:', params);
    const response = await api.get('/simnikah/kepala-kua/penghulu-tersedia', { params });
    console.log('✅ Get Available Penghulu Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Get Available Penghulu Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 5.3 Get Penghulu Statistics (Kepala KUA Only)
 * GET /simnikah/kepala-kua/statistik-penghulu
 * 
 * Sesuai dokumentasi API endpoint #24
 */
export interface PenghuluStatsParams {
  penghulu_id?: number;
  bulan?: number;
  tahun?: number;
}

export async function getPenghuluStatistics(
  params?: PenghuluStatsParams
): Promise<any> {
  try {
    const response = await api.get('/simnikah/kepala-kua/statistik-penghulu', { params });
    return response.data;
  } catch (error: any) {
    console.error('❌ Get Penghulu Statistics Error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// 6. BIMBINGAN PERKAWINAN APIs
// ============================================
// NOTE: All bimbingan endpoints removed - not in API documentation
// Bimbingan feature is not part of the current API specification

// ============================================
// 7. LOCATION & MAP APIs
// (Already implemented in api.ts, re-exported here for convenience)
// ============================================

export {
  geocodeAddress,
  reverseGeocodeCoordinates,
  searchAddress,
  getLocationDetail,
  updateRegistrationLocation,
} from './api';

// ============================================
// 8. NOTIFICATIONS APIs
// ============================================

/**
 * 8.1 Get User Notifications
 * GET /simnikah/notifikasi/user/:user_id
 * 
 * Sesuai dokumentasi API:
 * Response: { success: true, data: [...] }
 */
export async function getUserNotifications(
  userId: string,
  params?: NotificationListParams
): Promise<NotificationListResponse> {
  try {
    const response = await api.get<NotificationListResponse>(
      `/simnikah/notifikasi/user/${userId}`,
      { params }
    );
    
    // Handle response format sesuai dokumentasi
    // Jika response sudah dalam format { success: true, data: [...] }, return langsung
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data;
    }
    
    // Backward compatibility: jika response dalam format lama
    if (response.data.notifications && Array.isArray(response.data.notifications)) {
      const { notifications, ...restData } = response.data as any;
      return {
        success: true,
        data: notifications.map((notif: any) => ({
          id: notif.id,
          judul: notif.judul,
          pesan: notif.pesan,
          tipe: notif.tipe,
          status_baca: notif.status_baca,
          created_at: notif.created_at,
          link: notif.link,
        })),
        ...restData,
      };
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Get Notifications Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 8.2 Mark Notification as Read
 * PUT /simnikah/notifikasi/:id/status
 */
export async function markNotificationRead(
  id: string | number,
  data: MarkNotificationReadRequest
): Promise<any> {
  try {
    const response = await api.put(`/simnikah/notifikasi/${id}/status`, data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Mark Notification Read Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 8.3 Mark All as Read
 * PUT /simnikah/notifikasi/user/:user_id/mark-all-read
 */
export async function markAllNotificationsRead(userId: string): Promise<any> {
  try {
    const response = await api.put(`/simnikah/notifikasi/user/${userId}/mark-all-read`, {});
    return response.data;
  } catch (error: any) {
    console.error('❌ Mark All Read Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 8.5 Get Notification by ID
 * GET /simnikah/notifikasi/:id
 * 
 * Sesuai dokumentasi API endpoint #42
 */
export async function getNotificationById(id: string | number): Promise<any> {
  try {
    const response = await api.get(`/simnikah/notifikasi/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Get Notification by ID Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 8.6 Delete Notification
 * DELETE /simnikah/notifikasi/:id
 * 
 * Sesuai dokumentasi API endpoint #45
 */
export async function deleteNotification(id: string | number): Promise<any> {
  try {
    const response = await api.delete(`/simnikah/notifikasi/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Delete Notification Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 8.7 Get Notification Statistics
 * GET /simnikah/notifikasi/user/:user_id/stats
 * 
 * Sesuai dokumentasi API endpoint #46
 */
export interface NotificationStatsResponse {
  success: boolean;
  data: {
    total: number;
    belum_dibaca: number;
    sudah_dibaca: number;
    by_tipe: {
      Info: number;
      Success: number;
      Warning: number;
      Error: number;
    };
  };
}

export async function getNotificationStats(userId: string): Promise<NotificationStatsResponse> {
  try {
    const response = await api.get<NotificationStatsResponse>(`/simnikah/notifikasi/user/${userId}/stats`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Get Notification Stats Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 8.8 Send Notification to Role
 * POST /simnikah/notifikasi/send-to-role
 * 
 * Sesuai dokumentasi API endpoint #47
 * Role Required: staff, kepala_kua
 */
export interface SendNotificationToRoleRequest {
  role: 'user_biasa' | 'staff' | 'penghulu' | 'kepala_kua';
  judul: string;
  pesan: string;
  tipe?: 'Info' | 'Success' | 'Warning' | 'Error';
  tautan?: string;
}

export async function sendNotificationToRole(
  data: SendNotificationToRoleRequest
): Promise<any> {
  try {
    const response = await api.post('/simnikah/notifikasi/send-to-role', data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Send Notification to Role Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 8.9 Run Reminder Notification
 * POST /simnikah/notifikasi/run-reminder
 * 
 * Sesuai dokumentasi API endpoint #48
 * Role Required: staff, kepala_kua
 * Description: Menjalankan reminder notifikasi secara manual (untuk testing)
 */
export async function runReminderNotification(): Promise<any> {
  try {
    const response = await api.post('/simnikah/notifikasi/run-reminder', {});
    return response.data;
  } catch (error: any) {
    console.error('❌ Run Reminder Notification Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 8.4 Create Notification
 * POST /simnikah/notifikasi
 * 
 * Sesuai dokumentasi API endpoint #33
 * Hanya untuk Staff dan Kepala KUA
 */
export interface CreateNotificationRequest {
  user_id: string;
  judul: string;
  pesan: string;
  tipe?: 'Info' | 'Success' | 'Warning' | 'Error';
  tautan?: string; // Sesuai dokumentasi: menggunakan 'tautan' bukan 'link'
  link?: string; // Backward compatibility
}

export interface CreateNotificationResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    user_id: string;
    judul: string;
    pesan: string;
    tipe: string;
    status_baca: string;
    link?: string;
    created_at: string;
  };
}

export async function createNotification(
  data: CreateNotificationRequest
): Promise<CreateNotificationResponse> {
  try {
    // Sesuai dokumentasi: menggunakan 'tautan' bukan 'link'
    const requestBody = {
      ...data,
      tautan: data.tautan || data.link, // Prioritaskan 'tautan', fallback ke 'link' untuk backward compatibility
    };
    // Hapus 'link' jika ada untuk menghindari duplikasi
    if ((requestBody as any).link) {
      delete (requestBody as any).link;
    }
    
    const response = await api.post<CreateNotificationResponse>('/simnikah/notifikasi', requestBody);
    return response.data;
  } catch (error: any) {
    console.error('❌ Create Notification Error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// 📅 CALENDAR & AVAILABILITY APIs
// ============================================

/**
 * 7. Get Calendar Availability
 * GET /simnikah/kalender-ketersediaan
 * PUBLIC - No auth required
 * 
 * Updated structure sesuai dokumentasi API v1.1.0
 */
export interface CalendarAvailabilityResponse {
  success: boolean;
  message: string;
  data: {
    bulan: number;
    tahun: number;
    nama_bulan: string;
    kapasitas_harian: number;
    calendar: Array<{
      tanggal: number;
      tanggal_str: string; // YYYY-MM-DD
      hari: string;
      status: string;
      tersedia: boolean;
      jumlah_nikah: number;
      jumlah_draft: number;
      jumlah_disetujui: number;
      sisa_kuota: number;
      kapasitas: number;
      is_today: boolean;
      is_past: boolean;
      time_slots: Array<{
        waktu: string; // HH:MM
        kua: {
          tersedia: boolean;
          terbooking: boolean;
          jumlah_total: number;
          jumlah_draft: number;
          jumlah_disetujui: number;
        };
        luar_kua: {
          tersedia: boolean;
          terbooking: boolean;
          jumlah_total: number;
          jumlah_draft: number;
          jumlah_disetujui: number;
        };
      }>;
    }>;
  };
}

export async function getCalendarAvailability(
  bulan: number,
  tahun: number
): Promise<CalendarAvailabilityResponse> {
  try {
    const response = await api.get<CalendarAvailabilityResponse>(
      '/simnikah/kalender-ketersediaan',
      {
        params: { bulan, tahun }
      }
    );
    
    // Additional validation: ensure response.data is valid
    const responseData = response.data as any;
    if (!responseData || typeof responseData !== 'object') {
      throw new Error('Invalid response format from calendar API');
    }
    
    // Check if response.data is actually HTML (string starting with <)
    if (typeof responseData === 'string' && responseData.trim().startsWith('<')) {
      console.error('⚠️ Calendar API returned HTML:', responseData.substring(0, 200));
      throw new Error('API returned HTML error page instead of JSON');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Get Calendar Availability Error:', {
      message: error.message,
      response: error.response,
      data: error.response?.data,
      status: error.response?.status
    });
    
    // If error response is HTML, provide better error message
    if (error.response?.data && typeof error.response.data === 'string' && error.response.data.trim().startsWith('<')) {
      const enhancedError: any = new Error('API returned HTML error page. Please check the endpoint.');
      enhancedError.response = {
        ...error.response,
        data: { error: 'Invalid response format', message: 'Server returned HTML instead of JSON' }
      };
      throw enhancedError;
    }
    
    throw error;
  }
}

/**
 * 8. Get Available Time Slots
 * GET /simnikah/ketersediaan-jam
 * PUBLIC - No auth required
 * 
 * Updated structure sesuai dokumentasi API v1.1.0
 */
export interface TimeSlotsResponse {
  success: boolean;
  message: string;
  data: {
    tanggal: string; // YYYY-MM-DD
    hari: string;
    status: 'Semua Tersedia' | 'Sebagian Tersedia' | 'Penuh';
    summary: {
      total_slot: number;
      terbooking: number;
      tersedia: number;
      sisa_kuota: number;
    };
    time_slots: Array<{
      waktu: string; // HH:MM
      kua: {
        tersedia: boolean;
        terbooking: boolean;
        jumlah_total: number;
        jumlah_draft: number;
        jumlah_disetujui: number;
      };
      luar_kua: {
        tersedia: boolean;
        terbooking: boolean;
        jumlah_total: number;
        jumlah_draft: number;
        jumlah_disetujui: number;
      };
      // Legacy fields for backward compatibility
      tersedia?: boolean;
      terbooking?: boolean;
      jumlah_nikah?: number;
    }>;
    registrations_today: {
      total: number;
      detail: Array<any>;
    };
  };
}

export async function getAvailableTimeSlots(
  tanggal: string // YYYY-MM-DD
): Promise<TimeSlotsResponse> {
  try {
    const response = await api.get<TimeSlotsResponse>(
      '/simnikah/ketersediaan-jam',
      {
        params: { tanggal }
      }
    );
    
    // Additional validation: ensure response.data is valid
    const responseData = response.data as any;
    if (!responseData || typeof responseData !== 'object') {
      throw new Error('Invalid response format from time slots API');
    }
    
    // Check if response.data is actually HTML (string starting with <)
    if (typeof responseData === 'string' && responseData.trim().startsWith('<')) {
      console.error('⚠️ Time Slots API returned HTML:', responseData.substring(0, 200));
      throw new Error('API returned HTML error page instead of JSON');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Get Time Slots Error:', {
      message: error.message,
      response: error.response,
      data: error.response?.data,
      status: error.response?.status
    });
    
    // If error response is HTML, provide better error message
    if (error.response?.data && typeof error.response.data === 'string' && error.response.data.trim().startsWith('<')) {
      const enhancedError: any = new Error('API returned HTML error page. Please check the endpoint.');
      enhancedError.response = {
        ...error.response,
        data: { error: 'Invalid response format', message: 'Server returned HTML instead of JSON' }
      };
      throw enhancedError;
    }
    
    throw error;
  }
}

/**
 * 9. Get Weddings By Date
 * GET /simnikah/pernikahan-tanggal
 * PUBLIC - No auth required
 * 
 * Mendapatkan informasi detail pernikahan pada tanggal tertentu
 * 
 * @param tanggal - Tanggal dalam format YYYY-MM-DD (required)
 * @example
 * const data = await getWeddingsByDate('2024-12-15');
 * 
 * Response structure:
 * {
 *   success: true,
 *   message: "Data pernikahan pada tanggal berhasil diambil",
 *   data: {
 *     tanggal: "2024-12-15",
 *     hari: "Sunday",
 *     tanggal_format: "15 Desember 2024",
 *     summary: {
 *       total_nikah: 5,
 *       nikah_di_kua: 4,
 *       nikah_di_luar: 1
 *     },
 *     pernikahan: [...]
 *   }
 * }
 */
export interface WeddingsByDateResponse {
  success: boolean;
  message: string;
  data: {
    tanggal: string; // YYYY-MM-DD
    hari: string; // e.g., "Sunday", "Monday"
    tanggal_format: string; // e.g., "15 Desember 2024"
    summary: {
      total_nikah: number;
      nikah_di_kua: number;
      nikah_di_luar: number;
    };
    pernikahan: Array<{
      nomor_pendaftaran: string;
      waktu_nikah: string; // HH:MM format, e.g., "09:00"
      tempat_nikah: string; // "Di KUA" | "Di Luar KUA"
      alamat_akad: string;
      status_pendaftaran: string;
      penghulu?: {
        nama: string;
        nip: string;
      };
      calon_suami: {
        id: string;
        nama_lengkap: string; // e.g., "Ahmad Wijaya bin Abdullah"
      };
      calon_istri: {
        id: string;
        nama_lengkap: string; // e.g., "Siti Nurhaliza binti Muhammad"
      };
    }>;
  };
}

export async function getWeddingsByDate(
  tanggal: string // YYYY-MM-DD
): Promise<WeddingsByDateResponse> {
  try {
    const response = await api.get<WeddingsByDateResponse>(
      '/simnikah/pernikahan-tanggal',
      {
        params: { tanggal }
      }
    );
    
    // Additional validation: ensure response.data is valid
    const responseData = response.data as any;
    if (!responseData || typeof responseData !== 'object') {
      throw new Error('Invalid response format from weddings API');
    }
    
    // Check if response.data is actually HTML (string starting with <)
    if (typeof responseData === 'string' && responseData.trim().startsWith('<')) {
      console.error('⚠️ Weddings API returned HTML:', responseData.substring(0, 200));
      throw new Error('API returned HTML error page instead of JSON');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Get Weddings By Date Error:', {
      message: error.message,
      response: error.response,
      data: error.response?.data,
      status: error.response?.status
    });
    
    // If error response is HTML, provide better error message
    if (error.response?.data && typeof error.response.data === 'string' && error.response.data.trim().startsWith('<')) {
      const enhancedError: any = new Error('API returned HTML error page. Please check the endpoint.');
      enhancedError.response = {
        ...error.response,
        data: { error: 'Invalid response format', message: 'Server returned HTML instead of JSON' }
      };
      throw enhancedError;
    }
    
    throw error;
  }
}

// ============================================
// 💬 FEEDBACK APIs
// ============================================

/**
 * 25. Create Feedback
 * POST /simnikah/feedback-pernikahan
 */
export interface CreateFeedbackRequest {
  pendaftaran_id: number;
  jenis_feedback: 'Rating' | 'Saran' | 'Kritik' | 'Laporan';
  rating?: number; // Required if jenis_feedback = 'Rating', 1-5
  judul: string;
  pesan: string;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    pendaftaran_id: number;
    jenis_feedback: string;
    rating?: number;
    judul: string;
    pesan: string;
    status_baca: 'Belum Dibaca' | 'Sudah Dibaca';
    created_at: string;
  };
}

export async function createFeedback(
  data: CreateFeedbackRequest
): Promise<FeedbackResponse> {
  try {
    const response = await api.post<FeedbackResponse>('/simnikah/feedback-pernikahan', data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Create Feedback Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 26. List Feedback (Kepala KUA)
 * GET /simnikah/kepala-kua/feedback
 */
export interface FeedbackListParams {
  jenis_feedback?: 'Rating' | 'Saran' | 'Kritik' | 'Laporan';
  status_baca?: 'Belum Dibaca' | 'Sudah Dibaca';
  page?: number;
  limit?: number;
}

export interface FeedbackListResponse {
  success: boolean;
  message: string;
  data: Array<{
    id: number;
    pendaftaran_id: number;
    user_id: string;
    jenis_feedback: string;
    rating?: number;
    judul: string;
    pesan: string;
    status_baca: string;
    dibaca_oleh?: string;
    dibaca_pada?: string;
    created_at: string;
  }>;
}

export async function getFeedbackList(
  params?: FeedbackListParams
): Promise<FeedbackListResponse> {
  try {
    const response = await api.get<FeedbackListResponse>(
      '/simnikah/kepala-kua/feedback',
      { params }
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ Get Feedback List Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 27. Mark Feedback As Read
 * PUT /simnikah/kepala-kua/feedback/:id/mark-read
 */
export async function markFeedbackAsRead(id: number): Promise<any> {
  try {
    const response = await api.put(`/simnikah/kepala-kua/feedback/${id}/mark-read`, {});
    return response.data;
  } catch (error: any) {
    console.error('❌ Mark Feedback Read Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 28. Get Feedback Statistics
 * GET /simnikah/kepala-kua/feedback/stats
 */
export interface FeedbackStatsResponse {
  success: boolean;
  message: string;
  data: {
    total_feedback: number;
    total_belum_dibaca: number;
    total_sudah_dibaca: number;
    rating_rata_rata: number;
    per_jenis: {
      Rating: number;
      Saran: number;
      Kritik: number;
      Laporan: number;
    };
  };
}

export async function getFeedbackStats(): Promise<FeedbackStatsResponse> {
  try {
    const response = await api.get<FeedbackStatsResponse>('/simnikah/kepala-kua/feedback/stats');
    return response.data;
  } catch (error: any) {
    console.error('❌ Get Feedback Stats Error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// 🔧 HELPER FUNCTIONS
// ============================================

/**
 * Handle API errors consistently
 */
export function handleApiError(error: any): string {
  // Handle HTML response
  if (error.response?.data && typeof error.response.data === 'string') {
    const trimmed = error.response.data.trim();
    if (trimmed.startsWith('<') || trimmed.startsWith('<!')) {
      return 'Server mengembalikan halaman error. Silakan coba lagi nanti.';
    }
  }
  
  // Handle different error structures
  if (error.response?.data) {
    if (typeof error.response.data === 'object') {
      if (error.response.data.error) {
        return error.response.data.error;
      }
      if (error.response.data.message) {
        return error.response.data.message;
      }
    } else if (typeof error.response.data === 'string') {
      return error.response.data;
    }
  }
  
  // Handle status-based errors
  if (error.response?.status === 401) {
    return 'Username atau password salah';
  }
  if (error.response?.status === 403) {
    return 'Anda tidak memiliki izin untuk melakukan aksi ini';
  }
  if (error.response?.status === 404) {
    return 'Endpoint tidak ditemukan';
  }
  if (error.response?.status === 502) {
    return 'Server API tidak dapat dijangkau. Server mungkin sedang down atau mengalami masalah. Silakan coba lagi nanti.';
  }
  if (error.response?.status === 503) {
    return 'Server sedang dalam maintenance. Silakan coba lagi nanti.';
  }
  if (error.response?.status === 504) {
    return 'Server tidak merespons dalam waktu yang ditentukan. Silakan coba lagi.';
  }
  if (error.response?.status === 500) {
    return 'Terjadi kesalahan pada server';
  }
  
  // Handle error message
  if (error?.message) {
    return error.message;
  }
  
  // Default message
  return 'Terjadi kesalahan. Silakan coba lagi.';
}

/**
 * Check if error is authentication related
 */
export function isAuthError(error: any): boolean {
  return error.response?.status === 401 || error.response?.status === 403;
}

/**
 * Check if error is rate limit
 */
export function isRateLimitError(error: any): boolean {
  return error.response?.status === 429;
}

// ============================================
// 📊 DASHBOARD & ANALYTICS APIs
// ============================================

/**
 * 1. Get Kepala KUA Dashboard
 * GET /simnikah/dashboard/kepala-kua
 * 
 * Sesuai dokumentasi API endpoint Dashboard #1
 */
export interface KepalaKUADashboardParams {
  period?: 'day' | 'week' | 'month' | 'year';
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
}

export interface KepalaKUADashboardResponse {
  success: boolean;
  message: string;
  data: {
    period: {
      type: string;
      date_from: string;
      date_to: string;
    };
    statistics: {
      total_periode: number;
      hari_ini: number;
      bulan_ini: number;
      tahun_ini: number;
      selesai: number;
      pending: number;
      status_breakdown: {
        draft: number;
        disetujui: number;
        menunggu_penugasan: number;
        penghulu_ditugaskan: number;
        selesai: number;
        ditolak: number;
      };
    };
    trends: Array<{
      date: string;
      label: string;
      count: number;
    }>;
    status_distribution: Array<{
      status: string;
      count: number;
      label: string;
    }>;
    penghulu_performance: Array<{
      penghulu_id: number;
      nama_lengkap: string;
      jumlah_nikah: number;
      rating: number;
      jumlah_rating: number;
    }>;
    peak_hours: Array<{
      waktu: string;
      count: number;
    }>;
  };
}

export async function getKepalaKUADashboard(
  params?: KepalaKUADashboardParams
): Promise<KepalaKUADashboardResponse> {
  try {
    const response = await api.get<KepalaKUADashboardResponse>(
      '/simnikah/dashboard/kepala-kua',
      { params }
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ Get Kepala KUA Dashboard Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 2. Get Staff Dashboard
 * GET /simnikah/dashboard/staff
 * 
 * Sesuai dokumentasi API endpoint Dashboard #2
 */
export interface StaffDashboardResponse {
  success: boolean;
  message: string;
  data: {
    pending_verifications: Array<{
      id: number;
      nomor_pendaftaran: string;
      status_pendaftaran: string;
      tanggal_nikah: string;
      calon_suami: string;
      calon_istri: string;
      created_at: string;
    }>;
    pending_documents: Array<{
      id: number;
      nomor_pendaftaran: string;
      status_pendaftaran: string;
      calon_suami: string;
      calon_istri: string;
      created_at: string;
      needs_verification: boolean;
    }>;
    timeline: Array<{
      id: number;
      nomor_pendaftaran: string;
      status_pendaftaran: string;
      calon_suami: string;
      calon_istri: string;
      updated_at: string;
      action: string;
    }>;
  };
}

export async function getStaffDashboard(): Promise<StaffDashboardResponse> {
  try {
    const response = await api.get<StaffDashboardResponse>('/simnikah/dashboard/staff');
    return response.data;
  } catch (error: any) {
    console.error('❌ Get Staff Dashboard Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 3. Get Marriage Statistics
 * GET /simnikah/dashboard/statistik-pernikahan
 * 
 * Sesuai dokumentasi API endpoint Dashboard #3
 */
export interface MarriageStatsParams {
  period?: 'day' | 'month' | 'year';
}

export interface MarriageStatsResponse {
  success: boolean;
  message: string;
  data: {
    statistics: {
      total_periode: number;
      hari_ini: number;
      bulan_ini: number;
      tahun_ini: number;
      selesai: number;
      pending: number;
      status_breakdown: {
        draft: number;
        disetujui: number;
        menunggu_penugasan: number;
        penghulu_ditugaskan: number;
        selesai: number;
        ditolak: number;
      };
    };
    trends: Array<{
      date: string;
      label: string;
      count: number;
    }>;
  };
}

export async function getMarriageStatistics(
  params?: MarriageStatsParams
): Promise<MarriageStatsResponse> {
  try {
    const response = await api.get<MarriageStatsResponse>(
      '/simnikah/dashboard/statistik-pernikahan',
      { params }
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ Get Marriage Statistics Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 4. Get Penghulu Performance
 * GET /simnikah/dashboard/penghulu-performance
 * 
 * Sesuai dokumentasi API endpoint Dashboard #4
 */
export interface PenghuluPerformanceParams {
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
}

export interface PenghuluPerformanceResponse {
  success: boolean;
  message: string;
  data: Array<{
    penghulu_id: number;
    nama_lengkap: string;
    jumlah_nikah: number;
    rating: number;
    jumlah_rating: number;
  }>;
}

export async function getPenghuluPerformance(
  params?: PenghuluPerformanceParams
): Promise<PenghuluPerformanceResponse> {
  try {
    const response = await api.get<PenghuluPerformanceResponse>(
      '/simnikah/dashboard/penghulu-performance',
      { params }
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ Get Penghulu Performance Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 5. Get Peak Hours Analysis
 * GET /simnikah/dashboard/peak-hours
 * 
 * Sesuai dokumentasi API endpoint Dashboard #5
 */
export interface PeakHoursParams {
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
}

export interface PeakHoursResponse {
  success: boolean;
  message: string;
  data: Array<{
    waktu: string; // HH:MM
    count: number;
  }>;
}

export async function getPeakHours(
  params?: PeakHoursParams
): Promise<PeakHoursResponse> {
  try {
    const response = await api.get<PeakHoursResponse>(
      '/simnikah/dashboard/peak-hours',
      { params }
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ Get Peak Hours Error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// 📄 SURAT PENGUMUMAN NIKAH APIs
// ============================================

/**
 * Kop Surat Custom untuk Pengumuman Nikah
 */
export interface CustomKopSurat {
  nama_kua?: string;
  alamat_kua?: string;
  kota?: string;
  provinsi?: string;
  kode_pos?: string;
  telepon?: string;
  email?: string;
  website?: string;
  logo_url?: string;
}

/**
 * Response untuk List Pendaftaran (semua status kecuali "Ditolak")
 * Sesuai dokumentasi API v1.0.0 - Surat Pengumuman Nikah
 * Backend sudah memfilter status "Ditolak" secara otomatis
 */
export interface PengumumanListResponse {
  success: boolean;
  message: string;
  data: {
    tanggal_awal: string;
    tanggal_akhir: string;
    periode: string;
    total: number;
    kop_surat: {
      nama_kua: string;
      alamat_kua: string;
      kota: string;
      provinsi: string;
      kode_pos: string;
      telepon: string;
      email: string;
      website: string;
      logo_url: string;
    };
    registrations: Array<{
      id: number;
      nomor_pendaftaran: string;
      tanggal_nikah: string;
      waktu_nikah: string;
      tempat_nikah: string;
      alamat_akad: string;
      calon_suami: {
        nama_lengkap: string;
      };
      calon_istri: {
        nama_lengkap: string;
      };
      wali_nikah: {
        nama_dan_bin: string;
        hubungan_wali: string;
      };
    }>;
  };
}

/**
 * Query Parameters untuk List dan Generate Pengumuman
 */
export interface PengumumanParams {
  tanggal_awal?: string; // YYYY-MM-DD
  tanggal_akhir?: string; // YYYY-MM-DD
}

/**
 * 24. Get Registrations for Pengumuman (Staff)
 * GET /simnikah/staff/pengumuman-nikah/list
 * 
 * Sesuai dokumentasi API v1.0.0 - Surat Pengumuman Nikah
 * Backend sudah memfilter status "Ditolak" secara otomatis
 * Menampilkan semua status kecuali "Ditolak" (Draft, Disetujui, Menunggu Penugasan, Penghulu Ditugaskan, Selesai)
 * Role Required: staff, kepala_kua
 */
export interface PengumumanListRequestBody {
  tanggal_awal?: string; // YYYY-MM-DD
  tanggal_akhir?: string; // YYYY-MM-DD
  kop_surat?: CustomKopSurat; // Optional untuk custom kop surat
}

export async function getPengumumanList(
  params?: PengumumanListRequestBody
): Promise<PengumumanListResponse> {
  try {
    // Build query parameters
    const queryParams: any = {};
    if (params?.tanggal_awal) {
      queryParams.tanggal_awal = params.tanggal_awal;
    }
    if (params?.tanggal_akhir) {
      queryParams.tanggal_akhir = params.tanggal_akhir;
    }

    console.log('📅 GET Pengumuman List Request:', {
      endpoint: '/simnikah/staff/pengumuman-nikah/list',
      queryParams,
    });

    // Sesuai dokumentasi: GET request dengan query params
    const response = await api.get<PengumumanListResponse>(
      '/simnikah/staff/pengumuman-nikah/list',
      { params: queryParams }
    );

    console.log('📊 Response data:', {
      success: response.data.success,
      total: response.data.data?.total,
      periode: response.data.data?.periode,
      registrations_count: response.data.data?.registrations?.length,
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Get Pengumuman List Error:', error.response?.data || error.message);
    console.error('❌ Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
}

/**
 * 25. Generate Surat Pengumuman Nikah (Staff)
 * GET /simnikah/staff/pengumuman-nikah/generate
 * 
 * Sesuai dokumentasi: Parsing API Surat Pengumuman Nikah
 * Role Required: staff, kepala_kua
 * Returns: HTML string
 * 
 * @param params - Query parameters (tanggal_awal, tanggal_akhir)
 * @param customKopSurat - Optional custom kop surat (jika ada, gunakan POST dengan body)
 */
export async function generatePengumumanNikah(
  params?: PengumumanListRequestBody,
  customKopSurat?: CustomKopSurat
): Promise<string> {
  try {
    // Build request sesuai dokumentasi
    // Jika ada custom kop surat, gunakan POST dengan body
    // Jika tidak, gunakan GET dengan query params
    const hasCustomKop = customKopSurat || params?.kop_surat;
    
    const config: any = {
      url: '/simnikah/staff/pengumuman-nikah/generate',
      method: hasCustomKop ? 'post' : 'get',
      params: hasCustomKop ? undefined : {
        tanggal_awal: params?.tanggal_awal,
        tanggal_akhir: params?.tanggal_akhir,
      },
      data: hasCustomKop ? {
        tanggal_awal: params?.tanggal_awal,
        tanggal_akhir: params?.tanggal_akhir,
        ...(customKopSurat || params?.kop_surat ? { kop_surat: customKopSurat || params?.kop_surat } : {}),
      } : undefined,
      responseType: 'text', // Important: untuk mendapatkan HTML sebagai string
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    const response = await api.request<string>(config);
    
    // Validate response is HTML
    if (typeof response.data === 'string' && response.data.trim().startsWith('<!')) {
      console.log('✅ Generate Pengumuman Response: HTML received');
      return response.data;
    } else if (typeof response.data === 'string') {
      // If it's a string but not HTML, might be error message
      console.warn('⚠️ Response is string but not HTML:', response.data.substring(0, 200));
      return response.data;
    } else {
      throw new Error('Invalid response format: expected HTML string');
    }
  } catch (error: any) {
    console.error('❌ Generate Pengumuman Error:', error.response?.data || error.message);
    
    // Enhanced error handling sesuai dokumentasi
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.error || 'Format tanggal tidak valid');
    } else if (error.response?.status === 401) {
      throw new Error('Token tidak valid atau sudah kadaluarsa');
    } else if (error.response?.status === 403) {
      throw new Error('Anda tidak memiliki permission untuk mengakses endpoint ini');
    } else if (error.response?.status === 500) {
      throw new Error(error.response.data?.error || 'Terjadi kesalahan pada server');
    }
    
    throw error;
  }
}

/**
 * 26. Get Registrations for Pengumuman (Kepala KUA)
 * GET /simnikah/kepala-kua/pengumuman-nikah/list
 * 
 * Sesuai dokumentasi API v1.0.0 - Surat Pengumuman Nikah
 * Backend sudah memfilter status "Ditolak" secara otomatis
 * Menampilkan semua status kecuali "Ditolak" (Draft, Disetujui, Menunggu Penugasan, Penghulu Ditugaskan, Selesai)
 * Role Required: kepala_kua
 */
export async function getPengumumanListKepalaKUA(
  params?: PengumumanListRequestBody
): Promise<PengumumanListResponse> {
  try {
    // Build query parameters
    const queryParams: any = {};
    if (params?.tanggal_awal) {
      queryParams.tanggal_awal = params.tanggal_awal;
    }
    if (params?.tanggal_akhir) {
      queryParams.tanggal_akhir = params.tanggal_akhir;
    }

    console.log('📅 GET Pengumuman List (Kepala KUA) Request:', {
      endpoint: '/simnikah/kepala-kua/pengumuman-nikah/list',
      queryParams,
    });

    // Sesuai dokumentasi: GET request dengan query params
    const response = await api.get<PengumumanListResponse>(
      '/simnikah/kepala-kua/pengumuman-nikah/list',
      { params: queryParams }
    );

    console.log('📊 Response data (Kepala KUA):', {
      success: response.data.success,
      total: response.data.data?.total,
      periode: response.data.data?.periode,
      registrations_count: response.data.data?.registrations?.length,
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Get Pengumuman List (Kepala KUA) Error:', error.response?.data || error.message);
    console.error('❌ Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
}

/**
 * 27. Generate Surat Pengumuman Nikah (Kepala KUA)
 * GET /simnikah/kepala-kua/pengumuman-nikah/generate
 * 
 * Sesuai dokumentasi API v1.0.0 - Parsing API Surat Pengumuman Nikah
 * Role Required: kepala_kua
 * Returns: HTML string
 * 
 * @param params - Query parameters (tanggal_awal, tanggal_akhir)
 * @param customKopSurat - Optional custom kop surat (jika ada, gunakan POST dengan body)
 */
export async function generatePengumumanNikahKepalaKUA(
  params?: PengumumanListRequestBody,
  customKopSurat?: CustomKopSurat
): Promise<string> {
  try {
    // Build request sesuai dokumentasi
    // Jika ada custom kop surat, gunakan POST dengan body
    // Jika tidak, gunakan GET dengan query params
    const hasCustomKop = customKopSurat || params?.kop_surat;
    
    const config: any = {
      url: '/simnikah/kepala-kua/pengumuman-nikah/generate',
      method: hasCustomKop ? 'post' : 'get',
      params: hasCustomKop ? undefined : {
        tanggal_awal: params?.tanggal_awal,
        tanggal_akhir: params?.tanggal_akhir,
      },
      data: hasCustomKop ? {
        tanggal_awal: params?.tanggal_awal,
        tanggal_akhir: params?.tanggal_akhir,
        ...(customKopSurat || params?.kop_surat ? { kop_surat: customKopSurat || params?.kop_surat } : {}),
      } : undefined,
      responseType: 'text', // Important: untuk mendapatkan HTML sebagai string
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    const response = await api.request<string>(config);
    
    // Validate response is HTML
    if (typeof response.data === 'string' && response.data.trim().startsWith('<!')) {
      console.log('✅ Generate Pengumuman (Kepala KUA) Response: HTML received');
      return response.data;
    } else if (typeof response.data === 'string') {
      // If it's a string but not HTML, might be error message
      console.warn('⚠️ Response is string but not HTML:', response.data.substring(0, 200));
      return response.data;
    } else {
      throw new Error('Invalid response format: expected HTML string');
    }
  } catch (error: any) {
    console.error('❌ Generate Pengumuman (Kepala KUA) Error:', error.response?.data || error.message);
    
    // Enhanced error handling sesuai dokumentasi
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.error || 'Format tanggal tidak valid');
    } else if (error.response?.status === 401) {
      throw new Error('Token tidak valid atau sudah kadaluarsa');
    } else if (error.response?.status === 403) {
      throw new Error('Anda tidak memiliki permission untuk mengakses endpoint ini');
    } else if (error.response?.status === 500) {
      throw new Error(error.response.data?.error || 'Terjadi kesalahan pada server');
    }
    
    throw error;
  }
}

