# 🚀 Panduan Deployment ke Vercel

## Prerequisites

1. **Akun Vercel**: Pastikan Anda sudah memiliki akun di [vercel.com](https://vercel.com)
2. **Git Repository**: Project harus sudah di-push ke GitHub/GitLab/Bitbucket
3. **Node.js**: Vercel akan otomatis menggunakan Node.js yang sesuai

## Langkah-langkah Deployment

### 1. Install Vercel CLI (Opsional)

```bash
npm i -g vercel
```

### 2. Login ke Vercel

```bash
vercel login
```

### 3. Deploy via Vercel Dashboard (Recommended)

#### A. Import Project
1. Buka [vercel.com/dashboard](https://vercel.com/dashboard)
2. Klik **"Add New..."** → **"Project"**
3. Import repository dari GitHub/GitLab/Bitbucket
4. Pilih repository project ini

#### B. Configure Project
1. **Framework Preset**: Vercel akan otomatis detect Next.js
2. **Root Directory**: Biarkan kosong (atau `.` jika perlu)
3. **Build Command**: `npm run build` (sudah otomatis)
4. **Output Directory**: `.next` (sudah otomatis)
5. **Install Command**: `npm install` (sudah otomatis)

#### C. Environment Variables
Tambahkan environment variables berikut di Vercel Dashboard:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://simnikah-api-production-5583.up.railway.app` | URL API Backend (harus dengan `https://`) |
| `NEXT_PUBLIC_API_PROXY` | `/api/proxy` | Proxy path untuk API |

**⚠️ Penting:** 
- `NEXT_PUBLIC_API_URL` harus dimulai dengan `https://` atau `http://`
- Jika tidak ada protokol, akan otomatis ditambahkan `https://`
- Jangan tambahkan trailing slash (`/`) di akhir URL

**Cara menambahkan:**
1. Di halaman project settings, klik **"Environment Variables"**
2. Tambahkan setiap variable dengan value yang sesuai
3. Pilih environment: **Production**, **Preview**, dan **Development**
4. Klik **"Save"**

#### D. Deploy
1. Klik **"Deploy"**
2. Tunggu proses build selesai (biasanya 2-5 menit)
3. Setelah selesai, Anda akan mendapatkan URL production

### 4. Deploy via CLI (Alternative)

```bash
# Deploy ke production
vercel --prod

# Atau deploy preview
vercel
```

## Konfigurasi Tambahan

### Custom Domain
1. Di Vercel Dashboard, masuk ke project settings
2. Klik **"Domains"**
3. Tambahkan domain custom Anda
4. Ikuti instruksi untuk setup DNS

### Environment Variables per Environment

Anda bisa set environment variables berbeda untuk:
- **Production**: Untuk production deployment
- **Preview**: Untuk preview deployments (setiap PR)
- **Development**: Untuk development deployments

### Build Settings

File `vercel.json` sudah dikonfigurasi dengan:
- Build command: `npm run build`
- Framework: Next.js (auto-detected)
- Region: Singapore (sin1) untuk latency terbaik di Indonesia

## Troubleshooting

### Build Error

Jika build error, cek:
1. **TypeScript errors**: Pastikan semua type errors sudah diperbaiki
2. **Missing dependencies**: Pastikan semua dependencies ada di `package.json`
3. **Environment variables**: Pastikan semua env vars sudah di-set

### API Connection Error

Jika API tidak bisa diakses:
1. Pastikan `NEXT_PUBLIC_API_URL` sudah benar
2. Pastikan API backend sudah accessible dari internet
3. Cek CORS settings di backend API

### 403 Forbidden Error saat Login

Jika mendapat error 403 saat login di Vercel:

**Penyebab:**
- Backend API memblokir request karena CORS policy
- Backend API tidak mengizinkan request dari domain Vercel

**Solusi:**
1. **Setup CORS di Backend API:**
   - Buka file `BACKEND_CORS_SETUP.md` untuk panduan lengkap
   - Tambahkan domain Vercel ke allowed origins:
     - Production: `https://your-app.vercel.app`
     - Preview: `https://*.vercel.app` (wildcard untuk semua preview)
   - Deploy perubahan ke backend

2. **Cek Environment Variables:**
   - Pastikan `NEXT_PUBLIC_API_URL` sudah di-set di Vercel
   - Pastikan value-nya benar (tanpa trailing slash)

3. **Test dari Browser Console:**
   ```javascript
   // Test langsung ke backend API
   fetch('https://simnikah-api-production-5583.up.railway.app/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ username: 'test', password: 'test' })
   })
   .then(res => console.log('Status:', res.status))
   .catch(err => console.error('Error:', err));
   ```

4. **Cek Vercel Logs:**
   - Buka Vercel Dashboard → Project → Logs
   - Cari log dengan prefix `[proxy]` untuk melihat detail request
   - Cek apakah request dikirim dengan benar ke backend

5. **Cek Backend Logs:**
   - Cek logs backend untuk melihat apakah request diterima
   - Cek apakah ada error CORS di backend logs

### 500 Internal Server Error

Jika mendapat error 500 saat login atau request lainnya:

**Penyebab:**
- Backend API mengalami error internal saat memproses request
- Database connection error
- Validation error di backend
- Missing required fields atau data format tidak sesuai

**Solusi:**
1. **Cek Vercel Logs:**
   - Buka Vercel Dashboard → Project → Logs
   - Cari log dengan prefix `[proxy] ❌ 500 INTERNAL SERVER ERROR`
   - Lihat `Error Response Body` untuk detail error dari backend

2. **Cek Backend Logs:**
   - Cek logs backend untuk melihat stack trace error
   - Cek apakah ada database connection error
   - Cek apakah ada validation error

3. **Cek Request Body:**
   - Pastikan request body sesuai dengan format yang diharapkan backend
   - Cek apakah semua required fields sudah dikirim
   - Cek format data (string, number, date, dll)

4. **Test dengan Postman/curl:**
   ```bash
   # Test langsung ke backend API
   curl -X POST https://simnikah-api-production-5583.up.railway.app/login \
     -H "Content-Type: application/json" \
     -d '{"username":"test","password":"test"}' \
     -v
   ```

5. **Common Issues:**
   - **Database connection**: Pastikan database backend accessible
   - **Missing environment variables**: Pastikan semua env vars backend sudah di-set
   - **Data format**: Pastikan format data sesuai dengan yang diharapkan backend
   - **Validation error**: Cek apakah semua required fields sudah dikirim dengan format yang benar

### Proxy Error

Jika proxy error:
1. Pastikan `NEXT_PUBLIC_API_PROXY` di-set ke `/api/proxy`
2. Cek file `src/app/api/proxy/[...segments]/route.ts` sudah ada

### Invalid URL Error

Jika mendapat error `TypeError: Invalid URL`:

**Penyebab:**
- `NEXT_PUBLIC_API_URL` tidak memiliki protokol (`https://` atau `http://`)
- Format URL tidak valid

**Solusi:**
1. **Cek Environment Variable:**
   - Pastikan `NEXT_PUBLIC_API_URL` dimulai dengan `https://` atau `http://`
   - Contoh yang benar: `https://simnikah-api-production-5583.up.railway.app`
   - Contoh yang salah: `simnikah-api-production-5583.up.railway.app` (tanpa protokol)

2. **Update di Vercel:**
   - Buka Vercel Dashboard → Project → Settings → Environment Variables
   - Edit `NEXT_PUBLIC_API_URL` dan pastikan ada `https://` di depan
   - Redeploy project

3. **Catatan:**
   - Kode sudah otomatis menambahkan `https://` jika tidak ada protokol
   - Tapi lebih baik set dengan benar di environment variable

## Post-Deployment Checklist

- [ ] Test semua fitur utama
- [ ] Test login/logout
- [ ] Test form pendaftaran nikah
- [ ] Test API connections
- [ ] Test maps (jika menggunakan Leaflet)
- [ ] Test file uploads (jika ada)
- [ ] Setup custom domain (jika perlu)
- [ ] Setup monitoring (Vercel Analytics)

## Monitoring & Analytics

Vercel menyediakan:
- **Analytics**: Traffic dan performance metrics
- **Speed Insights**: Core Web Vitals
- **Logs**: Real-time deployment logs

Aktifkan di Vercel Dashboard → Project Settings → Analytics

## Support

Jika ada masalah:
1. Cek [Vercel Documentation](https://vercel.com/docs)
2. Cek build logs di Vercel Dashboard
3. Cek environment variables sudah benar

---

**Happy Deploying! 🎉**

