
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://simnikah-api-production.up.railway.app';

const api = axios.create({
  baseURL: BASE_URL,
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
