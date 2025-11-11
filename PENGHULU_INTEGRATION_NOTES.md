# Integration Notes: Penghulu & Kepala KUA

## Overview
Dokumentasi ini menjelaskan hubungan antara Penghulu Dashboard dan Kepala KUA Admin Dashboard dalam sistem informasi nikah.

## Role-Based Endpoints

### Kepala KUA Endpoints (Admin Only)
```
4.1 Create Penghulu
    POST /simnikah/penghulu
    Body: { nama_lengkap, nip, email, no_hp, alamat }
    Response: { id, ... }

4.2 Get All Penghulu
    GET /simnikah/penghulu
    Response: { data: [{ id, nama_lengkap, nip, status, ... }] }

4.3 Assign Penghulu
    POST /simnikah/pendaftaran/:id/assign-penghulu
    Body: { penghulu_id }
    Response: { status: "assigned" }
```

### Penghulu Endpoints (Penghulu Role)
```
4.4 Get Penghulu Schedule
    GET /simnikah/penghulu-jadwal/:tanggal
    Response: { data: { jadwal: [...] } }

4.5 Verify Documents
    POST /simnikah/penghulu/verify-documents/:id
    Body: { status_verifikasi, catatan }
    Response: { data: { id, status_verifikasi, ... } }

4.6 Get Assigned Registrations
    GET /simnikah/penghulu/assigned-registrations
    Response: { data: { registrations: [...] } }
```

## Workflow Integration

```
KEPALA KUA FLOW:
1. Login as kepala_kua
2. Admin Dashboard: src/app/admin
3. Create/Manage Penghulu (endpoints 4.1, 4.2)
4. Assign Penghulu to registrations (endpoint 4.3)
5. View verification status
6. Manage staff verification

PENGHULU FLOW:
1. Login as penghulu
2. Penghulu Dashboard: src/app/penghulu
3. View assigned registrations
4. View schedule (endpoint 4.4)
5. Verify documents (endpoint 4.5)
6. Auto-status update: "Menunggu Bimbingan"

DATA SYNC:
Kepala KUA assigns → Penghulu receives → Penghulu verifies → Status updates
```

## Data Relationship

### Registrations Status Timeline
```
CREATED
  ↓
[Staff Verification] (Formilir Online → Berkas Fisik)
Status: Menunggu Verifikasi Staff → Menunggu Verifikasi Penghulu
  ↓
[Penghulu Verification] (Document Check)
Status: Menunggu Verifikasi Penghulu
  ↓
[APPROVE] → Status: Menunggu Bimbingan
[REJECT]  → Status: Penolakan Dokumen
```

## Penghulu Assignment Flow

### Step 1: Create Penghulu (Kepala KUA Only)
```typescript
// In Kepala KUA Admin Dashboard
const newPenghulu = {
  nama_lengkap: "Ustadz Ahmad Ridho",
  nip: "198505052010121001",
  email: "ahmad@kua.go.id",
  no_hp: "081234567891",
  alamat: "Jl. Ahmad Yani 25"
};

await fetch('/simnikah/penghulu', {
  method: 'POST',
  body: JSON.stringify(newPenghulu),
  headers: { Authorization: 'Bearer {token}' }
});
```

### Step 2: Get All Penghulu
```typescript
// List available penghulu for assignment
const response = await fetch('/simnikah/penghulu', {
  method: 'GET',
  headers: { Authorization: 'Bearer {token}' }
});
const penghulu_list = response.data; // Array of penghulu
```

### Step 3: Assign to Registration (Kepala KUA Only)
```typescript
// Assign penghulu to registration
const assignment = {
  penghulu_id: 1  // From penghulu list
};

await fetch('/simnikah/pendaftaran/{registrationId}/assign-penghulu', {
  method: 'POST',
  body: JSON.stringify(assignment),
  headers: { Authorization: 'Bearer {token}' }
});
```

### Step 4: Penghulu Receives Assignment
```typescript
// Penghulu Dashboard automatically loads assigned registrations
const registrations = await fetch(
  '/simnikah/penghulu/assigned-registrations',
  { headers: { Authorization: 'Bearer {token}' } }
);
// Now shows in Verifikasi page under "Menunggu Verifikasi Penghulu"
```

### Step 5: Penghulu Verifies
```typescript
// In Penghulu Dashboard - Verifikasi page
await fetch(`/simnikah/penghulu/verify-documents/{registrationId}`, {
  method: 'POST',
  body: JSON.stringify({
    status_verifikasi: 'approved', // or 'rejected'
    catatan: 'Dokumen lengkap'
  }),
  headers: { Authorization: 'Bearer {token}' }
});
// Status auto-updates: "Menunggu Bimbingan"
```

## Notifications Integration

### Penghulu Notifications
When penghulu verifies documents, automatic notifications created:

```typescript
{
  id: "1234567890",
  type: "success", // or "error"
  message: "Dokumen 2024001 telah disetujui. Status: Menunggu Bimbingan",
  timestamp: "2024-01-15T10:30:00Z"
}
```

Stored in: `localStorage['penghulu_notifications']`

### Kepala KUA Notifications
Staff and admin verification notifications:

```typescript
{
  id: "1234567890",
  type: "success",
  message: "Formulir 2024001 telah diverifikasi",
  timestamp: "2024-01-15T10:00:00Z"
}
```

Stored in: `localStorage['staff_notifications']` or `localStorage['admin_notifications']`

## Data Sync Points

### When Kepala KUA Assigns Penghulu
1. API creates assignment in backend
2. Registration status might update
3. Penghulu dashboard auto-refreshes (or on next visit)
4. Penghulu sees new registration in "Menunggu Verifikasi Penghulu"

### When Penghulu Verifies
1. Penghulu clicks Setujui/Tolak
2. POST request to /verify-documents/:id
3. Status updates in backend
4. Local state updates immediately
5. Notification created
6. Kepala KUA can see updated status (on refresh)

### Two-Way Status Visibility
```
Kepala KUA Admin Dashboard
    ↓
Registration List: Shows all registrations + status
    ↓
[Shows verification progress: Staff → Penghulu → Next Step]
    ↓
Can see penghulu who is assigned
    ↓
Can see verification status

Penghulu Dashboard
    ↓
Assigned Registrations Only
    ↓
Can verify documents
    ↓
Status updates auto-reflect
```

## Storage Architecture

### Kepala KUA Storage
```
admin_profile              // Admin profile
admin_notifications        // Admin notifications
penghulu_list             // Cache of available penghulu
registrations             // All registrations
staff_verifications       // Staff verification data
admin_verifications       // Admin verification data
token                     // Auth token
user                      // User info
```

### Penghulu Storage
```
penghulu_profile          // Penghulu profile
penghulu_notifications    // Penghulu notifications
penghulu_assigned_registrations  // Assigned only
penghulu_schedules        // Schedule cache
penghulu_verifications    // Verification data
token                     // Auth token
user                      // User info
```

### No Cross-Storage
Penghulu cannot see admin notifications or vice versa.
Each role has isolated storage keys.

## API Authentication

### Token Bearer Format
```
Authorization: Bearer {token}
```

### Role Validation
Backend validates role from token:
- `kepala_kua` role: Can use 4.1, 4.2, 4.3 endpoints
- `penghulu` role: Can use 4.4, 4.5, 4.6 endpoints
- Other roles: Access denied (401)

### Frontend Validation
```typescript
// Layout validation
const user = JSON.parse(localStorage.getItem('user'));
if (user.role !== 'penghulu') {
  // Redirect non-penghulu away from /penghulu
}
```

## Performance Considerations

### Data Loading Strategy
1. **First Visit**: Load from API, cache results
2. **Subsequent Visits**: Load from cache, optionally refresh
3. **Manual Refresh**: User can force reload
4. **Background Sync**: Auto-refresh could be added

### Cache Management
Each role maintains separate caches:
- Penghulu dashboard caches: `penghulu_*` keys
- Admin dashboard caches: `admin_*` keys
- Shared: `token`, `user`

### Refresh Triggers
- Page navigation
- Manual refresh button
- Tab re-focus (could add)
- Periodic polling (could add)

## Error Scenarios

### Penghulu Can't Access Admin Endpoints
```
GET /simnikah/penghulu  ← Penghulu tries list
401 Unauthorized (Backend validates role)
→ Falls back to localStorage profile
→ Shows offline indicator
```

### Assignment Fails
```
Kepala KUA assigns penghulu:
POST /simnikah/pendaftaran/{id}/assign-penghulu
→ 400 Bad Request (penghulu_id invalid)
→ Show error to kepala_kua
→ Penghulu doesn't see registration
```

### Verification Conflict
```
Two penghulu try verify same registration:
First completes: Status updates to "Menunggu Bimbingan"
Second tries: 409 Conflict (already verified)
→ Show error: "Already verified"
→ Refresh data to sync
```

## Future Integration Points

### 1. Bulk Assignment
Kepala KUA should be able to:
- Select multiple registrations
- Assign same penghulu to all
- Or distribute across penghulu

### 2. Schedule Coordination
Kepala KUA should see:
- Penghulu availability
- Schedule conflicts
- Capacity warnings

### 3. Performance Metrics
Track per penghulu:
- Verification time average
- Approval/Rejection ratio
- Overall rating/performance

### 4. Real-time Updates
- WebSocket for live updates
- Penghulu verified notifications to admin
- Admin assignment notifications to penghulu

### 5. Document Management
- Central document repository
- Penghulu document upload
- Document status tracking

## Testing Integration

### Test Case 1: Happy Path
1. Login as kepala_kua
2. Create new penghulu
3. Get penghulu list
4. Assign to registration
5. Login as penghulu
6. See assigned registration
7. Verify document (approve)
8. Check status updated
9. Check notification created

### Test Case 2: Rejection Flow
1. Penghulu rejects document
2. Catatan required
3. Status updates to "Penolakan Dokumen"
4. Notification created with catatan
5. Kepala KUA sees rejection status

### Test Case 3: Offline Handling
1. API fails
2. Penghulu sees cache data
3. Tries to verify
4. Error shown
5. Offline indicator displayed
6. Data preserved for retry

### Test Case 4: Concurrent Verification
1. Two penghulu assigned same registration
2. First verifies
3. Second tries to verify
4. Conflict error shown
5. Data refreshed

## Documentation Files

- `PENGHULU_DASHBOARD_GUIDE.md` - Penghulu system details
- `PENGHULU_SETUP.md` - Penghulu setup
- `PENGHULU_IMPLEMENTATION_SUMMARY.md` - What was built
- `STAFF_VERIFICATION_GUIDE.md` - Staff verification (before penghulu)
- `ADMIN_DASHBOARD_INTEGRATION.md` - Admin side integration
- `API_FIX.md` - API endpoint details
- This file - Integration points

## Summary

### Penghulu Dashboard Integration Points:
1. ✅ Role-based access (penghulu role only)
2. ✅ Assigned registrations from kepala_kua
3. ✅ Schedule viewing (date-based)
4. ✅ Document verification workflow
5. ✅ Auto-status updates
6. ✅ Notifications creation
7. ✅ Data persistence
8. ✅ Offline support

### Not Implemented in Penghulu Dashboard:
- Create penghulu (kepala_kua only)
- Manage penghulu (kepala_kua only)
- Assign penghulu (kepala_kua only)
- View all registrations (only assigned)
- Admin functions

### Status: INTEGRATION-READY
Penghulu dashboard fully implements its endpoints and integrates properly with kepala_kua workflow.
