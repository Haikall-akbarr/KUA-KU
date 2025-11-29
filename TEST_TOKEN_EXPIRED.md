# 🧪 Cara Test Token Expired (Tanpa Menunggu 24 Jam)

Ada beberapa cara untuk test fitur auto-logout/relogin tanpa menunggu token expired:

## 🎯 Cara 1: Menggunakan Test Button (Development Mode)

1. Login ke aplikasi sebagai staff/admin
2. Buka halaman dashboard (misalnya `/admin/staff` atau `/admin/kepala`)
3. Akan muncul alert box kuning dengan tombol test (hanya di development mode)
4. Klik salah satu tombol:
   - **"Test: Hapus Token & Request"** - Hapus token dan langsung buat request API
   - **"Test: Invalid Token"** - Ganti token dengan invalid token
   - **"Hapus Token Manual"** - Hanya hapus token, lalu refresh halaman

## 🎯 Cara 2: Manual via Browser Console

1. Login ke aplikasi
2. Buka Browser Console (F12)
3. Jalankan salah satu command berikut:

### A. Hapus Token dan Refresh
```javascript
localStorage.removeItem('token');
location.reload();
```

### B. Set Invalid Token
```javascript
localStorage.setItem('token', 'invalid_token_test');
// Lalu buat request API atau refresh halaman
location.reload();
```

### C. Test dengan Request API
```javascript
// Hapus token
localStorage.removeItem('token');

// Buat request yang pasti akan return 401
fetch('/api/proxy/simnikah/profile', {
  headers: {
    'Authorization': 'Bearer invalid_token'
  }
}).catch(err => {
  console.log('401 triggered, redirect should happen');
});
```

## 🎯 Cara 3: Via Network Tab (Chrome DevTools)

1. Login ke aplikasi
2. Buka DevTools → Network tab
3. Cari request API yang menggunakan token (misalnya `/api/proxy/simnikah/profile`)
4. Klik kanan → **Edit and Resend**
5. Hapus atau ubah header `Authorization` menjadi invalid
6. Send request
7. Seharusnya dapat 401 dan redirect ke `/relogin`

## 🎯 Cara 4: Hapus Token via Application Tab

1. Login ke aplikasi
2. Buka DevTools → **Application** tab (Chrome) atau **Storage** tab (Firefox)
3. Pilih **Local Storage** → domain aplikasi
4. Hapus item `token`
5. Refresh halaman atau buat request API
6. Seharusnya redirect ke `/relogin`

## 🎯 Cara 5: Test dengan Interceptor Manual

Jalankan di console:

```javascript
// Simpan token asli
const originalToken = localStorage.getItem('token');

// Hapus token
localStorage.removeItem('token');

// Buat request yang akan trigger 401
fetch('/api/proxy/simnikah/profile')
  .then(res => {
    if (res.status === 401) {
      console.log('✅ 401 triggered! Redirect should happen automatically.');
    }
  })
  .catch(err => {
    console.log('Error (expected):', err);
  });
```

## ✅ Expected Behavior

Setelah token dihapus atau invalid:

1. ✅ Request API akan return **401 Unauthorized**
2. ✅ Interceptor di `api.ts` akan mendeteksi 401
3. ✅ Token akan dihapus dari localStorage (jika belum dihapus)
4. ✅ Data user akan tetap tersimpan di localStorage
5. ✅ Browser akan redirect ke `/relogin`
6. ✅ Halaman relogin akan menampilkan nama user
7. ✅ User hanya perlu memasukkan password
8. ✅ Setelah relogin berhasil, redirect ke dashboard sesuai role

## 🔍 Debugging

Jika redirect tidak terjadi, cek:

1. **Console Logs**: Cari log dengan prefix `🔄` atau `⚠️`
2. **Network Tab**: Cek apakah request benar-benar return 401
3. **Local Storage**: Pastikan `user` masih ada, `token` sudah dihapus
4. **Current Path**: Pastikan tidak sedang di `/relogin` atau `/login` (untuk avoid loop)

## 📝 Notes

- Test button hanya muncul di **development mode** (`NODE_ENV !== 'production'`)
- Di production, test button tidak akan muncul
- Pastikan sudah login sebelum test
- Data user akan tetap tersimpan untuk relogin

