# Dokumentasi Body Request & Logic Percabangan SimNikah API

## Daftar Isi
1. [Pendaftaran Nikah](#1-pendaftaran-nikah)
2. [Ketersediaan Jadwal](#2-ketersediaan-jadwal)
3. [Verifikasi & Approval](#3-verifikasi--approval)
4. [Assign Penghulu](#4-assign-penghulu)
5. [Aturan Kapasitas](#5-aturan-kapasitas)

---

## 1. Pendaftaran Nikah

### Endpoint: `POST /simnikah/pendaftaran`

```json
{
  "calon_laki_laki": {
    "nama_dan_bin": "Ahmad bin Abdullah",
    "pendidikan_akhir": "S1",
    "umur": 25
  },
  "calon_perempuan": {
    "nama_dan_binti": "Siti binti Muhammad",
    "pendidikan_akhir": "S1",
    "umur": 23
  },
  "lokasi_nikah": {
    "tempat_nikah": "Di KUA",
    "tanggal_nikah": "2024-12-25",
    "waktu_nikah": "09:00",
    "alamat_nikah": "",
    "detail_alamat": "",
    "kelurahan": ""
  },
  "wali_nikah": {
    "nama_dan_bin": "Abdullah bin Muhammad",
    "hubungan_wali": "Ayah Kandung"
  }
}
```

### Percabangan Logic Pendaftaran

```
┌─────────────────────────────────────────────────────────────────┐
│                    VALIDASI PENDAFTARAN                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. CEK UMUR                                                     │
│    - Laki-laki >= 19 tahun                                      │
│    - Perempuan >= 16 tahun                                      │
│    ❌ Error: "Umur tidak memenuhi syarat"                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. CEK TANGGAL                                                  │
│    - Tidak boleh tanggal yang sudah lewat                       │
│    - Minimal H+10 dari hari ini                                 │
│    ❌ Error: "Tanggal tidak valid"                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. CEK HARI LIBUR (jika tempat_nikah = "Di KUA")                │
│    - Minggu = Libur                                             │
│    - Hari libur nasional = Libur                                │
│    ❌ Error: "KUA tutup pada hari libur"                        │
│    ✅ Saran: "Pilih nikah di luar KUA"                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. CEK KAPASITAS                                                │
│    Lihat bagian "Aturan Kapasitas" di bawah                     │
└─────────────────────────────────────────────────────────────────┘
```

### Field `tempat_nikah`

| Nilai | Alamat Wajib? | Hari Libur |
|-------|---------------|------------|
| `"Di KUA"` | ❌ Tidak | ❌ Tidak bisa |
| `"Di Luar KUA"` | ✅ Wajib | ✅ Bisa |

### Kelurahan Valid (Banjarmasin Utara)
- Sungai Miai, Sungai Andai, Surgi Mufti, Pangeran
- Kuin Utara, Antasan Kecil Timur
- Alalak Utara, Alalak Tengah, Alalak Selatan

---

## 2. Ketersediaan Jadwal

### Endpoint: `GET /simnikah/kalender-ketersediaan`

Query: `?bulan=12&tahun=2024`

### Response per Hari

```json
{
  "tanggal": 25,
  "tanggal_str": "2024-12-25",
  "hari": "Wednesday",
  "status": "Tersedia",
  "tersedia": true,
  "tersedia_kua": true,
  "tersedia_luar_kua": true,
  "is_hari_libur": false,
  "nama_hari_libur": "",
  "time_slots": [
    {
      "waktu": "09:00",
      "kua": {
        "tersedia": true,
        "terbooking": false,
        "slot_tersisa": 1
      },
      "luar_kua": {
        "tersedia": true,
        "terbooking": false,
        "slot_tersisa": 3
      },
      "total_pernikahan": 0,
      "slot_tersisa": 3
    }
  ]
}
```

### Percabangan Status Hari

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATUS KETERSEDIAAN HARI                     │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
    ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
    │ Tanggal Lewat │ │  Hari Libur   │ │  Hari Biasa   │
    └───────────────┘ └───────────────┘ └───────────────┘
            │                 │                 │
            ▼                 ▼                 ▼
    ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
    │status:Terlewat│ │status:Libur   │ │ Cek Kapasitas │
    │tersedia:false │ │tersedia:true  │ │               │
    │kua:false      │ │kua:false      │ │               │
    │luar_kua:false │ │luar_kua:true  │ │               │
    └───────────────┘ └───────────────┘ └───────────────┘
                                                │
                              ┌─────────────────┼─────────────────┐
                              ▼                 ▼                 ▼
                      ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
                      │ Total >= 9    │ │ 0 < Total < 9 │ │  Total = 0    │
                      └───────────────┘ └───────────────┘ └───────────────┘
                              │                 │                 │
                              ▼                 ▼                 ▼
                      ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
                      │status: Penuh  │ │status:Sebagian│ │status:Tersedia│
                      │tersedia:false │ │tersedia:true  │ │tersedia:true  │
                      └───────────────┘ └───────────────┘ └───────────────┘
```

---

## 3. Verifikasi & Approval

### A. Verifikasi Formulir (Staff)

**Endpoint:** `POST /simnikah/staff/verify-formulir/:id`

```json
{
  "status": "Disetujui",
  "catatan": "Formulir lengkap dan valid"
}
```

| Status | Hasil |
|--------|-------|
| `"Disetujui"` | Lanjut ke approval |
| `"Ditolak"` | Pendaftaran ditolak |

### B. Approve Pendaftaran (Staff)

**Endpoint:** `POST /simnikah/staff/approve/:id`

```json
{
  "status": "Disetujui",
  "catatan": "Pendaftaran disetujui"
}
```

### Flow Status Pendaftaran

```
Draft → Disetujui → Penghulu Ditugaskan → Selesai
          ↓
       Ditolak
```

---

## 4. Assign Penghulu

### Endpoint: `POST /simnikah/pendaftaran/:id/assign-penghulu`

```json
{
  "penghulu_id": 1,
  "catatan": "Ditugaskan ke H. Ahmad"
}
```

### Percabangan Validasi Assign

```
┌─────────────────────────────────────────────────────────────────┐
│                    VALIDASI ASSIGN PENGHULU                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. CEK STATUS PENDAFTARAN                                       │
│    - Harus "Disetujui" atau "Menunggu Penugasan"                │
│    ❌ Error: "Status tidak sesuai"                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. CEK PENGHULU AKTIF                                           │
│    - Penghulu harus status "Aktif"                              │
│    ❌ Error: "Penghulu tidak ditemukan"                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. CEK JADWAL PENGHULU                                          │
│    - 1 penghulu = 1 pernikahan per jam                          │
│    - Cek apakah sudah ada jadwal di tanggal+jam yang sama       │
│    ❌ Error: "Penghulu tidak tersedia"                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ ✅ BERHASIL: Status → "Penghulu Ditugaskan"                     │
└─────────────────────────────────────────────────────────────────┘
```

### Lihat Penghulu Tersedia

**Endpoint:** `GET /simnikah/kepala-kua/penghulu-tersedia?tanggal=2024-12-25&waktu=09:00`

---

## 5. Aturan Kapasitas

### Batasan Utama

| Batasan | Nilai |
|---------|-------|
| Maksimal per hari | 9 pernikahan |
| Maksimal per jam | 3 pernikahan |
| Maksimal KUA per jam | 1 pernikahan |
| Maksimal per penghulu per jam | 1 pernikahan |
| Jumlah penghulu | 3 orang |
| Time slots | 08:00 - 16:00 (9 slot) |

### Percabangan Kapasitas per Jam

```
┌─────────────────────────────────────────────────────────────────┐
│              VALIDASI KAPASITAS PER JAM (Contoh 09:00)          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Total pernikahan di jam ini = ?                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  Total = 0    │     │ Total = 1-2   │     │  Total = 3    │
│               │     │               │     │               │
│ KUA: ✅ 1     │     │ Cek detail    │     │ KUA: ❌       │
│ Luar: ✅ 3    │     │               │     │ Luar: ❌      │
└───────────────┘     └───────────────┘     └───────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
    ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
    │ 1 di KUA      │ │ 1 di Luar     │ │ 2 di Luar     │
    │               │ │               │ │               │
    │ KUA: ❌       │ │ KUA: ✅ 1     │ │ KUA: ✅ 1     │
    │ Luar: ✅ 2    │ │ Luar: ✅ 2    │ │ Luar: ✅ 1    │
    └───────────────┘ └───────────────┘ └───────────────┘
```

### Tabel Skenario Kapasitas

| Kondisi Jam | Di KUA | Di Luar KUA | Total Tersisa |
|-------------|--------|-------------|---------------|
| Kosong | ✅ 1 slot | ✅ 3 slot | 3 |
| 1 di KUA | ❌ Penuh | ✅ 2 slot | 2 |
| 1 di Luar | ✅ 1 slot | ✅ 2 slot | 2 |
| 2 di Luar | ✅ 1 slot | ✅ 1 slot | 1 |
| 3 di Luar | ❌ Penuh | ❌ Penuh | 0 |
| 1 KUA + 2 Luar | ❌ Penuh | ❌ Penuh | 0 |

### Hari Libur

| Hari/Tanggal | Di KUA | Di Luar KUA |
|--------------|--------|-------------|
| Minggu | ❌ | ✅ |
| Hari Libur Nasional | ❌ | ✅ |
| Hari Biasa | ✅ | ✅ |

---

## 6. Body Request Lainnya

### Update Alamat Nikah
**Endpoint:** `PUT /simnikah/pendaftaran/:id/alamat`
```json
{
  "alamat_akad": "Jl. Pangeran No. 10, RT 05 RW 02"
}
```

### Complete Marriage (Penghulu)
**Endpoint:** `POST /simnikah/penghulu/complete-marriage/:id`
```json
{
  "catatan": "Pernikahan telah dilaksanakan"
}
```

### Buat Notifikasi
**Endpoint:** `POST /simnikah/notifikasi`
```json
{
  "user_id": "USR123",
  "judul": "Pengingat",
  "pesan": "Pernikahan Anda besok",
  "tipe": "Info",
  "link": "/pendaftaran/1"
}
```

### Buat Staff (Kepala KUA)
**Endpoint:** `POST /simnikah/kepala-kua/staff`
```json
{
  "username": "staff_baru",
  "email": "staff@kua.go.id",
  "password": "password123",
  "nama": "Staff Baru",
  "nip": "198501012010011001",
  "jabatan": "Staff",
  "bagian": "Pelayanan",
  "no_hp": "081234567890",
  "alamat": "Jl. Contoh No. 1"
}
```

### Buat Penghulu (Kepala KUA)
**Endpoint:** `POST /simnikah/kepala-kua/penghulu`
```json
{
  "username": "penghulu_baru",
  "email": "penghulu@kua.go.id",
  "password": "password123",
  "nama": "H. Penghulu Baru",
  "nip": "198501012010011002",
  "no_hp": "081234567891"
}
```

---

## 7. Error Response Format

```json
{
  "success": false,
  "message": "Pesan singkat error",
  "error": "Penjelasan detail error",
  "type": "validation|schedule_conflict|holiday_restriction|not_found",
  "field": "nama_field_yang_error",
  "saran": "Saran untuk user",
  "data": {
    "info_tambahan": "nilai"
  }
}
```

### Tipe Error

| Type | Deskripsi |
|------|-----------|
| `validation` | Data tidak valid |
| `schedule_conflict` | Jadwal bentrok |
| `holiday_restriction` | Hari libur |
| `not_found` | Data tidak ditemukan |
| `authentication` | Tidak terautentikasi |
| `authorization` | Tidak punya akses |
