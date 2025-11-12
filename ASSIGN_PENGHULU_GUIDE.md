# 📋 Panduan Lengkap: Assign Penghulu Feature

## 🎯 Overview

Fitur "Assign Penghulu" memungkinkan Kepala KUA untuk menugaskan pendaftaran pernikahan yang sudah diverifikasi kepada penghulu yang tersedia. Setelah assignment, data akan muncul di menu Verifikasi Penghulu untuk verifikasi lebih lanjut.

## 🔄 Flow Lengkap

### 1. **Kepala KUA - Dashboard**
```
Pendaftaran Nikah → Status: "Disetujui" → Assign Penghulu
```

**Lokasi**: `/admin/kepala` → Tab "Penugasan Pending"

**Data yang ditampilkan**:
- ID Pendaftaran
- Nama Calon Suami
- Nama Calon Istri
- Tanggal Nikah
- Tombol Aksi: "Tugaskan Penghulu"

### 2. **Kepala KUA - Assign Dialog**
Saat kepala KUA klik tombol "Tugaskan Penghulu":

```tsx
Dialog terbuka → Pilih Penghulu dari list → Klik tombol penghulu
```

**Data yang dikirim ke localStorage**:
```javascript
{
  ...registrationData,
  penghulu: "Nama Penghulu",
  penghuluId: "uuid-penghulu",  // 🔑 KUNCI untuk matching
  status: "Menunggu Verifikasi Penghulu", // Status berubah
  assignedAt: "2025-11-12T10:30:00.000Z"
}
```

### 3. **localStorage State**
Setelah assignment, data disimpan di beberapa tempat:

#### a) **marriageRegistrations** (Main storage)
```javascript
{
  id: "reg-123",
  groomName: "Ahmad",
  brideName: "Siti",
  status: "Menunggu Verifikasi Penghulu",
  penghuluId: "penghulu-uuid-456", // Penghulu yang ditugaskan
  penghulu: "Bapak Siddiq", // Nama penghulu
  weddingDate: "2025-11-20",
  // ... data lainnya
}
```

#### b) **penghulu_notifications** (Notifikasi untuk penghulu)
```javascript
{
  id: "penghulu_notif_1731318000000",
  title: "Penugasan Baru",
  description: "Anda ditugaskan untuk memverifikasi acara nikah Ahmad & Siti pada 20 Novemember 2025",
  type: "info",
  read: false,
  registrationId: "reg-123",
  createdAt: "2025-11-12T10:30:00.000Z"
}
```

### 4. **Penghulu Login**
Penghulu login dengan akun mereka. Flow:

1. Penghulu masuk ke halaman login
2. Login dengan username/password penghulu
3. Data penghulu disimpan di **penghulu_profile**:
```javascript
{
  id: "penghulu-uuid-456",
  nama_lengkap: "Bapak Siddiq",
  nip: "1234567890",
  status: "Aktif",
  // ... data penghulu lainnya
}
```

### 5. **Penghulu Dashboard - Verifikasi Menu**
Penghulu membuka `/penghulu/verifikasi`

**Proses**:
1. System load `marriageRegistrations` dari localStorage
2. Filter: registrations yang `penghuluId === penghulu_profile.id`
3. Status: "Menunggu Verifikasi Penghulu" → Tampil di card "Menunggu Verifikasi"
4. Penghulu bisa Setujui atau Tolak

**Matching Logic** (di `getAssignedRegistrations`):
```typescript
const assignedRegs = allRegs.filter((reg: any) => {
  const penghuluMatch = reg.penghuluId && (
    currentPenghulu?.id 
      ? reg.penghuluId === currentPenghulu.id || reg.penghuluId === currentPenghulu.id.toString()
      : reg.penghuluId === user.id || reg.penghuluId === user.id?.toString()
  );
  return penghuluMatch;
});
```

**Penjelasan**:
- Check `reg.penghuluId` ada
- Cek kesamaan dengan `currentPenghulu.id` (dari penghulu_profile)
- Atau fallback ke `user.id` dari localStorage

## 📊 Data Structure Reference

### Marriage Registration (Pendaftaran Nikah)
```typescript
{
  id: string;                  // Unique ID
  groomName: string;           // Nama calon suami
  brideName: string;           // Nama calon istri
  groomNik: string;            // NIK suami
  brideNik: string;            // NIK istri
  weddingDate: string;         // Tanggal pernikahan (ISO)
  weddingTime: string;         // Jam pernikahan
  weddingLocation: string;     // Lokasi pernikahan
  status: string;              // Status pendaftaran
  penghuluId?: string;         // 🔑 ID penghulu yang ditugaskan
  penghulu?: string;           // Nama penghulu
  assignedAt?: string;         // Tanggal assignment
}
```

### Penghulu Profile
```typescript
{
  id: number | string;         // 🔑 Harus match dengan penghuluId
  nama_lengkap: string;
  nip: string;
  status: string;
  jumlah_nikah: number;
  rating: number;
  email: string;
  no_hp: string;
  alamat?: string;
}
```

## ✅ Checklist - Pastikan Semua Langkah Bekerja

### Kepala KUA Side:
- [ ] Buka `/admin/kepala`
- [ ] Tab "Penugasan Pending" menampilkan pendaftaran dengan status "Disetujui"
- [ ] Klik "Tugaskan Penghulu" → Dialog terbuka
- [ ] Pilih penghulu dari list
- [ ] Klik tombol penghulu
- [ ] Alert: "✅ Penghulu XXX berhasil ditugaskan!"
- [ ] Page refresh otomatis
- [ ] Pendaftaran hilang dari "Penugasan Pending" (sudah di-assign)
- [ ] Check localStorage: `marriageRegistrations` ada `penghuluId`

### Penghulu Side:
- [ ] Buka dashboard penghulu atau refresh
- [ ] Check `/penghulu/verifikasi` 
- [ ] Data assignment muncul di card "Menunggu Verifikasi"
- [ ] Lihat detail: nomor pendaftaran, nama calon, tanggal nikah
- [ ] Tombol "Setujui" atau "Tolak" berfungsi

## 🐛 Troubleshooting

### Masalah: Data tidak muncul di Penghulu Verifikasi

**Penyebab 1**: `penghuluId` tidak cocok
- [ ] Check localStorage `marriageRegistrations`: ada field `penghuluId`?
- [ ] Check localStorage `penghulu_profile`: ada field `id`?
- [ ] Pastikan nilai sama (UUID atau number yang sama)

**Penyebab 2**: Status tidak berubah
- [ ] Check status registration: harus "Menunggu Verifikasi Penghulu"
- [ ] Bukan "Disetujui" atau status lain

**Penyebab 3**: Penghulu belum login
- [ ] `penghulu_profile` belum ada di localStorage
- [ ] Penghulu harus login dulu supaya profil tersimpan

**Debug Steps**:
```javascript
// Di browser console saat penghulu dashboard
const regs = JSON.parse(localStorage.getItem('marriageRegistrations') || '[]');
const penghulu = JSON.parse(localStorage.getItem('penghulu_profile') || '{}');
console.log('Penghulu ID:', penghulu.id);
console.log('All registrations with penghuluId:', regs.filter(r => r.penghuluId));
console.log('Assigned to this penghulu:', regs.filter(r => r.penghuluId === penghulu.id));
```

## 📁 File yang Terlibat

| File | Role | Lokasi |
|------|------|--------|
| `PendingAssignmentsTable.tsx` | UI untuk assign di kepala KUA | `/src/components/admin/kepala/` |
| `/admin/kepala/page.tsx` | Dashboard kepala KUA | `/src/app/admin/kepala/` |
| `/penghulu/verifikasi/page.tsx` | Dashboard verifikasi penghulu | `/src/app/penghulu/verifikasi/` |
| `penghulu-service.ts` | Business logic verifikasi | `/src/lib/` |

## 🔌 API Endpoints (untuk integrasi real API nanti)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/simnikah/registrations/assign-penghulu/:id` | POST | Assign penghulu ke registrasi |
| `/simnikah/penghulu/assigned-registrations` | GET | Get registrasi yang di-assign ke penghulu |
| `/simnikah/penghulu/verify-documents/:id` | POST | Submit verifikasi dokumen |

## 🎯 Testing Scenarios

### Skenario 1: Happy Path (Berhasil Assign)
1. Kepala KUA buka dashboard
2. Lihat registrasi di "Penugasan Pending"
3. Klik "Tugaskan Penghulu"
4. Pilih penghulu
5. Alert "Berhasil"
6. Refresh otomatis
7. **Expected**: Registrasi hilang dari "Penugasan Pending", muncul di verifikasi penghulu

### Skenario 2: Multiple Penghulu
1. Assign reg-1 ke Penghulu A
2. Assign reg-2 ke Penghulu B
3. Penghulu A login → lihat hanya reg-1
4. Penghulu B login → lihat hanya reg-2
5. **Expected**: Matching sempurna, tidak ada data tertukar

### Skenario 3: Offline Mode
1. Assign registrasi
2. Close browser (simulate offline)
3. Penghulu buka tanpa internet
4. **Expected**: Data cached still available

## 📝 Notes

- Semua data disimpan di **localStorage** (tidak ada backend API real)
- ID Penghulu harus **unik** dan **konsisten**
- Status berubah otomatis saat assignment: "Disetujui" → "Menunggu Verifikasi Penghulu"
- Setiap assignment membuat **notifikasi** untuk penghulu

---

**Last Updated**: November 12, 2025  
**Version**: 1.0  
**Status**: ✅ Complete & Ready for Testing
