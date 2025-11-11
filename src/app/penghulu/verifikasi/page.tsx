'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { FileCheck, AlertCircle, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import {
  getAssignedRegistrations,
  completeVerification,
  cacheAssignedRegistrations,
  getCachedAssignedRegistrations,
  AssignedRegistration,
  createPenguluNotification,
} from '@/lib/penghulu-service';

export default function VerifikasiPage() {
  const [registrations, setRegistrations] = useState<AssignedRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState<AssignedRegistration | null>(
    null
  );
  const [verificationDialog, setVerificationDialog] = useState(false);
  const [rejectionDialog, setRejectionDialog] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const loadRegistrations = async () => {
      try {
        const data = await getAssignedRegistrations();
        setRegistrations(data);
        if (data.length > 0) {
          cacheAssignedRegistrations(data);
        }
        setError(''); // Clear any previous errors
      } catch (err) {
        // Error is already handled in getAssignedRegistrations, just get cached data
        console.error('Error in loadRegistrations:', err);
        const cached = getCachedAssignedRegistrations();
        setRegistrations(cached);
        if (cached.length === 0) {
          setError('Tidak ada data registrasi yang tersimpan. Silakan login kembali.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadRegistrations();
  }, []);

  const handleApprove = (registration: AssignedRegistration) => {
    setSelectedRegistration(registration);
    setVerificationDialog(true);
  };

  const handleReject = (registration: AssignedRegistration) => {
    setSelectedRegistration(registration);
    setRejectionNotes('');
    setRejectionDialog(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedRegistration) return;

    setVerifying(true);
    try {
      const success = await completeVerification(
        selectedRegistration.id,
        selectedRegistration.nomor_pendaftaran,
        'approved'
      );

      if (success) {
        // Update local state
        setRegistrations((prev) =>
          prev.map((reg) =>
            reg.id === selectedRegistration.id
              ? { ...reg, status_pendaftaran: 'Menunggu Bimbingan' }
              : reg
          )
        );
        setVerificationDialog(false);
        setSelectedRegistration(null);
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedRegistration) return;

    setVerifying(true);
    try {
      const success = await completeVerification(
        selectedRegistration.id,
        selectedRegistration.nomor_pendaftaran,
        'rejected',
        rejectionNotes
      );

      if (success) {
        // Update local state
        setRegistrations((prev) =>
          prev.map((reg) =>
            reg.id === selectedRegistration.id
              ? { ...reg, status_pendaftaran: 'Penolakan Dokumen' }
              : reg
          )
        );
        setRejectionDialog(false);
        setSelectedRegistration(null);
        setRejectionNotes('');
      }
    } finally {
      setVerifying(false);
    }
  };

  const pendingVerifications = registrations.filter(
    (reg) => reg.status_pendaftaran === 'Menunggu Verifikasi Penghulu'
  );

  const approvedVerifications = registrations.filter(
    (reg) => reg.status_pendaftaran === 'Menunggu Bimbingan'
  );

  const rejectedVerifications = registrations.filter(
    (reg) => reg.status_pendaftaran === 'Penolakan Dokumen'
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Verifikasi Dokumen</h1>
          <p className="text-gray-600 mt-2">Verifikasi dokumen pendaftaran pernikahan</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            className={error.includes('cache') ? 'border-yellow-500 bg-yellow-50' : 'border-red-500 bg-red-50'}
          >
            <AlertCircle
              className={error.includes('cache') ? 'h-4 w-4 text-yellow-600' : 'h-4 w-4 text-red-600'}
            />
            <AlertTitle className={error.includes('cache') ? 'text-yellow-900' : 'text-red-900'}>
              {error.includes('cache') ? 'Mode Offline' : 'Error'}
            </AlertTitle>
            <AlertDescription className={error.includes('cache') ? 'text-yellow-700' : 'text-red-700'}>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Menunggu Verifikasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{pendingVerifications.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Telah Disetujui
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{approvedVerifications.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Ditolak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{rejectedVerifications.length}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Memuat data verifikasi...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Verifications */}
        {!loading && pendingVerifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-orange-600" />
                Menunggu Verifikasi ({pendingVerifications.length})
              </CardTitle>
              <CardDescription>Verifikasi dokumen calon pengantin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingVerifications.map((registration) => (
                <div
                  key={registration.id}
                  className="border rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{registration.nomor_pendaftaran}</h4>
                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-gray-600">Calon Suami</p>
                          <p className="font-medium">
                            {registration.calon_suami.nama_lengkap}
                          </p>
                          <p className="text-xs text-gray-500">
                            NIK: {registration.calon_suami.nik}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Calon Istri</p>
                          <p className="font-medium">
                            {registration.calon_istri.nama_lengkap}
                          </p>
                          <p className="text-xs text-gray-500">
                            NIK: {registration.calon_istri.nik}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      Menunggu
                    </Badge>
                  </div>

                  {/* Detail */}
                  <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-600">Tanggal Nikah</p>
                      <p className="font-medium">
                        {new Date(registration.tanggal_nikah).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Waktu</p>
                      <p className="font-medium">{registration.waktu_nikah}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-600">Lokasi</p>
                      <p className="font-medium">{registration.tempat_nikah}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(registration)}
                      disabled={verifying}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Setujui
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(registration)}
                      disabled={verifying}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Tolak
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Approved Verifications */}
        {!loading && approvedVerifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Telah Disetujui ({approvedVerifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {approvedVerifications.map((registration) => (
                <div key={registration.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{registration.nomor_pendaftaran}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {registration.calon_suami.nama_lengkap} & {registration.calon_istri.nama_lengkap}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Disetujui</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Rejected Verifications */}
        {!loading && rejectedVerifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Ditolak ({rejectedVerifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rejectedVerifications.map((registration) => (
                <div key={registration.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{registration.nomor_pendaftaran}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {registration.calon_suami.nama_lengkap} & {registration.calon_istri.nama_lengkap}
                      </p>
                    </div>
                    <Badge variant="destructive">Ditolak</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* No Data */}
        {!loading && registrations.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <FileCheck className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Tidak ada tugas verifikasi</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Verification Dialog */}
      <Dialog open={verificationDialog} onOpenChange={setVerificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Setujui Dokumen</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menyetujui dokumen pendaftaran ini?
            </DialogDescription>
          </DialogHeader>

          {selectedRegistration && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded space-y-2">
                <p className="text-sm">
                  <span className="text-gray-600">Nomor Pendaftaran:</span>{' '}
                  <span className="font-semibold">{selectedRegistration.nomor_pendaftaran}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Calon Suami:</span>{' '}
                  <span className="font-semibold">{selectedRegistration.calon_suami.nama_lengkap}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Calon Istri:</span>{' '}
                  <span className="font-semibold">{selectedRegistration.calon_istri.nama_lengkap}</span>
                </p>
              </div>

              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-900">Status Berubah</AlertTitle>
                <AlertDescription className="text-green-700">
                  Status akan berubah menjadi "Menunggu Bimbingan"
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setVerificationDialog(false)}>
              Batal
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleConfirmApprove}
              disabled={verifying}
            >
              {verifying ? 'Memproses...' : 'Setujui'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <AlertDialog open={rejectionDialog} onOpenChange={setRejectionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tolak Dokumen</AlertDialogTitle>
            <AlertDialogDescription>
              Berikan catatan penolakan untuk calon pengantin
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            {selectedRegistration && (
              <div className="bg-gray-50 p-4 rounded space-y-2 text-sm">
                <p>
                  <span className="text-gray-600">Nomor:</span>{' '}
                  <span className="font-semibold">{selectedRegistration.nomor_pendaftaran}</span>
                </p>
                <p>
                  <span className="text-gray-600">Calon Suami:</span>{' '}
                  <span className="font-semibold">{selectedRegistration.calon_suami.nama_lengkap}</span>
                </p>
                <p>
                  <span className="text-gray-600">Calon Istri:</span>{' '}
                  <span className="font-semibold">{selectedRegistration.calon_istri.nama_lengkap}</span>
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Catatan Penolakan</label>
              <Textarea
                placeholder="Jelaskan alasan penolakan dokumen..."
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>

            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-900">Perhatian</AlertTitle>
              <AlertDescription className="text-red-700">
                Status akan berubah menjadi "Penolakan Dokumen"
              </AlertDescription>
            </Alert>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={verifying || !rejectionNotes.trim()}
            >
              {verifying ? 'Memproses...' : 'Tolak'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
      </>
    );
}