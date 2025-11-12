# 🗺️ Map Integration Implementation - Phase 2 (COMPLETE)

**Status:** ✅ **PRODUCTION READY**  
**Date Completed:** 2025-11-12  
**TypeScript Verification:** ✅ 0 ERRORS  
**API Base:** `https://simnikah-api-production.up.railway.app`

---

## 📋 Overview

Map Integration enables users selecting "nikah di luar KUA" (marriage outside KUA) to specify the exact wedding location using an interactive map with address autocomplete, geocoding, and navigation links.

**Key Features:**
- ✅ Address autocomplete with debounced search (500ms)
- ✅ Interactive Leaflet map with OpenStreetMap (100% FREE)
- ✅ Geocoding (address → coordinates)
- ✅ Reverse geocoding (coordinates → address)
- ✅ Location marker placement and tooltips
- ✅ Navigation links (Google Maps, Waze, OpenStreetMap)
- ✅ Full responsive design (mobile & desktop)
- ✅ Penghulu location view with navigation

---

## 🏗️ Architecture

### Component Hierarchy

```
MultiStepMarriageForm (Enhanced)
├── Step1 (Schedule & Location)
│   ├── Location Selection (Di KUA / Di Luar KUA)
│   └── OutsideKUALocation (Conditional)
│       └── MapSelector
│           ├── AddressAutocomplete (Search Tab)
│           └── MapComponent (Map Tab)
│
Penghulu Dashboard
└── PenghuluLocationView
    └── MapComponent (Display)
```

### File Structure

```
src/
├── components/kuaku/
│   ├── MapComponent.tsx              (Leaflet map display)
│   ├── MapSelector.tsx               (Location picker UI)
│   ├── AddressAutocomplete.tsx        (Address search with debounce)
│   ├── OutsideKUALocation.tsx         (Form integration wrapper)
│   ├── PenghuluLocationView.tsx       (Penghulu dashboard view)
│   └── MultiStepMarriageForm.tsx      (Enhanced with map integration)
│
└── lib/
    └── api.ts                        (Location API endpoints)
```

---

## 🔌 API Integration

### Endpoints Implemented

#### 1. Geocode Address (Alamat → Koordinat)

```typescript
geocodeAddress(alamat: string): Promise<GeocodeResponse>
```

**Request:**
```bash
POST /simnikah/location/geocode
Authorization: Bearer {token}
Content-Type: application/json

{
  "alamat": "Jl. Pangeran Antasari No.1, Banjarmasin, Kalimantan Selatan"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Koordinat berhasil ditemukan",
  "data": {
    "alamat": "Jl. Pangeran Antasari No.1, Banjarmasin, Kalimantan Selatan",
    "latitude": -3.3149,
    "longitude": 114.5925,
    "map_url": "https://www.google.com/maps?q=-3.3149,114.5925",
    "osm_url": "https://www.openstreetmap.org/?mlat=-3.3149&mlon=114.5925&zoom=16"
  }
}
```

#### 2. Reverse Geocode (Koordinat → Alamat)

```typescript
reverseGeocodeCoordinates(latitude: number, longitude: number): Promise<ReverseGeocodeResponse>
```

**Request:**
```bash
POST /simnikah/location/reverse-geocode
Authorization: Bearer {token}

{
  "latitude": -3.3149,
  "longitude": 114.5925
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "latitude": -3.3149,
    "longitude": 114.5925,
    "alamat": "Jalan Pangeran Antasari, Sungai Baru, Banjarmasin Tengah, Kota Banjarmasin...",
    "detail": {
      "road": "Jalan Pangeran Antasari",
      "suburb": "Sungai Baru",
      "city_district": "Banjarmasin Tengah",
      "city": "Kota Banjarmasin",
      "state": "Kalimantan Selatan"
    }
  }
}
```

#### 3. Search Address (Autocomplete)

```typescript
searchAddress(query: string): Promise<SearchAddressResponse>
```

**Request:**
```bash
GET /simnikah/location/search?q=Banjarmasin
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "Banjarmasin",
    "results": [
      {
        "display_name": "Banjarmasin, Kalimantan Selatan, Indonesia",
        "latitude": "-3.3149",
        "longitude": "114.5925",
        "address": {
          "city": "Banjarmasin",
          "state": "Kalimantan Selatan"
        }
      }
    ],
    "count": 1
  }
}
```

#### 4. Get Location Detail (untuk Penghulu)

```typescript
getLocationDetail(registrationId: string | number): Promise<LocationDetail>
```

**Request:**
```bash
GET /simnikah/pendaftaran/{registrationId}/location
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pendaftaran_id": 123,
    "nomor_pendaftaran": "NIK20250127001",
    "tanggal_nikah": "2025-02-14",
    "waktu_nikah": "09:00",
    "alamat_akad": "Jl. Pangeran Antasari No.1, Banjarmasin",
    "latitude": -3.3149,
    "longitude": 114.5925,
    "has_coordinates": true,
    "is_outside_kua": true,
    "google_maps_directions_url": "https://www.google.com/maps/dir/?api=1&destination=-3.3149,114.5925",
    "waze_url": "https://www.waze.com/ul?ll=-3.3149,114.5925&navigate=yes",
    "osm_url": "https://www.openstreetmap.org/?mlat=-3.3149&mlon=114.5925&zoom=16"
  }
}
```

#### 5. Update Location (Save with Coordinates)

```typescript
updateRegistrationLocation(
  registrationId: string | number,
  alamat_akad: string,
  latitude?: number,
  longitude?: number
): Promise<UpdateLocationResponse>
```

**Request:**
```bash
PUT /simnikah/pendaftaran/{registrationId}/location
Authorization: Bearer {token}

{
  "alamat_akad": "Jl. Pangeran Antasari No.1, Banjarmasin",
  "latitude": -3.3149,
  "longitude": 114.5925
}
```

---

## 📱 Component Usage

### 1. MapSelector (User Input)

Add to registration form when user selects "Di Luar KUA":

```tsx
import { MapSelector } from '@/components/kuaku/MapSelector';

<MapSelector
  onLocationSelect={(location) => {
    console.log('Selected location:', location);
    // {
    //   alamat: string,
    //   latitude: number,
    //   longitude: number
    // }
  }}
  initialAddress=""
  disabled={false}
/>
```

**Features:**
- Dual-tab interface (Search / Map)
- Address autocomplete with suggestions
- Interactive Leaflet map
- Manual geocoding button
- Location preview with navigation links

### 2. AddressAutocomplete (Address Search)

```tsx
import { AddressAutocomplete } from '@/components/kuaku/AddressAutocomplete';

<AddressAutocomplete
  value={address}
  onChange={(value) => setAddress(value)}
  onSelect={(result) => {
    console.log('Selected:', result.display_name);
  }}
  placeholder="Ketik alamat..."
  disabled={false}
/>
```

**Features:**
- Debounced search (500ms delay)
- Minimum 3 characters required
- Dropdown suggestions with icons
- Click-outside to close
- Clear button

### 3. PenghuluLocationView (Penghulu Dashboard)

```tsx
import { PenghuluLocationView } from '@/components/kuaku/PenghuluLocationView';

<PenghuluLocationView registrationId={123} />
```

**Features:**
- Automatic location data loading
- Interactive map display
- Navigation links (Google Maps, Waze, OSM)
- Coordinates display
- Outside KUA status indicator

---

## 🛠️ Integration Guide

### Step 1: Install Dependencies

```bash
npm install leaflet react-leaflet --legacy-peer-deps
npm install --save-dev @types/leaflet
```

**Status:** ✅ Already installed

### Step 2: API Functions

All API functions are available in `src/lib/api.ts`:

```typescript
import {
  geocodeAddress,
  reverseGeocodeCoordinates,
  searchAddress,
  getLocationDetail,
  updateRegistrationLocation,
} from '@/lib/api';
```

### Step 3: Add to Registration Form

The MapSelector is already integrated into `MultiStepMarriageForm.tsx`:

```tsx
{weddingLocation === 'Di Luar KUA' && (
  <div className="mt-8 pt-6 border-t">
    <OutsideKUALocation isVisible={true} />
  </div>
)}
```

### Step 4: Penghulu Integration

Add to Penghulu dashboard:

```tsx
import { PenghuluLocationView } from '@/components/kuaku/PenghuluLocationView';

// In Penghulu registration details page:
<PenghuluLocationView registrationId={registration.pendaftaran_id} />
```

---

## 🎨 UI Components Used

- **Card, CardHeader, CardContent** - Container layout
- **Alert, AlertDescription** - Alerts & warnings
- **Button** - Action triggers
- **Input** - Text input
- **Tabs, TabsContent, TabsList** - Tab navigation
- **Lucide Icons** - Visual indicators

---

## ⚙️ Configuration

### API Base URL

Set in `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://simnikah-api-production.up.railway.app
```

### Map Center (Default)

In `MapComponent.tsx`:

```typescript
const DEFAULT_CENTER = [-3.3149, 114.5925]; // Banjarmasin
```

### Debounce Delay

In `AddressAutocomplete.tsx`:

```typescript
const DEBOUNCE_MS = 500; // milliseconds
```

---

## 🔐 Error Handling

### Geocoding Errors

```typescript
try {
  const response = await geocodeAddress(alamat);
  if (response.success) {
    // Handle success
  }
} catch (error: any) {
  const message = error.response?.data?.error || 'Alamat tidak ditemukan';
  // Show error to user
}
```

### Network Errors

- Rate limit (429): "Terlalu banyak request. Tunggu sebentar."
- Not found (404): "Alamat tidak dapat ditemukan di peta"
- Connection error: "Gagal terhubung ke server"

---

## 📊 Data Flow

### User Workflow (Di Luar KUA)

```
1. User selects "Di Luar KUA" in form
   ↓
2. MapSelector component displays (2 tabs)
   ↓
3. Option A: Use Address Search
   - User types address (min 3 chars)
   - Debounced API call → suggestions
   - User clicks suggestion
   - Coordinates auto-populated
   ↓
4. Option B: Click on Map
   - User clicks map location
   - Reverse geocode → address populated
   - Coordinates saved
   ↓
5. Location saved to form state
   ├── outside_kua_location_alamat
   ├── outside_kua_location_latitude
   └── outside_kua_location_longitude
   ↓
6. On form submit → API updates location
```

### Penghulu Workflow

```
1. Penghulu views registration detail
   ↓
2. PenghuluLocationView loads location
   ↓
3. If coordinates available:
   - Display map with marker
   - Show navigation links (Google Maps, Waze, OSM)
   ↓
4. If no coordinates:
   - Show warning message
   - Alert penghulu to contact couple
```

---

## 🌍 Map Services (100% FREE)

### Leaflet.js + OpenStreetMap

```typescript
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Create map
const map = L.map('map-container').setView([lat, lon], 16);

// Add tiles (OpenStreetMap - FREE)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19,
}).addTo(map);

// Add marker
L.marker([lat, lon]).addTo(map);
```

**Advantages:**
- ✅ 100% FREE (no API key required)
- ✅ No billing concerns
- ✅ OpenStreetMap community-driven data
- ✅ Unlimited requests (within rate limits)
- ✅ Full control over map styling

---

## 📈 Performance Optimization

### Code Splitting

Maps are dynamically imported to reduce initial bundle:

```typescript
const MapComponent = dynamic(() => import('./MapComponent'), {
  loading: () => <LoadingSpinner />,
  ssr: false, // Only render on client
});
```

### Debouncing

Search requests are debounced to respect API rate limits:

```typescript
const searchAddress = debounce(async (query) => {
  // Max 1 request per 500ms
}, 500);
```

### Lazy Loading

Components load only when needed (tabs, modals).

---

## 🧪 Testing Checklist

- ✅ TypeScript compilation (0 errors)
- ✅ API endpoints connectivity
- ✅ Address autocomplete functionality
- ✅ Map click-to-select
- ✅ Geocoding accuracy
- ✅ Navigation links working
- ✅ Responsive design (mobile/desktop)
- ✅ Error handling scenarios
- ✅ Loading states
- ✅ Form data persistence

---

## 📝 Form Field Storage

**Location data stored in form:**

```typescript
{
  outside_kua_location_alamat: string;      // Full address
  outside_kua_location_latitude: number;    // GPS latitude
  outside_kua_location_longitude: number;   // GPS longitude
}
```

**When submitted, API endpoint called:**

```typescript
PUT /simnikah/pendaftaran/{id}/location
{
  "alamat_akad": "...",
  "latitude": -3.3149,
  "longitude": 114.5925
}
```

---

## 🎯 Key Features Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Address Autocomplete | ✅ | Debounced 500ms search |
| Geocoding | ✅ | Address → Coordinates |
| Reverse Geocoding | ✅ | Coordinates → Address |
| Interactive Map | ✅ | Leaflet + OpenStreetMap |
| Map Click Selection | ✅ | Click to place marker |
| Navigation Links | ✅ | Google Maps, Waze, OSM |
| Error Handling | ✅ | User-friendly messages |
| Loading States | ✅ | Spinners & placeholders |
| Responsive Design | ✅ | Mobile & desktop |
| TypeScript Support | ✅ | Full type safety |
| Dark Mode Ready | ✅ | Uses Tailwind utilities |

---

## 🚀 Deployment Ready

**Verification Status:**

```
✅ TypeScript: 0 errors
✅ All imports resolved
✅ Components created (6 files)
✅ API functions implemented
✅ Tests passed
✅ Performance optimized
✅ Documentation complete
✅ No breaking changes
```

**Ready for production deployment!**

---

## 📚 Related Documentation

- `MAP_INTEGRATION.md` - API specification & examples
- `IMPLEMENTATION_SUMMARY.md` - Overall project status
- `MultiStepMarriageForm.tsx` - Form integration code

---

**Last Updated:** 2025-11-12  
**Version:** 1.0 - Production Ready
