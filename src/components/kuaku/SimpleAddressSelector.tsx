'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { AddressAutocomplete } from './AddressAutocomplete';
import {
  reverseGeocodeCoordinates,
  type AddressSearchResult,
} from '@/lib/api';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Loader2,
  AlertCircle,
  MapPin,
  CheckCircle2,
  MapIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Dynamic import to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent').then(mod => ({ default: mod.MapComponent })).catch(() => ({
  default: () => (
    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Memuat peta...</p>
    </div>
  )
})), {
  loading: () => (
    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  ),
  ssr: false,
});

interface SimpleAddressSelectorProps {
  value?: string;
  latitude?: number | null;
  longitude?: number | null;
  onLocationSelect: (location: {
    alamat: string;
    latitude: number;
    longitude: number;
  }) => void;
  disabled?: boolean;
  error?: string;
}

export const SimpleAddressSelector: React.FC<SimpleAddressSelectorProps> = ({
  value = '',
  latitude: initialLatitude = null,
  longitude: initialLongitude = null,
  onLocationSelect,
  disabled = false,
  error,
}) => {
  const [address, setAddress] = useState(value);
  const [latitude, setLatitude] = useState<number | null>(initialLatitude);
  const [longitude, setLongitude] = useState<number | null>(initialLongitude);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(error || null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Update when props change
  useEffect(() => {
    if (value !== address) {
      setAddress(value);
    }
    if (initialLatitude !== latitude || initialLongitude !== longitude) {
      setLatitude(initialLatitude);
      setLongitude(initialLongitude);
    }
  }, [value, initialLatitude, initialLongitude]);

  // Handle address selection from autocomplete
  const handleAddressSelect = useCallback(
    async (result: AddressSearchResult) => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const lat = parseFloat(result.latitude);
        const lon = parseFloat(result.longitude);

        setAddress(result.display_name);
        setLatitude(lat);
        setLongitude(lon);

        onLocationSelect({
          alamat: result.display_name,
          latitude: lat,
          longitude: lon,
        });
      } catch (error) {
        setErrorMsg('Gagal memproses alamat pilihan');
      } finally {
        setLoading(false);
      }
    },
    [onLocationSelect]
  );

  // Handle map click to reverse geocode
  const handleMapClick = useCallback(
    async (lat: number, lon: number) => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const response = await reverseGeocodeCoordinates(lat, lon);
        if (response.success) {
          setAddress(response.data.alamat);
          setLatitude(response.data.latitude);
          setLongitude(response.data.longitude);

          onLocationSelect({
            alamat: response.data.alamat,
            latitude: response.data.latitude,
            longitude: response.data.longitude,
          });
          
          // Auto-close popup setelah pilih (opsional, bisa di-comment jika tidak mau auto-close)
          // setIsMapOpen(false);
        }
      } catch (error: any) {
        setErrorMsg(
          error.response?.data?.error ||
          'Gagal mendapatkan alamat dari koordinat ini'
        );
      } finally {
        setLoading(false);
      }
    },
    [onLocationSelect]
  );

  // Handle marker drag
  const handleMarkerDrag = useCallback(
    async (lat: number, lon: number) => {
      setLatitude(lat);
      setLongitude(lon);

      // Reverse geocode untuk update alamat
      try {
        const response = await reverseGeocodeCoordinates(lat, lon);
        if (response.success) {
          setAddress(response.data.alamat);
          onLocationSelect({
            alamat: response.data.alamat,
            latitude: response.data.latitude,
            longitude: response.data.longitude,
          });
        }
      } catch (error) {
        // Jika reverse geocode gagal, tetap update koordinat
        onLocationSelect({
          alamat: address || `Koordinat: ${lat.toFixed(6)}, ${lon.toFixed(6)}`,
          latitude: lat,
          longitude: lon,
        });
      }
    },
    [onLocationSelect, address]
  );

  // Handle confirm location
  const handleConfirmLocation = useCallback(() => {
    if (latitude && longitude) {
      setIsMapOpen(false);
      setErrorMsg(null);
    }
  }, [latitude, longitude]);

  return (
    <div className="space-y-3">
      {/* Search Field - Compact seperti Shopee */}
      <div className="space-y-1.5">
        <Label className="text-sm">Alamat Nikah *</Label>
        <div className="flex gap-2">
          <div className="flex-1">
            <AddressAutocomplete
              value={address}
              onChange={setAddress}
              onSelect={handleAddressSelect}
              disabled={disabled || loading}
              placeholder="Ketik alamat (min 3 karakter)"
            />
          </div>
          <Button
            type="button"
            variant="default"
            size="default"
            onClick={() => setIsMapOpen(true)}
            disabled={disabled || loading}
            className="shrink-0 bg-primary hover:bg-primary/90"
          >
            <MapIcon className="h-4 w-4 mr-2" />
            Pilih di Peta
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          💡 Jika komplek/perumahan tidak ditemukan, gunakan tombol <strong>"Pilih di Peta"</strong> untuk memilih lokasi langsung di peta
        </p>
        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Memproses...</span>
          </div>
        )}
        {errorMsg && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errorMsg}
          </p>
        )}
        {latitude && longitude && (
          <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
            <CheckCircle2 className="h-3 w-3" />
            <span>Lokasi tersimpan</span>
          </div>
        )}
      </div>

      {/* Selected Address Display - Compact & Clickable untuk Edit */}
      {address && latitude && longitude && (
        <div 
          className="bg-accent/30 p-2 rounded border border-accent cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setIsMapOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsMapOpen(true);
            }
          }}
        >
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">Alamat Terpilih:</p>
              <p className="text-sm text-foreground break-words">{address}</p>
              <p className="text-xs text-muted-foreground mt-1">Klik untuk mengubah lokasi</p>
            </div>
          </div>
        </div>
      )}

      {/* Map Dialog - Popup */}
      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Pilih Lokasi di Peta
            </DialogTitle>
            <DialogDescription>
              <div className="space-y-1">
                <p>Klik di peta atau geser marker untuk memilih lokasi pernikahan</p>
                <p className="text-xs text-muted-foreground mt-1">
                  💡 Jika komplek/perumahan tidak ditemukan di search, gunakan peta ini untuk memilih lokasi secara manual
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden" style={{ height: '500px' }}>
              {latitude && longitude ? (
                <MapComponent
                  latitude={latitude}
                  longitude={longitude}
                  onMapClick={handleMapClick}
                  onMarkerDrag={handleMarkerDrag}
                  alamat={address || 'Lokasi terpilih'}
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
            {address && latitude && longitude && (
              <div className="bg-accent/50 p-3 rounded-lg">
                <p className="text-sm font-medium mb-1">Alamat Terpilih:</p>
                <p className="text-sm text-foreground break-words">{address}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Koordinat: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
              </div>
            )}
            <div className="flex justify-between items-center">
              {address && latitude && longitude ? (
                <div className="text-xs text-muted-foreground">
                  ✅ Lokasi sudah dipilih
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  Klik di peta untuk memilih lokasi
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsMapOpen(false)}
                >
                  Batal
                </Button>
                {latitude && longitude && (
                  <Button
                    type="button"
                    onClick={handleConfirmLocation}
                  >
                    Gunakan Lokasi Ini
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

