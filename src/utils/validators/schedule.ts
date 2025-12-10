/**
 * Validasi Ketersediaan Jadwal
 * Sesuai dokumentasi: Alur Pendaftaran dan Aturan Jam/Waktu Pernikahan
 */

import { getAvailableTimeSlots } from '@/lib/simnikah-api';
import { 
  isSlotAvailable, 
  getSlotUnavailableMessage,
  calculateSlotAvailability 
} from '../helpers/schedule';
import { CAPACITY } from '../constants/schedule';

export interface ScheduleValidationResult {
  isValid: boolean;
  message: string;
  details?: {
    kua?: {
      tersedia: boolean;
      jumlah_total: number;
      sisa_kuota: number;
    };
    luar_kua?: {
      tersedia: boolean;
      jumlah_total: number;
      sisa_kuota: number;
    };
    total?: {
      tersedia: boolean;
      jumlah_total: number;
      sisa_kuota: number;
    };
  };
}

/**
 * Validasi Ketersediaan Jadwal
 * Sesuai aturan:
 * - Di KUA: maksimal 1 per jam
 * - Di Luar KUA: maksimal 3 per jam
 * - Total kombinasi: maksimal 3 per jam
 */
export const validateScheduleAvailability = async (
  tanggal: string,
  waktu: string,
  tempat: 'Di KUA' | 'Di Luar KUA',
  apiClient?: any
): Promise<ScheduleValidationResult> => {
  try {
    // Fetch ketersediaan jam untuk tanggal tersebut
    const response = await getAvailableTimeSlots(tanggal);

    const timeSlot = response.data.time_slots.find(
      (slot: any) => slot.waktu === waktu
    );
    
    if (!timeSlot) {
      return {
        isValid: false,
        message: 'Waktu tidak tersedia. Pilih waktu antara 08:00 - 16:00'
      };
    }

    // Hitung ketersediaan slot
    const availability = calculateSlotAvailability(timeSlot);

    // Check ketersediaan berdasarkan tempat nikah
    if (tempat === 'Di KUA') {
      // Di KUA: maksimal 1 per jam
      if (!availability.kua.tersedia) {
        return {
          isValid: false,
          message: `Slot waktu di KUA sudah penuh (${availability.kua.jumlah_total}/${CAPACITY.KUA} pernikahan)`,
          details: {
            kua: {
              tersedia: false,
              jumlah_total: availability.kua.jumlah_total,
              sisa_kuota: availability.kua.sisa_kuota,
            }
          }
        };
      }
    } else {
      // Di Luar KUA: maksimal 3 per jam, tapi juga cek total
      if (!availability.luar_kua.tersedia) {
        return {
          isValid: false,
          message: `Slot waktu di luar KUA sudah penuh (${availability.luar_kua.jumlah_total}/${CAPACITY.LUAR_KUA} pernikahan)`,
          details: {
            luar_kua: {
              tersedia: false,
              jumlah_total: availability.luar_kua.jumlah_total,
              sisa_kuota: availability.luar_kua.sisa_kuota,
            }
          }
        };
      }
      
      // Cek total maksimal (kombinasi KUA + Luar KUA = maksimal 3)
      if (!availability.total.tersedia) {
        return {
          isValid: false,
          message: `Total slot waktu sudah penuh (${availability.total.jumlah_total}/${CAPACITY.TOTAL_PER_JAM} pernikahan). Kombinasi KUA dan luar KUA maksimal 3 per jam.`,
          details: {
            total: {
              tersedia: false,
              jumlah_total: availability.total.jumlah_total,
              sisa_kuota: availability.total.sisa_kuota,
            }
          }
        };
      }
    }

    return {
      isValid: true,
      message: 'Jadwal tersedia',
      details: {
        kua: {
          tersedia: availability.kua.tersedia,
          jumlah_total: availability.kua.jumlah_total,
          sisa_kuota: availability.kua.sisa_kuota,
        },
        luar_kua: {
          tersedia: availability.luar_kua.tersedia,
          jumlah_total: availability.luar_kua.jumlah_total,
          sisa_kuota: availability.luar_kua.sisa_kuota,
        },
        total: {
          tersedia: availability.total.tersedia,
          jumlah_total: availability.total.jumlah_total,
          sisa_kuota: availability.total.sisa_kuota,
        }
      }
    };
  } catch (error: any) {
    return {
      isValid: false,
      message: 'Gagal memvalidasi ketersediaan jadwal. Silakan coba lagi.'
    };
  }
};

