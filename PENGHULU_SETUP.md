# Penghulu Dashboard Setup Guide

## Quick Start (3 Steps)

### Step 1: Files Created
Dashboard penghulu sudah fully implemented dengan struktur berikut:

```
src/
├── app/penghulu/
│   ├── layout.tsx              # Main layout with sidebar
│   ├── page.tsx                # Dashboard homepage
│   ├── jadwal/
│   │   └── page.tsx            # Schedule page
│   ├── verifikasi/
│   │   └── page.tsx            # Document verification
│   └── profil/
│       └── page.tsx            # Penghulu profile
├── lib/
│   └── penghulu-service.ts     # API service layer
```

### Step 2: Environment Setup
Pastikan `.env` atau `.env.local` memiliki:

```env
NEXT_PUBLIC_API_URL=https://simnikah-api-production.up.railway.app
```

### Step 3: Access Dashboard
- **URL**: `http://localhost:3000/penghulu`
- **Requirement**: Harus login dengan role `penghulu`
- **Redirect**: Auto redirect ke login jika belum authenticated

## Menu Structure

```
📊 Dashboard (main stats and quick actions)
├─ Jadwal Nikah (schedule view with capacity)
├─ Verifikasi Dokumen (document verification workflow)
└─ Profil (profile info and edit)
```

## Key Features

### 1. Dashboard Homepage (`/penghulu`)
Menampilkan:
- Status penghulu (Aktif/Tidak Aktif)
- Total pernikahan yang telah disahkan
- Rating dengan star indicator
- Jumlah tugas terjadwalkan
- Tabbed interface: Jadwal | Profil | Tugas

### 2. Jadwal Nikah (`/penghulu/jadwal`)
Fitur:
- Date navigation (Sebelumnya, Hari Ini, Selanjutnya)
- Kapasitas summary dengan percentage
- Utilization status: Tersedia (hijau) / Padat (kuning) / Penuh (merah)
- Per-session detail (waktu mulai, waktu selesai, lokasi)
- Offline support dengan cache

**API Endpoint**:
```
GET /simnikah/penghulu-jadwal/:tanggal
```

### 3. Verifikasi Dokumen (`/penghulu/verifikasi`)
Workflow:
1. Load list registrations dengan status "Menunggu Verifikasi Penghulu"
2. Penghulu review dokumen calon suami/istri
3. Pilih Setujui atau Tolak
4. Dialog confirmation dengan detail
5. Auto status update dan create notification

**API Endpoints**:
```
GET /simnikah/penghulu/assigned-registrations
POST /simnikah/penghulu/verify-documents/:id
```

**Status Flow**:
```
Menunggu Verifikasi Penghulu
    ↓
[Approve] → Status: Menunggu Bimbingan + Notification
[Reject]  → Status: Penolakan Dokumen + Notification
```

**Catatan untuk Rejection**:
- Wajib diisi sebelum reject
- Akan ditampilkan ke calon pengantin

### 4. Profil (`/penghulu/profil`)
View dan Edit:
- Nama lengkap (view only)
- NIP (view only)
- Status (view only)
- Total nikah (view only)
- Rating dengan stars (view only)
- Email (editable)
- Nomor HP (editable)
- Alamat (editable)

Edit mode:
- Click "Edit" button
- Modify fields
- Click "Simpan" untuk save
- Data save ke localStorage + API sync
- Click "Batal" untuk discard

## Integration Points

### 1. Authentication
Layout otomatis validate:
```typescript
const user = localStorage.getItem('user');
const userData = JSON.parse(user);
if (userData.role !== 'penghulu') {
  // Redirect ke home
}
```

### 2. Notifications
Penghulu notifications disimpan di:
```
localStorage['penghulu_notifications']
```

Structure:
```json
[
  {
    "id": "1234567890",
    "type": "success|error|info",
    "message": "...",
    "timestamp": "2024-01-15T10:30:00Z"
  }
]
```

### 3. Data Caching
Semua data auto-cache ke localStorage:
- `penghulu_profile`: Profile data
- `penghulu_assigned_registrations`: Registered untuk verifikasi
- `penghulu_schedules`: Schedule per tanggal
- `penghulu_verifications`: Offline verification data

Cache dengan key: `{category}_{identifier}`

### 4. Service Layer Pattern
Semua API calls via `penghulu-service.ts`:

```typescript
// Load registrations
import { getAssignedRegistrations } from '@/lib/penghulu-service';
const registrations = await getAssignedRegistrations();

// Load schedule
import { getPenguluSchedule } from '@/lib/penghulu-service';
const schedule = await getPenguluSchedule('2024-01-15');

// Verify documents
import { completeVerification } from '@/lib/penghulu-service';
await completeVerification(
  registrationId,
  nomor_pendaftaran,
  'approved'  // atau 'rejected'
);
```

## API Reference

### Get Assigned Registrations
```
GET /simnikah/penghulu/assigned-registrations

Headers:
  Authorization: Bearer {token}

Response:
{
  "data": {
    "registrations": [
      {
        "id": "...",
        "nomor_pendaftaran": "2024001",
        "status_pendaftaran": "Menunggu Verifikasi Penghulu",
        "tanggal_nikah": "2024-01-20",
        "waktu_nikah": "10:00",
        "tempat_nikah": "Kantor KUA",
        "calon_suami": {
          "nama_lengkap": "...",
          "nik": "..."
        },
        "calon_istri": {
          "nama_lengkap": "...",
          "nik": "..."
        }
      }
    ]
  }
}
```

### Get Schedule for Date
```
GET /simnikah/penghulu-jadwal/:tanggal

Headers:
  Authorization: Bearer {token}

Response:
{
  "data": {
    "jadwal": [
      {
        "id": "...",
        "tanggal": "2024-01-15",
        "waktu_mulai": "09:00",
        "waktu_selesai": "10:00",
        "jumlah_pernikahan": 3,
        "kapasitas": 5,
        "lokasi": "Ruang Akad 1"
      }
    ]
  }
}
```

### Verify Documents
```
POST /simnikah/penghulu/verify-documents/:id

Headers:
  Authorization: Bearer {token}
  Content-Type: application/json

Body:
{
  "status_verifikasi": "approved",  // atau "rejected"
  "catatan": "Dokumen lengkap dan sesuai"
}

Response:
{
  "data": {
    "id": "...",
    "nomor_pendaftaran": "2024001",
    "status_verifikasi": "approved",
    "catatan": "...",
    "waktu_verifikasi": "2024-01-15T10:30:00Z"
  }
}
```

## Offline Mode

Aplikasi support offline dengan:
1. **Automatic Caching**: Semua API response di-cache
2. **Fallback**: Jika API fail, gunakan cache
3. **Indicator**: Alert banner show "offline mode"
4. **Persistence**: Data tetap tersedia offline

Cache invalidation:
- Manual: Navigate away dan kembali
- Auto: 24 jam cache expiry (can customize)

## Error Handling

Semua page handle errors dengan:
1. **API Error**: Alert merah dengan error message
2. **Offline Fallback**: Alert kuning, gunakan cache
3. **Loading State**: Spinner saat fetch
4. **User Feedback**: Toast/Alert notification

## Testing Checklist

### Functionality
- [ ] Login sebagai penghulu
- [ ] Dashboard load dan display stats
- [ ] Tab navigation (Jadwal, Profil, Tugas) work
- [ ] Jadwal page date navigation work
- [ ] Verifikasi approve workflow complete
- [ ] Verifikasi reject workflow dengan catatan
- [ ] Profil edit dan save work
- [ ] Profil edit cancel discard changes
- [ ] Logout clear all data

### Data Persistence
- [ ] Reload page maintain data
- [ ] Offline mode fallback work
- [ ] Cache clear on new login
- [ ] Notification persist

### API Integration
- [ ] GET /simnikah/penghulu/assigned-registrations work
- [ ] GET /simnikah/penghulu-jadwal/:tanggal work
- [ ] POST /simnikah/penghulu/verify-documents/:id work
- [ ] Auth header token included
- [ ] Error 401 redirect ke login

### UI/UX
- [ ] Sidebar responsive on mobile
- [ ] Dialog open/close smooth
- [ ] Loading states show correctly
- [ ] Error messages clear dan actionable
- [ ] Notification badge update

## Common Issues & Solutions

### "Page not loading"
**Cause**: Token atau user role tidak valid
**Solution**: 
1. Check localStorage memiliki 'token' dan 'user'
2. Check user.role === 'penghulu'
3. Logout dan login kembali

### "API 401 Unauthorized"
**Cause**: Token expired atau invalid
**Solution**:
1. Token refresh di AuthContext
2. Atau re-login
3. Check token format: `Bearer {token}`

### "Data tetap cache saat offline"
**Design**: Ini adalah feature, bukan bug
**If want clear cache**:
1. Open DevTools
2. Application > localStorage
3. Delete 'penghulu_*' keys
4. Refresh page

### "Verifikasi tidak save"
**Check**:
1. Catatan required untuk rejection
2. Registration ID valid
3. API endpoint reachable
4. Token valid

### "Edit profile tidak save"
**Check**:
1. Input fields valid (email format, etc)
2. localStorage writable
3. API endpoint reachable
4. Token valid

## Performance Optimization

Implemented:
- ✅ Lazy loading pages
- ✅ Image optimization
- ✅ API result caching
- ✅ localStorage persistence
- ✅ Minimal re-renders

Could add:
- Pagination for large lists
- Infinite scroll
- Debounced search
- Service Worker for offline

## Security Notes

- ✅ Token stored in localStorage (consider httpOnly for production)
- ✅ API calls require Authorization header
- ✅ Role-based access control implemented
- ✅ Sensitive data cached locally (review data sensitivity)
- ✅ No hardcoded credentials

Production checklist:
- [ ] Use httpOnly cookies untuk token (jika possible)
- [ ] Implement CSRF protection
- [ ] Add rate limiting di API
- [ ] Sanitize user inputs
- [ ] Implement token refresh logic
- [ ] Add request signing/verification

## Files Modified/Created

### New Files
```
✅ src/app/penghulu/layout.tsx
✅ src/app/penghulu/page.tsx
✅ src/app/penghulu/jadwal/page.tsx
✅ src/app/penghulu/verifikasi/page.tsx
✅ src/app/penghulu/profil/page.tsx
✅ src/lib/penghulu-service.ts
✅ PENGHULU_DASHBOARD_GUIDE.md
✅ PENGHULU_SETUP.md
```

### To Verify
Run these checks:
```bash
# Check all files exist
ls src/app/penghulu/page.tsx
ls src/app/penghulu/jadwal/page.tsx
ls src/app/penghulu/verifikasi/page.tsx
ls src/app/penghulu/profil/page.tsx
ls src/lib/penghulu-service.ts

# Build check
npm run build

# Type check
npx tsc --noEmit
```

## Next Steps

1. **Test Integration**:
   - Authenticate sebagai penghulu
   - Navigate each page
   - Test all workflows

2. **Production Deployment**:
   - Set env variables
   - Run build test
   - Deploy

3. **Monitoring**:
   - Track API response times
   - Monitor error rates
   - Collect user feedback

4. **Future Enhancements**:
   - Bulk operations
   - Advanced reports
   - Real-time updates
   - Mobile optimization

## Support & Contact

Untuk questions/issues:
1. Check PENGHULU_DASHBOARD_GUIDE.md untuk detailed documentation
2. Review penghulu-service.ts untuk API function examples
3. Check page components untuk UI patterns
4. Review localStorage structure dalam guide
