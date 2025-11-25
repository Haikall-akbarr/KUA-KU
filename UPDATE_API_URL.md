# ✅ UPDATE BASE URL API

## 📝 Perubahan

**Base URL Lama:**
```
https://simnikah-api-production.up.railway.app
```

**Base URL Baru:**
```
https://simnikah-api-production-5583.up.railway.app
```

---

## 📁 File yang Diupdate

### **1. Core API Files**

✅ `src/lib/api.ts`
- `DEFAULT_API_URL` updated

✅ `src/app/api/proxy/[...segments]/route.ts`
- `TARGET` updated

✅ `src/lib/penghulu-service.ts`
- `API_BASE_URL` updated
- Comment updated

✅ `src/lib/staff-verification-service.ts`
- `API_BASE_URL` updated

### **2. Page Files**

✅ `src/app/penghulu/page.tsx`
- `apiBaseUrl` default value updated

✅ `src/app/penghulu/profil/page.tsx`
- Hardcoded URLs updated (2 locations)

✅ `src/app/daftar-nikah/actions.ts`
- `API_BASE` updated

### **3. Component Files**

✅ `src/components/shared/UserProfileMenu.tsx`
- `apiBase` default value updated

✅ `src/components/admin/ProfileCard.tsx`
- `apiBase` default value updated

✅ `src/components/admin/kepala/AddStaffDialog.tsx`
- Hardcoded URL updated

✅ `src/components/admin/kepala/AddPenghuluDialog.tsx`
- Hardcoded URL updated

✅ `src/components/admin/StaffVerificationPanel.tsx`
- `apiBaseUrl` default value updated

### **4. Documentation**

✅ `ANALISIS_PROYEK_LENGKAP.md`
- All references updated

---

## 🔧 Environment Variable

**Pastikan `.env` atau environment variables di production menggunakan URL baru:**

```env
NEXT_PUBLIC_API_URL=https://simnikah-api-production-5583.up.railway.app
```

**Note:** Jika `NEXT_PUBLIC_API_URL` sudah diset di environment variables, maka nilai tersebut akan digunakan (tidak perlu hardcode di code).

---

## ✅ Verifikasi

Semua file source code sudah diupdate. Untuk memastikan:

1. **Check Environment Variable:**
   ```bash
   # Pastikan .env.local atau production env memiliki:
   NEXT_PUBLIC_API_URL=https://simnikah-api-production-5583.up.railway.app
   ```

2. **Test API Connection:**
   - Login ke aplikasi
   - Test fitur yang menggunakan API
   - Check browser console untuk error

3. **Rebuild Application:**
   ```bash
   npm run build
   ```

---

## 📊 Status

✅ **12 File Source Code Updated**  
✅ **1 File Documentation Updated**  
✅ **All Hardcoded URLs Replaced**  
✅ **All Default Values Updated**

---

## 🚀 Next Steps

1. Update `.env.local` atau production environment variables
2. Restart development server: `npm run dev`
3. Test semua fitur yang menggunakan API
4. Deploy ke production jika sudah verified

---

**Updated:** $(date)  
**Status:** ✅ COMPLETE

