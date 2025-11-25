// src/lib/staff-verification-service.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://simnikah-api-production-5583.up.railway.app';

interface VerificationRequest {
  approved: boolean;
  catatan: string;
}

interface VerificationResponse {
  success: boolean;
  message: string;
  data: {
    pendaftaran_id: number;
    status_baru: string;
    verified_by: string;
    verified_at: string;
  };
}

interface NotificationData {
  id: string;
  judul: string;
  pesan: string;
  tipe: 'Success' | 'Error' | 'Warning' | 'Info';
  status_baca: 'Belum Dibaca' | 'Sudah Dibaca';
  link: string;
  created_at: string;
  registration_id: string;
}

/**
 * Verifikasi Formulir Online
 */
export async function verifyFormulirOnline(
  registrationId: string,
  request: VerificationRequest
): Promise<VerificationResponse> {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Token tidak ditemukan. Silakan login kembali.');
  }

  const response = await fetch(
    `${API_BASE_URL}/simnikah/staff/verify-formulir/${registrationId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Verifikasi formulir gagal');
  }

  return data;
}

/**
 * Verifikasi Berkas Fisik
 */
export async function verifyBerkasPhysical(
  registrationId: string,
  request: VerificationRequest
): Promise<VerificationResponse> {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Token tidak ditemukan. Silakan login kembali.');
  }

  const response = await fetch(
    `${API_BASE_URL}/simnikah/staff/verify-berkas/${registrationId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Verifikasi berkas gagal');
  }

  return data;
}

/**
 * Buat Notifikasi untuk User
 */
export function createUserNotification(
  userId: string,
  title: string,
  message: string,
  type: 'Success' | 'Error' | 'Warning' | 'Info',
  registrationId: string
): NotificationData {
  const notification: NotificationData = {
    id: `notif_${Date.now()}`,
    judul: title,
    pesan: message,
    tipe: type,
    status_baca: 'Belum Dibaca',
    link: `/profile/registration-status/${registrationId}`,
    created_at: new Date().toISOString(),
    registration_id: registrationId,
  };

  // Simpan ke localStorage
  const existingNotifications = JSON.parse(
    localStorage.getItem(`notifications_${userId}`) || '[]'
  );

  existingNotifications.unshift(notification);

  localStorage.setItem(
    `notifications_${userId}`,
    JSON.stringify(existingNotifications.slice(0, 50)) // Simpan max 50 notifikasi
  );

  return notification;
}

/**
 * Update Status Registrasi
 */
export function updateRegistrationStatus(
  registrationId: string,
  newStatus: string
): void {
  const registrations = JSON.parse(
    localStorage.getItem('marriageRegistrations') || '[]'
  );

  const index = registrations.findIndex(
    (reg: any) => reg.id === registrationId
  );

  if (index !== -1) {
    registrations[index].status = newStatus;
    registrations[index].updated_at = new Date().toISOString();
    localStorage.setItem('marriageRegistrations', JSON.stringify(registrations));
  }
}

/**
 * Simpan Data Verifikasi
 */
export function saveVerificationData(
  registrationId: string,
  type: 'formulir_online' | 'berkas_fisik',
  approved: boolean,
  verifiedAt: string,
  verifiedBy: string,
  catatan: string
): void {
  const verificationData = JSON.parse(
    localStorage.getItem(`verification_${registrationId}`) || '{}'
  );

  verificationData[type] = {
    approved,
    verified_at: verifiedAt,
    verified_by: verifiedBy,
    catatan,
    saved_at: new Date().toISOString(),
  };

  localStorage.setItem(`verification_${registrationId}`, JSON.stringify(verificationData));
}

/**
 * Get Verifikasi Data
 */
export function getVerificationData(registrationId: string): any {
  return JSON.parse(
    localStorage.getItem(`verification_${registrationId}`) || '{}'
  );
}

/**
 * Handle Verifikasi Formulir Online dengan Notifikasi
 */
export async function handleFormulirVerification(
  registrationId: string,
  userId: string,
  groomName: string,
  brideName: string,
  approved: boolean,
  catatan: string
): Promise<void> {
  try {
    const response = await verifyFormulirOnline(registrationId, {
      approved,
      catatan: catatan || 'Verifikasi berhasil diproses',
    });

    // Simpan data verifikasi
    saveVerificationData(
      registrationId,
      'formulir_online',
      approved,
      response.data.verified_at,
      response.data.verified_by,
      catatan
    );

    // Update status registrasi
    updateRegistrationStatus(registrationId, response.data.status_baru);

    // Buat notifikasi
    if (approved) {
      createUserNotification(
        userId,
        '✅ Formulir Diverifikasi',
        `Formulir pendaftaran nikah Anda untuk ${groomName} & ${brideName} telah diverifikasi oleh staff KUA. Silakan datang ke KUA untuk menyerahkan berkas fisik.`,
        'Success',
        registrationId
      );
    } else {
      createUserNotification(
        userId,
        '❌ Formulir Ditolak',
        `Formulir pendaftaran Anda ditolak. Silakan hubungi KUA untuk informasi lebih lanjut.\n\nCatatan: ${catatan || 'Tidak ada catatan'}`,
        'Error',
        registrationId
      );
    }
  } catch (error) {
    console.error('Error handling formulir verification:', error);
    throw error;
  }
}

/**
 * Handle Verifikasi Berkas Fisik dengan Notifikasi
 */
export async function handleBerkasVerification(
  registrationId: string,
  userId: string,
  groomName: string,
  brideName: string,
  approved: boolean,
  catatan: string
): Promise<void> {
  try {
    const response = await verifyBerkasPhysical(registrationId, {
      approved,
      catatan: catatan || 'Verifikasi berhasil diproses',
    });

    // Simpan data verifikasi
    saveVerificationData(
      registrationId,
      'berkas_fisik',
      approved,
      response.data.verified_at,
      response.data.verified_by,
      catatan
    );

    // Update status registrasi
    updateRegistrationStatus(registrationId, response.data.status_baru);

    // Buat notifikasi
    if (approved) {
      createUserNotification(
        userId,
        '✅ Berkas Fisik Diterima',
        `Berkas fisik Anda untuk ${groomName} & ${brideName} telah diterima dan diverifikasi. Pendaftaran Anda sedang dalam proses berikutnya.\n\nStatus: ${response.data.status_baru}`,
        'Success',
        registrationId
      );
    } else {
      createUserNotification(
        userId,
        '❌ Berkas Fisik Ditolak',
        `Berkas fisik Anda ditolak. Silakan hubungi KUA untuk informasi lebih lanjut.\n\nCatatan: ${catatan || 'Tidak ada catatan'}`,
        'Error',
        registrationId
      );
    }
  } catch (error) {
    console.error('Error handling berkas verification:', error);
    throw error;
  }
}

/**
 * Get Notification Stats
 */
export function getNotificationStats(userId: string): {
  total: number;
  unread: number;
  read: number;
} {
  const notifications = JSON.parse(
    localStorage.getItem(`notifications_${userId}`) || '[]'
  );

  const unread = notifications.filter((n: NotificationData) => n.status_baca === 'Belum Dibaca').length;
  const total = notifications.length;
  const read = total - unread;

  return { total, unread, read };
}