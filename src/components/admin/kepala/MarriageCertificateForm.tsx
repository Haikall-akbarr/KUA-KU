'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Download, Eye } from 'lucide-react';
import Link from 'next/link';

interface Registration {
  id: string;
  nomor_pendaftaran: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
  weddingTime: string;
  weddingLocation: string;
  status: string;
  penghuluId?: string;
  assignedAt?: string;
}

interface CertificateData {
  id: string;
  nomor_pendaftaran: string;
  nomor_surat_nikah: string;
  tanggal_surat: string;
  nama_suami: string;
  nama_istri: string;
  tanggal_nikah: string;
  waktu_nikah: string;
  tempat_nikah: string;
  penghulu_nama: string;
  diterbitkan_oleh: string;
  diterbitkan_at: string;
}

export default function MarriageCertificateForm() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [generatingCertificate, setGeneratingCertificate] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [penguluName, setPenguluName] = useState('');

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = () => {
    try {
      // Ambil semua registrasi dari localStorage
      const allRegs = JSON.parse(localStorage.getItem('marriageRegistrations') || '[]');
      
      // Filter yang status "Sudah Bimbingan" (siap terbitkan surat)
      const readyForCertificate = allRegs.filter((reg: any) => 
        reg.status === 'Sudah Bimbingan'
      );

      console.log('📄 Registrasi siap terbitkan surat:', readyForCertificate.length);
      setRegistrations(readyForCertificate);
      setLoading(false);
    } catch (err) {
      console.error('Error loading registrations:', err);
      setErrorMessage('Gagal memuat data registrasi');
      setLoading(false);
    }
  };

  const getPenguluName = (penghuluId?: string) => {
    if (!penghuluId) return 'Penghulu KUA';
    
    // Cek di localStorage kalau ada detail penghulu
    const penguluProfile = localStorage.getItem('penghulu_profile');
    if (penguluProfile) {
      try {
        const penghulu = JSON.parse(penguluProfile);
        if (penghulu.id === penghuluId || penghulu.id.toString() === penghuluId.toString()) {
          return penghulu.nama_lengkap || 'Penghulu KUA';
        }
      } catch (e) {
        console.error('Error parsing penghulu profile:', e);
      }
    }
    
    return 'Penghulu KUA';
  };

  const generateCertificateNumber = () => {
    // Format: SURAT/2025/[index]/BAN (Banjarmasin)
    const year = new Date().getFullYear();
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `SURAT/${year}/${random}/BAN`;
  };

  const handleIssueCertificate = async () => {
    if (!selectedReg) {
      setErrorMessage('Pilih registrasi terlebih dahulu');
      return;
    }

    setGeneratingCertificate(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      console.log('📄 Mulai proses terbitkan surat untuk:', selectedReg.nomor_pendaftaran);

      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const penguluName = getPenguluName(selectedReg.penghuluId);
      const certificateNumber = generateCertificateNumber();
      const currentDate = new Date().toLocaleDateString('id-ID');

      // Buat data surat
      const certificateData: CertificateData = {
        id: selectedReg.id,
        nomor_pendaftaran: selectedReg.nomor_pendaftaran,
        nomor_surat_nikah: certificateNumber,
        tanggal_surat: currentDate,
        nama_suami: selectedReg.groomName,
        nama_istri: selectedReg.brideName,
        tanggal_nikah: selectedReg.weddingDate,
        waktu_nikah: selectedReg.weddingTime,
        tempat_nikah: selectedReg.weddingLocation,
        penghulu_nama: penguluName,
        diterbitkan_oleh: currentUser.nama || 'Kepala KUA',
        diterbitkan_at: new Date().toISOString(),
      };

      console.log('✅ Data surat dibuat:', certificateData);

      // Update registrasi
      const allRegs = JSON.parse(localStorage.getItem('marriageRegistrations') || '[]');
      const updatedRegs = allRegs.map((reg: any) => {
        if (reg.id === selectedReg.id) {
          return {
            ...reg,
            status: 'Selesai',
            certificateNumber: certificateNumber,
            certificateIssueDate: new Date().toISOString(),
            issuedBy: currentUser.id,
          };
        }
        return reg;
      });

      localStorage.setItem('marriageRegistrations', JSON.stringify(updatedRegs));
      console.log('✅ Status registrasi diubah ke: Selesai');

      // Simpan surat untuk diambil nanti
      const certificates = JSON.parse(localStorage.getItem('marriage_certificates') || '[]');
      certificates.push(certificateData);
      localStorage.setItem('marriage_certificates', JSON.stringify(certificates));
      console.log('✅ Surat nikah disimpan');

      // Buat notifikasi untuk user
      const notification = {
        id: `cert_${selectedReg.id}_${Date.now()}`,
        registrationId: selectedReg.id,
        judul: '✅ Surat Nikah Siap Diambil',
        pesan: `Surat nikah Anda dengan nomor ${certificateNumber} telah diterbitkan dan siap diambil di KUA.`,
        tipe: 'Success',
        status_baca: 'Belum Dibaca',
        link: `/profile?tab=certificates`,
        created_at: new Date().toISOString(),
      };

      const userNotifications = JSON.parse(
        localStorage.getItem(`notifications_${selectedReg.id}`) || '[]'
      );
      userNotifications.push(notification);
      localStorage.setItem(`notifications_${selectedReg.id}`, JSON.stringify(userNotifications));
      console.log('✅ Notifikasi dikirim ke user');

      setSuccessMessage(
        `✅ Surat nikah nomor ${certificateNumber} berhasil diterbitkan! Notifikasi telah dikirim ke user.`
      );
      setSelectedReg(null);
      
      // Reload data
      setTimeout(() => {
        loadRegistrations();
      }, 1500);
    } catch (err) {
      console.error('❌ Error terbitkan surat:', err);
      setErrorMessage('Gagal menerbitkan surat. Silakan coba lagi.');
    } finally {
      setGeneratingCertificate(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Terbitkan Surat Nikah
          </CardTitle>
          <CardDescription>
            Daftar pendaftaran nikah yang sudah melewati tahap bimbingan dan siap menerima surat nikah
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Sukses</AlertTitle>
              <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data...</p>
            </div>
          ) : registrations.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Tidak Ada Data</AlertTitle>
              <AlertDescription>
                Belum ada pendaftaran dengan status "Sudah Bimbingan"
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-3">Nomor Pendaftaran</th>
                      <th className="text-left p-3">Calon Suami</th>
                      <th className="text-left p-3">Calon Istri</th>
                      <th className="text-left p-3">Tanggal Nikah</th>
                      <th className="text-center p-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg) => (
                      <tr
                        key={reg.id}
                        className={`border-b hover:bg-gray-50 cursor-pointer transition ${
                          selectedReg?.id === reg.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedReg(reg)}
                      >
                        <td className="p-3 font-medium">{reg.nomor_pendaftaran}</td>
                        <td className="p-3">{reg.groomName}</td>
                        <td className="p-3">{reg.brideName}</td>
                        <td className="p-3">{reg.weddingDate}</td>
                        <td className="p-3 text-center">
                          <Badge
                            variant={selectedReg?.id === reg.id ? 'default' : 'outline'}
                          >
                            {selectedReg?.id === reg.id ? 'Dipilih' : 'Pilih'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedReg && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Detail Pendaftaran yang Dipilih
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Nomor Pendaftaran</p>
                        <p className="font-semibold">{selectedReg.nomor_pendaftaran}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <Badge className="bg-green-600">{selectedReg.status}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Calon Suami</p>
                        <p className="font-semibold">{selectedReg.groomName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Calon Istri</p>
                        <p className="font-semibold">{selectedReg.brideName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tanggal Nikah</p>
                        <p className="font-semibold">{selectedReg.weddingDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Waktu Nikah</p>
                        <p className="font-semibold">{selectedReg.weddingTime}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">Tempat Nikah</p>
                        <p className="font-semibold">{selectedReg.weddingLocation}</p>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleIssueCertificate}
                        disabled={generatingCertificate}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {generatingCertificate ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Memproses...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Terbitkan Surat Nikah
                          </>
                        )}
                      </Button>
                      <Link
                        href={`/admin/kepala/certificates/${selectedReg.id}`}
                        target="_blank"
                      >
                        <Button variant="outline" className="gap-2">
                          <Eye className="w-4 h-4" />
                          Preview
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{registrations.length}</p>
              <p className="text-sm text-gray-600 mt-2">Siap Terbitkan Surat</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {(() => {
                  const allRegs = JSON.parse(localStorage.getItem('marriageRegistrations') || '[]');
                  return allRegs.filter((r: any) => r.status === 'Selesai').length;
                })()}
              </p>
              <p className="text-sm text-gray-600 mt-2">Surat Sudah Diterbitkan</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {(() => {
                  const certs = JSON.parse(localStorage.getItem('marriage_certificates') || '[]');
                  return certs.length;
                })()}
              </p>
              <p className="text-sm text-gray-600 mt-2">Total Surat Terbitkan</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
