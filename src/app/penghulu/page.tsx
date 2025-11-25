'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, Clock, Star, AlertCircle } from 'lucide-react';
import { getAssignedRegistrations as getAssignedRegistrationsAPI } from '@/lib/simnikah-api';
import { getPenghuluProfile } from '@/lib/simnikah-api';
import { format, parseISO, isToday } from 'date-fns';

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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // Set timeout untuk memastikan loading tidak stuck
      timeoutRef.current = setTimeout(() => {
        console.warn('⚠️ Overall loading timeout - forcing loading to false');
        setLoading(false);
        // Set fallback data jika belum ada
        const userStr = localStorage.getItem('user');
        let user = {};
        try {
          if (userStr) {
            user = JSON.parse(userStr);
          }
        } catch (e) {
          user = {};
        }
        setPenguluData((prev) => {
          if (!prev) {
            return {
              id: 1,
              nama_lengkap: (user as any).nama || 'Penghulu',
              nip: '-',
              status: 'Aktif',
              jumlah_nikah: 0,
              rating: 0,
              email: (user as any).email || '',
              no_hp: '-',
              alamat: '',
            };
          }
          return prev;
        });
      }, 10000); // 10 second overall timeout

      try {
        // Tambahkan delay kecil untuk memastikan token sudah tersedia setelah login
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const token = localStorage.getItem('token');
        let user = {};
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            user = JSON.parse(userStr);
          }
        } catch (parseError) {
          console.error('Error parsing user from localStorage:', parseError);
          user = {};
        }

        if (!token) {
          setError('Token tidak ditemukan. Silakan login kembali.');
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          setLoading(false);
          return;
        }

        // Load assigned registrations from API with timeout
        try {
          const apiRegsPromise = getAssignedRegistrationsAPI();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 8000)
          );
          
          const response = await Promise.race([apiRegsPromise, timeoutPromise]).catch((err) => {
            console.error('Error loading assigned registrations:', err);
            // Return empty structure on error to prevent crash
            return { success: false, data: { registrations: [] } };
          }) as any;
          
          console.log('📊 Dashboard - Raw API Response:', response);
          
          // Handle response structure from API sesuai dokumentasi
          // Response format: { success: true, data: { penghulu: "...", registrations: [...], total: 1 } }
          let registrationsArray: any[] = [];
          
          if (response?.success && response?.data?.registrations) {
            registrationsArray = Array.isArray(response.data.registrations) ? response.data.registrations : [];
            console.log('✅ Using response.data.registrations:', registrationsArray.length);
          } else if (response?.data && Array.isArray(response.data)) {
            registrationsArray = response.data;
            console.log('✅ Using response.data (array):', registrationsArray.length);
          } else if (Array.isArray(response)) {
            registrationsArray = response;
            console.log('✅ Using response (array):', registrationsArray.length);
          } else {
            console.warn('⚠️ Unknown response structure:', response);
          }
          
          console.log('📊 Processed registrations array:', registrationsArray.length);
          if (registrationsArray.length > 0) {
            console.log('📊 First registration:', registrationsArray[0]);
          }
          
          // Map API response to expected format with null checks
          const mappedRegs = registrationsArray.map((reg: any) => {
            // Extract calon suami name
            let calonSuami = '';
            if (reg.calon_suami) {
              if (typeof reg.calon_suami === 'string') {
                calonSuami = reg.calon_suami;
              } else if (reg.calon_suami.nama_lengkap) {
                calonSuami = reg.calon_suami.nama_lengkap;
              } else if (reg.calon_suami.nama) {
                calonSuami = reg.calon_suami.nama;
              }
            }
            
            // Extract calon istri name
            let calonIstri = '';
            if (reg.calon_istri) {
              if (typeof reg.calon_istri === 'string') {
                calonIstri = reg.calon_istri;
              } else if (reg.calon_istri.nama_lengkap) {
                calonIstri = reg.calon_istri.nama_lengkap;
              } else if (reg.calon_istri.nama) {
                calonIstri = reg.calon_istri.nama;
              }
            }
            
            return {
              id: reg.id || reg.nomor_pendaftaran || `reg_${Date.now()}`,
              nomor_pendaftaran: reg.nomor_pendaftaran || reg.id || '-',
              status_pendaftaran: reg.status_pendaftaran || reg.status || 'Draft',
              tanggal_nikah: reg.tanggal_nikah || reg.weddingDate || '',
              waktu_nikah: reg.waktu_nikah || reg.weddingTime || '-',
              tempat_nikah: reg.tempat_nikah || reg.weddingLocation || '-',
              calon_suami: {
                nama_lengkap: calonSuami || 'Data tidak tersedia',
                nik: reg.calon_suami?.nik || reg.groomNik || '-',
              },
              calon_istri: {
                nama_lengkap: calonIstri || 'Data tidak tersedia',
                nik: reg.calon_istri?.nik || reg.brideNik || '-',
              },
            };
          });

          console.log('📊 Mapped registrations:', mappedRegs.length);
          setAssignedRegistrations(mappedRegs);
        } catch (apiErr) {
          console.error('Error loading registrations from API:', apiErr);
          setAssignedRegistrations([]);
        }

        // Load penghulu profile from API with timeout
        try {
          const profilePromise = getPenghuluProfile();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 8000)
          );
          
          const profileData = await Promise.race([profilePromise, timeoutPromise]).catch((err) => {
            console.error('Error loading profile:', err);
            // Return null on error to use fallback data
            return null;
          }) as any;
          
          // Check if response is valid (not HTML error page)
          if (!profileData || (typeof profileData === 'string' && profileData.trim().startsWith('<'))) {
            console.warn('⚠️ Profile API returned invalid data, using fallback data');
            throw new Error('Invalid response format');
          }
          
          if (profileData?.data) {
            setPenguluData({
              id: profileData.data.id || 1,
              nama_lengkap: profileData.data.nama_lengkap || user.nama || 'Penghulu',
              nip: profileData.data.nip || '-',
              status: profileData.data.status || 'Aktif',
              jumlah_nikah: profileData.data.jumlah_nikah || 0,
              rating: profileData.data.rating || 0,
              email: profileData.data.email || user.email || '',
              no_hp: profileData.data.no_hp || '-',
              alamat: profileData.data.alamat || '',
            });
          } else if (profileData && typeof profileData === 'object') {
            // Handle case where data is directly in response
            setPenguluData({
              id: profileData.id || 1,
              nama_lengkap: profileData.nama_lengkap || user.nama || 'Penghulu',
              nip: profileData.nip || '-',
              status: profileData.status || 'Aktif',
              jumlah_nikah: profileData.jumlah_nikah || 0,
              rating: profileData.rating || 0,
              email: profileData.email || user.email || '',
              no_hp: profileData.no_hp || '-',
              alamat: profileData.alamat || '',
            });
          }
        } catch (profileErr: any) {
          console.error('Error loading profile from API:', profileErr);
          
          // Check if error is due to HTML response
          if (profileErr.message && (
            profileErr.message.includes('Unexpected token') ||
            profileErr.message.includes('HTML error page') ||
            profileErr.message.includes('502') ||
            profileErr.message.includes('Bad Gateway')
          )) {
            console.warn('⚠️ Profile API returned invalid response, using fallback data');
          }
          
          // Fallback to user data - ensure we always set data even on error
          const userData = typeof user === 'object' && user !== null ? user : {};
          setPenguluData({
            id: 1,
            nama_lengkap: (userData as any).nama || 'Penghulu',
            nip: '-',
            status: 'Aktif',
            jumlah_nikah: 0,
            rating: 0,
            email: (userData as any).email || '',
            no_hp: '-',
            alamat: '',
          });
        }
      } catch (err: any) {
        console.error('Error loading data:', err);
        setError('Gagal memuat data. Silakan coba lagi.');
        
        // Ensure we set fallback data even on outer catch
        const userData = typeof user === 'object' && user !== null ? user : {};
        if (!penguluData) {
          setPenguluData({
            id: 1,
            nama_lengkap: (userData as any).nama || 'Penghulu',
            nip: '-',
            status: 'Aktif',
            jumlah_nikah: 0,
            rating: 0,
            email: (userData as any).email || '',
            no_hp: '-',
            alamat: '',
          });
        }
      } finally {
        // Always clear timeout and set loading to false, even if there's an error
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setLoading(false);
        console.log('✅ Loading completed');
      }
    };

    loadData();
    
    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="jadwal">
              <Calendar className="mr-2 h-4 w-4" />
              Jadwal
            </TabsTrigger>
            <TabsTrigger value="profil">
              <Users className="mr-2 h-4 w-4" />
              Profil
            </TabsTrigger>
          </TabsList>

          {/* Jadwal Tab */}
          <TabsContent value="jadwal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Jadwal Akad Nikah</CardTitle>
                <CardDescription>Jadwal pernikahan yang ditugaskan hari ini</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  // Filter jadwal untuk hari ini saja
                  const today = new Date();
                  const todayStr = format(today, 'yyyy-MM-dd');
                  
                  console.log('📅 Filtering for today:', todayStr);
                  console.log('📅 Total registrations:', assignedRegistrations.length);
                  
                  const todaySchedule = assignedRegistrations.filter((reg) => {
                    if (!reg.tanggal_nikah) {
                      console.log('⚠️ Registration without tanggal_nikah:', reg.nomor_pendaftaran);
                      return false;
                    }
                    
                    // Normalize tanggal format
                    let tanggalStr = reg.tanggal_nikah;
                    if (tanggalStr.includes('T')) {
                      tanggalStr = tanggalStr.split('T')[0];
                    }
                    if (tanggalStr.includes('Z')) {
                      tanggalStr = tanggalStr.split('Z')[0].split('T')[0];
                    }
                    
                    console.log('📅 Comparing dates:', {
                      nomor: reg.nomor_pendaftaran,
                      tanggal_nikah: reg.tanggal_nikah,
                      normalized: tanggalStr,
                      today: todayStr,
                      match: tanggalStr === todayStr
                    });
                    
                    // Compare date strings directly (more reliable)
                    return tanggalStr === todayStr;
                  });

                  console.log('📅 Today schedule count:', todaySchedule.length);

                  if (todaySchedule.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">Tidak ada jadwal pernikahan hari ini</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Total jadwal yang ditugaskan: {assignedRegistrations.length}
                        </p>
                        {assignedRegistrations.length > 0 && (
                          <div className="mt-4 text-xs text-gray-500">
                            <p>Tanggal jadwal yang ada:</p>
                            <ul className="list-disc list-inside mt-2">
                              {assignedRegistrations.slice(0, 5).map((reg) => {
                                const tanggal = reg.tanggal_nikah?.split('T')[0] || reg.tanggal_nikah || 'Tidak diketahui';
                                return <li key={reg.id}>{tanggal}</li>;
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {todaySchedule.map((reg) => (
                      <div key={reg.id} className="border rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">
                              {reg.nomor_pendaftaran}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {reg.calon_suami?.nama_lengkap || 'Data tidak tersedia'} & {reg.calon_istri?.nama_lengkap || 'Data tidak tersedia'}
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
                  );
                })()}
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
        </Tabs>
      </div>
    );
}