'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id as IndonesianLocale } from 'date-fns/locale';
import { getRegistrationDetail, handleApiError } from '@/lib/simnikah-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  ArrowLeft, 
  AlertCircle, 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  FileText,
  Phone,
  Mail,
  Home,
  Navigation
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MapComponent } from '@/components/kuaku/MapComponent';

interface RegistrationDetailViewProps {
  registrationId: string | number;
  onBack?: () => void;
}

export function RegistrationDetailView({ registrationId, onBack }: RegistrationDetailViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registration, setRegistration] = useState<any>(null);

  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getRegistrationDetail(registrationId);
        setRegistration(response.data);
      } catch (err: any) {
        const errorInfo = handleApiError(err);
        setError(errorInfo.message);
        
        toast({
          title: 'Gagal Memuat Detail',
          description: errorInfo.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (registrationId) {
      loadDetail();
    }
  }, [registrationId, toast]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || 'Pendaftaran tidak ditemukan'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Disetujui':
        return 'default';
      case 'Penghulu Ditugaskan':
        return 'default';
      case 'Selesai':
        return 'default';
      case 'Ditolak':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <h1 className="text-3xl font-bold mt-4">Detail Pendaftaran</h1>
          <p className="text-muted-foreground mt-1">
            {registration.nomor_pendaftaran}
          </p>
        </div>
        <Badge variant={getStatusBadgeVariant(registration.status_pendaftaran)}>
          {registration.status_pendaftaran}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informasi Umum */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informasi Umum
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nomor Pendaftaran</p>
              <p className="font-semibold">{registration.nomor_pendaftaran}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={getStatusBadgeVariant(registration.status_pendaftaran)}>
                {registration.status_pendaftaran}
              </Badge>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Tanggal Pendaftaran</p>
              <p className="font-semibold">
                {format(new Date(registration.tanggal_pendaftaran), 'EEEE, dd MMMM yyyy', { locale: IndonesianLocale })}
              </p>
            </div>
            {registration.disetujui_pada && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Disetujui Pada</p>
                  <p className="font-semibold">
                    {format(new Date(registration.disetujui_pada), 'EEEE, dd MMMM yyyy HH:mm', { locale: IndonesianLocale })}
                  </p>
                </div>
              </>
            )}
            {registration.catatan && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Catatan</p>
                  <p className="text-sm">{registration.catatan}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Jadwal Pernikahan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Jadwal Pernikahan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Tanggal Nikah</p>
              <p className="font-semibold">
                {format(new Date(registration.tanggal_nikah), 'EEEE, dd MMMM yyyy', { locale: IndonesianLocale })}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Waktu Nikah</p>
              <p className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {registration.waktu_nikah} WITA
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Tempat Nikah</p>
              <p className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {registration.tempat_nikah}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Alamat Akad</p>
              <p className="text-sm">{registration.alamat_akad || '-'}</p>
            </div>
            {registration.location && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Lokasi</p>
                  {registration.location.has_coordinates && (
                    <div className="h-48 rounded-lg overflow-hidden">
                      <MapComponent
                        latitude={registration.location.latitude}
                        longitude={registration.location.longitude}
                        address={registration.alamat_akad}
                      />
                    </div>
                  )}
                  {registration.location.google_maps_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(registration.location.google_maps_url, '_blank')}
                      className="w-full"
                    >
                      <Navigation className="mr-2 h-4 w-4" />
                      Buka di Google Maps
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Calon Suami */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Calon Suami
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nama Lengkap</p>
              <p className="font-semibold">{registration.calon_suami.nama_lengkap}</p>
            </div>
            {registration.calon_suami.nik && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">NIK</p>
                  <p className="font-semibold">{registration.calon_suami.nik}</p>
                </div>
              </>
            )}
            {registration.calon_suami.tanggal_lahir && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Lahir</p>
                  <p className="font-semibold">
                    {format(new Date(registration.calon_suami.tanggal_lahir), 'dd MMMM yyyy', { locale: IndonesianLocale })}
                  </p>
                </div>
              </>
            )}
            {registration.calon_suami.pendidikan_terakhir && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Pendidikan Terakhir</p>
                  <p className="font-semibold">{registration.calon_suami.pendidikan_terakhir}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Calon Istri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Calon Istri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nama Lengkap</p>
              <p className="font-semibold">{registration.calon_istri.nama_lengkap}</p>
            </div>
            {registration.calon_istri.nik && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">NIK</p>
                  <p className="font-semibold">{registration.calon_istri.nik}</p>
                </div>
              </>
            )}
            {registration.calon_istri.tanggal_lahir && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Lahir</p>
                  <p className="font-semibold">
                    {format(new Date(registration.calon_istri.tanggal_lahir), 'dd MMMM yyyy', { locale: IndonesianLocale })}
                  </p>
                </div>
              </>
            )}
            {registration.calon_istri.pendidikan_terakhir && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Pendidikan Terakhir</p>
                  <p className="font-semibold">{registration.calon_istri.pendidikan_terakhir}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Wali Nikah */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Wali Nikah
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nama</p>
              <p className="font-semibold">{registration.wali_nikah.nama_dan_bin}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Hubungan Wali</p>
              <p className="font-semibold">{registration.wali_nikah.hubungan_wali}</p>
            </div>
          </CardContent>
        </Card>

        {/* Penghulu (jika sudah ditugaskan) */}
        {registration.penghulu && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Penghulu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nama</p>
                <p className="font-semibold">{registration.penghulu.nama_lengkap}</p>
              </div>
              {registration.penghulu.nip && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">NIP</p>
                    <p className="font-semibold">{registration.penghulu.nip}</p>
                  </div>
                </>
              )}
              {registration.penghulu.no_hp && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">No. HP</p>
                    <p className="font-semibold flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {registration.penghulu.no_hp}
                    </p>
                  </div>
                </>
              )}
              {registration.penghulu.email && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {registration.penghulu.email}
                    </p>
                  </div>
                </>
              )}
              {registration.penghulu.alamat && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Alamat</p>
                    <p className="font-semibold flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      {registration.penghulu.alamat}
                    </p>
                  </div>
                </>
              )}
              {registration.penghulu.ditugaskan_pada && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Ditugaskan Pada</p>
                    <p className="font-semibold">
                      {format(new Date(registration.penghulu.ditugaskan_pada), 'EEEE, dd MMMM yyyy HH:mm', { locale: IndonesianLocale })}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

