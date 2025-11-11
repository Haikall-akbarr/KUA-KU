# 📋 Staff Verification dengan Notifikasi - Dokumentasi Implementasi

**Version:** 1.0  
**Last Updated:** 11 November 2025  
**API Base URL:** `https://simnikah-api-production.up.railway.app`

---

## 📚 Daftar Isi

1. [Overview](#overview)
2. [API Endpoints](#api-endpoints)
3. [Component Implementation](#component-implementation)
4. [Service Implementation](#service-implementation)
5. [Notification System](#notification-system)
6. [Integration Guide](#integration-guide)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Sistem verifikasi staff KUA terdiri dari **2 tahap verifikasi**:

1. **Verifikasi Formulir Online** - Staff memverifikasi data yang diisi user secara online
2. **Verifikasi Berkas Fisik** - Staff memverifikasi dokumen fisik yang diserahkan user ke KUA

Setiap tahap verifikasi akan **otomatis mengirim notifikasi** ke user dengan informasi status pendaftaran mereka.

### Flow Diagram

```
User Submit Form
      ↓
Status: "Menunggu Verifikasi"
      ↓
Staff Verifikasi Formulir Online
      ├─ APPROVED → Status: "Menunggu Pengumpulan Berkas" + Notifikasi ✅
      └─ REJECTED → Status: "Ditolak" + Notifikasi ❌
      ↓
User Datang ke KUA (Berkas Diterima)
      ↓
Status: "Berkas Diterima"
      ↓
Staff Verifikasi Berkas Fisik
      ├─ APPROVED → Status: "Berkas Diterima" + Notifikasi ✅
      └─ REJECTED → Status: "Berkas Ditolak" + Notifikasi ❌
```

---

## 📡 API Endpoints

### 3.3 Verify Formulir (Online)

**Endpoint:** `POST /simnikah/staff/verify-formulir/:id`  
**Auth Required:** Yes  
**Role:** `staff`

**Request Body:**
```json
{
  "approved": true,
  "catatan": "Formulir sudah lengkap dan sesuai"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Formulir berhasil diverifikasi",
  "data": {
    "pendaftaran_id": 1,
    "status_baru": "Menunggu Pengumpulan Berkas",
    "verified_by": "USR1730268000",
    "verified_at": "2025-10-30T14:30:00Z"
  }
}
```

**If Rejected (approved: false):**
```json
{
  "success": true,
  "message": "Formulir ditolak",
  "data": {
    "pendaftaran_id": 1,
    "status_baru": "Ditolak",
    "catatan": "Data NIK tidak valid, silakan perbaiki"
  }
}
```

---

### 3.4 Verify Berkas (Fisik/Offline)

**Endpoint:** `POST /simnikah/staff/verify-berkas/:id`  
**Auth Required:** Yes  
**Role:** `staff`

**Request Body:**
```json
{
  "approved": true,
  "catatan": "Berkas lengkap dan sesuai dengan data online"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Berkas berhasil diverifikasi",
  "data": {
    "pendaftaran_id": 1,
    "status_baru": "Berkas Diterima",
    "verified_by": "USR1730268000",
    "verified_at": "2025-10-31T10:00:00Z"
  }
}
```

**If Rejected (approved: false):**
```json
{
  "success": true,
  "message": "Berkas ditolak",
  "data": {
    "pendaftaran_id": 1,
    "status_baru": "Berkas Ditolak",
    "catatan": "Dokumen tidak lengkap"
  }
}
```

---

## 🔧 Component Implementation

### StaffVerificationPanel Component

File: `src/components/admin/StaffVerificationPanel.tsx`

**Props:**
```typescript
interface StaffVerificationPanelProps {
  registrationId: string;           // ID registrasi dari database
  registrationNumber: string;       // No. pendaftaran (REG/2025/001)
  groomName: string;                // Nama calon suami
  brideName: string;                // Nama calon istri
  currentStatus: string;            // Status saat ini
  verificationStatus?: {            // Status verifikasi
    formulir_online?: boolean;
    berkas_fisik?: boolean;
  };
}
```

**Usage:**
```tsx
import { StaffVerificationPanel } from '@/components/admin/StaffVerificationPanel';

export default function StaffPage() {
  return (
    <StaffVerificationPanel
      registrationId="1"
      registrationNumber="REG/2025/001"
      groomName="Ahmad Fauzan"
      brideName="Siti Aminah"
      currentStatus="Menunggu Verifikasi"
      verificationStatus={{
        formulir_online: false,
        berkas_fisik: false
      }}
    />
  );
}
```

**Features:**
- ✅ 2-stage verification interface
- ✅ Dialog untuk input catatan verifikasi
- ✅ Real-time status updates
- ✅ Automatic notification creation
- ✅ Error handling & loading states
- ✅ Visual status indicators

---

## 📚 Service Implementation

File: `src/lib/staff-verification-service.ts`

### Functions Available

#### 1. verifyFormulirOnline()
Mengirim verifikasi formulir online ke API

```typescript
await verifyFormulirOnline(registrationId, {
  approved: true,
  catatan: "Formulir sudah lengkap"
});
```

#### 2. verifyBerkasPhysical()
Mengirim verifikasi berkas fisik ke API

```typescript
await verifyBerkasPhysical(registrationId, {
  approved: true,
  catatan: "Berkas lengkap dan valid"
});
```

#### 3. createUserNotification()
Membuat notifikasi untuk user

```typescript
createUserNotification(
  userId,
  "✅ Formulir Diverifikasi",
  "Formulir Anda telah disetujui...",
  "Success",
  registrationId
);
```

#### 4. updateRegistrationStatus()
Update status registrasi di localStorage

```typescript
updateRegistrationStatus(registrationId, "Berkas Diterima");
```

#### 5. handleFormulirVerification()
Handle verifikasi formulir lengkap (API + Notifikasi)

```typescript
await handleFormulirVerification(
  registrationId,
  userId,
  groomName,
  brideName,
  true,  // approved
  "Formulir sudah lengkap"
);
```

#### 6. handleBerkasVerification()
Handle verifikasi berkas lengkap (API + Notifikasi)

```typescript
await handleBerkasVerification(
  registrationId,
  userId,
  groomName,
  brideName,
  false,  // approved
  "Dokumen tidak lengkap"
);
```

---

## 🔔 Notification System

### Notifikasi Otomatis yang Dikirim

#### 1. Verifikasi Formulir - APPROVED
**Type:** Success  
**Title:** ✅ Formulir Diverifikasi  
**Message:**
```
Formulir pendaftaran nikah Anda untuk {groomName} & {brideName} 
telah diverifikasi oleh staff KUA. Silakan datang ke KUA untuk 
menyerahkan berkas fisik.
```

#### 2. Verifikasi Formulir - REJECTED
**Type:** Error  
**Title:** ❌ Formulir Ditolak  
**Message:**
```
Formulir pendaftaran Anda ditolak. Silakan hubungi KUA untuk 
informasi lebih lanjut.

Catatan: {catatan staff}
```

#### 3. Verifikasi Berkas - APPROVED
**Type:** Success  
**Title:** ✅ Berkas Fisik Diterima  
**Message:**
```
Berkas fisik Anda untuk {groomName} & {brideName} telah diterima 
dan diverifikasi. Pendaftaran Anda sedang dalam proses berikutnya.

Status: {newStatus}
```

#### 4. Verifikasi Berkas - REJECTED
**Type:** Error  
**Title:** ❌ Berkas Fisik Ditolak  
**Message:**
```
Berkas fisik Anda ditolak. Silakan hubungi KUA untuk informasi 
lebih lanjut.

Catatan: {catatan staff}
```

### Data Struktur Notifikasi

```typescript
interface NotificationData {
  id: string;                    // notif_1234567890
  judul: string;                 // ✅ Formulir Diverifikasi
  pesan: string;                 // Pesan lengkap
  tipe: 'Success' | 'Error' | 'Warning' | 'Info';
  status_baca: 'Belum Dibaca' | 'Sudah Dibaca';
  link: string;                  // /profile/registration-status/1
  created_at: string;            // ISO 8601 datetime
  registration_id: string;       // ID registrasi
}
```

### LocalStorage Format

```javascript
// Notifications disimpan dengan key: notifications_{userId}
localStorage.getItem('notifications_USER123')
// Returns: JSON array of NotificationData

// Verification data disimpan dengan key: verification_{registrationId}
localStorage.getItem('verification_1')
// Returns:
{
  "formulir_online": {
    "approved": true,
    "verified_at": "2025-10-30T14:30:00Z",
    "verified_by": "USR1730268000",
    "catatan": "Formulir sudah lengkap"
  },
  "berkas_fisik": {
    "approved": true,
    "verified_at": "2025-10-31T10:00:00Z",
    "verified_by": "USR1730268000",
    "catatan": "Berkas lengkap"
  }
}
```

---

## 🚀 Integration Guide

### 1. Integrasi ke Registrations Page

```tsx
// src/app/admin/registrations/page.tsx
import { StaffVerificationPanel } from '@/components/admin/StaffVerificationPanel';

export default function RegistrationsPage() {
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  return (
    <div className="space-y-6">
      {selectedRegistration && (
        <StaffVerificationPanel
          registrationId={selectedRegistration.id}
          registrationNumber={selectedRegistration.nomor_pendaftaran}
          groomName={selectedRegistration.groomName}
          brideName={selectedRegistration.brideName}
          currentStatus={selectedRegistration.status}
          verificationStatus={getVerificationStatus(selectedRegistration.id)}
        />
      )}
      
      {/* Registrations table */}
    </div>
  );
}
```

### 2. Integrasi Notification Badge di Sidebar

```tsx
// src/components/admin/AdminSidebar.tsx
import { getNotificationStats } from '@/lib/staff-verification-service';
import { Badge } from '@/components/ui/badge';

export function AdminSidebar() {
  const [notifCount, setNotifCount] = useState(0);
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const stats = getNotificationStats(userId);
    setNotifCount(stats.unread);
  }, [userId]);

  return (
    <aside>
      <nav>
        <li>
          <a href="/admin/notifications">
            Notifikasi
            {notifCount > 0 && (
              <Badge className="ml-2">{notifCount}</Badge>
            )}
          </a>
        </li>
      </nav>
    </aside>
  );
}
```

### 3. Integrasi Notification Display

```tsx
// src/app/admin/notifications/page.tsx
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const notifs = JSON.parse(
      localStorage.getItem(`notifications_${userId}`) || '[]'
    );
    setNotifications(notifs);
  }, [userId]);

  return (
    <div className="space-y-4">
      {notifications.map((notif) => (
        <div key={notif.id} className="border p-4 rounded">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold">{notif.judul}</h3>
              <p className="text-sm text-gray-600 mt-1">{notif.pesan}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(notif.created_at).toLocaleString('id-ID')}
              </p>
            </div>
            <Badge 
              variant={notif.tipe === 'Success' ? 'default' : 'destructive'}
            >
              {notif.status_baca}
            </Badge>
          </div>
          <Button className="mt-3" variant="outline" size="sm">
            Lihat Detail
          </Button>
        </div>
      ))}
    </div>
  );
}
```

---

## 📊 Testing Guide

### Test 1: Verifikasi Formulir - Approved

1. Login sebagai staff
2. Buka admin panel → Registrations
3. Pilih registrasi dengan status "Menunggu Verifikasi"
4. Klik "Verifikasi Formulir"
5. Isi catatan (opsional)
6. Klik "Setujui"
7. Verifikasi:
   - ✅ Status berubah menjadi "Menunggu Pengumpulan Berkas"
   - ✅ Notifikasi masuk ke user (notifications_USER123)
   - ✅ Verification data tersimpan di localStorage

### Test 2: Verifikasi Formulir - Rejected

1. Repeat step 1-5 dari Test 1
2. Klik "Tolak"
3. Verifikasi:
   - ✅ Status berubah menjadi "Ditolak"
   - ✅ Error notification dikirim ke user
   - ✅ Catatan ditampilkan di notifikasi

### Test 3: Verifikasi Berkas - Approved

1. Pastikan formulir sudah disetujui (Test 1)
2. Klik "Verifikasi Berkas Fisik"
3. Isi catatan
4. Klik "Terima Berkas"
5. Verifikasi:
   - ✅ Button "Terima Berkas" aktif hanya setelah formulir disetujui
   - ✅ Status berubah menjadi "Berkas Diterima"
   - ✅ Success notification dikirim

### Test 4: Check Notification Count

```javascript
// Buka browser console
const userId = localStorage.getItem('user_id');
const notifs = JSON.parse(localStorage.getItem(`notifications_${userId}`) || '[]');
console.log('Total notifications:', notifs.length);
console.log('Unread:', notifs.filter(n => n.status_baca === 'Belum Dibaca').length);
```

---

## 🔧 Troubleshooting

### Issue 1: "Token tidak ditemukan"
**Penyebab:** User belum login  
**Solusi:** Pastikan login berhasil dan token tersimpan di localStorage

```javascript
// Check token
console.log(localStorage.getItem('token'));
```

### Issue 2: Notifikasi tidak muncul
**Penyebab:** userId tidak tersimpan atau salah  
**Solusi:** Verifikasi user_id di localStorage

```javascript
// Check user_id
console.log(localStorage.getItem('user_id'));
// Jika kosong, set dari user data
const user = JSON.parse(localStorage.getItem('user'));
localStorage.setItem('user_id', user.user_id);
```

### Issue 3: API Error 401
**Penyebab:** Token expired atau invalid  
**Solusi:** Clear localStorage dan login ulang

```javascript
localStorage.clear();
// Redirect to login
window.location.href = '/login';
```

### Issue 4: Data tidak ter-update
**Penyebab:** Page cache  
**Solusi:** Hard refresh (Ctrl+Shift+R) atau clear cache

---

## 📝 Checklist Implementasi

- [ ] Install/Update StaffVerificationPanel component
- [ ] Install staff-verification-service
- [ ] Update RegistrationsTable untuk menampilkan verification panel
- [ ] Add notification display page
- [ ] Update AdminSidebar dengan notification badge
- [ ] Test all verification flows
- [ ] Verify notifications created correctly
- [ ] Setup notification polling (optional)
- [ ] Document API endpoint di team
- [ ] Deploy ke production

---

## 🎯 Next Steps

1. **Real-time Notifications** - Implementasi WebSocket untuk notifikasi real-time
2. **Email Notifications** - Kirim email ke user saat verifikasi
3. **SMS Notifications** - Kirim SMS reminder
4. **Notification History** - Archive notifikasi lama
5. **Advanced Filtering** - Filter notifications by type/status

---

Made with ❤️ for SimNikah Team