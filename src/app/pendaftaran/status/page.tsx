'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { checkRegistrationStatus, type RegistrationStatusResponse } from '@/lib/simnikah-api';
import { FeedbackForm } from '@/components/kuaku/FeedbackForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, Clock, XCircle, AlertCircle, MessageSquare, Calendar, MapPin, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id as IndonesianLocale } from 'date-fns/locale';
import Link from 'next/link';

interface DetailItemProps {
  label: string;
  value: string | undefined | null;
  icon?: React.ReactNode;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, icon }) => (
  <div className="flex flex-col sm:flex-row py-3 border-b border-border/50 last:border-none">
    <dt className="w-full sm:w-1/3 font-medium text-muted-foreground flex items-center gap-2">
      {icon}
      {label}
    </dt>
    <dd className="w-full sm:w-2/3 mt-1 sm:mt-0 font-semibold text-foreground">{value || '-'}</dd>
  </div>
);

function getStatusBadge(status: string) {
  switch (status) {
    case 'Draft':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Draft</Badge>;
    case 'Disetujui':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Disetujui</Badge>;
    case 'Menunggu Penugasan':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Menunggu Penugasan</Badge>;
    case 'Penghulu Ditugaskan':
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">Penghulu Ditugaskan</Badge>;
    case 'Selesai':
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">Selesai</Badge>;
    case 'Ditolak':
      return <Badge variant="destructive">Ditolak</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'Selesai':
      return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
    case 'Ditolak':
      return <XCircle className="h-5 w-5 text-red-600" />;
    case 'Draft':
    case 'Disetujui':
    case 'Menunggu Penugasan':
    case 'Penghulu Ditugaskan':
      return <Clock className="h-5 w-5 text-blue-600" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-600" />;
  }
}

export default function RegistrationStatusPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFeedback, setHasFeedback] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      loadRegistrationStatus();
    }
  }, [user, authLoading, router]);

  const loadRegistrationStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await checkRegistrationStatus();
      
      if (response.success && response.data?.registration) {
        const regData = response.data.registration;
        
        // Cek localStorage untuk data tambahan (calon suami, calon istri, penghulu)
        let localStorageData: any = null;
        if (regData.nomor_pendaftaran) {
          try {
            const stored = localStorage.getItem(`registration_${regData.nomor_pendaftaran}`);
            if (stored) {
              localStorageData = JSON.parse(stored);
              console.log('📦 Loaded from localStorage:', localStorageData);
            }
          } catch (e) {
            console.warn('Failed to parse localStorage data:', e);
          }
        }
        
        // Merge data dari API dengan data dari localStorage
        const mergedData = {
          ...regData,
          // Gunakan data dari localStorage jika API tidak mengembalikan data
          calon_suami: regData.calon_suami || localStorageData?.calon_suami || null,
          calon_istri: regData.calon_istri || localStorageData?.calon_istri || null,
          // Update penghulu dari localStorage jika API tidak mengembalikan
          penghulu: regData.penghulu || localStorageData?.penghulu || null,
          // Update data lain dari localStorage jika lebih lengkap
          waktu_nikah: regData.waktu_nikah || localStorageData?.waktu_nikah || regData.waktu_nikah,
          alamat_akad: regData.alamat_akad || localStorageData?.alamat_akad || regData.alamat_akad,
        };
        
        // Log untuk debugging
        console.log('📋 Registration Data (merged):', {
          calonSuami: mergedData.calon_suami,
          calonIstri: mergedData.calon_istri,
          penghulu: mergedData.penghulu,
          fromLocalStorage: !!localStorageData,
        });
        
        setRegistrationData(mergedData);
        // TODO: Check if user already submitted feedback for this registration
        // For now, we'll assume they haven't if status is "Selesai"
        if (mergedData.status_pendaftaran === 'Selesai') {
          setHasFeedback(false); // You can add API call to check if feedback exists
        }
      } else {
        setRegistrationData(null);
      }
    } catch (err: any) {
      console.error('Error loading registration status:', err);
      setError(err.response?.data?.error || err.message || 'Gagal memuat status pendaftaran');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSuccess = () => {
    setHasFeedback(true);
    // Optionally reload status
    loadRegistrationStatus();
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Memuat status pendaftaran...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto my-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push('/')} variant="outline">
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  if (!registrationData) {
    return (
      <div className="max-w-3xl mx-auto my-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Status Pendaftaran</CardTitle>
            <CardDescription>Informasi status pendaftaran nikah Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Belum Ada Pendaftaran</AlertTitle>
              <AlertDescription>
                Anda belum memiliki pendaftaran nikah. Silakan daftar terlebih dahulu.
              </AlertDescription>
            </Alert>
            <div className="mt-6">
              <Link href="/daftar-nikah-sederhana">
                <Button>Daftar Nikah Sekarang</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formattedWeddingDate = registrationData.tanggal_nikah
    ? (() => {
        try {
          const dateStr = registrationData.tanggal_nikah.split('T')[0];
          return format(parseISO(dateStr), 'EEEE, dd MMMM yyyy', { locale: IndonesianLocale });
        } catch (e) {
          return registrationData.tanggal_nikah;
        }
      })()
    : '-';

  const isCompleted = registrationData.status_pendaftaran === 'Selesai';

  return (
    <div className="max-w-4xl mx-auto my-8 px-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Status Pendaftaran Nikah</h1>
        <p className="text-muted-foreground mt-2">
          Informasi lengkap tentang status pendaftaran nikah Anda
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(registrationData.status_pendaftaran)}
              <div>
                <CardTitle>Status Pendaftaran</CardTitle>
                <CardDescription>Nomor: {registrationData.nomor_pendaftaran}</CardDescription>
              </div>
            </div>
            {getStatusBadge(registrationData.status_pendaftaran)}
          </div>
        </CardHeader>
        <CardContent>
          <dl className="divide-y divide-border/50">
            <DetailItem 
              label="Calon Suami" 
              value={
                registrationData.calon_suami?.nama_lengkap || 
                registrationData.calon_suami?.nama_dan_bin || 
                registrationData.calon_suami?.nama || 
                '-'
              }
              icon={<User className="h-4 w-4" />}
            />
            <DetailItem 
              label="Calon Istri" 
              value={
                registrationData.calon_istri?.nama_lengkap || 
                registrationData.calon_istri?.nama_dan_binti || 
                registrationData.calon_istri?.nama || 
                '-'
              }
              icon={<User className="h-4 w-4" />}
            />
            <DetailItem 
              label="Tanggal Nikah" 
              value={formattedWeddingDate}
              icon={<Calendar className="h-4 w-4" />}
            />
            <DetailItem 
              label="Waktu Nikah" 
              value={registrationData.waktu_nikah ? `${registrationData.waktu_nikah} WITA` : '-'}
              icon={<Clock className="h-4 w-4" />}
            />
            <DetailItem 
              label="Tempat Nikah" 
              value={registrationData.tempat_nikah || '-'}
              icon={<MapPin className="h-4 w-4" />}
            />
            {registrationData.alamat_akad && (
              <DetailItem 
                label="Alamat Akad" 
                value={registrationData.alamat_akad}
                icon={<MapPin className="h-4 w-4" />}
              />
            )}
            <DetailItem 
              label="Penghulu" 
              value={
                registrationData.penghulu?.nama_lengkap || 
                registrationData.penghulu?.nama || 
                (typeof registrationData.penghulu === 'string' ? registrationData.penghulu : '-')
              }
              icon={<User className="h-4 w-4" />}
            />
          </dl>
        </CardContent>
      </Card>

      {/* Feedback Section - Only show if status is "Selesai" */}
      {isCompleted && !hasFeedback && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle>Berikan Feedback</CardTitle>
            </div>
            <CardDescription>
              Pernikahan Anda sudah selesai. Bagikan pengalaman Anda untuk membantu kami meningkatkan pelayanan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeedbackForm 
              pendaftaranId={registrationData.id} 
              onSuccess={handleFeedbackSuccess}
            />
          </CardContent>
        </Card>
      )}

      {/* Feedback Submitted Message */}
      {isCompleted && hasFeedback && (
        <Alert className="bg-emerald-50 border-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertTitle className="text-emerald-900">Terima Kasih!</AlertTitle>
          <AlertDescription className="text-emerald-800">
            Feedback Anda telah berhasil dikirim. Kami sangat menghargai masukan Anda.
          </AlertDescription>
        </Alert>
      )}

      {/* Status Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informasi Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            {registrationData.status_pendaftaran === 'Draft' && (
              <p>Pendaftaran Anda sedang dalam status draft. Staff KUA akan memverifikasi pendaftaran Anda.</p>
            )}
            {registrationData.status_pendaftaran === 'Disetujui' && (
              <p>Pendaftaran Anda telah disetujui. Kepala KUA akan menugaskan penghulu untuk pernikahan Anda.</p>
            )}
            {registrationData.status_pendaftaran === 'Menunggu Penugasan' && (
              <p>Pendaftaran Anda sedang menunggu penugasan penghulu oleh Kepala KUA.</p>
            )}
            {registrationData.status_pendaftaran === 'Penghulu Ditugaskan' && (
              <p>Penghulu telah ditugaskan untuk pernikahan Anda. Silakan persiapkan diri untuk hari pernikahan.</p>
            )}
            {registrationData.status_pendaftaran === 'Selesai' && (
              <p>Pernikahan Anda telah selesai dilaksanakan. Terima kasih telah menggunakan layanan KUA Banjarmasin Utara.</p>
            )}
            {registrationData.status_pendaftaran === 'Ditolak' && (
              <p>Pendaftaran Anda ditolak. Silakan perbaiki dokumen yang diperlukan dan daftar ulang.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={loadRegistrationStatus} variant="outline">
          Refresh Status
        </Button>
        <Link href="/">
          <Button variant="outline">Kembali ke Beranda</Button>
        </Link>
      </div>
    </div>
  );
}

