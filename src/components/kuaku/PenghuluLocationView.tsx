'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getLocationDetail, type LocationDetail } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  MapPin,
  AlertCircle,
  Info,
  Navigation,
  Clock,
  Users,
  MapIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Dynamic import to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent').then(mod => ({ default: mod.MapComponent })).catch(err => {
  console.error('Error loading MapComponent:', err);
  // Return a fallback component
  return { default: () => (
    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Map</AlertTitle>
        <AlertDescription>Failed to load map component. Please refresh the page.</AlertDescription>
      </Alert>
    </div>
  )};
}), {
  loading: () => (
    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
  ssr: false,
});

interface PenghuluLocationViewProps {
  registrationId: string | number;
}

export const PenghuluLocationView: React.FC<PenghuluLocationViewProps> = ({
  registrationId,
}) => {
  const [location, setLocation] = useState<LocationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLoading(true);
        const data = await getLocationDetail(registrationId);
        setLocation(data);
        console.log('📍 Location detail loaded:', data);
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message ||
          'Gagal memuat detail lokasi pernikahan';
        setError(errorMsg);
        console.error('❌ Error loading location:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [registrationId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Gagal Memuat</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!location) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Informasi</AlertTitle>
        <AlertDescription>Data lokasi tidak ditemukan</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Detail Lokasi Pernikahan
        </CardTitle>
        <CardDescription>
          Nomor: {location.nomor_pendaftaran}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Tanggal Akad</p>
            <p className="text-base font-medium">
              {location.tanggal_nikah}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Waktu Akad</p>
            <p className="text-base font-medium">
              {location.waktu_nikah} WITA
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Tempat Nikah</p>
            <p className="text-base font-medium">
              {location.tempat_nikah}
            </p>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Alamat Lengkap</p>
          <p className="text-base break-words font-medium">
            {location.alamat_akad}
          </p>
        </div>

        {/* Coordinates (if available) */}
        {(location.has_coordinates || (location.is_outside_kua && location.latitude && location.longitude)) && location.latitude && location.longitude && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Latitude</p>
              <code className="bg-muted px-2 py-1 rounded text-xs">
                {location.latitude.toFixed(6)}
              </code>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Longitude</p>
              <code className="bg-muted px-2 py-1 rounded text-xs">
                {location.longitude.toFixed(6)}
              </code>
            </div>
          </div>
        )}

        {/* Map Display - Show for outside KUA if coordinates exist, even if has_coordinates is false */}
        {((location.has_coordinates || (location.is_outside_kua && location.latitude && location.longitude)) && location.latitude && location.longitude) && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Peta Lokasi</p>
            <MapComponent
              latitude={location.latitude}
              longitude={location.longitude}
              alamat={location.alamat_akad}
            />
          </div>
        )}

        {/* Navigation Links */}
        {(location.has_coordinates || (location.is_outside_kua && location.latitude && location.longitude)) && (
          <div className="space-y-3 p-4 bg-accent/50 rounded-lg">
            <p className="text-sm font-medium flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Tautan Navigasi
            </p>
            <div className="grid grid-cols-2 gap-2">
              {location.google_maps_directions_url && (
                <a
                  href={location.google_maps_directions_url}
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
              )}
              {location.waze_url && (
                <a
                  href={location.waze_url}
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
              )}
              {location.osm_url && (
                <a
                  href={location.osm_url}
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
              )}
            </div>
          </div>
        )}

        {/* Outside KUA Info */}
        {location.is_outside_kua && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Pernikahan di Luar KUA</AlertTitle>
            <AlertDescription className="mt-2 space-y-1">
              <p>{location.note}</p>
              {(location.has_coordinates || (location.latitude && location.longitude)) && (
                <p className="text-xs">
                  ✅ Koordinat GPS sudah tersimpan untuk memudahkan navigasi.
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* No Coordinates Warning */}
        {location.is_outside_kua && !location.has_coordinates && !location.latitude && !location.longitude && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Koordinat Belum Tersedia</AlertTitle>
            <AlertDescription>
              Pengguna belum mengatur koordinat GPS untuk lokasi ini.
              Pastikan untuk meminta pihak calon pengantin melengkapi
              informasi lokasi.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
