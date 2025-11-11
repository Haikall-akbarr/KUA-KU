# Penghulu Dashboard Documentation

## Overview

Penghulu Dashboard adalah modul khusus untuk mengelola tugas penghulu dalam sistem informasi nikah. Penghulu dapat melihat jadwal akad, memverifikasi dokumen, dan mengelola profil mereka.

## Fitur Utama

### 1. Dashboard Utama (`/penghulu`)
- **Statistik Cepat**: Status, Total Nikah, Rating, Terjadwalkan
- **Tabs Navigation**:
  - **Jadwal**: Daftar jadwal akad nikah dengan kapasitas
  - **Profil**: Informasi lengkap penghulu
  - **Tugas**: Daftar tugas verifikasi dokumen

**Komponen**: `src/app/penghulu/page.tsx`

**Props/Interface**: Menggunakan data dari API dan localStorage
```typescript
interface AssignedRegistration {
  id: string;
  nomor_pendaftaran: string;
  status_pendaftaran: string;
  tanggal_nikah: string;
  waktu_nikah: string;
  tempat_nikah: string;
  calon_suami: { nama_lengkap: string; nik: string }
  calon_istri: { nama_lengkap: string; nik: string }
}

interface PenguluData {
  id: number;
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

### 2. Layout (`/penghulu/layout.tsx`)
- **Sidebar Navigation** dengan menu:
  - Dashboard
  - Jadwal Nikah
  - Verifikasi Dokumen
  - Profil
- **Top Bar** dengan notifikasi dan user menu
- **Role-based Access Control**: Hanya penghulu yang bisa akses
- **Logout Functionality**

**Fitur**:
- Sidebar collapse/expand
- Notification badge
- User avatar
- Logout dengan clear localStorage

### 3. Jadwal Nikah (`/penghulu/jadwal`)
**Endpoint API**: `GET /simnikah/penghulu-jadwal/:tanggal`

**Fitur**:
- Date navigation (Sebelumnya, Hari Ini, Selanjutnya)
- Kapasitas summary dengan progress bar
- Utilization indicator (Tersedia/Padat/Penuh)
- Detail sesi dengan waktu mulai/selesai
- Offline mode support

**Komponen**: `src/app/penghulu/jadwal/page.tsx`

**Data Structure**:
```typescript
interface PenguluSchedule {
  id: string;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string;
  jumlah_pernikahan: number;
  kapasitas: number;
  lokasi?: string;
}
```

### 4. Verifikasi Dokumen (`/penghulu/verifikasi`)
**Endpoint API**: 
- `GET /simnikah/penghulu/assigned-registrations`
- `POST /simnikah/penghulu/verify-documents/:id`

**Fitur**:
- **Status Tabs**:
  - Menunggu Verifikasi (pending)
  - Telah Disetujui (approved)
  - Ditolak (rejected)
- **Detail Registration**: Nama calon suami/istri, NIK, tanggal nikah, lokasi
- **Action Buttons**:
  - **Setujui**: Approval dialog confirmation
  - **Tolak**: Rejection dialog dengan catatan wajib
- **Automatic Notifications**: Created after verification
- **Status Update**: Automatically update to "Menunggu Bimbingan" or "Penolakan Dokumen"

**Komponen**: `src/app/penghulu/verifikasi/page.tsx`

**Workflow**:
1. Load assigned registrations dengan status "Menunggu Verifikasi Penghulu"
2. Display detail calon pengantin dan dokumen
3. Penghulu pilih Setujui atau Tolak
4. Dialog confirmation dengan detail
5. API call to verify-documents endpoint
6. Update status lokal dan create notification
7. Show approved/rejected lists

### 5. Profil Penghulu (`/penghulu/profil`)
**Fitur**:
- **View Mode**:
  - Profile card dengan avatar
  - NIP dan status
  - Statistics: Total nikah, Rating dengan stars
  - Contact info: Email, Phone, Address
- **Edit Mode**:
  - Edit Email, Phone, Address
  - Save to localStorage dan sync ke API
  - Cancel button untuk discard changes
- **Data Persistence**: localStorage + API sync

**Komponen**: `src/app/penghulu/profil/page.tsx`

**Editable Fields**:
- Email (text input)
- Nomor HP (tel input)
- Alamat (textarea)

## Service Layer

**File**: `src/lib/penghulu-service.ts`

### API Functions

#### 1. getAssignedRegistrations()
```typescript
export const getAssignedRegistrations = async(): Promise<AssignedRegistration[]>
```
- GET `/simnikah/penghulu/assigned-registrations`
- Returns list of registrations assigned to penghulu
- Error handling dengan fallback ke cache

#### 2. getPenguluSchedule(tanggal: string)
```typescript
export const getPenguluSchedule = async(tanggal: string): Promise<PenguluSchedule[]>
```
- GET `/simnikah/penghulu-jadwal/:tanggal`
- Returns schedule for specific date
- Cache support per tanggal

#### 3. verifyDocuments(registrationId, status, catatan?)
```typescript
export const verifyDocuments = async(
  registrationId: string,
  status: 'approved' | 'rejected',
  catatan?: string
): Promise<VerificationResult>
```
- POST `/simnikah/penghulu/verify-documents/:id`
- Payload: `{ status_verifikasi, catatan }`
- Returns verification result

### Data Management Functions

#### Notification Management
```typescript
createPenguluNotification(type, message)  // Create notification
getPenguluNotifications()                  // Get all notifications
clearPenguluNotifications()                // Clear all
```

#### Verification Workflow
```typescript
completeVerification(registrationId, nomor_pendaftaran, status, catatan?)
// Complete verification dengan auto-notification dan status update
```

#### Caching Functions
```typescript
cacheAssignedRegistrations(registrations)
getCachedAssignedRegistrations()
cacheSchedule(tanggal, schedule)
getCachedSchedule(tanggal)
```

#### Statistics
```typescript
getVerificationStats()
// Returns: {
//   total_assigned,
//   pending_verification,
//   completed_verification,
//   approved,
//   rejected
// }
```

## Data Persistence

### localStorage Keys

```typescript
'penghulu_profile'                // Profile data
'penghulu_notifications'          // Notifications array
'penghulu_verifications'          // Offline verification data
'penghulu_assigned_registrations' // Cached registrations
'penghulu_schedules'              // Cached schedules by date
'token'                           // JWT token
'user'                            // User data
```

### Data Structure Examples

**penghulu_profile**:
```json
{
  "id": 1,
  "nama_lengkap": "Ustadz Ahmad Ridho",
  "nip": "198505052010121001",
  "status": "Aktif",
  "jumlah_nikah": 15,
  "rating": 4.8,
  "email": "ahmad.ridho@kua.go.id",
  "no_hp": "081234567891",
  "alamat": "Jl. Ahmad Yani No. 25"
}
```

**penghulu_notifications**:
```json
[
  {
    "id": "1234567890",
    "type": "success",
    "message": "Dokumen 2024001 telah disetujui. Status: Menunggu Bimbingan",
    "timestamp": "2024-01-15T10:30:00Z"
  }
]
```

**penghulu_verifications**:
```json
{
  "registration-id-123": {
    "id": "registration-id-123",
    "nomor_pendaftaran": "2024001",
    "status_verifikasi": "approved",
    "catatan": "",
    "waktu_verifikasi": "2024-01-15T10:30:00Z",
    "saved_at": "2024-01-15T10:30:00Z"
  }
}
```

## Integration Guide

### 1. Setup Layout Navigation
Semua page di `/penghulu/*` menggunakan `PenguluLayout` component yang otomatis:
- Validate role adalah 'penghulu'
- Redirect ke login jika tidak authenticated
- Provide sidebar navigation

### 2. API Integration Pattern

```typescript
// Load dari API dengan fallback ke cache
try {
  const data = await getAssignedRegistrations();
  setRegistrations(data);
  cacheAssignedRegistrations(data);
} catch (err) {
  const cached = getCachedAssignedRegistrations();
  if (cached.length > 0) {
    setRegistrations(cached);
    setError('Menampilkan data dari cache (offline mode)');
  }
}
```

### 3. Notification Integration

Setiap verifikasi otomatis create notification:
```typescript
await completeVerification(
  registrationId,
  nomor_pendaftaran,
  'approved'  // atau 'rejected'
);
// Notification dibuat otomatis dengan message yang sesuai
```

### 4. Status Flow

```
Pendaftaran dibuat
    ↓
Status: "Menunggu Verifikasi Penghulu"
    ↓
Penghulu pilih Setujui/Tolak
    ↓
API call verify-documents
    ↓
Status berubah ke "Menunggu Bimbingan" (setujui)
Status berubah ke "Penolakan Dokumen" (tolak)
    ↓
Notification dibuat otomatis
```

## Authentication

Semua API calls require:
- Authorization header: `Bearer {token}`
- Token dari localStorage['token']
- Function `getAuthHeaders()` di service layer handle ini

Redirect ke login jika:
- Token tidak ada
- User role bukan 'penghulu'
- Token expired (API return 401)

## Offline Mode Support

Aplikasi support offline mode dengan:
1. **Automatic Caching**: Data dari API di-cache ke localStorage
2. **Graceful Degradation**: Jika API gagal, fallback ke cache
3. **Offline Indicator**: Alert banner menunjukkan mode offline
4. **Pending Sync**: Offline changes saved lokally, sync saat online

## Error Handling

Setiap halaman implement:
1. **API Error Alert**: Red alert dengan error message
2. **Offline Fallback**: Yellow alert untuk cache data
3. **Loading State**: Spinner saat fetch data
4. **Retry Logic**: Manual retry bisa via reload/navigation

## Component Patterns

### Page Layout Pattern
```typescript
export default function Page() {
  return (
    <PenguluLayout>
      <div className="space-y-6">
        {/* Header */}
        {/* Alerts */}
        {/* Content */}
      </div>
    </PenguluLayout>
  );
}
```

### Data Loading Pattern
```typescript
useEffect(() => {
  const load = async () => {
    try {
      const data = await apiFunction();
      setData(data);
      cache(data);
    } catch (err) {
      const cached = getCache();
      if (cached) {
        setData(cached);
        setError('offline');
      } else {
        setError('failed');
      }
    } finally {
      setLoading(false);
    }
  };
  load();
}, []);
```

### Dialog Pattern
```typescript
// Approval Dialog
<Dialog open={dialog} onOpenChange={setDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Konfirmasi</DialogTitle>
      <DialogDescription>Deskripsi action</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button variant="outline">Batal</Button>
      <Button>Setujui</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Testing

### Manual Testing Checklist

- [ ] Login sebagai penghulu
- [ ] Dashboard load data correctly
- [ ] Jadwal navigation (prev/next/today) works
- [ ] Verifikasi document approve workflow
- [ ] Verifikasi document reject workflow dengan catatan
- [ ] Profil edit dan save
- [ ] Offline mode fallback
- [ ] Logout clear localStorage
- [ ] Notification created after verification

### API Integration Testing

- [ ] GET /simnikah/penghulu/assigned-registrations
- [ ] GET /simnikah/penghulu-jadwal/:tanggal
- [ ] POST /simnikah/penghulu/verify-documents/:id
- [ ] GET /simnikah/penghulu (profile list)

## Troubleshooting

### Data not loading
1. Check token in localStorage
2. Check user role is 'penghulu'
3. Check API endpoint reachable
4. Check API response format

### Verification not saving
1. Verify registration ID correct
2. Check catatan required untuk rejection
3. Check API response status
4. Check localStorage permission

### Notification not appearing
1. Check notification created in completeVerification
2. Check penghulu_notifications key in localStorage
3. Check notification render in layout

### Offline mode not working
1. Check cache keys in localStorage
2. Verify data structure matches interface
3. Check cache refresh on online

## Future Enhancements

1. **Bulk Operations**: Approve/reject multiple registrations
2. **Advanced Analytics**: Verification trends, performance metrics
3. **Calendar View**: Full month jadwal view
4. **Sync Queue**: Track pending API calls untuk sync
5. **Document Upload**: Upload scanned documents
6. **Real-time Updates**: WebSocket notifications
7. **Export Reports**: PDF/Excel report generation
8. **Multi-language**: i18n support

## API Reference Summary

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/simnikah/penghulu/assigned-registrations` | GET | Get assigned registrations | ✅ |
| `/simnikah/penghulu-jadwal/:tanggal` | GET | Get schedule for date | ✅ |
| `/simnikah/penghulu/verify-documents/:id` | POST | Verify documents | ✅ |
| `/simnikah/penghulu` | GET | Get penghulu profile | ✅ |
| `/simnikah/penghulu/:id` | PUT | Update penghulu profile | ✅ |

## Related Files

- Layout: `src/app/penghulu/layout.tsx`
- Pages: `src/app/penghulu/page.tsx`, `src/app/penghulu/jadwal/page.tsx`, etc.
- Service: `src/lib/penghulu-service.ts`
- Auth Context: `src/context/AuthContext.tsx`
- UI Components: `src/components/ui/*`
