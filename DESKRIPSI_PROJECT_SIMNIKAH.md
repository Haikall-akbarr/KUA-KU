# SimNikah – Aplikasi Pendamping Simkah untuk Pendataan & Penjadwalan Nikah

## 1. Deskripsi Singkat

SimNikah adalah **aplikasi web pendamping Simkah** yang digunakan di lingkungan **Kantor Urusan Agama (KUA)** untuk:

- Mendata pendaftaran nikah.
- Mengatur **penjadwalan akad** dan tugas penghulu.
- Menyajikan informasi jadwal secara **transparan** kepada pihak internal KUA, serta (opsional) kepada calon pengantin.

Aplikasi ini tidak menggantikan sistem Simkah resmi, tetapi **melengkapi** dengan fokus pada **pendataan dan penjadwalan yang lebih terstruktur, rapi, dan mudah diakses**.

---

## 2. Tujuan Utama

- **Digitalisasi pendataan pendaftaran nikah** sehingga tidak bergantung pada pencatatan manual.
- **Transparansi penjadwalan**:
  - Mengurangi bentrok jadwal akad.
  - Mengurangi miskomunikasi antara staff, kepala KUA, penghulu, dan catin.
- **Mendukung pengambilan keputusan** di tingkat Kepala KUA lewat ringkasan data dan laporan.
- **Mempercepat proses administrasi** seperti pembuatan surat pengumuman nikah dari data yang sudah ada.

---

## 3. Ruang Lingkup & Fungsi Utama

### 3.1. Pendataan Pendaftaran Nikah

- Input data calon pengantin:
  - Data calon suami & calon istri.
  - Data wali, saksi, dan informasi lain yang diperlukan.
- Input detail pelaksanaan:
  - Tanggal dan waktu akad.
  - Tempat/lokasi akad.
- Data tersimpan terstruktur di sistem, siap dipakai untuk:
  - Penjadwalan.
  - Laporan dan pengumuman.

### 3.2. Penjadwalan Akad & Penghulu

- Pengaturan jadwal akad nikah:
  - Melihat **ketersediaan tanggal & waktu** (kalender ketersediaan).
  - Menghindari **double booking** penghulu.
- Penugasan penghulu:
  - Kepala KUA dapat meng-assign penghulu ke setiap pendaftaran.
  - Penghulu dapat melihat **jadwal tugasnya sendiri**.

### 3.3. Transparansi Status & Jadwal

- **Untuk catin**:
  - Melihat status pendaftaran (proses verifikasi, persetujuan, penjadwalan).
  - Melihat ringkasan jadwal akad (tanggal, waktu, tempat).
- **Untuk internal KUA**:
  - Staff dan Kepala KUA memiliki tampilan dashboard dan tabel data yang jelas:
    - Daftar pendaftaran.
    - Status tiap pendaftaran.
    - Jadwal yang sudah ditetapkan.

### 3.4. Surat Pengumuman Nikah

- Menghasilkan **Surat Pengumuman Nikah** secara otomatis dari data yang sudah tercatat:
  - Mengambil data list pendaftar yang akan diumumkan.
  - Menyusun dokumen HTML surat pengumuman (berisi kop surat, periode, dan daftar pasangan).
  - Memudahkan pencetakan dan pengarsipan.
- Proses ini menghemat waktu dan mengurangi kesalahan pengetikan manual.

---

## 4. Peran Pengguna & Kegunaan bagi Masing-Masing

### 4.1. Catin (Calon Pengantin)

- **Fungsi:**
  - Mengisi form pendaftaran nikah secara online.
  - Melihat status pengajuan dan jadwal akad.
- **Kegunaan:**
  - Tidak perlu sering datang hanya untuk cek status.
  - Mengurangi ketidakpastian karena informasi status & jadwal jelas.

### 4.2. Staff KUA

- **Fungsi:**
  - Mengelola data pendaftaran.
  - Melakukan verifikasi dan update status.
- **Kegunaan:**
  - Pekerjaan administrasi lebih cepat dan rapi.
  - Data mudah dicari dan difilter.
  - Mengurangi risiko kehilangan/tercecer berkas fisik.

### 4.3. Kepala KUA

- **Fungsi:**
  - Memantau seluruh pendaftaran dan jadwal.
  - Mengelola data pegawai dan penghulu.
  - Menyetujui dan mengawasi penjadwalan.
  - Menghasilkan surat pengumuman nikah.
- **Kegunaan:**
  - Punya gambaran menyeluruh (overview) kondisi pernikahan di wilayahnya.
  - Lebih mudah membuat keputusan dan laporan.
  - Proses pengumuman nikah menjadi cepat dan konsisten.

### 4.4. Penghulu

- **Fungsi:**
  - Melihat jadwal tugas akad nikah yang sudah di-assign.
- **Kegunaan:**
  - Mengurangi benturan jadwal.
  - Punya informasi lengkap sebelum pelaksanaan (nama pasangan, lokasi, waktu).

---

## 5. Alur Kerja Singkat Sistem

1. **Pendaftaran**  
   Catin mengisi form pendaftaran nikah → data tersimpan di sistem.

2. **Verifikasi oleh Staff**  
   Staff memeriksa kelengkapan dan kebenaran data → update status.

3. **Penjadwalan & Penugasan**  
   - Jadwal akad ditetapkan (tanggal, jam, lokasi).
   - Kepala KUA atau staff meng-assign penghulu.

4. **Pengumuman & Informasi**  
   - Sistem dapat membuat surat pengumuman nikah dari data yang sudah ada.
   - Catin dapat melihat status dan jadwal.
   - Penghulu dapat melihat jadwal tugas.

5. **Pelaksanaan & Arsip**  
   - Setelah akad berjalan, data dapat digunakan untuk laporan dan arsip internal.

---

## 6. Manfaat Utama Secara Ringkas

- **Keteraturan data**: Semua pendaftaran dan jadwal tercatat rapi dan terpusat.
- **Transparansi**: Jadwal akad dan status pengajuan dapat diakses pihak terkait.
- **Efisiensi**: Mengurangi pekerjaan manual, penulisan ulang, dan pencarian berkas.
- **Akurasi**: Minim salah input dan salah jadwal.
- **Dukungan keputusan**: Memudahkan Kepala KUA melihat tren dan membuat laporan.

---

## 7. Teknologi yang Digunakan (Singkat)

- **Frontend**: Next.js (React)
- **Komunikasi API**: Axios melalui wrapper `simnikah-api.ts`
- **Manajemen Form**: `react-hook-form`
- **Backend**: Terhubung ke endpoint SimNikah/Simkah pendamping (via proxy API Next.js)
- **Format Dokumen**: Surat pengumuman dibuat dalam bentuk HTML yang siap dicetak.
