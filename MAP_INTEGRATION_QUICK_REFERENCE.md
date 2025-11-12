# 🗺️ Map Integration - Quick Reference

**Status:** ✅ PRODUCTION READY  
**TypeScript:** ✅ 0 ERRORS  
**Components:** ✅ 6 CREATED

---

## 📦 What Was Created

### Components (6 files)

| File | Purpose | Lines |
|------|---------|-------|
| `MapComponent.tsx` | Leaflet map display | ~120 |
| `MapSelector.tsx` | Location picker UI | ~350 |
| `AddressAutocomplete.tsx` | Address search | ~180 |
| `OutsideKUALocation.tsx` | Form wrapper | ~50 |
| `PenghuluLocationView.tsx` | Penghulu view | ~280 |
| `MultiStepMarriageForm.tsx` | Enhanced form | Modified |

### API Functions (5 endpoints)

| Function | Endpoint | Purpose |
|----------|----------|---------|
| `geocodeAddress()` | POST /location/geocode | Address → Coordinates |
| `reverseGeocodeCoordinates()` | POST /location/reverse-geocode | Coordinates → Address |
| `searchAddress()` | GET /location/search | Address autocomplete |
| `getLocationDetail()` | GET /pendaftaran/:id/location | Get location for penghulu |
| `updateRegistrationLocation()` | PUT /pendaftaran/:id/location | Save location |

---

## 🚀 Quick Start

### For Users (Di Luar KUA)

1. Select "Di Luar KUA" in wedding location
2. MapSelector appears (2 tabs)
3. **Option A:** Type address → select from suggestions
4. **Option B:** Click on map to place marker
5. Location confirmed with coordinates
6. Submit form

### For Penghulu

1. View registration in dashboard
2. `<PenghuluLocationView registrationId={id} />` loaded
3. See map with marker + address
4. Click Google Maps / Waze / OpenStreetMap links

---

## 💻 Implementation Details

### Dependencies Added

```bash
npm install leaflet react-leaflet --legacy-peer-deps
npm install --save-dev @types/leaflet
```

### Files Modified

```
src/components/kuaku/
  └── MultiStepMarriageForm.tsx
      ├── Added import
      ├── Added OutsideKUALocation component
      └── Conditional render when "Di Luar KUA" selected
```

### Files Created

```
src/components/kuaku/
  ├── AddressAutocomplete.tsx      (Address search with debounce)
  ├── MapComponent.tsx              (Leaflet map wrapper)
  ├── MapSelector.tsx               (Location picker UI)
  ├── OutsideKUALocation.tsx         (Form integration)
  └── PenghuluLocationView.tsx       (Penghulu view)

src/lib/
  └── api.ts (Enhanced with 5 location functions)
```

---

## 🎯 Key Features

### 1. Address Autocomplete
- Minimum 3 characters
- 500ms debounce
- Dropdown suggestions
- Click to select

### 2. Interactive Map
- **Library:** Leaflet.js
- **Tiles:** OpenStreetMap (100% FREE)
- **Click to select:** Place marker on map
- **Reverse geocode:** Auto-fill address

### 3. Navigation Links
- 🗺️ Google Maps (with directions)
- 🚗 Waze (navigation)
- 🌍 OpenStreetMap (view)

### 4. Error Handling
- Address not found
- Network errors
- Rate limit exceeded
- User-friendly messages

### 5. Responsive Design
- Mobile: Single column layout
- Tablet: 2-column grid
- Desktop: Full featured

---

## 📊 Data Structure

```typescript
// User selects location
{
  outside_kua_location_alamat: "Jl. Pangeran Antasari No.1, Banjarmasin",
  outside_kua_location_latitude: -3.3149,
  outside_kua_location_longitude: 114.5925
}

// Penghulu receives
{
  pendaftaran_id: 123,
  nomor_pendaftaran: "NIK20250127001",
  alamat_akad: "...",
  latitude: -3.3149,
  longitude: 114.5925,
  has_coordinates: true,
  is_outside_kua: true,
  google_maps_directions_url: "https://...",
  waze_url: "https://...",
  osm_url: "https://..."
}
```

---

## ✅ Quality Assurance

| Check | Status |
|-------|--------|
| TypeScript Compilation | ✅ 0 errors |
| Dependencies Resolved | ✅ All installed |
| Components Rendering | ✅ No SSR issues |
| API Integration | ✅ Tested endpoints |
| Error Handling | ✅ User-friendly |
| Responsive Design | ✅ Mobile/Desktop |
| Performance | ✅ Optimized (code-split) |
| Documentation | ✅ Complete |

---

## 🔗 Integration Checklist

- ✅ Dependencies installed
- ✅ API functions created
- ✅ Components created
- ✅ Form integration done
- ✅ Penghulu view ready
- ✅ TypeScript verified
- ✅ Error handling complete
- ✅ Documentation written

---

## 🌟 Highlights

**100% FREE:**
- Leaflet.js: ✅ Open source
- OpenStreetMap: ✅ Free tiles
- Navigation links: ✅ No API keys needed
- Geocoding: ✅ Backend provides

**User Experience:**
- Autocomplete suggestions ✅
- Interactive map ✅
- Click-to-select ✅
- Preview before save ✅
- Navigation options ✅

**Developer Experience:**
- Full TypeScript support ✅
- Clear API documentation ✅
- Error handling ✅
- Performance optimized ✅
- Well-commented code ✅

---

## 🎓 Usage Example

### In Registration Form

```tsx
import { MapSelector } from '@/components/kuaku/MapSelector';

<MapSelector
  onLocationSelect={(location) => {
    // location = { alamat, latitude, longitude }
    console.log('Selected:', location);
  }}
/>
```

### In Penghulu Dashboard

```tsx
import { PenghuluLocationView } from '@/components/kuaku/PenghuluLocationView';

<PenghuluLocationView registrationId={registration.id} />
```

### Direct API Usage

```tsx
import {
  geocodeAddress,
  searchAddress,
  getLocationDetail
} from '@/lib/api';

// Search addresses
const results = await searchAddress('Banjarmasin');

// Geocode address
const coords = await geocodeAddress('Jl. Pangeran Antasari...');

// Get location for penghulu
const location = await getLocationDetail(123);
```

---

## 📞 Troubleshooting

### Map not showing?
- Check internet connection (loading tiles)
- Verify container has height: `400px`
- Check console for errors

### Address not found?
- Use full address (Jalan, Kelurahan, Kota)
- Add landmarks if available
- Try different variations

### Autocomplete not working?
- Type minimum 3 characters
- Wait 500ms for search
- Check network tab for API calls

### Navigation links not working?
- Requires coordinates (latitude/longitude)
- Test with: `https://www.google.com/maps?q=LAT,LON`

---

## 📈 Performance

- **Bundle size:** ~50KB (Leaflet only, dynamic import)
- **API calls:** Debounced (max 1 per 500ms)
- **Memory usage:** Minimal (lazy loaded)
- **Network:** Optimized (tile caching)

---

**Version:** 1.0  
**Last Updated:** 2025-11-12  
**Status:** ✅ Production Ready
