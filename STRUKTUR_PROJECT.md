# 📋 Dokumentasi Struktur Project KUA-KU (SimNikah)

## 🎯 Overview Project

**Nama Project:** KUA-KU (SimNikah)  
**Teknologi:** Next.js 15.2.3, React 18, TypeScript  
**Port Development:** 9002  
**Base API:** https://simnikah-api-production-5583.up.railway.app

Aplikasi web pendamping Simkah untuk pendataan & penjadwalan nikah di KUA Banjarmasin Utara.

---

## 📁 Struktur Folder Utama

```
KUA-KU/
├── public/                    # Static assets
│   ├── Kegiatan1.jpg         # Foto kegiatan
│   ├── Kegiatan2.jpg
│   ├── Kegiatan3.jpg
│   ├── logo-kemenag.png      # Logo Kemenag (pentagon emblem)
│   ├── ketuakua2.png         # Foto kepala KUA
│   └── ...
│
├── src/
│   ├── app/                   # Next.js App Router (Pages)
│   │   ├── layout.tsx        # Root layout dengan AuthProvider
│   │   ├── page.tsx          # Homepage (redirect admin, tampilkan untuk user_biasa)
│   │   ├── admin/            # Dashboard Admin
│   │   │   ├── layout.tsx    # Admin layout dengan sidebar
│   │   │   ├── page.tsx      # Dashboard utama admin
│   │   │   ├── staff/        # Dashboard Staff KUA
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   └── kepala/       # Dashboard Kepala KUA
│   │   │       └── page.tsx
│   │   ├── penghulu/         # Dashboard Penghulu
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── daftar-nikah/     # Form pendaftaran nikah
│   │   │   └── page.tsx
│   │   ├── pendaftaran/      # Status pendaftaran
│   │   │   └── status/
│   │   ├── login/            # Halaman login
│   │   ├── register/         # Halaman registrasi
│   │   └── ...
│   │
│   ├── components/           # Komponen React
│   │   ├── layout/           # Layout components
│   │   │   ├── AppHeader.tsx    # Header dengan logo, nav, profile
│   │   │   └── AppFooter.tsx
│   │   ├── kuaku/           # Komponen utama KUA
│   │   │   ├── HeroSection.tsx
│   │   │   ├── ServiceSection.tsx
│   │   │   ├── ContactInfo.tsx      # Info kontak & foto kegiatan
│   │   │   ├── MapPlaceholder.tsx   # Placeholder untuk foto kegiatan (1200x400)
│   │   │   ├── SimpleMarriageRegistrationForm.tsx  # Form pendaftaran dengan step indicators
│   │   │   └── ...
│   │   ├── admin/          # Komponen admin dashboard
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── RegistrationsTable.tsx
│   │   │   └── ...
│   │   ├── auth/           # Komponen autentikasi
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── shared/         # Komponen shared
│   │   │   ├── UserProfileMenu.tsx  # Profile menu dengan logout button
│   │   │   └── SectionWrapper.tsx
│   │   └── ui/             # shadcn/ui components
│   │
│   ├── context/            # React Context
│   │   └── AuthContext.tsx    # Authentication context dengan role management
│   │
│   ├── lib/                # Utilities & API
│   │   ├── simnikah-api.ts    # API service utama
│   │   ├── api.ts             # Axios instance
│   │   ├── utils.ts           # Utility functions
│   │   └── role-guards.ts     # Role-based access control
│   │
│   └── hooks/              # Custom hooks
│       └── use-toast.ts
│
└── [config files]
    ├── package.json
    ├── next.config.ts
    ├── tailwind.config.ts
    └── tsconfig.json
```

---

## 🔐 Sistem Autentikasi & Role

### Roles yang Tersedia:
```typescript
ADMIN_ROLES = ['staff', 'kepala_kua', 'administrator', 'penghulu']
USER_ROLES = ['user_biasa']  // Calon pengantin
```

### AuthContext Features:
- Token management (localStorage)
- User state management
- Role-based redirects
- Auto-login dari localStorage

### Redirect Logic:
- `user_biasa` → Homepage (bisa akses form pendaftaran)
- `staff` → `/admin/staff`
- `kepala_kua` → `/admin/kepala`
- `penghulu` → `/penghulu`
- `administrator` → `/admin`

---

## 🎨 Design System & Styling

### Color Scheme:
- **Primary Green:** `#1a4d3a` (hijau tua untuk readability orang tua)
- **Logo:** `/logo-kemenag.png` (pentagon emblem Kemenag)
- **Font:** Literata (serif) untuk headline & body

### Tailwind Config:
- Custom colors dengan CSS variables
- Dark mode support (class-based)
- Custom animations (fadeInFromBottom)

### UI Components:
- Menggunakan **shadcn/ui** (Radix UI + Tailwind)
- Lokasi: `src/components/ui/`
- Components: Button, Card, Dialog, Form, Input, Select, dll.

---

## 📝 Form Pendaftaran Nikah

### File Utama:
- `SimpleMarriageRegistrationForm.tsx` - Form sederhana dengan step indicators
- `SimpleMultiStepForm.tsx` - Form multi-step alternatif

### Step Indicators (01-04):
1. **Data Calon Suami** - Nama, Bin, Pendidikan, Umur
2. **Data Calon Istri** - Nama, Binti, Pendidikan, Umur
3. **Lokasi & Waktu Nikah** - Tempat, Tanggal, Waktu, Alamat (jika luar KUA)
4. **Data Wali Nikah** - Nama, Bin, Hubungan

### Step Indicator Logic:
- **Hijau** (`bg-green-600`) = Step sudah terisi lengkap
- **Biru** (`bg-blue-600`) = Step masih kosong/belum lengkap
- **Bentuk:** Bulat sempurna (48px × 48px)
- **Icon:** Check mark (✓) jika completed, angka (01-04) jika belum

---

## 🖼️ Assets & Images

### Lokasi: `public/`

**Logo:**
- `logo-kemenag.png` - Logo Kemenag (pentagon emblem) - **DIGUNAKAN DI HEADER**

**Foto Kegiatan:**
- `Kegiatan1.jpg` - Foto kegiatan 1
- `Kegiatan2.jpg` - Foto kegiatan 2
- `Kegiatan3.jpg` - Foto kegiatan 3
- **Lokasi Display:** `MapPlaceholder.tsx` (grid 3 kolom, 1200x400px)

**Lainnya:**
- `ketuakua2.png` - Foto kepala KUA (digunakan di HeroSection)

---

## 🧩 Komponen Penting

### 1. AppHeader (`src/components/layout/AppHeader.tsx`)
**Fitur:**
- Logo Kemenag di kiri
- Navigation menu (Layanan, Daftar Nikah, Kontak, Lokasi)
- Search bar (jika user login)
- Notification bell
- UserProfileMenu (profile avatar + logout button)

**Logo Path:** `/logo-kemenag.png`

### 2. UserProfileMenu (`src/components/shared/UserProfileMenu.tsx`)
**Fitur:**
- Avatar dengan initial user
- Dropdown menu dengan:
  - Profil Saya
  - Status Pendaftaran (untuk user_biasa)
  - Logout button
- **Logout button** di samping kanan avatar (bukan di dropdown)

### 3. ContactInfo (`src/components/kuaku/ContactInfo.tsx`)
**Fitur:**
- Detail Kontak (Alamat, Telepon, Email)
- Jam Operasional
- **TIDAK ADA** foto kegiatan (sudah dipindah ke MapPlaceholder)

### 4. MapPlaceholder (`src/components/kuaku/MapPlaceholder.tsx`)
**Fitur:**
- Menampilkan 3 foto kegiatan dalam grid (Kegiatan1.jpg, Kegiatan2.jpg, Kegiatan3.jpg)
- Ukuran: 1200x400px total (400px per foto)
- Section title: "Temukan Kami"

### 5. SimpleMarriageRegistrationForm (`src/components/kuaku/SimpleMarriageRegistrationForm.tsx`)
**Fitur:**
- Form pendaftaran dengan 4 step
- Step indicators dengan warna dinamis (hijau/biru)
- Validasi dengan react-hook-form + zod
- Calendar untuk pilih tanggal
- Time slot selector
- Address selector untuk "Di Luar KUA"

---

## 🔌 API Integration

### Base API:
- **File:** `src/lib/simnikah-api.ts`
- **Base URL:** `https://simnikah-api-production-5583.up.railway.app`
- **Axios Instance:** `src/lib/api.ts`

### Endpoints Penting:
- `POST /auth/register` - Registrasi user
- `POST /auth/login` - Login
- `GET /auth/profile` - Get profile
- `POST /simple-marriage-registrations` - Buat pendaftaran nikah
- `GET /calendar/availability` - Ketersediaan kalender
- `GET /time-slots` - Slot waktu tersedia

---

## 🛠️ Development Commands

```bash
# Development server (port 9002)
npm run dev

# Build production
npm run build

# Start production
npm start

# Type checking
npm run typecheck

# Linting
npm run lint
```

---

## 📋 Checklist untuk Prompt Perbaikan

Saat memberikan prompt perbaikan, sertakan informasi berikut:

### 1. Lokasi File
- ✅ Path lengkap file yang akan diubah
- ✅ Atau nama komponen/page yang terpengaruh

### 2. Konteks Perubahan
- ✅ Apa yang ingin diubah (UI, logic, data, dll)
- ✅ Bagian mana yang terpengaruh (header, form, dashboard, dll)

### 3. Detail Spesifik
- ✅ Warna, ukuran, posisi (untuk UI changes)
- ✅ Validasi, error handling (untuk logic changes)
- ✅ API endpoint, data structure (untuk API changes)

### 4. Role & Access
- ✅ Role mana yang terpengaruh (user_biasa, staff, kepala_kua, penghulu)
- ✅ Apakah perlu permission check?

### 5. Dependencies
- ✅ Apakah perlu install package baru?
- ✅ Apakah ada file lain yang perlu diubah?

---

## 🎯 Common Patterns

### 1. Menambah Route Baru
```typescript
// src/app/nama-route/page.tsx
"use client";
export default function NamaPage() {
  // ...
}
```

### 2. Menambah Komponen Baru
```typescript
// src/components/nama-folder/NamaComponent.tsx
"use client";
export function NamaComponent() {
  // ...
}
```

### 3. Menggunakan Auth Context
```typescript
import { useAuth } from '@/context/AuthContext';

const { user, userRole, token, logout } = useAuth();
```

### 4. Role Guard
```typescript
import { ADMIN_ROLES } from '@/context/AuthContext';

if (!ADMIN_ROLES.includes(userRole)) {
  router.push('/login');
}
```

### 5. API Call
```typescript
import { createSimpleMarriageRegistration } from '@/lib/simnikah-api';

const response = await createSimpleMarriageRegistration(data);
```

---

## 🐛 Common Issues & Solutions

### Logo Tidak Muncul
- ✅ Pastikan file ada di `public/logo-kemenag.png`
- ✅ Gunakan path `/logo-kemenag.png` (dengan leading slash)
- ✅ Tambahkan `unoptimized` prop jika perlu
- ✅ Hard refresh browser (Ctrl+F5)

### Step Indicator Tidak Update
- ✅ Pastikan form.watch() untuk semua field step
- ✅ Check logic `isStepXComplete` dengan benar
- ✅ Pastikan semua required field terisi

### Redirect Loop
- ✅ Check AuthContext loading state
- ✅ Pastikan role check di useEffect dengan dependency yang benar
- ✅ Check localStorage untuk data korup

---

## 📚 Referensi File Penting

1. **Auth:** `src/context/AuthContext.tsx`
2. **API:** `src/lib/simnikah-api.ts`
3. **Header:** `src/components/layout/AppHeader.tsx`
4. **Form:** `src/components/kuaku/SimpleMarriageRegistrationForm.tsx`
5. **Homepage:** `src/app/page.tsx`
6. **Config:** `next.config.ts`, `tailwind.config.ts`

---

## 💡 Tips untuk Prompt yang Efektif

1. **Spesifik:** "Ubah warna tombol di header" → "Ubah warna tombol logout di UserProfileMenu menjadi merah"
2. **Lokasi Jelas:** Sertakan path file atau nama komponen
3. **Konteks:** Jelaskan apa yang ingin dicapai, bukan hanya apa yang salah
4. **Contoh:** Berikan contoh kode atau screenshot jika ada
5. **Testing:** Sebutkan role/user yang perlu ditest

---

**Last Updated:** 2025-01-XX  
**Maintainer:** Development Team KUA Banjarmasin Utara

