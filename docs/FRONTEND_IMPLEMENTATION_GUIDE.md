# 📘 Dokumentasi Lengkap Frontend - SimNikah API

**Versi:** 2.0.0  
**Update Terakhir:** Desember 2024  
**Target Audience:** Frontend Developer

---

## 📋 Daftar Isi

1. [Pengenalan](#pengenalan)
2. [Konfigurasi & Setup](#konfigurasi--setup)
3. [Authentication & Authorization](#authentication--authorization)
4. [Endpoints Berdasarkan Fitur](#endpoints-berdasarkan-fitur)
5. [Request & Response Format](#request--response-format)
6. [Error Handling](#error-handling)
7. [Contoh Implementasi](#contoh-implementasi)
8. [Best Practices](#best-practices)
9. [✅ Validasi Tampilan Frontend (Wajib Diimplementasikan)](#-validasi-tampilan-frontend-wajib-diimplementasikan)
10. [Testing](#testing)
11. [FAQ](#faq)

---

## 🎯 Pengenalan

SimNikah adalah sistem informasi pendaftaran nikah berbasis API untuk KUA (Kantor Urusan Agama) Kecamatan Banjarmasin Utara. Dokumentasi ini menjelaskan cara mengintegrasikan frontend dengan API backend SimNikah.

### Base URL

- **Development:** `http://localhost:8080`
- **Production:** Sesuai dengan domain yang diberikan (Railway/Vercel)

### Teknologi Backend

- Framework: Gin (Golang)
- Database: MySQL/MariaDB
- Authentication: JWT (JSON Web Token)
- File Storage: ImgBB (untuk foto profil)

---

## ⚙️ Konfigurasi & Setup

### 1. Environment Variables

File `.env.local` atau environment variables:

```env
# API Base URL
NEXT_PUBLIC_API_URL=https://simnikah-api-production-5583.up.railway.app

# Optional: Timeout untuk request
NEXT_PUBLIC_API_TIMEOUT=30000
```

### 2. API Client Setup

API Client sudah di-setup di `src/lib/api.ts` dengan:
- Request interceptor untuk menambahkan token
- Response interceptor untuk handle error
- Auto-redirect ke login jika 401

---

## 🔐 Authentication & Authorization

### Flow Authentication

```
1. User Register/Login
   ↓
2. Backend mengembalikan JWT Token
   ↓
3. Frontend menyimpan token (localStorage)
   ↓
4. Setiap request mengirim token di header Authorization
   ↓
5. Backend memverifikasi token
   ↓
6. Request berhasil atau ditolak
```

### Menyimpan Token

**LocalStorage (Sudah diimplementasikan):**

```typescript
// Setelah login (di AuthContext)
localStorage.setItem('token', response.token);
localStorage.setItem('user', JSON.stringify(response.user));
```

### Endpoints Authentication

Semua endpoint authentication sudah diimplementasikan di `src/lib/simnikah-api.ts`:
- `registerUser()` - Register user
- `login()` - Login
- `getProfile()` - Get profile
- Upload photo profile (via FormData)

---

## 📍 Endpoints Berdasarkan Fitur

### 🔵 Publik (Tanpa Authentication)

#### 1. Kalender Ketersediaan

**API Function:**
```typescript
import { getCalendarAvailability } from '@/lib/simnikah-api';

const response = await getCalendarAvailability(12, 2024);
```

#### 2. Ketersediaan Jam

**API Function:**
```typescript
import { getAvailableTimeSlots } from '@/lib/simnikah-api';

const response = await getAvailableTimeSlots('2024-12-15');
```

#### 3. Pernikahan per Tanggal

**API Function:**
```typescript
import { getWeddingsByDate } from '@/lib/simnikah-api';

const response = await getWeddingsByDate('2024-12-15');
```

---

### 👰 Catin (User Biasa) Endpoints

#### 1. Buat Pendaftaran Nikah

**API Function:**
```typescript
import { createSimpleMarriageRegistration } from '@/lib/simnikah-api';

const response = await createSimpleMarriageRegistration({
  calon_laki_laki: { /* ... */ },
  calon_perempuan: { /* ... */ },
  lokasi_nikah: { /* ... */ },
  wali_nikah: { /* ... */ }
});
```

**Validasi:** Gunakan validators dari `@/utils/validators/registration`

#### 2. Cek Status Pendaftaran

**API Function:**
```typescript
import { checkRegistrationStatus } from '@/lib/simnikah-api';

const response = await checkRegistrationStatus();
```

#### 3. Get Detail Pendaftaran by ID

**API Function (NEW):**
```typescript
import { getRegistrationDetail } from '@/lib/simnikah-api';

const response = await getRegistrationDetail(registrationId);
```

**Role Access:**
- `user_biasa`: Hanya bisa melihat pendaftaran miliknya sendiri
- `staff`, `penghulu`, `kepala_kua`: Bisa melihat semua pendaftaran

#### 4. Buat Feedback Pernikahan

**API Function:**
```typescript
import { createFeedback } from '@/lib/simnikah-api';

const response = await createFeedback({
  pendaftaran_id: 1,
  jenis_feedback: 'Rating',
  rating: 5,
  judul: 'Pelayanan Sangat Baik',
  pesan: 'Terima kasih...'
});
```

---

### 👔 Staff KUA Endpoints

Semua endpoint staff sudah diimplementasikan:
- `getAllRegistrations()` - List semua pendaftaran
- `approveRegistration()` - Approve pendaftaran
- `createRegistrationForUser()` - Buat pendaftaran untuk user
- `getPengumumanList()` - List pengumuman nikah
- `generatePengumumanNikah()` - Generate surat pengumuman

---

### 👨‍⚖️ Penghulu Endpoints

Semua endpoint penghulu sudah diimplementasikan:
- `getAssignedRegistrations()` - List tugas saya
- `completeMarriage()` - Selesaikan pernikahan
- `getTodaySchedule()` - Jadwal hari ini

---

### 👔 Kepala KUA Endpoints

Semua endpoint kepala KUA sudah diimplementasikan:
- `assignPenghulu()` - Assign penghulu
- `getAvailablePenghulu()` - List penghulu tersedia
- `createStaff()` - Buat staff
- `createPenghulu()` - Buat penghulu
- `getKepalaKUADashboard()` - Dashboard kepala KUA
- `getFeedbackList()` - List feedback

---

## 📦 Request & Response Format

### Standard Success Response

```json
{
  "success": true,
  "message": "Pesan sukses",
  "data": {
    // Data response
  }
}
```

### Standard Error Response

```json
{
  "success": false,
  "message": "Pesan error umum",
  "error": "Detail error",
  "type": "validation",
  "field": "nama_field"
}
```

---

## ❌ Error Handling

### Error Handler Utility

Sudah diimplementasikan di `src/utils/errorHandler.ts`:

```typescript
import { handleApiError } from '@/utils/errorHandler';

try {
  const response = await apiClient.post('/simnikah/pendaftaran', data);
} catch (error) {
  const errorInfo = handleApiError(error);
  
  if (errorInfo.type === 'validation') {
    setFieldError(errorInfo.field, errorInfo.error);
  } else {
    toast.error(errorInfo.message);
  }
}
```

### HTTP Status Codes

| Code | Description | Action |
|------|-------------|--------|
| `200` | Success | Continue normal flow |
| `201` | Created | Resource berhasil dibuat |
| `400` | Bad Request | Validasi error, tampilkan pesan error |
| `401` | Unauthorized | Token invalid/expired, redirect ke login |
| `403` | Forbidden | Tidak punya permission |
| `404` | Not Found | Resource tidak ditemukan |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Error server, tampilkan pesan umum |

---

## ✅ Validasi Tampilan Frontend

**PENTING:** Semua validasi sudah diimplementasikan di `src/utils/validators/`

### 1. Registration Validators

- ✅ `validateCalonLakiLaki()` - Validasi calon suami
- ✅ `validateCalonPerempuan()` - Validasi calon istri
- ✅ `validateWaliNikah()` - Validasi wali nikah
- ✅ `validateLokasiNikah()` - Validasi lokasi & jadwal

### 2. Authentication Validators

- ✅ `validateLogin()` - Validasi login
- ✅ `validateRegister()` - Validasi register

### 3. File Upload Validator

- ✅ `validateProfilePhoto()` - Validasi foto profil

### 4. Sanitization

- ✅ `sanitizeString()` - Sanitize string
- ✅ `sanitizeEmail()` - Sanitize email
- ✅ `escapeHtml()` - XSS protection

### 5. Business Logic Validators

- ✅ `validateStatusTransition()` - Validasi status transition
- ✅ `validateScheduleAvailability()` - Validasi ketersediaan jadwal
- ✅ `validateFeedback()` - Validasi feedback

### 6. Authorization

- ✅ `checkRoleAccess()` - Check role access
- ✅ `useRoleGuard()` - Hook untuk role guard

**Lihat dokumentasi lengkap:** `src/utils/README.md`

---

## 💻 Contoh Implementasi

### 1. Form Pendaftaran dengan Validasi

```typescript
import {
  validateCalonLakiLaki,
  validateCalonPerempuan,
  validateWaliNikah,
  validateLokasiNikah,
  validateScheduleAvailability
} from '@/utils/validators';
import { handleApiError } from '@/utils/errorHandler';
import { createSimpleMarriageRegistration } from '@/lib/simnikah-api';

const handleSubmit = async () => {
  // Validasi client-side
  const calonLakiValidation = validateCalonLakiLaki(formData.calon_laki_laki);
  if (!calonLakiValidation.isValid) {
    setErrors({ calon_laki_laki: calonLakiValidation.errors });
    return;
  }

  // Validasi ketersediaan jadwal
  const scheduleValidation = await validateScheduleAvailability(
    formData.lokasi_nikah.tanggal_nikah,
    formData.lokasi_nikah.waktu_nikah,
    formData.lokasi_nikah.tempat_nikah
  );

  if (!scheduleValidation.isValid) {
    setErrors({ lokasi_nikah: { waktu_nikah: scheduleValidation.message } });
    return;
  }

  // Submit
  try {
    await createSimpleMarriageRegistration(formData);
    toast.success('Pendaftaran berhasil!');
  } catch (error) {
    const errorInfo = handleApiError(error);
    toast.error(errorInfo.message);
  }
};
```

### 2. Get Detail Pendaftaran

```typescript
import { getRegistrationDetail } from '@/lib/simnikah-api';
import { handleApiError } from '@/utils/errorHandler';

const fetchDetail = async (id: number) => {
  try {
    const response = await getRegistrationDetail(id);
    setRegistration(response.data);
  } catch (error) {
    const errorInfo = handleApiError(error);
    
    if (errorInfo.type === 'not_found') {
      toast.error('Pendaftaran tidak ditemukan');
    } else if (errorInfo.type === 'authorization') {
      toast.error('Anda tidak memiliki akses untuk melihat pendaftaran ini');
    } else {
      toast.error(errorInfo.message);
    }
  }
};
```

---

## ✅ Best Practices

### 1. Token Management
- ✅ Sudah diimplementasikan di `src/lib/api.ts` dengan interceptor
- ✅ Auto-redirect ke login jika 401

### 2. Error Handling
- ✅ Gunakan `handleApiError()` dari `@/utils/errorHandler`
- ✅ Tampilkan pesan error yang user-friendly

### 3. Loading States
- ✅ Tampilkan loading indicator saat fetch data
- ✅ Disable button saat submit form

### 4. Form Validation
- ✅ Gunakan validators dari `@/utils/validators`
- ✅ Validasi client-side sebelum submit
- ✅ Validasi ketersediaan jadwal real-time

### 5. Security
- ✅ Sanitize input dengan `sanitizeString()`
- ✅ Escape HTML dengan `escapeHtml()`
- ✅ Validasi role-based access

---

## 📚 Resources Tambahan

- **Utils & Validators:** `src/utils/README.md`
- **Alur Pendaftaran:** `docs/ALUR_PENDAFTARAN_DAN_JAM.md`
- **Parsing API Pengumuman:** `docs/PARSING_API_PENGUMUMAN_NIKAH.md`
- **Struktur Project:** `STRUKTUR_PROJECT.md`

---

## 📞 Support

Jika ada pertanyaan atau masalah:

1. Cek dokumentasi di `src/utils/README.md`
2. Cek error message dari API response
3. Pastikan token valid dan tidak expired
4. Pastikan role user sesuai dengan endpoint yang diakses

---

**Last Updated:** Desember 2024  
**API Version:** 1.3.0  
**Frontend Documentation Version:** 2.0.0

