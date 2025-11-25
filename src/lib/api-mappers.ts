/**
 * API Data Mappers
 * Helper functions to map API responses to frontend data structures
 * Sederhana sesuai struktur backend
 */

import type { MarriageRegistration } from '@/lib/admin-data';

/**
 * Map API registration response to frontend Registration format
 * Struktur backend: { id, nomor_pendaftaran, status_pendaftaran, tanggal_nikah, ... }
 */
export function mapApiRegistrationToFrontend(apiReg: any): MarriageRegistration {
  return {
    id: apiReg.nomor_pendaftaran || apiReg.id,
    groomName: apiReg.calon_suami?.nama_lengkap || 'Data tidak tersedia',
    brideName: apiReg.calon_istri?.nama_lengkap || 'Data tidak tersedia',
    registrationDate: apiReg.tanggal_pendaftaran || apiReg.created_at,
    weddingDate: apiReg.tanggal_nikah || '',
    weddingTime: apiReg.waktu_nikah || '',
    weddingLocation: apiReg.tempat_nikah || '',
    status: apiReg.status_pendaftaran || 'Menunggu Penugasan',
    penghulu: apiReg.penghulu?.nama_lengkap || apiReg.penghulu?.nama || null,
  };
}

/**
 * Map multiple API registrations to frontend format
 */
export function mapApiRegistrationsToFrontend(apiRegs: any[]): MarriageRegistration[] {
  return apiRegs.map(mapApiRegistrationToFrontend);
}
