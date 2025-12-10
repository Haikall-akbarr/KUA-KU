/**
 * Validasi Feedback
 * Sesuai dokumentasi backend - Section Validasi Tampilan Frontend
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validasi Feedback
 */
export const validateFeedback = (data: {
  pendaftaran_id?: number | string;
  jenis_feedback?: string;
  rating?: number | string;
  judul?: string;
  pesan?: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  // Pendaftaran ID - Required, harus number
  if (!data.pendaftaran_id) {
    errors.pendaftaran_id = 'ID pendaftaran wajib diisi';
  } else if (isNaN(parseInt(String(data.pendaftaran_id)))) {
    errors.pendaftaran_id = 'ID pendaftaran harus berupa angka';
  }

  // Jenis Feedback - Required, harus dari daftar valid
  const validJenis = ['Rating', 'Saran', 'Kritik', 'Laporan'];
  if (!data.jenis_feedback || !validJenis.includes(data.jenis_feedback)) {
    errors.jenis_feedback = 'Jenis feedback tidak valid';
  }

  // Rating - Required jika jenis "Rating", harus 1-5
  if (data.jenis_feedback === 'Rating') {
    if (!data.rating) {
      errors.rating = 'Rating wajib diisi untuk jenis Rating';
    } else {
      const rating = typeof data.rating === 'string' ? parseInt(data.rating, 10) : data.rating;
      if (isNaN(rating) || rating < 1 || rating > 5) {
        errors.rating = 'Rating harus antara 1-5';
      }
    }
  }

  // Judul - Required, min 5 karakter, max 200 karakter
  if (!data.judul || data.judul.trim() === '') {
    errors.judul = 'Judul wajib diisi';
  } else if (data.judul.trim().length < 5) {
    errors.judul = 'Judul minimal 5 karakter';
  } else if (data.judul.length > 200) {
    errors.judul = 'Judul maksimal 200 karakter';
  }

  // Pesan - Required, min 10 karakter
  if (!data.pesan || data.pesan.trim() === '') {
    errors.pesan = 'Pesan wajib diisi';
  } else if (data.pesan.trim().length < 10) {
    errors.pesan = 'Pesan minimal 10 karakter';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

