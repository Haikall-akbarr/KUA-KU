 'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, Clock, Star, AlertCircle, CheckCircle } from 'lucide-react';

interface AssignedRegistration {
  id: string;
  nomor_pendaftaran: string;
  status_pendaftaran: string;
  tanggal_nikah: string;
  waktu_nikah: string;
  tempat_nikah: string;
  calon_suami: {
    nama_lengkap: string;
    nik: string;
  };
  calon_istri: {
    nama_lengkap: string;
    nik: string;
  };
}

interface PenguluData {
  id: number;
  nama_lengkap: string;
  nip: string;
  status: string;
  jumlah_nikah: number;
  rating: number;
  email: string;
  no_hp: string;
  alamat?: string;
}

export default function PenguluDashboard() {
  const [penguluData, setPenguluData] = useState<PenguluData | null>(null);
  const [assignedRegistrations, setAssignedRegistrations] = useState<AssignedRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://simnikah-api-production.up.railway.app';

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        if (!token) {
          setError('Token tidak ditemukan. Silakan login kembali.');
          setLoading(false);
          return;
        }

        // Load assigned registrations from localStorage first
        const allRegs = JSON.parse(localStorage.getItem('marriageRegistrations') || '[]');
        // Get penghulu info from localStorage to match the current user
        const penguluFromStorage = localStorage.getItem('penghulu_profile');
        const currentPenghulu = penguluFromStorage ? JSON.parse(penguluFromStorage) : null;
        
        // Filter registrations assigned to this penghulu
        const assignedRegs = allRegs.filter((reg: any) => 
          currentPenghulu?.id ? reg.penghuluId === currentPenghulu.id : reg.penghuluId === user.id
        );
        
        // Map to expected format
        const mappedRegs = assignedRegs.map((reg: any) => ({
          id: reg.id,
          nomor_pendaftaran: reg.id,
          status_pendaftaran: reg.status,
          tanggal_nikah: reg.weddingDate,
          waktu_nikah: reg.weddingTime || '-',
          tempat_nikah: reg.weddingLocation || '-',
          calon_suami: {
            nama_lengkap: reg.groomName,
            nik: reg.groomNik || '-',
          },
          calon_istri: {
            nama_lengkap: reg.brideName,
            nik: reg.brideNik || '-',
          },
        }));

        setAssignedRegistrations(mappedRegs);

        // Try to load from API as fallback
        try {
          const regsResponse = await fetch(
            `${apiBaseUrl}/simnikah/penghulu/assigned-registrations`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (regsResponse.ok) {
            const regsData = await regsResponse.json();
            if (regsData.data?.registrations) {
              setAssignedRegistrations(regsData.data.registrations);
            }
          }
        } catch (apiErr) {
          console.debug('API call failed, using localStorage data:', apiErr);
        }

        // Load penghulu profile (dari localStorage atau generate dari user data)
        if (penguluFromStorage) {
          setPenguluData(JSON.parse(penguluFromStorage));
        } else {
          // Generate dari user data jika belum ada
          setPenguluData({
            id: 1,
            nama_lengkap: user.nama || 'Ustadz Ahmad Ridho',
            nip: '198505052010121001',
            status: 'Aktif',
            jumlah_nikah: 15,
            rating: 4.8,
            email: user.email || 'ahmad.ridho@kua.go.id',
            no_hp: '081234567891',
            alamat: 'Jl. Ahmad Yani No. 25, Banjarmasin',
          });
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Gagal memuat data. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Penghulu</h1>
          <p className="text-gray-600 mt-2">
            Selamat datang, {penguluData?.nama_lengkap || 'Penghulu'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-500 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-900">Error</AlertTitle>
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        {penguluData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{penguluData.status}</div>
                <Badge className="mt-2 bg-green-100 text-green-800">Aktif</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Nikah</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{penguluData.jumlah_nikah}</div>
                <p className="text-xs text-gray-500 mt-2">Pernikahan selesai</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">{penguluData.rating}</div>
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Terjadwalkan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assignedRegistrations.length}</div>
                <p className="text-xs text-gray-500 mt-2">Tugas menunggu</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="jadwal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="jadwal">
              <Calendar className="mr-2 h-4 w-4" />
              Jadwal
            </TabsTrigger>
            <TabsTrigger value="profil">
              <Users className="mr-2 h-4 w-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="tugas">
              <CheckCircle className="mr-2 h-4 w-4" />
              Tugas
            </TabsTrigger>
          </TabsList>

          {/* Jadwal Tab */}
          <TabsContent value="jadwal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Jadwal Akad Nikah</CardTitle>
                <CardDescription>Daftar semua jadwal akad nikah yang ditugaskan</CardDescription>
              </CardHeader>
              <CardContent>
                {assignedRegistrations.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Belum ada jadwal terjadwalkan</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignedRegistrations.map((reg) => (
                      <div key={reg.id} className="border rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">
                              {reg.nomor_pendaftaran}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {reg.calon_suami.nama_lengkap} & {reg.calon_istri.nama_lengkap}
                            </p>
                          </div>
                          <Badge variant="outline">{reg.status_pendaftaran}</Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Tanggal</p>
                            <p className="font-medium">
                              {new Date(reg.tanggal_nikah).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Waktu</p>
                            <p className="font-medium">{reg.waktu_nikah}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Tempat</p>
                            <p className="font-medium">{reg.tempat_nikah}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profil Tab */}
          <TabsContent value="profil" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profil Penghulu</CardTitle>
                <CardDescription>Informasi profil penghulu</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {penguluData && (
                  <>
                    {/* Informasi Pribadi */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Nama Lengkap</label>
                        <p className="text-lg font-semibold mt-2">{penguluData.nama_lengkap}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">NIP</label>
                        <p className="text-lg font-semibold mt-2">{penguluData.nip}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <p className="text-lg font-semibold mt-2">{penguluData.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Nomor HP</label>
                        <p className="text-lg font-semibold mt-2">{penguluData.no_hp}</p>
                      </div>
                    </div>

                    {/* Alamat */}
                    <div>
                      <label className="text-sm font-medium text-gray-600">Alamat</label>
                      <p className="text-lg font-semibold mt-2">
                        {penguluData.alamat || 'Tidak ada data'}
                      </p>
                    </div>

                    {/* Statistik */}
                    <div className="border-t pt-6">
                      <h3 className="font-semibold mb-4">Statistik</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded">
                          <p className="text-sm text-gray-600">Total Pernikahan</p>
                          <p className="text-2xl font-bold text-blue-600 mt-2">
                            {penguluData.jumlah_nikah}
                          </p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded">
                          <p className="text-sm text-gray-600">Rating</p>
                          <div className="flex items-center mt-2">
                            <p className="text-2xl font-bold text-yellow-600">
                              {penguluData.rating}
                            </p>
                            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 ml-2" />
                          </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded">
                          <p className="text-sm text-gray-600">Status</p>
                          <Badge className="mt-2 bg-green-100 text-green-800">
                            {penguluData.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tugas Tab */}
          <TabsContent value="tugas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tugas Verifikasi Dokumen</CardTitle>
                <CardDescription>Verifikasi dokumen calon pengantin</CardDescription>
              </CardHeader>
              <CardContent>
                {assignedRegistrations.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Semua tugas telah selesai</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignedRegistrations
                      .filter((reg) => reg.status_pendaftaran === 'Menunggu Verifikasi Penghulu')
                      .map((reg) => (
                        <div
                          key={reg.id}
                          className="border rounded-lg p-4 hover:shadow-md transition"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">{reg.nomor_pendaftaran}</h4>
                            <Button variant="outline" size="sm">
                              Verifikasi
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600">
                            {reg.calon_suami.nama_lengkap} & {reg.calon_istri.nama_lengkap}
                          </p>
                        </div>
                      ))}

                    {assignedRegistrations.filter(
                      (reg) => reg.status_pendaftaran === 'Menunggu Verifikasi Penghulu'
                    ).length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-gray-500">Tidak ada tugas verifikasi</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
}