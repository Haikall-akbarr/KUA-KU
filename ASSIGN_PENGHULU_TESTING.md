# 🧪 Step-by-Step Testing Guide: Assign Penghulu

## 🎯 Goal

Test bahwa fitur "Assign Penghulu" bekerja dengan sempurna dari kepala KUA sampai penghulu verifikasi.

## 📋 Prerequisites

- [ ] Development server running (`npm run dev`)
- [ ] Browser buka: `http://localhost:3000`
- [ ] Browser console open (F12)
- [ ] Clear localStorage jika perlu (buat fresh start)

## 🧪 Test Case 1: Happy Path - Single Assignment

### Setup

**1. Buat Penghulu (jika belum ada)**
```
URL: http://localhost:3000/admin/kepala
Tab: "Penghulu"
Klik: "Tambah Penghulu"
Isi Form:
  - Nama: "Bapak Siddiq"
  - NIP: "1234567890"
Klik: "Simpan"
```

**Expected Result**: 
- Alert: "✅ Penghulu berhasil ditambahkan"
- Penghulu muncul di list

### Create Test Data (Registrasi dengan status "Disetujui")

```javascript
// Jalankan di console F12:
const testReg = {
  id: "test-reg-001",
  groomName: "Ahmad Rizki",
  brideName: "Siti Nurhaliza",
  groomNik: "1234567890123456",
  brideNik: "9876543210654321",
  weddingDate: "2025-11-20",
  weddingTime: "10:00",
  weddingLocation: "Masjid Raya",
  status: "Disetujui",  // 🔑 IMPORTANT
};

const regs = JSON.parse(localStorage.getItem('marriageRegistrations') || '[]');
regs.push(testReg);
localStorage.setItem('marriageRegistrations', JSON.stringify(regs));
console.log('✅ Test registration created:', testReg);
```

### Test: Assign Penghulu

**1. Buka Dashboard Kepala KUA**
```
URL: http://localhost:3000/admin/kepala
Tab: "Penugasan Pending"
```

**Expected Result**:
- [ ] Card menampilkan registrasi "Ahmad Rizki & Siti Nurhaliza"
- [ ] Status: "Disetujui"
- [ ] Tombol: "Tugaskan Penghulu"

**2. Klik Tombol "Tugaskan Penghulu"**

**Expected Result**:
- [ ] Dialog muncul dengan title "Tugaskan Penghulu"
- [ ] List penghulu ditampilkan (termasuk "Bapak Siddiq")

**3. Pilih Penghulu**
```
Klik: Tombol "Bapak Siddiq"
```

**Expected Result**:
- [ ] Alert: `✅ Penghulu Bapak Siddiq berhasil ditugaskan!`
- [ ] Page refresh otomatis
- [ ] Registrasi hilang dari "Penugasan Pending" (sudah di-assign)

**4. Verify di Console**
```javascript
const regs = JSON.parse(localStorage.getItem('marriageRegistrations') || '[]');
const assigned = regs.find(r => r.id === 'test-reg-001');
console.log('✅ Assignment successful:', {
  penghuluId: assigned.penghuluId,
  penghulu: assigned.penghulu,
  status: assigned.status,
  assignedAt: assigned.assignedAt
});
```

**Expected Output**:
```javascript
{
  penghuluId: "penghulu-uuid-here", // Should exist
  penghulu: "Bapak Siddiq",         // Should match
  status: "Menunggu Verifikasi Penghulu", // Should change
  assignedAt: "2025-11-12T10:30:00.000Z"  // Should exist
}
```

## 🧪 Test Case 2: Penghulu Verifikasi - Data Muncul

### Setup: Login as Penghulu

**1. Simulate Penghulu Login**
```javascript
// Run di console:
const penguluProfile = {
  id: "penghulu-uuid-here",  // 🔑 MUST MATCH penghuluId dari assignment
  nama_lengkap: "Bapak Siddiq",
  nip: "1234567890"
};

localStorage.setItem('penghulu_profile', JSON.stringify(penguluProfile));
console.log('✅ Penghulu profile set');
```

⚠️ **IMPORTANT**: `penguluProfile.id` harus sama dengan `penghuluId` yang di-assign!

Untuk tahu ID yang benar:
```javascript
const penghulus = JSON.parse(localStorage.getItem('penghulus') || '[]');
console.log('Available penghulu IDs:', penghulus.map(p => ({ id: p.id, name: p.name })));
```

### Test: Verifikasi Page

**1. Buka Penghulu Verifikasi**
```
URL: http://localhost:3000/penghulu/verifikasi
```

**Expected Result**:
- [ ] Page load dengan stats card
- [ ] Card "Menunggu Verifikasi" menampilkan 1 item
- [ ] Detail tampil: "test-reg-001", "Ahmad Rizki", "Siti Nurhaliza"

**2. Lihat Detail Registrasi**

**Expected**:
- [ ] Nomor Pendaftaran: "test-reg-001"
- [ ] Calon Suami: "Ahmad Rizki" (NIK: 1234567890123456)
- [ ] Calon Istri: "Siti Nurhaliza" (NIK: 9876543210654321)
- [ ] Tanggal Nikah: "20 November 2025"
- [ ] Lokasi: "Masjid Raya"
- [ ] Tombol: "Setujui" & "Tolak"

**3. Verify di Console**
```javascript
const regs = JSON.parse(localStorage.getItem('marriageRegistrations') || '[]');
const penghulu = JSON.parse(localStorage.getItem('penghulu_profile') || '{}');
const matched = regs.filter(r => r.penghuluId === penghulu.id);
console.log('Matched registrations:', matched);
```

**Expected Output**:
```
Array dengan 1 item (test-reg-001)
```

## 🧪 Test Case 3: Approve Verifikasi

### Test: Click Setujui

**1. Klik Tombol "Setujui"**

**Expected Result**:
- [ ] Dialog: "Setujui Dokumen?"
- [ ] Detail registrasi ditampilkan
- [ ] Alert: "Status akan berubah menjadi Menunggu Bimbingan"

**2. Klik Tombol "Setujui" di Dialog**

**Expected Result**:
- [ ] Loading state
- [ ] Dialog tutup
- [ ] Registrasi pindah ke section "Telah Disetujui"
- [ ] Status berubah: "Menunggu Bimbingan"

**3. Verify di Console**
```javascript
const regs = JSON.parse(localStorage.getItem('marriageRegistrations') || '[]');
const updated = regs.find(r => r.id === 'test-reg-001');
console.log('Updated status:', updated.status);
```

**Expected**: `"Menunggu Bimbingan"`

## 🧪 Test Case 4: Reject Verifikasi

### Reset & Test Reject

**1. Reset Status**
```javascript
const regs = JSON.parse(localStorage.getItem('marriageRegistrations') || '[]');
const idx = regs.findIndex(r => r.id === 'test-reg-001');
regs[idx].status = 'Menunggu Verifikasi Penghulu';
localStorage.setItem('marriageRegistrations', JSON.stringify(regs));
console.log('✅ Reset done, registrasi di Menunggu Verifikasi');
```

**2. Reload Page**
```
F5 atau Ctrl+R
```

**3. Klik Tombol "Tolak"**

**Expected Result**:
- [ ] Dialog: "Tolak Dokumen"
- [ ] Input: "Catatan Penolakan"

**4. Isi Catatan & Klik "Tolak"**
```
Catatan: "Dokumen tidak lengkap, silakan perbaiki"
Klik: "Tolak"
```

**Expected Result**:
- [ ] Dialog tutup
- [ ] Registrasi pindah ke section "Ditolak"
- [ ] Status berubah: "Penolakan Dokumen"

**5. Verify di Console**
```javascript
const regs = JSON.parse(localStorage.getItem('marriageRegistrations') || '[]');
const updated = regs.find(r => r.id === 'test-reg-001');
console.log('Rejection details:', {
  status: updated.status,
  notes: updated.penguluRejectionNotes || 'Check API response'
});
```

## 🧪 Test Case 5: Multiple Penghulu

### Setup: Create 2 Penghulu

```javascript
// In admin/kepala: Add 2 penghulus
// 1. Bapak Siddiq (already created)
// 2. Bapak Ahmad
```

### Create 2 Test Registrations

```javascript
const reg2 = {
  id: "test-reg-002",
  groomName: "Bambang Suganda",
  brideName: "Ratna Widya",
  groomNik: "1111111111111111",
  brideNik: "2222222222222222",
  weddingDate: "2025-11-25",
  weddingTime: "14:00",
  weddingLocation: "Gereja Katedral",
  status: "Disetujui"
};

const regs = JSON.parse(localStorage.getItem('marriageRegistrations') || '[]');
regs.push(reg2);
localStorage.setItem('marriageRegistrations', JSON.stringify(regs));
```

### Test: Assign Different Penghulu

**1. Assign reg-001 ke Bapak Siddiq**
**2. Assign reg-002 ke Bapak Ahmad**

### Test: Each Penghulu Sees Only Their Assignment

**1. Login as Bapak Siddiq**
```javascript
// Set penghulu profile untuk Bapak Siddiq
localStorage.setItem('penghulu_profile', JSON.stringify({
  id: "siddiq-uuid",
  nama_lengkap: "Bapak Siddiq"
}));
```

**2. Buka `/penghulu/verifikasi`**

**Expected**:
- [ ] Hanya lihat reg-001 (Ahmad Rizki & Siti Nurhaliza)
- [ ] Tidak lihat reg-002

**3. Switch: Login as Bapak Ahmad**
```javascript
localStorage.setItem('penghulu_profile', JSON.stringify({
  id: "ahmad-uuid",
  nama_lengkap: "Bapak Ahmad"
}));
```

**4. Reload `/penghulu/verifikasi`**

**Expected**:
- [ ] Hanya lihat reg-002 (Bambang Suganda & Ratna Widya)
- [ ] Tidak lihat reg-001

**✅ Success**: Data tidak tertukar!

## 🧪 Test Case 6: Debug Page

### Test: Debug Page

**1. Buka URL**
```
http://localhost:3000/admin/kepala/debug-assignment
```

**Expected**:
- [ ] Page load dengan tabs
- [ ] Tab "Overview": stats registrasi & penghulu
- [ ] Tab "Registrasi": list semua dengan penghuluId
- [ ] Tab "Penghulu": list penghulu dengan assigned count
- [ ] Tab "Mapping": visual mapping penghulu ↔ registrasi

**2. Check Mapping Tab**

**Expected**:
- [ ] Bapak Siddiq: 1 assigned (Ahmad & Siti)
- [ ] Bapak Ahmad: 1 assigned (Bambang & Ratna)

## ✅ Checklist: All Tests Passed?

- [ ] Test Case 1: Happy Path ✓
- [ ] Test Case 2: Penghulu Verifikasi ✓
- [ ] Test Case 3: Approve ✓
- [ ] Test Case 4: Reject ✓
- [ ] Test Case 5: Multiple Penghulu ✓
- [ ] Test Case 6: Debug Page ✓

## 🎉 If All Pass

```
✅ FEATURE COMPLETE & WORKING
✅ READY FOR PRODUCTION
```

## 🐛 If Any Fail

1. **Check Console Logs** (F12)
   - Cari error message
   - Cari debug log yang di-print

2. **Check localStorage State**
   ```javascript
   console.log('marriageRegistrations:', 
     JSON.parse(localStorage.getItem('marriageRegistrations') || '[]')
   );
   console.log('penghulu_profile:',
     JSON.parse(localStorage.getItem('penghulu_profile') || '{}')
   );
   ```

3. **Check ID Matching**
   ```javascript
   const regs = JSON.parse(localStorage.getItem('marriageRegistrations') || '[]');
   const penghulu = JSON.parse(localStorage.getItem('penghulu_profile') || '{}');
   console.log('Match found:', regs.filter(r => r.penghuluId === penghulu.id));
   ```

4. **Use Debug Page**: `/admin/kepala/debug-assignment`

---

**Total Test Time**: ~15-20 minutes  
**Status**: Ready to execute  
**Date**: November 12, 2025
