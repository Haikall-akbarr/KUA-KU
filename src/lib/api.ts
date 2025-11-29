
import axios from 'axios';

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://simnikah-api-production-5583.up.railway.app';

// Use a same-origin proxy for client-side requests to avoid CORS during development.
// In the browser we want axios to call `/api/proxy/...` so the Next server forwards to the external API.
let baseURL = DEFAULT_API_URL;
if (typeof window !== 'undefined') {
  baseURL = process.env.NEXT_PUBLIC_API_PROXY || '/api/proxy';
}

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token from localStorage for client requests
api.interceptors.request.use((config) => {
  try {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    }
  } catch (e) {
    // ignore in SSR
  }
  return config;
});

// Response interceptor to handle HTML error pages
api.interceptors.response.use(
  (response) => {
    try {
      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers['content-type'] || response.headers['Content-Type'] || '';
      const responseType = response.config?.responseType;
      
      // Allow HTML response if:
      // 1. responseType is explicitly set to 'text' (for endpoints that return HTML like pengumuman)
      // 2. Status is 200 (success)
      const isExpectedHTML = responseType === 'text' && response.status === 200;
      
      if (contentType.includes('text/html') && !isExpectedHTML) {
        console.error('⚠️ API returned HTML instead of JSON. Content-Type:', contentType);
        const error: any = new Error('API returned HTML error page instead of JSON response');
        error.response = {
          ...response,
          data: { error: 'Invalid response format', message: 'Server returned HTML instead of JSON' }
        };
        error.isAxiosError = true;
        throw error;
      }
      
      // If HTML is expected (responseType: 'text'), return as is without any processing
      if (isExpectedHTML) {
        console.log('✅ HTML response received (expected) - returning as is');
        // Don't process HTML response, return immediately
        return response;
      }
      
      // Also check if response.data is a string that looks like HTML
      // Skip this check if responseType is 'text' (expected HTML)
      if (typeof response.data === 'string' && responseType !== 'text') {
        const trimmed = response.data.trim();
        if (trimmed.startsWith('<') || trimmed.startsWith('<!') || trimmed.startsWith('<?xml')) {
          console.error('⚠️ API response data is HTML:', trimmed.substring(0, 200));
          const error: any = new Error('API returned HTML instead of JSON response');
          error.response = {
            ...response,
            data: { error: 'Invalid response format', message: 'Server returned HTML instead of JSON' }
          };
          error.isAxiosError = true;
          throw error;
        }
        
        // Try to parse as JSON if it's a string
        try {
          // Check again if it's HTML before trying to parse
          const trimmed = response.data.trim();
          if (trimmed.startsWith('<') || trimmed.startsWith('<!') || trimmed.startsWith('<?xml')) {
            console.error('⚠️ Response data is HTML, cannot parse as JSON');
            const error: any = new Error('API returned HTML instead of JSON response');
            error.response = {
              ...response,
              data: { error: 'Invalid response format', message: 'Server returned HTML instead of JSON' }
            };
            error.isAxiosError = true;
            throw error;
          }
          const parsed = JSON.parse(response.data);
          response.data = parsed;
        } catch (e: any) {
          // If parsing failed and it's not our error, check if it's HTML
          if (e && e.isAxiosError) {
            throw e; // Re-throw our error
          }
          // If JSON.parse failed with "Unexpected token '<'", it's likely HTML
          if (e && e.message && e.message.includes('Unexpected token')) {
            console.error('⚠️ JSON.parse failed with "Unexpected token" - likely HTML response');
            const error: any = new Error('API returned HTML instead of JSON response');
            error.response = {
              ...response,
              data: { error: 'Invalid response format', message: 'Server returned HTML instead of JSON' }
            };
            error.isAxiosError = true;
            throw error;
          }
          // If it's not valid JSON and not HTML, keep as is
          console.warn('⚠️ Response data is string but not JSON or HTML:', response.data.substring(0, 100));
        }
      }
      
      // Final check: if response.data is still a string after parsing attempt, check again
      // Skip this check if responseType is 'text' (expected HTML)
      if (typeof response.data === 'string' && response.data.trim().startsWith('<') && responseType !== 'text') {
        console.error('⚠️ Response data is still HTML after processing');
        const error: any = new Error('API returned HTML instead of JSON response');
        error.response = {
          ...response,
          data: { error: 'Invalid response format', message: 'Server returned HTML instead of JSON' }
        };
        error.isAxiosError = true;
        throw error;
      }
      
      // If responseType is 'text', we already returned above, but just in case:
      if (responseType === 'text' && typeof response.data === 'string') {
        console.log('✅ Text response received - returning as is');
        return response;
      }
      
      return response;
    } catch (err) {
      // Re-throw if it's our error
      if (err && typeof err === 'object' && 'isAxiosError' in err) {
        throw err;
      }
      // Otherwise return response as is
      return response;
    }
  },
  (error) => {
    // Handle network errors (no response)
    if (!error.response) {
      // Check if it's a network error or timeout
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.error('⚠️ Request timeout');
        error.message = 'Request timeout - Server tidak merespons dalam waktu yang ditentukan. Silakan coba lagi.';
        error.response = {
          status: 504,
          statusText: 'Gateway Timeout',
          data: {
            error: 'Request Timeout',
            message: 'Server tidak merespons dalam waktu yang ditentukan. Silakan coba lagi.',
            status: 504
          }
        };
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        console.error('⚠️ Network error');
        error.message = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
        error.response = {
          status: 502,
          statusText: 'Bad Gateway',
          data: {
            error: 'Network Error',
            message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
            status: 502
          }
        };
      }
    }
    
    // Handle response errors
    if (error.response) {
      try {
        const status = error.response.status;
        const contentType = error.response.headers['content-type'] || '';
        const responseData = error.response.data;
        
        // Handle 401 Unauthorized - Token expired
        if (status === 401) {
          console.warn('⚠️ 401 Unauthorized - Token expired or invalid');
          
          // Set error message
          error.response.data = {
            error: 'Unauthorized',
            message: 'Token tidak valid atau sudah kadaluarsa',
            status: 401
          };
          error.message = 'Token tidak valid atau sudah kadaluarsa';
          
          // Handle token expiration: redirect to relogin page
          // Only redirect if we're in browser and not already on relogin/login page
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            const isOnAuthPage = currentPath.includes('/relogin') || currentPath.includes('/login');
            
            if (!isOnAuthPage) {
              // Check if user data exists in localStorage
              const storedUser = localStorage.getItem('user');
              
              if (storedUser) {
                // User data exists, redirect to relogin (keep user, remove token)
                console.log('🔄 Token expired - redirecting to relogin page');
                // Remove token but keep user data
                localStorage.removeItem('token');
                // Use setTimeout to avoid redirect loop and allow error to propagate
                setTimeout(() => {
                  window.location.href = '/relogin';
                }, 100);
              } else {
                // No user data, redirect to login
                console.log('🔄 No user data - redirecting to login page');
                localStorage.removeItem('token');
                setTimeout(() => {
                  window.location.href = '/login';
                }, 100);
              }
            }
          }
        }
        // Handle 502 Bad Gateway specifically
        else if (status === 502) {
          console.error('⚠️ 502 Bad Gateway - Server API tidak dapat dijangkau');
          error.response.data = {
            error: 'Bad Gateway',
            message: 'Server API tidak dapat dijangkau. Server mungkin sedang down atau mengalami masalah. Silakan coba lagi nanti.',
            status: 502
          };
          error.message = 'Server API tidak dapat dijangkau. Silakan coba lagi nanti.';
        }
        // Check if response is HTML
        else if (contentType.includes('text/html')) {
          console.error('⚠️ API error response is HTML:', responseData);
          // Replace HTML response with JSON error
          error.response.data = {
            error: 'API Error',
            message: 'Server returned HTML error page. Please check the API endpoint.',
            status: status
          };
          error.message = 'API returned HTML error page. Please check the API endpoint.';
        } else if (typeof responseData === 'string') {
          const trimmed = responseData.trim();
          if (trimmed.startsWith('<') || trimmed.startsWith('<!')) {
            console.error('⚠️ API error response data is HTML:', trimmed.substring(0, 200));
            error.response.data = {
              error: 'API Error',
              message: 'Server returned HTML instead of JSON',
              status: status
            };
            error.message = 'API returned HTML error page. Please check the API endpoint.';
          }
        } else if (responseData && typeof responseData === 'object' && Object.keys(responseData).length === 0) {
          // Handle empty object response - provide default error message based on status
          console.warn('⚠️ API error response data is empty object. Status:', status);
          const statusMessages: Record<number, string> = {
            401: 'Unauthorized - Token tidak valid atau sudah kadaluarsa',
            403: 'Forbidden - Anda tidak memiliki izin untuk mengakses resource ini',
            404: 'Not Found - Resource tidak ditemukan',
            500: 'Internal Server Error - Terjadi kesalahan pada server',
            502: 'Bad Gateway - Server API tidak dapat dijangkau',
            503: 'Service Unavailable - Server sedang dalam maintenance',
            504: 'Gateway Timeout - Server tidak merespons dalam waktu yang ditentukan',
          };
          
          error.response.data = {
            error: 'API Error',
            message: statusMessages[status] || `Error ${status}: ${error.response.statusText || 'Request failed'}`,
            status: status
          };
        }
      } catch (e) {
        console.error('Error processing error response:', e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ============================================
// 🗺️ Location APIs (Map Integration)
// ============================================

export interface GeocodeResponse {
  success: boolean;
  message: string;
  data: {
    alamat: string;
    latitude: number;
    longitude: number;
    map_url: string;
    osm_url: string;
  };
}

export interface ReverseGeocodeResponse {
  success: boolean;
  message: string;
  data: {
    latitude: number;
    longitude: number;
    alamat: string;
    detail: {
      road?: string;
      suburb?: string;
      city_district?: string;
      city?: string;
      state?: string;
      postcode?: string;
      country?: string;
    };
    map_url: string;
    osm_url: string;
  };
}

export interface AddressSearchResult {
  display_name: string;
  latitude: string;
  longitude: string;
  address: {
    road?: string;
    suburb?: string;
    city_district?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

export interface SearchAddressResponse {
  success: boolean;
  message: string;
  data: {
    query: string;
    results: AddressSearchResult[];
    count: number;
  };
}

export interface LocationDetail {
  pendaftaran_id: number;
  nomor_pendaftaran: string;
  tanggal_nikah: string;
  waktu_nikah: string;
  tempat_nikah: string;
  alamat_akad: string;
  latitude?: number;
  longitude?: number;
  has_coordinates: boolean;
  is_outside_kua: boolean;
  note: string;
  map_url?: string;
  google_maps_url?: string;
  google_maps_directions_url?: string;
  osm_url?: string;
  waze_url?: string;
}

export interface UpdateLocationResponse {
  success: boolean;
  message: string;
  data: LocationDetail;
}

// 1. Geocoding - Alamat ke Koordinat
export async function geocodeAddress(alamat: string): Promise<GeocodeResponse> {
  try {
    const response = await api.post<GeocodeResponse>('/simnikah/location/geocode', {
      alamat,
    });
    console.log('🌍 Geocoding Result:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Geocoding Error:', error.response?.data || error.message);
    throw error;
  }
}

// 2. Reverse Geocoding - Koordinat ke Alamat
export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResponse> {
  try {
    const response = await api.post<ReverseGeocodeResponse>(
      '/simnikah/location/reverse-geocode',
      { latitude, longitude }
    );
    console.log('🌍 Reverse Geocoding Result:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Reverse Geocoding Error:', error.response?.data || error.message);
    throw error;
  }
}

// 3. Search Address (Autocomplete)
export async function searchAddress(query: string): Promise<SearchAddressResponse> {
  try {
    const response = await api.get<SearchAddressResponse>('/simnikah/location/search', {
      params: { q: query },
    });
    console.log('🔍 Search Results:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Search Error:', error.response?.data || error.message);
    throw error;
  }
}

// 4. Get Location Detail (untuk Penghulu)
export async function getLocationDetail(registrationId: string | number): Promise<LocationDetail> {
  try {
    const response = await api.get<{ success: boolean; data: LocationDetail }>(
      `/simnikah/pendaftaran/${registrationId}/location`
    );
    console.log('📍 Location Detail:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Get Location Error:', error.response?.data || error.message);
    throw error;
  }
}

// 5. Update Location (save dengan koordinat)
export async function updateRegistrationLocation(
  registrationId: string | number,
  alamat_akad: string,
  latitude?: number,
  longitude?: number
): Promise<UpdateLocationResponse> {
  try {
    const payload: any = { alamat_akad };
    if (latitude !== undefined && longitude !== undefined) {
      payload.latitude = latitude;
      payload.longitude = longitude;
    }

    const response = await api.put<UpdateLocationResponse>(
      `/simnikah/pendaftaran/${registrationId}/location`,
      payload
    );
    console.log('✅ Location Updated:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Update Location Error:', error.response?.data || error.message);
    throw error;
  }
}
