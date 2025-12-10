# 📄 Dokumentasi Parsing API Surat Pengumuman Nikah

**Versi:** 1.0.0  
**Tanggal:** Desember 2024  
**Status:** ✅ Production Ready

---

## 📋 Daftar Isi

1. [Overview](#overview)
2. [Endpoint List](#endpoint-list)
3. [Authentication](#authentication)
4. [Get Approved Registrations Per Week](#get-approved-registrations-per-week)
5. [Generate Pengumuman Nikah](#generate-pengumuman-nikah)
6. [Parsing HTML Response](#parsing-html-response)
7. [Custom Kop Surat](#custom-kop-surat)
8. [Error Handling](#error-handling)
9. [Contoh Implementasi](#contoh-implementasi)

---

## 🎯 Overview

API Surat Pengumuman Nikah memungkinkan **Staff** dan **Kepala KUA** untuk:

- Mengambil daftar pendaftaran nikah yang telah disetujui per minggu
- Generate surat pengumuman nikah dalam format HTML yang siap dicetak atau dikonversi ke PDF
- Mengkustomisasi kop surat (logo, alamat, kontak, dll)

**Base URL:** Sesuai konfigurasi di `src/lib/api.ts`

---

## 📍 Endpoint List

| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/simnikah/staff/pengumuman-nikah/list` | `staff`, `kepala_kua` | Daftar pendaftaran disetujui per minggu |
| `GET/POST` | `/simnikah/staff/pengumuman-nikah/generate` | `staff`, `kepala_kua` | Generate surat pengumuman (HTML) |
| `GET` | `/simnikah/kepala-kua/pengumuman-nikah/list` | `kepala_kua` | Daftar pendaftaran disetujui per minggu |
| `GET/POST` | `/simnikah/kepala-kua/pengumuman-nikah/generate` | `kepala_kua` | Generate surat pengumuman (HTML) |

---

## 🔐 Authentication

Semua endpoint memerlukan authentication token. Token otomatis ditambahkan oleh interceptor di `src/lib/api.ts`.

---

## 📊 Get Approved Registrations Per Week

### API Function

```typescript
import { getPengumumanList, getPengumumanListKepalaKUA } from '@/lib/simnikah-api';

// Staff
const data = await getPengumumanList({
  tanggal_awal: '2024-12-16',
  tanggal_akhir: '2024-12-22'
});

// Kepala KUA
const data = await getPengumumanListKepalaKUA({
  tanggal_awal: '2024-12-16',
  tanggal_akhir: '2024-12-22'
});
```

### Response Structure

```typescript
interface PengumumanListResponse {
  success: boolean;
  message: string;
  data: {
    tanggal_awal: string;
    tanggal_akhir: string;
    periode: string;
    total: number;
    registrations: Array<{
      id: number;
      nomor_pendaftaran: string;
      tanggal_nikah: string;
      waktu_nikah: string;
      tempat_nikah: string;
      alamat_akad: string;
      calon_suami: { nama_lengkap: string };
      calon_istri: { nama_lengkap: string };
      wali_nikah: {
        nama_dan_bin: string;
        hubungan_wali: string;
      };
    }>;
  };
}
```

---

## 📝 Generate Pengumuman Nikah

### API Function

```typescript
import { 
  generatePengumumanNikah,
  generatePengumumanNikahKepalaKUA,
  type CustomKopSurat
} from '@/lib/simnikah-api';

// Generate dengan default kop surat
const html = await generatePengumumanNikah({
  tanggal_awal: '2024-12-16',
  tanggal_akhir: '2024-12-22'
});

// Generate dengan custom kop surat
const customKop: CustomKopSurat = {
  nama_kua: "KANTOR URUSAN AGAMA KECAMATAN BANJARMASIN UTARA",
  alamat_kua: "Jl. Contoh No. 123",
  kota: "Kota Banjarmasin",
  provinsi: "Kalimantan Selatan",
  kode_pos: "70123",
  telepon: "0511-1234567",
  email: "kua@example.com",
  website: "https://kua.example.com",
  logo_url: "https://example.com/logo.png"
};

const html = await generatePengumumanNikah(
  {
    tanggal_awal: '2024-12-16',
    tanggal_akhir: '2024-12-22'
  },
  customKop
);
```

### Response

Response berupa HTML string yang siap dicetak atau dikonversi ke PDF.

---

## 🔍 Parsing HTML Response

### Helper Functions

```typescript
import {
  parsePengumumanHTML,
  printPengumumanHTML,
  downloadPengumumanHTML,
  displayPengumumanInIframe,
  convertHTMLToPDF
} from '@/utils/helpers/pengumuman';

// Parse dan validasi HTML
const parsedHTML = parsePengumumanHTML(html);

// Print
printPengumumanHTML(html);

// Download sebagai HTML file
downloadPengumumanHTML(html, 'pengumuman-nikah.html');

// Display di iframe
displayPengumumanInIframe(html, 'pengumuman-iframe');

// Convert ke PDF (requires html2pdf.js)
await convertHTMLToPDF(html, 'pengumuman-nikah.pdf');
```

---

## 🎨 Custom Kop Surat

### Interface

```typescript
interface CustomKopSurat {
  nama_kua?: string;
  alamat_kua?: string;
  kota?: string;
  provinsi?: string;
  kode_pos?: string;
  telepon?: string;
  email?: string;
  website?: string;
  logo_url?: string;
}
```

### Catatan Penting

- `logo_url` harus berupa URL yang dapat diakses (tidak bisa menggunakan base64 atau file lokal)
- Jika logo tidak dapat di-load, surat tetap akan di-generate tanpa logo
- Semua field optional, jika tidak dikirim akan menggunakan default

---

## ⚠️ Error Handling

### Menggunakan Error Handler

```typescript
import { handleApiError } from '@/utils/errorHandler';

try {
  const html = await generatePengumumanNikah(params);
} catch (error) {
  const errorInfo = handleApiError(error);
  
  // Tampilkan error ke user
  toast.error(errorInfo.message);
}
```

### HTTP Status Codes

| Code | Deskripsi |
|------|-----------|
| `200` | Success (untuk generate HTML) |
| `400` | Bad Request (format tanggal tidak valid) |
| `401` | Unauthorized (token tidak valid atau tidak ada) |
| `403` | Forbidden (tidak punya permission/role) |
| `500` | Internal Server Error |

---

## 💻 Contoh Implementasi Lengkap

### React Component

Lihat implementasi lengkap di `src/components/admin/PengumumanNikahGenerator.tsx`

### Contoh Sederhana

```typescript
'use client';

import { useState } from 'react';
import { generatePengumumanNikah } from '@/lib/simnikah-api';
import { printPengumumanHTML, downloadPengumumanHTML } from '@/utils/helpers/pengumuman';
import { handleApiError } from '@/utils/errorHandler';

export function SimplePengumumanGenerator() {
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const htmlContent = await generatePengumumanNikah({
        tanggal_awal: '2024-12-16',
        tanggal_akhir: '2024-12-22'
      });
      setHtml(htmlContent);
    } catch (error) {
      const errorInfo = handleApiError(error);
      alert(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={generate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate'}
      </button>
      
      {html && (
        <>
          <button onClick={() => printPengumumanHTML(html)}>Print</button>
          <button onClick={() => downloadPengumumanHTML(html)}>Download</button>
          <iframe srcDoc={html} style={{ width: '100%', height: '800px' }} />
        </>
      )}
    </div>
  );
}
```

---

## 📌 Best Practices

1. **Validasi Tanggal:** Selalu validasi format tanggal sebelum mengirim request
2. **Error Handling:** Gunakan `handleApiError` untuk konsisten error handling
3. **Loading State:** Tampilkan loading indicator saat generate
4. **HTML Validation:** Gunakan `parsePengumumanHTML` untuk validasi response
5. **Security:** Jangan expose token di client-side code yang bisa diakses public
6. **Logo URL:** Pastikan logo URL accessible dan menggunakan HTTPS

---

## 🔗 Related Documentation

- [API Documentation Lengkap](../documentasi%20terbaru%20backend.md)
- [Alur Pendaftaran dan Jam](./ALUR_PENDAFTARAN_DAN_JAM.md)
- [Utils & Validators](../src/utils/README.md)

---

**Last Updated:** Desember 2024  
**Version:** 1.0.0

