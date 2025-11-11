'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface StaffVerificationPanelProps {
  registrationId: string;
  registrationNumber: string;
  groomName: string;
  brideName: string;
  currentStatus: string;
  verificationStatus?: {
    formulir_online?: boolean;
    berkas_fisik?: boolean;
  };
}

type VerificationType = 'formulir_online' | 'berkas_fisik';

export function StaffVerificationPanel({
  registrationId,
  registrationNumber,
  groomName,
  brideName,
  currentStatus,
  verificationStatus = {}
}: StaffVerificationPanelProps) {
  const [loading, setLoading] = useState(false);
  const [catatan, setCatatan] = useState('');
  const [activeDialog, setActiveDialog] = useState<VerificationType | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://simnikah-api-production.up.railway.app';

  const handleVerification = async (
    type: VerificationType,
    approved: boolean
  ) => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login kembali.');
      }

      const endpoint = type === 'formulir_online'
        ? `/simnikah/staff/verify-formulir/${registrationId}`
        : `/simnikah/staff/verify-berkas/${registrationId}`;

      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approved,
          catatan: catatan || 'Verifikasi berhasil diproses',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verifikasi gagal');
      }

      // Simpan verifikasi ke localStorage
      const userId = localStorage.getItem('user_id') || registrationId;
      const verificationData = JSON.parse(
        localStorage.getItem(`verification_${registrationId}`) || '{}'
      );

      verificationData[type] = {
        approved,
        status: data.data?.status_baru || 'Sudah Diverifikasi',
        verified_at: data.data?.verified_at,
        verified_by: data.data?.verified_by,
        catatan: catatan || data.data?.catatan,
      };

      localStorage.setItem(`verification_${registrationId}`, JSON.stringify(verificationData));

      // Buat notifikasi untuk user
      createNotification(registrationId, type, approved, data.data?.status_baru);

      // Update daftar registrasi
      updateRegistrationStatus(registrationId, data.data?.status_baru);

      setSuccessMessage(
        `${type === 'formulir_online' ? 'Formulir' : 'Berkas fisik'} ${
          approved ? 'disetujui' : 'ditolak'
        } dengan sukses. Notifikasi telah dikirim ke user.`
      );

      setCatatan('');
      setActiveDialog(null);

      // Reload halaman setelah 2 detik
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Verification error:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'Terjadi kesalahan saat verifikasi'
      );
    } finally {
      setLoading(false);
    }
  };

  const createNotification = (
    registrationId: string,
    type: VerificationType,
    approved: boolean,
    newStatus?: string
  ) => {
    const notifications = JSON.parse(
      localStorage.getItem(`notifications_${registrationId}`) || '[]'
    );

    const notificationTitle = type === 'formulir_online'
      ? approved
        ? '✅ Formulir Diverifikasi'
        : '❌ Formulir Ditolak'
      : approved
        ? '✅ Berkas Fisik Diterima'
        : '❌ Berkas Fisik Ditolak';

    const notificationMessage = type === 'formulir_online'
      ? approved
        ? `Formulir pendaftaran nikah Anda untuk ${groomName} & ${brideName} telah diverifikasi oleh staff KUA. Silakan datang ke KUA untuk menyerahkan berkas fisik.`
        : `Formulir pendaftaran Anda ditolak. Silakan hubungi KUA untuk informasi lebih lanjut. Catatan: ${catatan || 'Tidak ada catatan'}`
      : approved
        ? `Berkas fisik Anda telah diterima dan diverifikasi. Pendaftaran Anda sedang dalam proses berikutnya. Status: ${newStatus}`
        : `Berkas fisik Anda ditolak. Silakan hubungi KUA untuk informasi lebih lanjut. Catatan: ${catatan || 'Tidak ada catatan'}`;

    notifications.unshift({
      id: `notif_${Date.now()}`,
      judul: notificationTitle,
      pesan: notificationMessage,
      tipe: approved ? 'Success' : 'Error',
      status_baca: 'Belum Dibaca',
      link: `/profile/registration-status/${registrationId}`,
      created_at: new Date().toISOString(),
      registration_id: registrationId,
    });

    localStorage.setItem(`notifications_${registrationId}`, JSON.stringify(notifications));
  };

  const updateRegistrationStatus = (registrationId: string, newStatus: string) => {
    const registrations = JSON.parse(
      localStorage.getItem('marriageRegistrations') || '[]'
    );

    const index = registrations.findIndex(
      (reg: any) => reg.id === registrationId
    );

    if (index !== -1) {
      registrations[index].status = newStatus;
      localStorage.setItem('marriageRegistrations', JSON.stringify(registrations));
    }
  };

  const isFormulirVerified = verificationStatus?.formulir_online;
  const isBerkasVerified = verificationStatus?.berkas_fisik;
  const canVerifyBerkas = isFormulirVerified && !isBerkasVerified;

  return (
    <div className="space-y-6">
      {successMessage && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900">Sukses</AlertTitle>
          <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert className="border-red-500 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-900">Error</AlertTitle>
          <AlertDescription className="text-red-700">{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verifikasi Formulir Online */}
        <Card className={`${isFormulirVerified ? 'border-green-300' : 'border-yellow-300'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Verifikasi Formulir Online</CardTitle>
                <CardDescription>Tahap 1: Verifikasi Data Online</CardDescription>
              </div>
              {isFormulirVerified && (
                <CheckCircle className="h-6 w-6 text-green-600" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Status Pendaftaran:</p>
              <Badge variant={currentStatus === 'Menunggu Verifikasi' ? 'secondary' : 'default'}>
                {currentStatus}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Data Calon Pengantin:</p>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p>Suami: <span className="font-semibold">{groomName}</span></p>
                <p>Istri: <span className="font-semibold">{brideName}</span></p>
              </div>
            </div>

            {isFormulirVerified && (
              <Alert className="bg-green-50 border-green-300">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Formulir telah diverifikasi
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Dialog open={activeDialog === 'formulir_online'} onOpenChange={(open) => {
              setActiveDialog(open ? 'formulir_online' : null);
            }}>
              <DialogTrigger asChild>
                <Button
                  className="w-full"
                  variant={isFormulirVerified ? 'outline' : 'default'}
                  disabled={isFormulirVerified}
                >
                  {isFormulirVerified ? 'Sudah Diverifikasi' : 'Verifikasi Formulir'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Verifikasi Formulir Online</DialogTitle>
                  <DialogDescription>
                    Verifikasi kelengkapan dan kevalidan data formulir online
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded space-y-2">
                    <p className="text-sm"><span className="font-medium">No. Pendaftaran:</span> {registrationNumber}</p>
                    <p className="text-sm"><span className="font-medium">Calon Suami:</span> {groomName}</p>
                    <p className="text-sm"><span className="font-medium">Calon Istri:</span> {brideName}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Catatan (Opsional)</label>
                    <Textarea
                      placeholder="Tambahkan catatan verifikasi..."
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleVerification('formulir_online', true)}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Setujui
                        </>
                      )}
                    </Button>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={() => handleVerification('formulir_online', false)}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Tolak
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>

        {/* Verifikasi Berkas Fisik */}
        <Card className={`${isBerkasVerified ? 'border-green-300' : 'border-gray-300'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Verifikasi Berkas Fisik</CardTitle>
                <CardDescription>Tahap 2: Verifikasi Dokumen Offline</CardDescription>
              </div>
              {isBerkasVerified && (
                <CheckCircle className="h-6 w-6 text-green-600" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Persyaratan:</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Formulir harus sudah diverifikasi</li>
                <li>User telah membawa berkas fisik</li>
                <li>Dokumen lengkap dan valid</li>
              </ul>
            </div>

            {!canVerifyBerkas && (
              <Alert className="bg-yellow-50 border-yellow-300">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700">
                  {isBerkasVerified
                    ? 'Berkas telah diverifikasi'
                    : 'Verifikasi formulir online terlebih dahulu'}
                </AlertDescription>
              </Alert>
            )}

            {isBerkasVerified && (
              <Alert className="bg-green-50 border-green-300">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Berkas fisik telah diverifikasi
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Dialog open={activeDialog === 'berkas_fisik'} onOpenChange={(open) => {
              setActiveDialog(open ? 'berkas_fisik' : null);
            }}>
              <DialogTrigger asChild>
                <Button
                  className="w-full"
                  variant={isBerkasVerified ? 'outline' : 'default'}
                  disabled={!canVerifyBerkas && isBerkasVerified}
                >
                  {isBerkasVerified
                    ? 'Sudah Diverifikasi'
                    : !isFormulirVerified
                      ? 'Tunggu Verifikasi Formulir'
                      : 'Verifikasi Berkas Fisik'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Verifikasi Berkas Fisik</DialogTitle>
                  <DialogDescription>
                    Verifikasi kelengkapan dan kevalidan dokumen yang diserahkan
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded space-y-2">
                    <p className="text-sm"><span className="font-medium">No. Pendaftaran:</span> {registrationNumber}</p>
                    <p className="text-sm"><span className="font-medium">Calon Suami:</span> {groomName}</p>
                    <p className="text-sm"><span className="font-medium">Calon Istri:</span> {brideName}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Dokumen yang Diverifikasi:</p>
                    <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                      <p>✓ Surat Pernyataan Belum Kawin</p>
                      <p>✓ Fotokopi KTP Calon Suami & Istri</p>
                      <p>✓ Fotokopi Akta Kelahiran</p>
                      <p>✓ Surat Keterangan Orang Tua</p>
                      <p>✓ Surat Izin dari Wali Nikah</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Catatan Verifikasi</label>
                    <Textarea
                      placeholder="Catatan hasil verifikasi berkas fisik..."
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleVerification('berkas_fisik', true)}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Terima Berkas
                        </>
                      )}
                    </Button>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={() => handleVerification('berkas_fisik', false)}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Tolak Berkas
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      </div>

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Status Verifikasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                isFormulirVerified ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {isFormulirVerified ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <div className="h-3 w-3 rounded-full bg-gray-400" />
                )}
              </div>
              <div>
                <p className="font-medium">Tahap 1: Formulir Online</p>
                <p className="text-sm text-gray-600">
                  {isFormulirVerified ? '✅ Sudah diverifikasi' : '⏳ Menunggu verifikasi'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                isBerkasVerified ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {isBerkasVerified ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <div className="h-3 w-3 rounded-full bg-gray-400" />
                )}
              </div>
              <div>
                <p className="font-medium">Tahap 2: Berkas Fisik</p>
                <p className="text-sm text-gray-600">
                  {isBerkasVerified
                    ? '✅ Sudah diverifikasi'
                    : isFormulirVerified
                      ? '⏳ Menunggu verifikasi'
                      : '⬜ Tidak bisa diakses'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}