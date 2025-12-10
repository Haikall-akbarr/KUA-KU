# Utils & Validators

Dokumentasi untuk utilities dan validators yang diimplementasikan sesuai dokumentasi backend SimNikah.

## 📁 Struktur

```
src/utils/
├── errorHandler.ts          # Error handling utility
├── validators/
│   ├── index.ts             # Export semua validators
│   ├── registration.ts      # Validasi form pendaftaran
│   ├── auth.ts              # Validasi login/register
│   ├── file.ts              # Validasi file upload
│   ├── sanitize.ts          # Sanitization input
│   ├── status.ts             # Validasi status transition
│   ├── schedule.ts          # Validasi ketersediaan jadwal
│   ├── feedback.ts          # Validasi feedback
│   └── authorization.ts     # Role-based access control
└── README.md                # Dokumentasi ini
```

## 🔧 Error Handler

### Penggunaan

```typescript
import { handleApiError } from '@/utils/errorHandler';

try {
  const response = await apiClient.post('/simnikah/pendaftaran', data);
  // Success handling
} catch (error) {
  const errorInfo = handleApiError(error);
  
  // Tampilkan error ke user
  if (errorInfo.type === 'validation') {
    // Tampilkan error validasi spesifik
    setFieldError(errorInfo.field, errorInfo.error);
  } else {
    // Tampilkan error umum
    toast.error(errorInfo.message);
  }
}
```

### Error Types

- `network` - Error koneksi
- `authentication` - Token invalid/expired
- `authorization` - Tidak punya permission
- `validation` - Error validasi input
- `not_found` - Resource tidak ditemukan
- `rate_limit` - Terlalu banyak request
- `server` - Error server
- `format` - Error format data
- `schedule_conflict` - Konflik jadwal

## ✅ Validators

### 1. Registration Validators

#### Validasi Calon Laki-Laki

```typescript
import { validateCalonLakiLaki } from '@/utils/validators';

const result = validateCalonLakiLaki({
  nama_dan_bin: 'Ahmad bin Abdullah',
  pendidikan_akhir: 'S1',
  umur: 25
});

if (!result.isValid) {
  console.log(result.errors);
  // { nama_dan_bin: '...', umur: '...' }
}
```

#### Validasi Calon Perempuan

```typescript
import { validateCalonPerempuan } from '@/utils/validators';

const result = validateCalonPerempuan({
  nama_dan_binti: 'Siti binti Muhammad',
  pendidikan_akhir: 'S1',
  umur: 23
});
```

#### Validasi Wali Nikah

```typescript
import { validateWaliNikah } from '@/utils/validators';

const result = validateWaliNikah({
  nama_dan_bin: 'Abdullah bin Muhammad',
  hubungan_wali: 'Ayah Kandung'
});
```

#### Validasi Lokasi & Jadwal

```typescript
import { validateLokasiNikah } from '@/utils/validators';

const result = validateLokasiNikah({
  tempat_nikah: 'Di KUA',
  tanggal_nikah: '2024-12-15',
  waktu_nikah: '10:00',
  // ... fields lainnya
}, availableSlots); // Optional: untuk validasi ketersediaan slot
```

### 2. Authentication Validators

#### Validasi Login

```typescript
import { validateLogin } from '@/utils/validators';

const result = validateLogin({
  username: 'ahmad123',
  password: 'password123'
});
```

#### Validasi Register

```typescript
import { validateRegister } from '@/utils/validators';

const result = validateRegister({
  username: 'ahmad123',
  email: 'ahmad@example.com',
  password: 'password123',
  nama: 'Ahmad Wijaya',
  role: 'user_biasa'
});
```

### 3. File Upload Validator

```typescript
import { validateProfilePhoto } from '@/utils/validators';

const file = event.target.files[0];
const result = validateProfilePhoto(file);

if (!result.isValid) {
  result.errors.forEach(error => {
    toast.error(error);
  });
}
```

### 4. Sanitization

```typescript
import { sanitizeString, sanitizeEmail, escapeHtml } from '@/utils/validators';

// Sanitize input
const cleanInput = sanitizeString(userInput);
const cleanEmail = sanitizeEmail(userEmail);

// Escape HTML untuk display (XSS protection)
const safeHtml = escapeHtml(userInput);
```

### 5. Status Validation

```typescript
import { validateStatusTransition } from '@/utils/validators';

const result = validateStatusTransition(
  'Draft',
  'Disetujui',
  'staff'
);

if (!result.isValid) {
  console.log(result.message);
}
```

### 6. Schedule Validation

```typescript
import { validateScheduleAvailability } from '@/utils/validators';

const result = await validateScheduleAvailability(
  '2024-12-15',
  '10:00',
  'Di KUA'
);

if (!result.isValid) {
  console.log(result.message);
}
```

### 7. Feedback Validation

```typescript
import { validateFeedback } from '@/utils/validators';

const result = validateFeedback({
  pendaftaran_id: 1,
  jenis_feedback: 'Rating',
  rating: 5,
  judul: 'Pelayanan Sangat Baik',
  pesan: 'Terima kasih untuk pelayanan yang sangat baik.'
});
```

### 8. Authorization

```typescript
import { checkRoleAccess, useRoleGuard } from '@/utils/validators';

// Check access
const access = checkRoleAccess(userRole, ['staff', 'kepala_kua']);
if (!access.hasAccess) {
  console.log(access.message);
}

// Use in component
const hasAccess = useRoleGuard(['staff', 'kepala_kua']);
```

## 📝 Contoh Implementasi di Component

### Form Pendaftaran dengan Validasi

```typescript
'use client';

import { useState } from 'react';
import {
  validateCalonLakiLaki,
  validateCalonPerempuan,
  validateWaliNikah,
  validateLokasiNikah,
  validateScheduleAvailability
} from '@/utils/validators';
import { handleApiError } from '@/utils/errorHandler';
import { createSimpleMarriageRegistration } from '@/lib/simnikah-api';

export function RegistrationForm() {
  const [formData, setFormData] = useState({ /* ... */ });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: any = {};

    // Validasi calon laki-laki
    const calonLakiLakiValidation = validateCalonLakiLaki(formData.calon_laki_laki);
    if (!calonLakiLakiValidation.isValid) {
      newErrors.calon_laki_laki = calonLakiLakiValidation.errors;
    }

    // Validasi calon perempuan
    const calonPerempuanValidation = validateCalonPerempuan(formData.calon_perempuan);
    if (!calonPerempuanValidation.isValid) {
      newErrors.calon_perempuan = calonPerempuanValidation.errors;
    }

    // Validasi wali nikah
    const waliValidation = validateWaliNikah(formData.wali_nikah);
    if (!waliValidation.isValid) {
      newErrors.wali_nikah = waliValidation.errors;
    }

    // Validasi lokasi
    const lokasiValidation = validateLokasiNikah(formData.lokasi_nikah);
    if (!lokasiValidation.isValid) {
      newErrors.lokasi_nikah = lokasiValidation.errors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi client-side
    if (!validateForm()) {
      return;
    }

    // Validasi ketersediaan jadwal sebelum submit
    try {
      const scheduleValidation = await validateScheduleAvailability(
        formData.lokasi_nikah.tanggal_nikah,
        formData.lokasi_nikah.waktu_nikah,
        formData.lokasi_nikah.tempat_nikah
      );

      if (!scheduleValidation.isValid) {
        setErrors({
          ...errors,
          lokasi_nikah: {
            ...errors.lokasi_nikah,
            waktu_nikah: scheduleValidation.message
          }
        });
        return;
      }
    } catch (error) {
      toast.error('Gagal memvalidasi ketersediaan jadwal. Silakan coba lagi.');
      return;
    }

    // Submit ke API
    setLoading(true);
    try {
      const response = await createSimpleMarriageRegistration(formData);
      toast.success('Pendaftaran berhasil!');
      // Reset form atau redirect
    } catch (error) {
      const errorInfo = handleApiError(error);
      
      // Handle error dari backend
      if (errorInfo.type === 'validation' && errorInfo.field) {
        setErrors({
          ...errors,
          [errorInfo.field]: errorInfo.error
        });
      } else {
        toast.error(errorInfo.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields dengan error display */}
      {errors.calon_laki_laki?.nama_dan_bin && (
        <div className="error">{errors.calon_laki_laki.nama_dan_bin}</div>
      )}
      {/* ... */}
    </form>
  );
}
```

### Login Form dengan Validasi

```typescript
'use client';

import { useState } from 'react';
import { validateLogin } from '@/utils/validators';
import { handleApiError } from '@/utils/errorHandler';
import { login } from '@/lib/simnikah-api';

export function LoginForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi client-side
    const validation = validateLogin(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      const response = await login(formData);
      // Handle success
    } catch (error) {
      const errorInfo = handleApiError(error);
      if (errorInfo.type === 'validation') {
        setErrors({ [errorInfo.field || '']: errorInfo.error || errorInfo.message });
      } else {
        toast.error(errorInfo.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## ✅ Checklist Validasi Wajib

Sesuai dokumentasi backend, berikut checklist validasi yang **WAJIB** diimplementasikan:

### Form Pendaftaran
- [x] Validasi nama calon laki-laki (required, min 3, max 100, format "bin")
- [x] Validasi nama calon perempuan (required, min 3, max 100, format "binti")
- [x] Validasi umur (required, min 19 tahun, max 100)
- [x] Validasi wali nikah (required, format "bin", hubungan wali valid)
- [x] Validasi tanggal (required, format YYYY-MM-DD, tidak boleh masa lalu, bukan Minggu)
- [x] Validasi waktu (required, format HH:MM, 08:00-16:00, dalam time slots)
- [x] Validasi alamat (jika luar KUA: required, min 10, max 200)
- [x] Validasi kelurahan (jika luar KUA: required, dalam daftar valid)
- [x] Validasi ketersediaan slot sebelum submit

### Authentication
- [x] Validasi username (required, min 3, max 50, alphanumeric + underscore)
- [x] Validasi email (required, format email valid, max 100)
- [x] Validasi password (required, min 6 karakter)
- [x] Validasi nama (required, min 3, max 100)
- [x] Validasi role (required, dalam daftar valid)

### File Upload
- [x] Validasi file size (max 5MB)
- [x] Validasi file type (JPG, PNG, WEBP)
- [x] Validasi file extension

### Security
- [x] Sanitize semua input string
- [x] Escape HTML untuk display
- [x] Validasi role-based access
- [x] Validasi status transition

### Business Logic
- [x] Validasi ketersediaan jadwal real-time
- [x] Validasi status flow
- [x] Validasi feedback (rating 1-5, judul, pesan)

## 📊 Constants & Helpers

### Constants untuk Aturan Jam/Waktu

```typescript
import { 
  TIME_SLOTS,           // Array time slots tersedia
  CAPACITY,             // Kapasitas pernikahan
  STATUS_COUNTED_IN_QUOTA,  // Status yang dihitung dalam kuota
  VALID_KELURAHAN,      // Daftar kelurahan valid
  VALID_HUBUNGAN_WALI   // Daftar hubungan wali valid
} from '@/utils/constants';
```

### Helper Functions untuk Kapasitas

```typescript
import { 
  calculateSlotAvailability,  // Hitung ketersediaan slot
  isSlotAvailable,            // Check apakah slot tersedia
  getSlotUnavailableMessage   // Get error message jika tidak tersedia
} from '@/utils/helpers';
```

### Contoh Penggunaan

```typescript
import { calculateSlotAvailability, isSlotAvailable } from '@/utils/helpers';
import { CAPACITY } from '@/utils/constants';

// Hitung ketersediaan dari time slot response
const availability = calculateSlotAvailability(timeSlot);

// Check ketersediaan
if (isSlotAvailable(timeSlot, 'Di KUA')) {
  console.log(`Slot KUA tersedia: ${availability.kua.sisa_kuota}/${CAPACITY.KUA}`);
} else {
  console.log('Slot KUA sudah penuh');
}
```

## 📚 Referensi

- **Dokumentasi Backend:** `documentasi terbaru backend.md`
- **Frontend Implementation Guide:** `docs/FRONTEND_IMPLEMENTATION_GUIDE.md`
- **Alur Pendaftaran:** `docs/ALUR_PENDAFTARAN_DAN_JAM.md`
- **Parsing API Pengumuman:** `docs/PARSING_API_PENGUMUMAN_NIKAH.md`
- **Struktur Project:** `STRUKTUR_PROJECT.md`

