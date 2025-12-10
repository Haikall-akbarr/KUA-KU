/**
 * Validasi File Upload
 * Sesuai dokumentasi backend - Section Validasi Tampilan Frontend
 */

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validasi Profile Photo
 */
export const validateProfilePhoto = (file: File | null): FileValidationResult => {
  const errors: string[] = [];

  if (!file) {
    errors.push('File wajib dipilih');
    return { isValid: false, errors };
  }

  // Validasi file size (5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB dalam bytes
  if (file.size > maxSize) {
    errors.push('Ukuran file maksimal 5MB');
  }

  // Validasi file type
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];
  
  if (!validTypes.includes(file.type)) {
    errors.push('Format file tidak didukung. Gunakan JPG, PNG, atau WEBP');
  }

  // Validasi file extension (double check)
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!fileExtension || !validExtensions.includes(fileExtension)) {
    errors.push('Ekstensi file tidak valid');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

