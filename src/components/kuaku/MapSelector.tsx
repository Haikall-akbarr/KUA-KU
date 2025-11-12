'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { AddressAutocomplete } from './AddressAutocomplete';
import {
  geocodeAddress,
  reverseGeocodeCoordinates,
  type AddressSearchResult,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2,
  AlertCircle,
  MapPin,
  Navigation,
  MapIcon,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Dynamic import to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent').then(mod => ({ default: mod.MapComponent })), {
  loading: () => (
    <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
  ssr: false,
});

interface MapSelectorProps {
  onLocationSelect: (location: {
    alamat: string;
    latitude: number;
    longitude: number;
  }) => void;
  initialAddress?: string;
  disabled?: boolean;
}

interface LocationState {
  alamat: string;
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
}

export const MapSelector: React.FC<MapSelectorProps> = ({
  onLocationSelect,
  initialAddress = '',
  disabled = false,
}) => {
  const [location, setLocation] = useState<LocationState>({
    alamat: initialAddress,
    latitude: null,
    longitude: null,
    loading: false,
    error: null,
  });
  const [activeTab, setActiveTab] = useState('search');

  // Handle address selection from autocomplete
  const handleAddressSelect = useCallback(
    async (result: AddressSearchResult) => {
      setLocation(prev => ({ ...prev, loading: true, error: null }));

      try {
        const latitude = parseFloat(result.latitude);
        const longitude = parseFloat(result.longitude);

        setLocation(prev => ({
          ...prev,
          alamat: result.display_name,
          latitude,
          longitude,
          loading: false,
        }));

        onLocationSelect({
          alamat: result.display_name,
          latitude,
          longitude,
        });
      } catch (error) {
        setLocation(prev => ({
          ...prev,
          error: 'Gagal memproses alamat pilihan',
          loading: false,
        }));
      }
    },
    [onLocationSelect]
  );

  // Handle address input change
  const handleAddressChange = useCallback((value: string) => {
    setLocation(prev => ({ ...prev, alamat: value }));
  }, []);

  // Geocode address button (untuk input manual)
  const handleGeocodeManual = useCallback(async () => {
    if (!location.alamat || location.alamat.length < 10) {
      setLocation(prev => ({
        ...prev,
        error: 'Masukkan alamat lengkap minimal 10 karakter',
      }));
      return;
    }

    setLocation(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await geocodeAddress(location.alamat);
      if (response.success) {
        setLocation(prev => ({
          ...prev,
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          loading: false,
        }));

        onLocationSelect({
          alamat: response.data.alamat,
          latitude: response.data.latitude,
          longitude: response.data.longitude,
        });
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error ||
        'Alamat tidak ditemukan. Silakan cek kembali.';
      setLocation(prev => ({
        ...prev,
        error: errorMsg,
        loading: false,
      }));
    }
  }, [location.alamat, onLocationSelect]);

  // Handle map click to reverse geocode
  const handleMapClick = useCallback(
    async (lat: number, lon: number) => {
      setLocation(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await reverseGeocodeCoordinates(lat, lon);
        if (response.success) {
          setLocation(prev => ({
            ...prev,
            alamat: response.data.alamat,
            latitude: response.data.latitude,
            longitude: response.data.longitude,
            loading: false,
          }));

          onLocationSelect({
            alamat: response.data.alamat,
            latitude: response.data.latitude,
            longitude: response.data.longitude,
          });
        }
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.error ||
          'Gagal mendapatkan alamat dari koordinat ini';
        setLocation(prev => ({
          ...prev,
          error: errorMsg,
          loading: false,
        }));
      }
    },
    [onLocationSelect]
  );

  // Handle marker drag to update coordinates (reverse geocode new position)
  const handleMarkerDrag = useCallback(
    async (lat: number, lon: number) => {
      console.log('📍 Marker position updated:', lat, lon);
      
      setLocation(prev => ({ ...prev, latitude: lat, longitude: lon }));

      // Optionally reverse geocode to get new address
      // For now just update coordinates, address stays the same
      // but you could uncomment below for auto-address update
      
      /*
      try {
        const response = await reverseGeocodeCoordinates(lat, lon);
        if (response.success) {
          setLocation(prev => ({
            ...prev,
            alamat: response.data.alamat,
          }));
        }
      } catch (error) {
        console.error('Error reverse geocoding:', error);
      }
      */
    },
    []
  );

  // Generate navigation URLs
  const generateNavigationLinks = () => {
    if (!location.latitude || !location.longitude) return null;

    const lat = location.latitude;
    const lon = location.longitude;

    return {
      google_maps: `https://www.google.com/maps?q=${lat},${lon}`,
      google_directions: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,
      waze: `https://www.waze.com/ul?ll=${lat},${lon}&navigate=yes`,
      osm: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=16`,
    };
  };

  const links = generateNavigationLinks();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Pilih Lokasi Pernikahan
        </CardTitle>
        <CardDescription>
          Cari dan tandai lokasi pernikahan Anda di peta dengan akurat
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search" className="gap-2">
              <MapPin className="h-4 w-4" />
              Cari Alamat
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2">
              <MapIcon className="h-4 w-4" />
              Pilih di Peta
            </TabsTrigger>
          </TabsList>

          {/* Tab: Cari Alamat */}
          <TabsContent value="search" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Cari Alamat (dengan Autocomplete)
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  Ketik minimal 3 karakter untuk mencari
                </p>
                <AddressAutocomplete
                  value={location.alamat}
                  onChange={handleAddressChange}
                  onSelect={handleAddressSelect}
                  disabled={disabled || location.loading}
                  placeholder="Contoh: Jl. Pangeran Antasari, Banjarmasin..."
                />
              </div>

              {/* Manual geocoding option */}
              <div className="space-y-2">
                <Button
                  onClick={handleGeocodeManual}
                  disabled={
                    disabled ||
                    location.loading ||
                    !location.alamat ||
                    location.alamat.length < 10
                  }
                  className="w-full gap-2"
                  variant="secondary"
                >
                  {location.loading && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  <Zap className="h-4 w-4" />
                  Cari Koordinat
                </Button>
                <p className="text-xs text-muted-foreground">
                  💡 Atau pilih dari hasil autocomplete di atas
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Pilih di Peta */}
          <TabsContent value="map" className="space-y-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                ℹ️ Klik di peta untuk menandai lokasi pernikahan Anda, atau geser marker untuk menyesuaikan posisi
              </p>

              {location.latitude && location.longitude ? (
                <MapComponent
                  latitude={location.latitude}
                  longitude={location.longitude}
                  onMapClick={handleMapClick}
                  onMarkerDrag={handleMarkerDrag}
                  alamat={location.alamat}
                  draggableMarker={true}
                />
              ) : (
                <MapComponent
                  latitude={-3.3149}
                  longitude={114.5925}
                  onMapClick={handleMapClick}
                  onMarkerDrag={handleMarkerDrag}
                  alamat="Klik di peta untuk memilih lokasi"
                  draggableMarker={true}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Error Alert */}
        {location.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Gagal</AlertTitle>
            <AlertDescription>{location.error}</AlertDescription>
          </Alert>
        )}

        {/* Location Preview */}
        {location.latitude && location.longitude && (
          <Card className="bg-accent/50">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">📍 Lokasi Terpilih</p>
                <p className="text-sm text-foreground font-medium break-words">
                  {location.alamat}
                </p>
                <p className="text-xs text-muted-foreground">
                  Lat: {location.latitude.toFixed(6)}, Lon:{' '}
                  {location.longitude.toFixed(6)}
                </p>
              </div>

              {/* Navigation Links */}
              {links && (
                <div className="space-y-3 pt-2 border-t">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Navigation className="h-4 w-4" />
                    Buka di Navigasi
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={links.google_directions}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'text-xs px-3 py-2 rounded-md font-medium',
                        'bg-blue-100 text-blue-700 hover:bg-blue-200',
                        'transition-colors text-center'
                      )}
                    >
                      🗺️ Google Maps
                    </a>
                    <a
                      href={links.waze}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'text-xs px-3 py-2 rounded-md font-medium',
                        'bg-green-100 text-green-700 hover:bg-green-200',
                        'transition-colors text-center'
                      )}
                    >
                      🚗 Waze
                    </a>
                    <a
                      href={links.osm}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'text-xs px-3 py-2 rounded-md font-medium',
                        'bg-orange-100 text-orange-700 hover:bg-orange-200',
                        'transition-colors text-center'
                      )}
                    >
                      🌍 OpenStreetMap
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Helper Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
          <p className="text-sm font-medium text-blue-900">💡 Tips:</p>
          <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
            <li>Masukkan alamat lengkap (Jalan, Kelurahan, Kota, Provinsi)</li>
            <li>Gunakan autocomplete untuk hasil yang lebih akurat</li>
            <li>Atau klik langsung di peta untuk menandai lokasi</li>
            <li>Koordinat akan disimpan otomatis untuk penghulu</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
