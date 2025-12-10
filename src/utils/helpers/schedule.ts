/**
 * Helper Functions untuk Validasi Kapasitas dan Ketersediaan
 * Sesuai dokumentasi: Alur Pendaftaran dan Aturan Jam/Waktu Pernikahan
 */

import { CAPACITY, isStatusCountedInQuota } from '../constants/schedule';

export interface SlotAvailability {
  kua: {
    tersedia: boolean;
    terbooking: boolean;
    jumlah_total: number;
    jumlah_draft: number;
    jumlah_disetujui: number;
    sisa_kuota: number;
  };
  luar_kua: {
    tersedia: boolean;
    terbooking: boolean;
    jumlah_total: number;
    jumlah_draft: number;
    jumlah_disetujui: number;
    sisa_kuota: number;
  };
  total: {
    tersedia: boolean;
    jumlah_total: number;
    sisa_kuota: number;
  };
}

/**
 * Hitung kapasitas tersedia berdasarkan data time slot
 */
export const calculateSlotAvailability = (timeSlot: any): SlotAvailability => {
  const kua = {
    tersedia: true,
    terbooking: false,
    jumlah_total: timeSlot.kua?.jumlah_total || 0,
    jumlah_draft: timeSlot.kua?.jumlah_draft || 0,
    jumlah_disetujui: timeSlot.kua?.jumlah_disetujui || 0,
    sisa_kuota: 0,
  };

  const luar_kua = {
    tersedia: true,
    terbooking: false,
    jumlah_total: timeSlot.luar_kua?.jumlah_total || 0,
    jumlah_draft: timeSlot.luar_kua?.jumlah_draft || 0,
    jumlah_disetujui: timeSlot.luar_kua?.jumlah_disetujui || 0,
    sisa_kuota: 0,
  };

  // Hitung sisa kuota KUA
  kua.sisa_kuota = CAPACITY.KUA - kua.jumlah_total;
  kua.terbooking = kua.jumlah_total >= CAPACITY.KUA;
  kua.tersedia = !kua.terbooking;

  // Hitung sisa kuota Luar KUA
  luar_kua.sisa_kuota = CAPACITY.LUAR_KUA - luar_kua.jumlah_total;
  luar_kua.terbooking = luar_kua.jumlah_total >= CAPACITY.LUAR_KUA;
  luar_kua.tersedia = !luar_kua.terbooking;

  // Hitung total
  const total_jumlah = kua.jumlah_total + luar_kua.jumlah_total;
  const total = {
    tersedia: total_jumlah < CAPACITY.TOTAL_PER_JAM,
    jumlah_total: total_jumlah,
    sisa_kuota: CAPACITY.TOTAL_PER_JAM - total_jumlah,
  };

  return {
    kua,
    luar_kua,
    total,
  };
};

/**
 * Check if slot is available for tempat nikah
 */
export const isSlotAvailable = (
  timeSlot: any,
  tempatNikah: 'Di KUA' | 'Di Luar KUA'
): boolean => {
  const availability = calculateSlotAvailability(timeSlot);

  if (tempatNikah === 'Di KUA') {
    return availability.kua.tersedia;
  } else {
    // Untuk luar KUA, cek juga total maksimal
    return (
      availability.luar_kua.tersedia &&
      availability.total.tersedia
    );
  }
};

/**
 * Get error message if slot is not available
 */
export const getSlotUnavailableMessage = (
  timeSlot: any,
  tempatNikah: 'Di KUA' | 'Di Luar KUA'
): string | null => {
  const availability = calculateSlotAvailability(timeSlot);

  if (tempatNikah === 'Di KUA') {
    if (!availability.kua.tersedia) {
      return `Slot waktu di KUA sudah penuh (${availability.kua.jumlah_total}/${CAPACITY.KUA})`;
    }
  } else {
    if (!availability.luar_kua.tersedia) {
      return `Slot waktu di luar KUA sudah penuh (${availability.luar_kua.jumlah_total}/${CAPACITY.LUAR_KUA})`;
    }
    if (!availability.total.tersedia) {
      return `Total slot waktu sudah penuh (${availability.total.jumlah_total}/${CAPACITY.TOTAL_PER_JAM})`;
    }
  }

  return null;
};

/**
 * Format waktu untuk display
 */
export const formatTime = (time: string): string => {
  return time; // Format sudah HH:MM
};

/**
 * Parse waktu ke menit
 */
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Check if waktu is within operational hours
 */
export const isWithinOperationalHours = (time: string): boolean => {
  const timeMinutes = timeToMinutes(time);
  return (
    timeMinutes >= 8 * 60 && // 08:00
    timeMinutes <= 16 * 60   // 16:00
  );
};

