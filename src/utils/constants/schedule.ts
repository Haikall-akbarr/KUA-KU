/**
 * Constants untuk Aturan Jam/Waktu Pernikahan
 * Sesuai dokumentasi: Alur Pendaftaran dan Aturan Jam/Waktu Pernikahan
 */

/**
 * Time Slots Tersedia
 * Format: HH:MM (24 jam)
 */
export const TIME_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00'
] as const;

/**
 * Jam Operasional
 */
export const OPERATIONAL_HOURS = {
  START: '08:00',
  END: '16:00',
  START_MINUTES: 8 * 60, // 08:00 dalam menit
  END_MINUTES: 16 * 60,  // 16:00 dalam menit
} as const;

/**
 * Kapasitas Pernikahan per Jam
 */
export const CAPACITY = {
  KUA: 1,           // Maksimal 1 pernikahan per jam di KUA
  LUAR_KUA: 3,      // Maksimal 3 pernikahan per jam di luar KUA
  TOTAL_PER_JAM: 3, // Total maksimal per jam (kombinasi KUA + Luar KUA)
} as const;

/**
 * Status yang Diperhitungkan dalam Kuota
 */
export const STATUS_COUNTED_IN_QUOTA = [
  'Draft',
  'Disetujui',
  'Menunggu Penugasan',
  'Penghulu Ditugaskan',
] as const;

/**
 * Status yang TIDAK Diperhitungkan dalam Kuota
 */
export const STATUS_NOT_COUNTED_IN_QUOTA = [
  'Ditolak',
  'Selesai',
] as const;

/**
 * Alur Status Pendaftaran
 */
export const STATUS_FLOW = [
  'Draft',
  'Disetujui',
  'Menunggu Penugasan',
  'Penghulu Ditugaskan',
  'Selesai',
] as const;

/**
 * Valid Kelurahan (Kecamatan Banjarmasin Utara)
 */
export const VALID_KELURAHAN = [
  'Alalak Utara',
  'Alalak Tengah',
  'Alalak Selatan',
  'Antasan Kecil Timur',
  'Kuin Utara',
  'Pangeran',
  'Sungai Miai',
  'Sungai Andai',
  'Surgi Mufti',
] as const;

/**
 * Valid Hubungan Wali
 */
export const VALID_HUBUNGAN_WALI = [
  'Ayah Kandung',
  'Kakek',
  'Saudara Laki-Laki Kandung',
  'Saudara Laki-Laki Seayah',
  'Keponakan Laki-Laki',
  'Paman Kandung',
  'Paman Seayah',
  'Sepupu Laki-Laki',
  'Wali Hakim',
  'Lainnya',
] as const;

/**
 * Check if status is counted in quota
 */
export const isStatusCountedInQuota = (status: string): boolean => {
  return STATUS_COUNTED_IN_QUOTA.includes(status as any);
};

/**
 * Check if status is NOT counted in quota
 */
export const isStatusNotCountedInQuota = (status: string): boolean => {
  return STATUS_NOT_COUNTED_IN_QUOTA.includes(status as any);
};

/**
 * Check if time slot is valid
 */
export const isValidTimeSlot = (time: string): boolean => {
  return TIME_SLOTS.includes(time as any);
};

/**
 * Check if kelurahan is valid
 */
export const isValidKelurahan = (kelurahan: string): boolean => {
  return VALID_KELURAHAN.includes(kelurahan as any);
};

/**
 * Check if hubungan wali is valid
 */
export const isValidHubunganWali = (hubungan: string): boolean => {
  return VALID_HUBUNGAN_WALI.includes(hubungan as any);
};

