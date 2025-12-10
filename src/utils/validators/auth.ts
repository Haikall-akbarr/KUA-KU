/**
 * Validasi Authentication & Authorization
 * Sesuai dokumentasi backend - Section Validasi Tampilan Frontend
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validasi Login
 */
export const validateLogin = (data: {
  username?: string;
  password?: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  // Username - Required, min 3 karakter
  if (!data.username || data.username.trim() === '') {
    errors.username = 'Username wajib diisi';
  } else if (data.username.trim().length < 3) {
    errors.username = 'Username minimal 3 karakter';
  } else if (data.username.length > 50) {
    errors.username = 'Username maksimal 50 karakter';
  } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
    errors.username = 'Username hanya boleh mengandung huruf, angka, dan underscore';
  }

  // Password - Required, min 6 karakter
  if (!data.password || data.password === '') {
    errors.password = 'Password wajib diisi';
  } else if (data.password.length < 6) {
    errors.password = 'Password minimal 6 karakter';
  } else if (data.password.length > 255) {
    errors.password = 'Password terlalu panjang';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validasi Register
 */
export const validateRegister = (data: {
  username?: string;
  email?: string;
  password?: string;
  nama?: string;
  role?: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  // Username
  if (!data.username || data.username.trim() === '') {
    errors.username = 'Username wajib diisi';
  } else if (data.username.trim().length < 3) {
    errors.username = 'Username minimal 3 karakter';
  } else if (data.username.length > 50) {
    errors.username = 'Username maksimal 50 karakter';
  } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
    errors.username = 'Username hanya boleh mengandung huruf, angka, dan underscore';
  }

  // Email - Required, format email valid
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || data.email.trim() === '') {
    errors.email = 'Email wajib diisi';
  } else if (!emailRegex.test(data.email)) {
    errors.email = 'Format email tidak valid';
  } else if (data.email.length > 100) {
    errors.email = 'Email maksimal 100 karakter';
  }

  // Password
  if (!data.password || data.password === '') {
    errors.password = 'Password wajib diisi';
  } else if (data.password.length < 6) {
    errors.password = 'Password minimal 6 karakter';
  }

  // Nama - Required
  if (!data.nama || data.nama.trim() === '') {
    errors.nama = 'Nama wajib diisi';
  } else if (data.nama.trim().length < 3) {
    errors.nama = 'Nama minimal 3 karakter';
  } else if (data.nama.length > 100) {
    errors.nama = 'Nama maksimal 100 karakter';
  }

  // Role - Required, harus dari daftar valid
  const validRoles = ['user_biasa', 'staff', 'penghulu', 'kepala_kua'];
  if (!data.role || !validRoles.includes(data.role)) {
    errors.role = 'Role tidak valid';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

