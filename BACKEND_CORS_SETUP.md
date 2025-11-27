# 🔧 Panduan Setup CORS di Backend API

Error 403 di Vercel biasanya disebabkan oleh backend API yang memblokir request karena CORS policy. Dokumen ini menjelaskan cara mengatur CORS di backend API.

## 📋 Informasi Backend API

- **URL API**: `https://simnikah-api-production-5583.up.railway.app`
- **Platform**: Railway.app
- **Framework**: (Perlu dikonfirmasi - Express.js, Flask, FastAPI, dll)

---

## 🚀 Setup CORS untuk Framework Populer

### 1. Express.js (Node.js)

Jika backend menggunakan Express.js, install dan konfigurasi CORS:

```bash
npm install cors
```

**Contoh konfigurasi:**

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// Option 1: Allow all origins (NOT RECOMMENDED for production)
app.use(cors());

// Option 2: Allow specific origins (RECOMMENDED)
const allowedOrigins = [
  'http://localhost:3000',           // Local development
  'http://localhost:9002',           // Local development (port 9002)
  'https://your-vercel-app.vercel.app', // Vercel production
  'https://*.vercel.app',             // All Vercel preview deployments
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        // Handle wildcard domains like *.vercel.app
        const pattern = allowed.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return allowed === origin;
    })) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Handle preflight requests
app.options('*', cors());
```

**Atau menggunakan environment variable:**

```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:9002',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

---

### 2. Flask (Python)

Jika backend menggunakan Flask:

```bash
pip install flask-cors
```

**Contoh konfigurasi:**

```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# Option 1: Allow all origins (NOT RECOMMENDED)
CORS(app)

# Option 2: Allow specific origins (RECOMMENDED)
allowed_origins = [
    'http://localhost:3000',
    'http://localhost:9002',
    'https://your-vercel-app.vercel.app',
    'https://*.vercel.app',
]

CORS(app, 
     origins=allowed_origins,
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
     supports_credentials=True)
```

**Atau menggunakan environment variable:**

```python
import os
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

allowed_origins = os.getenv('ALLOWED_ORIGINS', '').split(',') or [
    'http://localhost:3000',
    'http://localhost:9002',
]

CORS(app, 
     origins=allowed_origins,
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization'],
     supports_credentials=True)
```

---

### 3. FastAPI (Python)

Jika backend menggunakan FastAPI:

```bash
pip install fastapi[all]
```

**Contoh konfigurasi:**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allowed origins
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:9002",
    "https://your-vercel-app.vercel.app",
    "https://*.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### 4. Django (Python)

Jika backend menggunakan Django:

**Install:**
```bash
pip install django-cors-headers
```

**settings.py:**
```python
INSTALLED_APPS = [
    ...
    'corsheaders',
    ...
]

MIDDLEWARE = [
    ...
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    ...
]

# Allow specific origins
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:9002",
    "https://your-vercel-app.vercel.app",
]

# Or allow all Vercel domains
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
```

---

## 🔍 Cara Mengetahui Framework Backend

Jika tidak yakin framework apa yang digunakan, cek:

1. **File di repository backend:**
   - `package.json` → Express.js/Node.js
   - `requirements.txt` → Python (Flask/FastAPI/Django)
   - `pom.xml` → Java/Spring Boot
   - `go.mod` → Go

2. **Response headers dari API:**
   ```bash
   curl -I https://simnikah-api-production-5583.up.railway.app/login
   ```
   Lihat header `Server` atau `X-Powered-By`

3. **Cek dokumentasi backend** atau tanyakan ke developer backend

---

## ✅ Checklist Setup CORS

- [ ] Install package CORS sesuai framework
- [ ] Tambahkan domain Vercel ke allowed origins:
  - Production: `https://your-app.vercel.app`
  - Preview: `https://*.vercel.app` (wildcard untuk semua preview)
- [ ] Tambahkan localhost untuk development:
  - `http://localhost:3000`
  - `http://localhost:9002`
- [ ] Enable credentials jika menggunakan cookies/auth headers
- [ ] Allow methods: GET, POST, PUT, DELETE, OPTIONS
- [ ] Allow headers: Content-Type, Authorization, X-Requested-With
- [ ] Test dengan request dari frontend
- [ ] Deploy perubahan ke backend

---

## 🧪 Testing CORS

### Test dengan curl:

```bash
# Test preflight request
curl -X OPTIONS https://simnikah-api-production-5583.up.railway.app/login \
  -H "Origin: https://your-app.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# Seharusnya mendapat response dengan:
# Access-Control-Allow-Origin: https://your-app.vercel.app
# Access-Control-Allow-Methods: POST
# Access-Control-Allow-Headers: Content-Type
```

### Test dari browser console:

```javascript
fetch('https://simnikah-api-production-5583.up.railway.app/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'test',
    password: 'test'
  })
})
.then(res => console.log('Success:', res))
.catch(err => console.error('Error:', err));
```

---

## 🚨 Troubleshooting

### Error: "Access to fetch blocked by CORS policy"

**Solusi:**
1. Pastikan domain frontend ada di `allowed_origins`
2. Pastikan method (GET, POST, dll) di-allow
3. Pastikan headers yang digunakan di-allow
4. Pastikan `credentials: true` jika menggunakan cookies

### Error: "Preflight request doesn't pass"

**Solusi:**
1. Pastikan OPTIONS method di-handle dengan benar
2. Pastikan preflight response memiliki header CORS yang benar
3. Cek apakah middleware CORS dipasang sebelum middleware lainnya

### Error: "Credentials flag is true, but Access-Control-Allow-Credentials is not true"

**Solusi:**
1. Set `credentials: true` di konfigurasi CORS
2. Pastikan origin tidak menggunakan wildcard `*` jika credentials enabled
3. Gunakan specific origins, bukan `*`

---

## 📝 Environment Variables untuk Backend

Tambahkan di Railway.app atau environment backend:

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:9002,https://your-app.vercel.app,https://*.vercel.app
```

---

## 🔗 Referensi

- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS](https://expressjs.com/en/resources/middleware/cors.html)
- [Flask CORS](https://flask-cors.readthedocs.io/)
- [FastAPI CORS](https://fastapi.tiangolo.com/tutorial/cors/)

---

## 💡 Catatan Penting

1. **Jangan gunakan `origin: '*'` di production** jika menggunakan credentials
2. **Selalu whitelist domain yang spesifik** untuk keamanan
3. **Test di production** setelah deploy perubahan CORS
4. **Monitor logs backend** untuk melihat origin yang di-block

---

## 📞 Langkah Selanjutnya

Setelah setup CORS di backend:

1. Deploy perubahan ke backend API
2. Test login dari frontend Vercel
3. Jika masih error, cek:
   - Vercel logs untuk melihat request yang dikirim
   - Backend logs untuk melihat error yang diterima
   - Network tab di browser untuk melihat response headers

## 🔍 Troubleshooting Error 403 yang Persisten

Jika setelah setup CORS masih mendapat error 403:

### 1. Cek Apakah Backend Menerima Request

**Test langsung dari server:**
```bash
# Test dari Vercel server (via SSH atau server logs)
curl -X POST https://simnikah-api-production-5583.up.railway.app/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}' \
  -v
```

### 2. Cek IP Whitelist

Beberapa backend memblokir request berdasarkan IP. Pastikan:
- Vercel IP ranges tidak di-block
- Atau tambahkan Vercel IP ke whitelist

**Vercel IP Ranges:**
- Vercel menggunakan dynamic IPs
- Tidak ada static IP list
- Solusi: Jangan gunakan IP whitelist, gunakan CORS atau API key

### 3. Cek Rate Limiting

Backend mungkin memblokir karena rate limiting:
- Cek apakah ada rate limit per IP
- Cek apakah request terlalu sering
- Tunggu beberapa menit dan coba lagi

### 4. Cek Authentication/Authorization

Backend mungkin memblokir karena:
- Missing API key atau token
- Invalid authentication headers
- Missing required headers

**Solusi:**
- Pastikan semua required headers dikirim
- Cek apakah backend memerlukan API key
- Cek apakah backend memerlukan authentication untuk login endpoint

### 5. Cek Request Format

Backend mungkin memblokir karena format request tidak sesuai:
- Content-Type tidak sesuai
- Request body format tidak sesuai
- Missing required fields

**Solusi:**
- Cek Vercel logs untuk melihat request yang dikirim
- Bandingkan dengan request yang berhasil (dari Postman/curl)
- Pastikan format request sesuai dengan dokumentasi API

### 6. Cek Backend Logs

Cek backend logs untuk melihat:
- Apakah request diterima oleh backend
- Error message dari backend
- Stack trace jika ada

**Contoh log yang dicari:**
```
[ERROR] 403 Forbidden: IP not whitelisted
[ERROR] 403 Forbidden: Missing API key
[ERROR] 403 Forbidden: Invalid origin
```

### 7. Test dengan Postman/curl

Test langsung ke backend untuk memastikan backend berfungsi:
```bash
curl -X POST https://simnikah-api-production-5583.up.railway.app/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://your-app.vercel.app" \
  -d '{"username":"test","password":"test"}' \
  -v
```

Jika ini berhasil tapi dari Vercel tidak, masalahnya ada di proxy atau cara request dikirim.

### 8. Cek Vercel Logs

Cek Vercel logs untuk melihat:
- Request yang dikirim ke backend
- Response dari backend
- Error details

**Cara cek:**
1. Buka Vercel Dashboard → Project → Logs
2. Cari log dengan prefix `[proxy]`
3. Lihat detail request dan response

### 9. Bypass Proxy (Temporary Test)

Untuk test apakah masalahnya di proxy atau backend, coba bypass proxy sementara:

**Ubah di `src/lib/api.ts`:**
```typescript
// Temporary: bypass proxy untuk test
let baseURL = DEFAULT_API_URL; // Langsung ke backend, tidak pakai proxy
```

**Catatan:** Ini hanya untuk test. Setelah test, kembalikan ke proxy karena akan ada CORS issue di browser.

### 10. Contact Backend Developer

Jika semua langkah di atas sudah dicoba tapi masih error 403:
- Hubungi backend developer
- Berikan detail error dari Vercel logs
- Berikan detail request yang dikirim
- Minta backend developer untuk cek logs dan whitelist Vercel domain/IP



