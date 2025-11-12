# Penghulu Assignment & Verification - Debug Guide

## Current Implementation Status

The system has been enhanced with comprehensive logging and auto-refresh capabilities to trace data flow from Kepala KUA assignment to Penghulu verification.

### Files Updated

1. **src/components/admin/kepala/PendingAssignmentsTable.tsx**
   - Enhanced logging with emoji indicators (✅, 📊, 📡, ⚠️, ❌)
   - Creates dual notifications: user notification + penghulu notification
   - Logs all assignment steps to browser console

2. **src/lib/penghulu-service.ts**
   - Added type coercion for penghuluId matching
   - Extensive console logging to trace filtering
   - Logs registration counts and matches

3. **src/app/penghulu/verifikasi/page.tsx**
   - Added storage event listener for auto-refresh
   - Detects when marriageRegistrations change
   - Auto-reloads data in real-time

4. **src/app/penghulu/page.tsx**
   - Added storage event listener to dashboard
   - Enhanced filtering with console logging
   - Auto-refreshes when new assignments occur

## Testing Steps

### Step 1: Open Browser Console
```
Open browser → F12 (or Right-click → Inspect) → Console tab
Keep console open throughout the test
```

### Step 2: Staff Verification (if not already done)
1. Login as Staff user (username: staff)
2. Go to Admin Dashboard → Registrations
3. Find a pending registration
4. Click "Verifikasi" button
5. Watch console for logs (if applicable)

### Step 3: Kepala KUA Assignment ⭐ KEY STEP
1. Login as Kepala KUA (username: kepala_kua)
2. Go to Admin Dashboard → Kepala KUA → Pending Assignments
3. **Watch browser console closely**
4. Click "Assign Penghulu" button
5. Select a penghulu from the dropdown
6. **Watch console for these logs:**

```
✅ Loading registrations...
📊 Registrations found in localStorage: X
✅ Registration updated: [registration_id]
✅ Status changed to: Menunggu Verifikasi Penghulu
✅ Assigned penghuluId: [penghulu_id]
✅ Saved to localStorage: success
✅ User notification added: [registration_id]
✅ Penghulu notification added: [penghulu_id]
✅ All checks passed!
```

### Step 4: Verify localStorage Data
1. In browser console, run:
```javascript
// Check the assignment
console.table(JSON.parse(localStorage.getItem('marriageRegistrations')))

// Look for:
// - penghuluId: [should match penghulu's ID]
// - status: "Menunggu Verifikasi Penghulu"
```

### Step 5: Penghulu Dashboard Check ⭐ KEY STEP
1. **WITHOUT refreshing**, stay on current page or go to home
2. Logout and login as the assigned Penghulu
3. Go to Dashboard (Penghulu → Home)
4. **Watch console for these logs:**

```
📊 Penghulu dashboard - Current user: {id: X, nama_lengkap: "...", ...}
📊 Total registrations: X
✅ Dashboard: Matched [registration_id], status: Menunggu Verifikasi Penghulu
📊 Dashboard found 1 assigned registrations
📡 Storage changed: marriageRegistrations updated, reloading...
```

5. **Expected result**: Should show 1+ "Menunggu Verifikasi Penghulu" registrations

### Step 6: Penghulu Verification Page Check ⭐ KEY STEP
1. Navigate to Penghulu → Verifikasi Dokumen
2. **Watch console for these logs:**

```
🔍 Loading registrations...
Current penghulu profile: {id: X, nama_lengkap: "...", ...}
Total registrations in localStorage: X
✅ Matched registration: [registration_id], status: Menunggu Verifikasi Penghulu
📊 Found 1 assigned registrations
```

3. **Expected result**: Should display the registration with approve/reject buttons

## Troubleshooting

### Problem: Console shows "Found 0 assigned registrations"

**Check 1: Verify penghuluId was saved**
```javascript
// In console:
const regs = JSON.parse(localStorage.getItem('marriageRegistrations'))
const reg = regs.find(r => r.id === 'REGISTRATION_ID')
console.log('penghuluId:', reg.penghuluId)
console.log('penghulu ID:', reg.penghuluId?.toString())
```

**Check 2: Verify penghulu profile loaded**
```javascript
// In console:
const penghulu = JSON.parse(localStorage.getItem('penghulu_profile'))
const user = JSON.parse(localStorage.getItem('user'))
console.log('penghulu_profile:', penghulu)
console.log('user:', user)
console.log('Do they match?', penghulu?.id === reg.penghuluId)
```

**Check 3: Check notification was created**
```javascript
// In console:
console.log('Penghulu notifications:', localStorage.getItem('penghulu_notifications'))
console.log('User notification:', localStorage.getItem('notifications_REGISTRATION_ID'))
```

### Problem: Console shows "Total registrations: 0"

**Cause**: No registrations have been created yet
**Solution**: 
1. Create a registration via daftar-nikah form
2. Verify it appears in Admin Dashboard
3. Have staff verify it
4. Then proceed with Kepala KUA assignment

### Problem: Penghulu dashboard shows registrations but verification page doesn't

**This may indicate**:
- Filtering logic issue
- Status value mismatch (check exact status string spelling)
- Component state not updating

**Solution**: Check the console logs carefully - they will show exactly which registrations are being filtered and why

### Problem: "Tidak ada tugas verifikasi" still showing

**Root cause possibilities**:
1. ❌ penghuluId not saved correctly → check storage
2. ❌ penghulu_profile not loaded → logout/login again
3. ❌ ID type mismatch (string vs number) → code includes both checks
4. ❌ Status not exactly "Menunggu Verifikasi Penghulu" → check exact spelling

**Debug action**:
```javascript
// In console, while on penghulu verifikasi page:
const penghulu = JSON.parse(localStorage.getItem('penghulu_profile') || '{}')
const user = JSON.parse(localStorage.getItem('user') || '{}')
const regs = JSON.parse(localStorage.getItem('marriageRegistrations') || '[]')

console.log('=== MATCHING DEBUG ===')
console.log('Penghulu ID:', penghulu.id || user.id)
console.log('Registrations with penghuluId:')
regs.forEach(r => {
  if (r.status === 'Menunggu Verifikasi Penghulu') {
    console.log(`  ID: ${r.id}, penghuluId: ${r.penghuluId}, Match: ${r.penghuluId === (penghulu.id || user.id)}`)
  }
})
```

## Expected Data Flow

```
1. USER CREATES REGISTRATION
   └─ Storage: marriageRegistrations[] += newReg
      └─ status: "Pending"

2. STAFF VERIFIES
   └─ Storage: reg.status = "Disetujui"
   └─ Console: "✅ Registration updated"

3. KEPALA KUA ASSIGNS PENGHULU
   └─ Storage: 
      └─ reg.status = "Menunggu Verifikasi Penghulu"
      └─ reg.penghuluId = penghulu.id
      └─ reg.assignedAt = timestamp
   └─ Notification:
      └─ notifications_[regId] = user notification
      └─ penghulu_notifications = penghulu notification
   └─ Console: "✅ All checks passed!"

4. PENGHULU VIEWS DASHBOARD
   └─ Storage: Reads penghulu_profile
   └─ Filter: Matches penghuluId === penghulu.id
   └─ Display: Shows assigned registrations
   └─ Console: "📊 Dashboard found X assigned registrations"

5. PENGHULU VIEWS VERIFICATION PAGE
   └─ Storage: Reads "Menunggu Verifikasi Penghulu" registrations
   └─ Display: Shows registration details with approve/reject buttons
   └─ Console: "✅ Matched registration"

6. PENGHULU APPROVES/REJECTS
   └─ Storage: 
      └─ reg.status = "Menunggu Bimbingan" or "Penolakan Dokumen"
      └─ reg.approvedAt or reg.rejectedAt = timestamp
   └─ User Notification: Status update sent to user
```

## Console Log Legend

| Log | Meaning | Status |
|-----|---------|--------|
| 🔍 | Starting to load data | PROCESS |
| ✅ | Success/Match found | SUCCESS |
| 📊 | Summary/Count information | INFO |
| 📡 | Auto-refresh triggered | REFRESH |
| ⚠️ | Warning/Potential issue | WARNING |
| ❌ | Error occurred | ERROR |

## Next Actions If Still Not Working

If after following these steps the data still doesn't appear:

1. **Check localStorage is enabled**
   ```javascript
   // In console:
   typeof(localStorage)  // Should return "object"
   ```

2. **Check cross-tab communication**
   - Open DevTools in assignment tab AND verification tab
   - Perform assignment in one tab
   - Check if verification tab receives storage event listener log

3. **Force refresh and retry**
   - Sometimes browser cache needs clearing: Ctrl+Shift+R
   - Clear localStorage and start fresh test
   - Check all console logs in both phases

4. **Report findings with console logs**
   - Perform assignment and screenshot console logs
   - Navigate to penghulu and screenshot console logs
   - Share both logs for detailed debugging

## Key Files to Monitor

- **Assignment happens in**: `src/components/admin/kepala/PendingAssignmentsTable.tsx`
- **Filtering happens in**: `src/lib/penghulu-service.ts` and `src/app/penghulu/verifikasi/page.tsx`
- **Dashboard loads in**: `src/app/penghulu/page.tsx`
- **Data stored in**: Browser's localStorage keys:
  - `marriageRegistrations` - all registrations
  - `penghulu_profile` - current penghulu info
  - `user` - current user info
  - `penghulu_notifications` - penghulu notifications
  - `notifications_[regId]` - user notifications

## Success Indicators

✅ When working correctly, you should see:
1. Console logs with emoji indicators during assignment
2. Data persists in localStorage with penghuluId field
3. Penghulu dashboard auto-refreshes with new data
4. Verification page shows "Menunggu Verifikasi Penghulu" registrations
5. Penghulu can click Approve/Reject buttons
6. User receives notification

🔴 If any of these fail, check the corresponding console logs for the error location.
