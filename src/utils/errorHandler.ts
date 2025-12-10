/**
 * Error Handler Utility
 * Sesuai dokumentasi backend - Section Error Handling
 */

export interface ApiErrorInfo {
  message: string;
  type: 'network' | 'authentication' | 'authorization' | 'validation' | 'not_found' | 'rate_limit' | 'server' | 'format' | 'schedule_conflict' | 'unknown';
  error?: string;
  field?: string;
  status?: number;
}

/**
 * Handle API errors consistently
 * Sesuai dokumentasi: Section Error Handling
 */
export const handleApiError = (error: any): ApiErrorInfo => {
  // Handle network errors (no response)
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        message: 'Request timeout - Server tidak merespons dalam waktu yang ditentukan. Silakan coba lagi.',
        type: 'network',
        status: 504
      };
    }
    
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      return {
        message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
        type: 'network',
        status: 502
      };
    }
    
    return {
      message: 'Tidak dapat terhubung ke server',
      type: 'network'
    };
  }

  const { status, data } = error.response;

  // Handle different status codes
  switch (status) {
    case 400:
      return {
        message: data?.message || 'Data tidak valid',
        error: data?.error,
        type: data?.type || 'validation',
        field: data?.field,
        status: 400
      };
    
    case 401:
      // Redirect ke login (handled by interceptor in api.ts)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // Don't redirect here, let the interceptor handle it
      }
      return {
        message: 'Sesi Anda telah berakhir, silakan login kembali',
        type: 'authentication',
        status: 401
      };
    
    case 403:
      return {
        message: 'Anda tidak memiliki akses untuk melakukan aksi ini',
        type: 'authorization',
        status: 403
      };
    
    case 404:
      return {
        message: 'Data tidak ditemukan',
        type: 'not_found',
        status: 404
      };
    
    case 429:
      return {
        message: 'Terlalu banyak request, silakan tunggu sebentar',
        type: 'rate_limit',
        status: 429
      };
    
    case 500:
      return {
        message: data?.message || 'Terjadi kesalahan pada server',
        error: data?.error,
        type: 'server',
        status: 500
      };
    
    case 502:
      return {
        message: 'Server API tidak dapat dijangkau. Server mungkin sedang down atau mengalami masalah. Silakan coba lagi nanti.',
        type: 'server',
        status: 502
      };
    
    case 503:
      return {
        message: 'Server sedang dalam maintenance. Silakan coba lagi nanti.',
        type: 'server',
        status: 503
      };
    
    case 504:
      return {
        message: 'Server tidak merespons dalam waktu yang ditentukan. Silakan coba lagi.',
        type: 'network',
        status: 504
      };
    
    default:
      return {
        message: data?.message || 'Terjadi kesalahan',
        error: data?.error,
        type: data?.type || 'unknown',
        status: status
      };
  }
};

/**
 * Check if error is authentication related
 */
export const isAuthError = (error: any): boolean => {
  return error.response?.status === 401 || error.response?.status === 403;
};

/**
 * Check if error is rate limit
 */
export const isRateLimitError = (error: any): boolean => {
  return error.response?.status === 429;
};

/**
 * Check if error is validation error
 */
export const isValidationError = (error: any): boolean => {
  return error.response?.status === 400 && error.response?.data?.type === 'validation';
};

/**
 * Get field-specific error message
 */
export const getFieldError = (error: any, fieldName: string): string | null => {
  if (error.response?.status === 400 && error.response?.data?.field === fieldName) {
    return error.response.data.error || error.response.data.message;
  }
  return null;
};

