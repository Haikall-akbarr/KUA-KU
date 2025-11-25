# Environment Variables untuk Vercel

## Required Environment Variables

Tambahkan environment variables berikut di Vercel Dashboard:

### 1. NEXT_PUBLIC_API_URL
```
Value: https://simnikah-api-production-5583.up.railway.app
Description: URL API Backend
Environment: Production, Preview, Development
```

### 2. NEXT_PUBLIC_API_PROXY
```
Value: /api/proxy
Description: Proxy path untuk API (digunakan di client-side)
Environment: Production, Preview, Development
```

## Cara Menambahkan di Vercel

1. Buka Vercel Dashboard → Project Settings
2. Klik **"Environment Variables"**
3. Tambahkan setiap variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://simnikah-api-production-5583.up.railway.app`
   - **Environment**: Pilih semua (Production, Preview, Development)
4. Klik **"Save"**
5. Ulangi untuk `NEXT_PUBLIC_API_PROXY`

## Catatan

- Environment variables dengan prefix `NEXT_PUBLIC_` akan di-expose ke client-side
- Pastikan API URL sudah accessible dari internet
- Setelah menambahkan env vars, perlu redeploy untuk apply changes

