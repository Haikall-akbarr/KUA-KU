# USE CASE DOCUMENTATION - SISTEM SIMNIKAH
## (Sistem Informasi Nikah)

---

## 1. OVERVIEW SISTEM

**SimNikah** adalah sistem informasi manajemen pernikahan yang terintegrasi dengan Kantor Urusan Agama (KUA). Sistem ini menyediakan platform digital untuk mengelola seluruh proses pernikahan mulai dari pendaftaran hingga penerbitan surat nikah dengan tanda tangan digital yang tersertifikasi Komdigi.

### 1.1 Fitur Utama
- **Manajemen Pendaftaran Nikah**: Sistem pendaftaran online yang lengkap
- **Manajemen Staff KUA**: Pengelolaan staff, penghulu, dan kepala KUA
- **Bimbingan Perkawinan**: Sesi bimbingan wajib sebelum nikah
- **Penjadwalan Nikah**: Sistem penjadwalan otomatis dengan penghulu
- **Tanda Tangan Digital**: Integrasi dengan provider tersertifikasi Komdigi
- **Notifikasi Otomatis**: Sistem notifikasi real-time
- **Laporan dan Dokumentasi**: Generate surat undangan dan dokumen resmi

### 1.2 Teknologi
- **Backend**: Go (Gin Framework)
- **Database**: MySQL dengan GORM
- **Authentication**: JWT Token
- **Digital Signature**: Komdigi-compliant providers (PrivyID, Sertisign, VIDA, iOTENTIK)
- **API**: RESTful API

---

## 2. ACTORS (PELAKU SISTEM)

### 2.1 Primary Actors
1. **Calon Pasangan** (User Biasa)
   - Calon suami dan istri yang akan menikah
   - Mengisi data pribadi dan pendaftaran nikah
   - **Registrasi**: Mandiri melalui sistem

2. **Staff KUA**
   - Verifikasi dokumen pendaftaran
   - Mengelola data pendaftaran
   - Update status pendaftaran
   - **Registrasi**: Dibuat oleh Kepala KUA

3. **Penghulu**
   - Memimpin prosesi nikah
   - Melihat jadwal nikah yang ditugaskan
   - **Registrasi**: Dibuat oleh Kepala KUA

4. **Kepala KUA**
   - Approval final pendaftaran
   - Assign penghulu
   - Tanda tangan digital surat nikah
   - Manajemen staff dan penghulu
   - **Registrasi**: Dibuat oleh administrator sistem

### 2.2 Secondary Actors
1. **Administrator Sistem**
   - Membuat akun kepala KUA
   - Mengelola konfigurasi sistem
   - Maintenance dan monitoring

2. **Sistem Notifikasi**
   - Mengirim notifikasi otomatis
   - Reminder untuk bimbingan dan nikah

3. **Provider Tanda Tangan Digital**
   - PrivyID, Sertisign, VIDA, iOTENTIK
   - Verifikasi dan tanda tangan digital

---

## 3. USE CASES DETAIL

### 3.1 UC-001: REGISTRASI CALON PASANGAN

**Actor**: Calon Pasangan

**Description**: Calon pasangan mendaftar ke sistem untuk dapat mengakses layanan pendaftaran nikah

**Preconditions**: 
- Calon pasangan belum terdaftar di sistem
- Memiliki data pribadi yang valid

**Main Flow**:
1. Calon pasangan mengakses endpoint `/register`
2. Calon pasangan mengisi form registrasi (username, email, password, nama, role="user_biasa")
3. Sistem validasi format data
4. Sistem cek duplikasi username/email
5. Sistem hash password
6. Sistem generate user_id unik
7. Sistem simpan data user dengan role "user_biasa"
8. Sistem return response sukses

**Alternative Flows**:
- 3a. Format data tidak valid → Return error message
- 4a. Username/email sudah ada → Return error message
- 5a. Password tidak memenuhi kriteria → Return error message

**Postconditions**: Calon pasangan berhasil terdaftar dan dapat login

**API Endpoint**: `POST /register`

**Note**: Hanya calon pasangan yang dapat registrasi mandiri. Staff KUA dan Penghulu dibuat oleh Kepala KUA melalui sistem.

---

### 3.2 UC-002: PEMBUATAN AKUN KEPALA KUA

**Actor**: Administrator Sistem

**Description**: Administrator sistem membuat akun kepala KUA untuk mengelola KUA

**Preconditions**: 
- Administrator sistem memiliki akses ke sistem
- Data kepala KUA sudah lengkap dan valid

**Main Flow**:
1. Administrator mengakses endpoint `/register` dengan role "kepala_kua"
2. Administrator input data kepala KUA (username, email, password, nama, NIP)
3. Sistem validasi format data
4. Sistem cek duplikasi username/email/NIP
5. Sistem hash password
6. Sistem generate user_id unik
7. Sistem simpan data user dengan role "kepala_kua"
8. Sistem return response sukses dengan kredensial login

**Alternative Flows**:
- 3a. Format data tidak valid → Return error message
- 4a. Username/email/NIP sudah ada → Return error message
- 5a. Password tidak memenuhi kriteria → Return error message

**Postconditions**: Akun kepala KUA berhasil dibuat dan dapat login

**API Endpoint**: `POST /register`

**Note**: Akun kepala KUA dibuat oleh administrator sistem, bukan melalui registrasi mandiri.

---

### 3.3 UC-003: LOGIN USER

**Actor**: Semua User

**Description**: User melakukan autentikasi ke sistem

**Preconditions**: User sudah terdaftar dan status aktif

**Main Flow**:
1. User mengakses endpoint `/login`
2. User input username dan password
3. Sistem validasi format input
4. Sistem cari user berdasarkan username
5. Sistem cek status user (harus aktif)
6. Sistem verifikasi password
7. Sistem generate JWT token
8. Sistem return token dan data user

**Alternative Flows**:
- 3a. Format input tidak valid → Return error
- 4a. Username tidak ditemukan → Return error
- 5a. User tidak aktif → Return error
- 6a. Password salah → Return error

**Postconditions**: User berhasil login dan mendapat token akses

**API Endpoint**: `POST /login`

---

### 3.4 UC-004: PENGISIAN DATA CALON PASANGAN

**Actor**: Calon Pasangan

**Description**: Calon pasangan mengisi data pribadi lengkap

**Preconditions**: User sudah login dengan role user_biasa

**Main Flow**:
1. User mengakses endpoint `/simnikah/calon-pasangan`
2. User mengisi data pribadi (NIK, nama, tempat/tanggal lahir, alamat, dll)
3. Sistem validasi format data
4. Sistem cek duplikasi NIK
5. Sistem cek user belum memiliki profile
6. Sistem simpan data calon pasangan
7. Sistem return response sukses

**Alternative Flows**:
- 3a. Format data tidak valid → Return error
- 4a. NIK sudah terdaftar → Return error
- 5a. User sudah memiliki profile → Return error

**Postconditions**: Data calon pasangan tersimpan

**API Endpoint**: `POST /simnikah/calon-pasangan`

---

### 3.5 UC-005: PENDAFTARAN NIKAH LENGKAP

**Actor**: Calon Pasangan

**Description**: Calon pasangan mendaftar nikah dengan data lengkap

**Preconditions**: 
- User sudah login
- Data calon suami dan istri sudah lengkap
- Data orang tua sudah lengkap
- Data wali nikah sudah lengkap

**Main Flow**:
1. User mengakses endpoint `/simnikah/pendaftaran/lengkap`
2. User input data lengkap (calon suami, istri, orang tua, wali, jadwal)
3. Sistem validasi semua data
4. Sistem cek NIK tidak duplikat
5. Sistem start database transaction
6. Sistem create calon suami
7. Sistem create calon istri
8. Sistem create data orang tua
9. Sistem create wali nikah
10. Sistem create pendaftaran nikah
11. Sistem commit transaction
12. Sistem kirim notifikasi otomatis
13. Sistem return response sukses

**Alternative Flows**:
- 3a. Data tidak valid → Return error
- 4a. NIK duplikat → Return error
- 5a-11a. Error dalam transaction → Rollback dan return error

**Postconditions**: Pendaftaran nikah tersimpan dengan status "Menunggu Verifikasi"

**API Endpoint**: `POST /simnikah/pendaftaran/lengkap`

---

### 3.6 UC-006: VERIFIKASI PENDAFTARAN NIKAH

**Actor**: Staff KUA

**Description**: Staff KUA memverifikasi pendaftaran nikah

**Preconditions**: 
- Staff sudah login dengan role staff
- Ada pendaftaran dengan status "Menunggu Verifikasi"

**Main Flow**:
1. Staff mengakses endpoint `/simnikah/pendaftaran`
2. Sistem tampilkan daftar pendaftaran
3. Staff pilih pendaftaran untuk diverifikasi
4. Staff akses detail pendaftaran
5. Staff review semua dokumen dan data
6. Staff update status pendaftaran
7. Sistem simpan perubahan
8. Sistem kirim notifikasi ke calon pasangan
9. Sistem return response sukses

**Alternative Flows**:
- 6a. Staff menolak pendaftaran → Status "Ditolak"
- 6b. Staff menyetujui pendaftaran → Status "Disetujui"

**Postconditions**: Status pendaftaran terupdate dan notifikasi terkirim

**API Endpoint**: `PUT /simnikah/pendaftaran/:id/status`

---

### 3.7 UC-007: ASSIGN PENGHULU

**Actor**: Kepala KUA

**Description**: Kepala KUA menugaskan penghulu untuk pendaftaran nikah

**Preconditions**: 
- Kepala KUA sudah login
- Pendaftaran sudah disetujui
- Ada penghulu yang tersedia

**Main Flow**:
1. Kepala KUA mengakses endpoint `/simnikah/pendaftaran/:id/assign-penghulu`
2. Kepala KUA pilih penghulu dari daftar
3. Sistem cek ketersediaan penghulu pada tanggal nikah
4. Sistem cek konflik jadwal (minimal 2 jam interval)
5. Sistem assign penghulu ke pendaftaran
6. Sistem simpan perubahan
7. Sistem kirim notifikasi ke penghulu
8. Sistem return response sukses

**Alternative Flows**:
- 3a. Penghulu sudah penuh (3 nikah/hari) → Return error
- 4a. Ada konflik jadwal → Return error dengan detail konflik

**Postconditions**: Penghulu berhasil di-assign dan notifikasi terkirim

**API Endpoint**: `POST /simnikah/pendaftaran/:id/assign-penghulu`

---

### 3.8 UC-008: MANAJEMEN BIMBINGAN PERKAWINAN

**Actor**: Staff KUA, Kepala KUA, Calon Pasangan

**Description**: Mengelola sesi bimbingan perkawinan

**Preconditions**: Staff/Kepala KUA sudah login

**Main Flow**:
1. Staff mengakses endpoint `/simnikah/bimbingan`
2. Staff create sesi bimbingan baru (hari Rabu)
3. Sistem validasi tanggal (harus hari Rabu)
4. Sistem cek tidak ada konflik jadwal
5. Sistem simpan data bimbingan
6. Sistem kirim notifikasi ke calon pasangan
7. Calon pasangan daftar bimbingan
8. Sistem cek kapasitas tersedia
9. Sistem simpan pendaftaran bimbingan
10. Sistem return response sukses

**Alternative Flows**:
- 3a. Bukan hari Rabu → Return error
- 4a. Sudah ada bimbingan di tanggal tersebut → Return error
- 8a. Kapasitas penuh → Return error

**Postconditions**: Bimbingan perkawinan tersedia dan calon pasangan terdaftar

**API Endpoints**: 
- `POST /simnikah/bimbingan` (Create)
- `POST /simnikah/bimbingan/:id/daftar` (Register)

---

### 3.9 UC-009: PENJADWALAN NIKAH

**Actor**: Kepala KUA, Staff KUA

**Description**: Mengelola jadwal nikah dan ketersediaan penghulu

**Preconditions**: Staff/Kepala KUA sudah login

**Main Flow**:
1. Staff mengakses endpoint `/simnikah/kalender-ketersediaan`
2. Sistem tampilkan kalender ketersediaan
3. Staff lihat slot waktu yang tersedia
4. Staff akses detail ketersediaan tanggal
5. Sistem tampilkan jadwal penghulu per tanggal
6. Sistem hitung kapasitas dan sisa kuota
7. Sistem return data ketersediaan

**Alternative Flows**:
- 2a. Tanggal sudah lewat → Status "Terlewat"
- 2b. Kapasitas penuh → Status "Penuh"
- 2c. Masih tersedia → Status "Tersedia"

**Postconditions**: Staff dapat melihat ketersediaan jadwal nikah

**API Endpoints**:
- `GET /simnikah/kalender-ketersediaan`
- `GET /simnikah/ketersediaan-tanggal/:tanggal`
- `GET /simnikah/penghulu-jadwal/:tanggal`

---

### 3.10 UC-010: PENERBITAN SURAT UNDANGAN NIKAH

**Actor**: Kepala KUA

**Description**: Kepala KUA menerbitkan surat undangan nikah dengan tanda tangan digital

**Preconditions**: 
- Kepala KUA sudah login
- Pendaftaran sudah disetujui
- Penghulu sudah di-assign
- Provider tanda tangan digital sudah dikonfigurasi

**Main Flow**:
1. Kepala KUA mengakses endpoint `/simnikah/surat-undangan`
2. Kepala KUA input data surat (pendaftaran_id, penghulu_id, provider)
3. Sistem ambil data pendaftaran lengkap
4. Sistem generate nomor surat unik
5. Sistem generate barcode
6. Sistem panggil provider tanda tangan digital
7. Provider proses tanda tangan
8. Sistem simpan surat dengan signature
9. Sistem update status pendaftaran
10. Sistem return response dengan data surat

**Alternative Flows**:
- 3a. Pendaftaran tidak ditemukan → Return error
- 3b. Pendaftaran belum disetujui → Return error
- 6a. Provider tidak tersedia → Return error
- 7a. Gagal tanda tangan → Return error

**Postconditions**: Surat undangan nikah diterbitkan dengan tanda tangan digital

**API Endpoint**: `POST /simnikah/surat-undangan`

---

### 3.11 UC-011: VERIFIKASI TANDA TANGAN DIGITAL

**Actor**: Semua User

**Description**: Verifikasi keabsahan tanda tangan digital surat nikah

**Preconditions**: Surat nikah sudah diterbitkan dengan tanda tangan digital

**Main Flow**:
1. User mengakses endpoint `/simnikah/surat-undangan/verify`
2. User input signature_id dan document_data
3. Sistem cari surat berdasarkan signature_id
4. Sistem panggil provider untuk verifikasi
5. Provider verifikasi signature
6. Sistem ambil info penandatangan
7. Sistem return hasil verifikasi

**Alternative Flows**:
- 3a. Surat tidak ditemukan → Return error
- 4a. Provider tidak tersedia → Return error
- 5a. Signature tidak valid → Return verification failed

**Postconditions**: User mendapat hasil verifikasi tanda tangan

**API Endpoint**: `POST /simnikah/surat-undangan/verify`

---

### 3.12 UC-012: MANAJEMEN NOTIFIKASI

**Actor**: Semua User, Sistem

**Description**: Mengelola notifikasi otomatis dan manual

**Preconditions**: User sudah login

**Main Flow**:
1. Sistem generate notifikasi otomatis (pendaftaran, status update, reminder)
2. Sistem simpan notifikasi ke database
3. User akses endpoint `/simnikah/notifikasi/user/:user_id`
4. Sistem tampilkan notifikasi user
5. User baca notifikasi
6. Sistem update status notifikasi
7. Sistem return daftar notifikasi

**Alternative Flows**:
- 1a. Notifikasi manual dari staff → Staff create notifikasi
- 5a. User mark all as read → Update semua notifikasi

**Postconditions**: User mendapat notifikasi dan status terupdate

**API Endpoints**:
- `GET /simnikah/notifikasi/user/:user_id`
- `PUT /simnikah/notifikasi/:id/status`
- `PUT /simnikah/notifikasi/user/:user_id/mark-all-read`

---

### 3.13 UC-013: MANAJEMEN STAFF KUA

**Actor**: Kepala KUA

**Description**: Kepala KUA membuat dan mengelola akun staff KUA

**Preconditions**: Kepala KUA sudah login

**Main Flow**:
1. Kepala KUA mengakses endpoint `/simnikah/staff`
2. Kepala KUA create staff baru dengan data lengkap (NIP, nama, jabatan, bagian, kontak)
3. Sistem validasi data staff
4. Sistem cek duplikasi NIP
5. Sistem create akun user dengan role "staff"
6. Sistem simpan data staff KUA
7. Sistem return response sukses dengan informasi login staff

**Alternative Flows**:
- 3a. Data tidak valid → Return error
- 4a. NIP sudah ada → Return error

**Postconditions**: Akun staff KUA berhasil dibuat dan dapat login

**API Endpoints**:
- `POST /simnikah/staff` (Create)
- `GET /simnikah/staff` (List)
- `PUT /simnikah/staff/:id` (Update)

**Note**: Kepala KUA membuat akun staff yang dapat langsung login dengan kredensial yang diberikan.

---

### 3.14 UC-014: MANAJEMEN PENGHULU

**Actor**: Kepala KUA

**Description**: Kepala KUA membuat dan mengelola akun penghulu

**Preconditions**: Kepala KUA sudah login

**Main Flow**:
1. Kepala KUA mengakses endpoint `/simnikah/penghulu`
2. Kepala KUA create penghulu baru dengan data lengkap (NIP, nama, kontak, alamat)
3. Sistem validasi data penghulu
4. Sistem cek duplikasi NIP
5. Sistem create akun user dengan role "penghulu"
6. Sistem simpan data penghulu
7. Sistem return response sukses dengan informasi login penghulu

**Alternative Flows**:
- 3a. Data tidak valid → Return error
- 4a. NIP sudah ada → Return error

**Postconditions**: Akun penghulu berhasil dibuat dan dapat login

**API Endpoints**:
- `POST /simnikah/penghulu` (Create)
- `GET /simnikah/penghulu` (List)
- `PUT /simnikah/penghulu/:id` (Update)

**Note**: Kepala KUA membuat akun penghulu yang dapat langsung login dengan kredensial yang diberikan.

---

### 3.15 UC-015: TRACKING STATUS PENDAFTARAN

**Actor**: Calon Pasangan

**Description**: Calon pasangan melacak status pendaftaran nikah

**Preconditions**: User sudah login dan memiliki pendaftaran

**Main Flow**:
1. User mengakses endpoint `/simnikah/pendaftaran/:id/status-flow`
2. Sistem ambil data pendaftaran
3. Sistem tampilkan alur status lengkap
4. Sistem tampilkan info bimbingan (jika ada)
5. Sistem return status flow

**Alternative Flows**:
- 2a. Pendaftaran tidak ditemukan → Return error

**Postconditions**: User mendapat informasi status pendaftaran lengkap

**API Endpoint**: `GET /simnikah/pendaftaran/:id/status-flow`

---

### 3.16 UC-016: COMPLETION WORKFLOW

**Actor**: Staff KUA, Kepala KUA

**Description**: Menyelesaikan proses nikah (bimbingan dan nikah)

**Preconditions**: Staff/Kepala KUA sudah login

**Main Flow**:
1. Staff akses endpoint untuk complete bimbingan
2. Sistem update status bimbingan
3. Sistem update status pendaftaran
4. Staff akses endpoint untuk complete nikah
5. Sistem update status nikah selesai
6. Sistem return response sukses

**Alternative Flows**:
- 1a. Complete bimbingan → Status "Sudah Bimbingan"
- 4a. Complete nikah → Status "Selesai"

**Postconditions**: Proses nikah selesai

**API Endpoints**:
- `PUT /simnikah/pendaftaran/:id/complete-bimbingan`
- `PUT /simnikah/pendaftaran/:id/complete-nikah`

---

## 4. ALUR PEMBUATAN AKUN

### 4.1 Hierarki Pembuatan Akun
```
Administrator Sistem
    ↓ (membuat)
Kepala KUA
    ↓ (membuat)
Staff KUA & Penghulu
    ↓ (registrasi mandiri)
Calon Pasangan
```

### 4.2 Proses Pembuatan Akun

#### 4.2.1 Akun Kepala KUA
- **Dibuat oleh**: Administrator Sistem
- **Metode**: Endpoint `/register` dengan role "kepala_kua"
- **Data yang diperlukan**: Username, email, password, nama, NIP
- **Hasil**: Akun kepala KUA dapat langsung login

#### 4.2.2 Akun Staff KUA
- **Dibuat oleh**: Kepala KUA
- **Metode**: Endpoint `/simnikah/staff` (POST)
- **Data yang diperlukan**: NIP, nama lengkap, jabatan, bagian, kontak
- **Hasil**: Akun staff dengan role "staff" dapat langsung login

#### 4.2.3 Akun Penghulu
- **Dibuat oleh**: Kepala KUA
- **Metode**: Endpoint `/simnikah/penghulu` (POST)
- **Data yang diperlukan**: NIP, nama lengkap, kontak, alamat
- **Hasil**: Akun penghulu dengan role "penghulu" dapat langsung login

#### 4.2.4 Akun Calon Pasangan
- **Dibuat oleh**: Calon pasangan sendiri
- **Metode**: Endpoint `/register` dengan role "user_biasa"
- **Data yang diperlukan**: Username, email, password, nama
- **Hasil**: Akun calon pasangan dapat langsung login

### 4.3 Keamanan dan Validasi
- Semua akun memerlukan validasi data yang ketat
- NIP harus unik untuk staff dan penghulu
- Username dan email harus unik di seluruh sistem
- Password harus memenuhi kriteria keamanan
- Akun yang dibuat oleh kepala KUA langsung aktif

---

## 5. BUSINESS RULES

### 5.1 Aturan Pendaftaran
- NIK harus unik dan 16 digit
- Tanggal nikah minimal 1 hari dari pendaftaran
- Tanggal nikah maksimal 3 bulan dari pendaftaran
- Bimbingan perkawinan wajib sebelum nikah
- Bimbingan hanya di hari Rabu

### 5.2 Aturan Penghulu
- Maksimal 3 nikah per penghulu per hari
- Interval minimal 2 jam antar nikah
- Penghulu harus aktif untuk di-assign

### 5.3 Aturan Tanda Tangan Digital
- Hanya provider tersertifikasi Komdigi
- Kepala KUA harus memiliki sertifikat digital
- Signature harus diverifikasi

### 5.4 Aturan Notifikasi
- Notifikasi otomatis untuk setiap perubahan status
- Reminder bimbingan 1 hari sebelum
- Reminder nikah 1 hari sebelum

---

## 6. INTEGRATION POINTS

### 6.1 External APIs
- **SIMKAH/Dukcapil**: Validasi NIK
- **Provider Tanda Tangan Digital**: PrivyID, Sertisign, VIDA, iOTENTIK
- **Sistem Notifikasi**: Email, SMS (future)

### 6.2 Database
- **MySQL**: Primary database
- **GORM**: ORM untuk Go
- **Migration**: Auto-migration saat startup

---

## 7. SECURITY CONSIDERATIONS

### 7.1 Authentication
- JWT Token dengan expiry 24 jam
- Password hashing dengan bcrypt
- Role-based access control

### 6.2 Authorization
- Middleware untuk validasi role
- Endpoint protection berdasarkan role
- Multi-role middleware untuk fleksibilitas

### 6.3 Data Protection
- Input validation dan sanitization
- SQL injection prevention dengan GORM
- Sensitive data encryption

---

## 7. ERROR HANDLING

### 7.1 Common Error Responses
```json
{
  "error": "Error message in Indonesian",
  "details": "Additional error details if available"
}
```

### 7.2 HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

---

## 8. PERFORMANCE CONSIDERATIONS

### 8.1 Database Optimization
- Index pada field yang sering di-query
- Connection pooling
- Transaction management

### 8.2 API Performance
- Pagination untuk list data
- Caching untuk data yang jarang berubah
- Async processing untuk notifikasi

---

## 9. MONITORING AND LOGGING

### 9.1 Application Logs
- Request/response logging
- Error logging dengan stack trace
- Performance metrics

### 9.2 Business Metrics
- Jumlah pendaftaran per hari
- Success rate verifikasi
- Response time API

---

## 10. DEPLOYMENT AND MAINTENANCE

### 10.1 Environment Configuration
- Development, Staging, Production
- Environment variables untuk konfigurasi
- Database migration strategy

### 10.2 Backup and Recovery
- Database backup otomatis
- File backup untuk dokumen
- Disaster recovery plan

---

## 11. FUTURE ENHANCEMENTS

### 11.1 Planned Features
- Mobile application
- Integration dengan sistem KUA lainnya
- Advanced reporting dan analytics
- Multi-language support

### 11.2 Technical Improvements
- Microservices architecture
- API versioning
- GraphQL support
- Real-time notifications dengan WebSocket

---

*Dokumentasi ini dibuat berdasarkan analisis kode sistem SimNikah dan dapat diupdate sesuai dengan perkembangan sistem.*
