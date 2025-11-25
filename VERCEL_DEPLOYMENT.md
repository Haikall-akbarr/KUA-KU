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
| `NEXT_PUBLIC_API_URL` | `https://simnikah-api-production-5583.up.railway.app` | URL API Backend |
| `NEXT_PUBLIC_API_PROXY` | `/api/proxy` | Proxy path untuk API |

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

### Proxy Error

Jika proxy error:
1. Pastikan `NEXT_PUBLIC_API_PROXY` di-set ke `/api/proxy`
2. Cek file `src/app/api/proxy/[...segments]/route.ts` sudah ada

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

