/**
 * Validasi Form Pendaftaran Nikah
 * Sesuai dokumentasi backend - Section Validasi Tampilan Frontend
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validasi Calon Laki-Laki
 */
export const validateCalonLakiLaki = (data: {
  nama_dan_bin?: string;
  pendidikan_akhir?: string;
  umur?: string | number;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  // Nama dan Bin - Required, min 3 karakter, max 100 karakter
  if (!data.nama_dan_bin || data.nama_dan_bin.trim() === '') {
    errors.nama_dan_bin = 'Nama dan bin wajib diisi';
  } else if (data.nama_dan_bin.trim().length < 3) {
    errors.nama_dan_bin = 'Nama minimal 3 karakter';
  } else if (data.nama_dan_bin.length > 100) {
    errors.nama_dan_bin = 'Nama maksimal 100 karakter';
  } else if (!data.nama_dan_bin.toLowerCase().includes('bin')) {
    errors.nama_dan_bin = 'Format nama harus menggunakan "bin" (contoh: Ahmad bin Abdullah)';
  }

  // Umur - Required, minimal 19 tahun
  if (!data.umur || data.umur === '') {
    errors.umur = 'Umur wajib diisi';
  } else {
    const umur = typeof data.umur === 'string' ? parseInt(data.umur, 10) : data.umur;
    if (isNaN(umur) || umur < 19) {
      errors.umur = 'Umur calon laki-laki minimal 19 tahun';
    } else if (umur > 100) {
      errors.umur = 'Umur tidak valid';
    }
  }

  // Pendidikan - Optional tapi jika diisi harus valid
  if (data.pendidikan_akhir && data.pendidikan_akhir.length > 50) {
    errors.pendidikan_akhir = 'Pendidikan maksimal 50 karakter';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validasi Calon Perempuan
 */
export const validateCalonPerempuan = (data: {
  nama_dan_binti?: string;
  pendidikan_akhir?: string;
  umur?: string | number;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  // Nama dan Binti - Required, min 3 karakter, max 100 karakter
  if (!data.nama_dan_binti || data.nama_dan_binti.trim() === '') {
    errors.nama_dan_binti = 'Nama dan binti wajib diisi';
  } else if (data.nama_dan_binti.trim().length < 3) {
    errors.nama_dan_binti = 'Nama minimal 3 karakter';
  } else if (data.nama_dan_binti.length > 100) {
    errors.nama_dan_binti = 'Nama maksimal 100 karakter';
  } else if (!data.nama_dan_binti.toLowerCase().includes('binti')) {
    errors.nama_dan_binti = 'Format nama harus menggunakan "binti" (contoh: Siti binti Muhammad)';
  }

  // Umur - Required, minimal 19 tahun
  if (!data.umur || data.umur === '') {
    errors.umur = 'Umur wajib diisi';
  } else {
    const umur = typeof data.umur === 'string' ? parseInt(data.umur, 10) : data.umur;
    if (isNaN(umur) || umur < 19) {
      errors.umur = 'Umur calon perempuan minimal 19 tahun';
    } else if (umur > 100) {
      errors.umur = 'Umur tidak valid';
    }
  }

  // Pendidikan - Optional tapi jika diisi harus valid
  if (data.pendidikan_akhir && data.pendidikan_akhir.length > 50) {
    errors.pendidikan_akhir = 'Pendidikan maksimal 50 karakter';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validasi Wali Nikah
 */
export const validateWaliNikah = (data: {
  nama_dan_bin?: string;
  hubungan_wali?: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  // Nama dan Bin - Required
  if (!data.nama_dan_bin || data.nama_dan_bin.trim() === '') {
    errors.nama_dan_bin = 'Nama wali nikah wajib diisi';
  } else if (data.nama_dan_bin.trim().length < 3) {
    errors.nama_dan_bin = 'Nama minimal 3 karakter';
  } else if (data.nama_dan_bin.length > 100) {
    errors.nama_dan_bin = 'Nama maksimal 100 karakter';
  } else if (!data.nama_dan_bin.toLowerCase().includes('bin')) {
    errors.nama_dan_bin = 'Format nama harus menggunakan "bin"';
  }

  // Hubungan Wali - Required, harus dari daftar valid
  const validHubunganWali = [
    'Ayah Kandung',
    'Kakek',
    'Saudara Laki-Laki Kandung',
    'Saudara Laki-Laki Seayah',
    'Keponakan Laki-Laki',
    'Paman Kandung',
    'Paman Seayah',
    'Sepupu Laki-Laki',
    'Wali Hakim',
    'Lainnya'
  ];

  if (!data.hubungan_wali || data.hubungan_wali.trim() === '') {
    errors.hubungan_wali = 'Hubungan wali wajib diisi';
  } else if (!validHubunganWali.includes(data.hubungan_wali)) {
    errors.hubungan_wali = 'Hubungan wali tidak valid. Pilih dari daftar yang tersedia';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validasi Lokasi & Jadwal Nikah
 */
export const validateLokasiNikah = (data: {
  tempat_nikah?: string;
  tanggal_nikah?: string;
  waktu_nikah?: string;
  alamat_nikah?: string;
  alamat_detail?: string;
  kelurahan?: string;
}, availableSlots?: any[]): ValidationResult => {
  const errors: Record<string, string> = {};

  // Tempat Nikah - Required, harus "Di KUA" atau "Di Luar KUA"
  const validTempat = ['Di KUA', 'Di Luar KUA'];
  if (!data.tempat_nikah || !validTempat.includes(data.tempat_nikah)) {
    errors.tempat_nikah = 'Pilih tempat nikah: Di KUA atau Di Luar KUA';
  }

  // Tanggal Nikah - Required, format YYYY-MM-DD, tidak boleh di masa lalu
  if (!data.tanggal_nikah || data.tanggal_nikah.trim() === '') {
    errors.tanggal_nikah = 'Tanggal nikah wajib diisi';
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.tanggal_nikah)) {
      errors.tanggal_nikah = 'Format tanggal harus YYYY-MM-DD (contoh: 2024-12-15)';
    } else {
      const selectedDate = new Date(data.tanggal_nikah);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (isNaN(selectedDate.getTime())) {
        errors.tanggal_nikah = 'Tanggal tidak valid';
      } else if (selectedDate < today) {
        errors.tanggal_nikah = 'Tanggal nikah tidak boleh di masa lalu';
      }
      
      // Cek hari libur (Minggu)
      if (selectedDate.getDay() === 0) {
        errors.tanggal_nikah = 'Tidak bisa memilih hari Minggu';
      }
    }
  }

  // Waktu Nikah - Required, format HH:MM, dalam range 08:00-16:00
  if (!data.waktu_nikah || data.waktu_nikah.trim() === '') {
    errors.waktu_nikah = 'Waktu nikah wajib diisi';
  } else {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(data.waktu_nikah)) {
      errors.waktu_nikah = 'Format waktu harus HH:MM (contoh: 09:00, 14:30)';
    } else {
      const [hours, minutes] = data.waktu_nikah.split(':').map(Number);
      const timeInMinutes = hours * 60 + minutes;
      const startTime = 8 * 60; // 08:00
      const endTime = 16 * 60; // 16:00
      
      if (timeInMinutes < startTime || timeInMinutes > endTime) {
        errors.waktu_nikah = 'Waktu nikah harus antara 08:00 - 16:00';
      }
      
      // Cek apakah waktu dalam time slots yang valid
      // Sesuai dokumentasi: 9 slot waktu (08:00 - 16:00)
      const validTimeSlots = [
        '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00'
      ];
      if (!validTimeSlots.includes(data.waktu_nikah)) {
        errors.waktu_nikah = 'Waktu harus sesuai dengan slot yang tersedia (08:00, 09:00, ..., 16:00)';
      }
      
      // Validasi: waktu harus tepat pada jam (tidak boleh menit selain 00)
      // Sesuai dokumentasi: time slots hanya tersedia pada jam tepat
      if (data.waktu_nikah && !data.waktu_nikah.endsWith(':00')) {
        errors.waktu_nikah = 'Waktu harus tepat pada jam (contoh: 09:00, 10:00, bukan 09:30)';
      }
    }
  }

  // Jika nikah di luar KUA, validasi alamat
  if (data.tempat_nikah === 'Di Luar KUA') {
    if (!data.alamat_nikah || data.alamat_nikah.trim() === '') {
      errors.alamat_nikah = 'Alamat nikah wajib diisi untuk nikah di luar KUA';
    } else if (data.alamat_nikah.trim().length < 10) {
      errors.alamat_nikah = 'Alamat minimal 10 karakter';
    } else if (data.alamat_nikah.length > 200) {
      errors.alamat_nikah = 'Alamat maksimal 200 karakter';
    }

    if (data.alamat_detail && data.alamat_detail.length > 200) {
      errors.alamat_detail = 'Detail alamat maksimal 200 karakter';
    }

    // Kelurahan - Required, harus dalam daftar valid
    const validKelurahan = [
      'Alalak Utara',
      'Alalak Tengah',
      'Alalak Selatan',
      'Antasan Kecil Timur',
      'Kuin Utara',
      'Pangeran',
      'Sungai Miai',
      'Sungai Andai',
      'Surgi Mufti'
    ];

    if (!data.kelurahan || data.kelurahan.trim() === '') {
      errors.kelurahan = 'Kelurahan wajib diisi';
    } else if (!validKelurahan.includes(data.kelurahan)) {
      errors.kelurahan = 'Kelurahan harus dalam Kecamatan Banjarmasin Utara';
    }
  }

  // Validasi ketersediaan slot (jika data availableSlots tersedia)
  if (availableSlots && data.tanggal_nikah && data.waktu_nikah) {
    const slot = availableSlots.find(
      (s: any) => s.waktu === data.waktu_nikah
    );
    
    if (slot) {
      if (data.tempat_nikah === 'Di KUA') {
        if (!slot.kua?.tersedia || slot.kua?.terbooking) {
          errors.waktu_nikah = 'Slot waktu di KUA sudah terbooking';
        }
      } else {
        if (!slot.luar_kua?.tersedia || slot.luar_kua?.terbooking) {
          errors.waktu_nikah = 'Slot waktu di luar KUA sudah penuh (maksimal 3 per jam)';
        }
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

