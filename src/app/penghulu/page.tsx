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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        {/* Header dengan gradient background */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border border-primary/20 shadow-sm">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
          <div className="relative">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Dashboard Penghulu
            </h1>
            <p className="text-muted-foreground mt-2 text-base">
              Selamat datang, <span className="font-semibold text-foreground">{penguluData?.nama_lengkap || 'Penghulu'}</span>
          </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-500 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-900">Error</AlertTitle>
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards dengan enhanced design */}
        {penguluData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="group relative overflow-hidden border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-green-50/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <CardHeader className="pb-3 relative z-10">
                <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-green-100">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-foreground mb-2">{penguluData.status}</div>
                <Badge className="bg-green-100 text-green-800 border-green-200">Aktif</Badge>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-blue-50/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <CardHeader className="pb-3 relative z-10">
                <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-100">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  Total Nikah
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-1">{penguluData.jumlah_nikah}</div>
                <p className="text-xs text-muted-foreground font-medium">Pernikahan selesai</p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-l-4 border-l-yellow-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-yellow-50/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <CardHeader className="pb-3 relative z-10">
                <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-yellow-100">
                    <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                  </div>
                  Rating
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">{penguluData.rating}</div>
                  <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">Rating penghulu</p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-orange-50/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <CardHeader className="pb-3 relative z-10">
                <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-orange-100">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                  Terjadwalkan
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-1">{assignedRegistrations.length}</div>
                <p className="text-xs text-muted-foreground font-medium">Tugas menunggu</p>
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
                      <div className="text-center py-16">
                        <div className="relative mx-auto w-24 h-24 mb-6">
                          <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse" />
                          <div className="absolute inset-4 bg-blue-200 rounded-full flex items-center justify-center">
                            <Calendar className="h-10 w-10 text-blue-500" />
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Tidak ada jadwal hari ini</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-2">
                          Total jadwal yang ditugaskan: <span className="font-semibold text-foreground">{assignedRegistrations.length}</span>
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
                    <div className="space-y-3">
                      {todaySchedule.map((reg, index) => (
                      <Card 
                        key={reg.id} 
                        className="group border-l-4 border-l-blue-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 bg-gradient-to-br from-white to-blue-50/20"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <CardContent className="pt-6">
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-lg text-foreground">
                              {reg.nomor_pendaftaran}
                            </h4>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {reg.status_pendaftaran}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium text-foreground">
                              {reg.calon_suami?.nama_lengkap || 'Data tidak tersedia'} & {reg.calon_istri?.nama_lengkap || 'Data tidak tersedia'}
                            </p>
                          </div>
                        </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tanggal</p>
                              <p className="text-sm font-semibold text-foreground">
                              {new Date(reg.tanggal_nikah).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Waktu</p>
                              <p className="text-sm font-semibold text-foreground">{reg.waktu_nikah}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tempat</p>
                              <p className="text-sm font-semibold text-foreground">{reg.tempat_nikah}</p>
                          </div>
                          </div>
                        </CardContent>
                      </Card>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profil Tab */}
          <TabsContent value="profil" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Profil Penghulu</CardTitle>
                <CardDescription>Informasi profil penghulu</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {penguluData && (
                  <>
                    {/* Informasi Pribadi */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nama Lengkap</label>
                        <p className="text-lg font-semibold text-foreground mt-2">{penguluData.nama_lengkap}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">NIP</label>
                        <p className="text-lg font-semibold text-foreground mt-2">{penguluData.nip}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</label>
                        <p className="text-lg font-semibold text-foreground mt-2">{penguluData.email}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nomor HP</label>
                        <p className="text-lg font-semibold text-foreground mt-2">{penguluData.no_hp}</p>
                      </div>
                    </div>

                    {/* Alamat */}
                    <div className="pt-4 border-t">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Alamat</label>
                      <p className="text-lg font-semibold text-foreground mt-2">
                        {penguluData.alamat || 'Tidak ada data'}
                      </p>
                    </div>

                    {/* Statistik */}
                    <div className="border-t pt-6">
                      <h3 className="font-semibold mb-4 text-foreground">Statistik</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card className="bg-blue-50 border-blue-200">
                          <CardContent className="pt-6">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Total Pernikahan</p>
                            <p className="text-3xl font-bold text-blue-600">
                            {penguluData.jumlah_nikah}
                          </p>
                          </CardContent>
                        </Card>
                        <Card className="bg-yellow-50 border-yellow-200">
                          <CardContent className="pt-6">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Rating</p>
                            <div className="flex items-center gap-2">
                              <p className="text-3xl font-bold text-yellow-600">
                              {penguluData.rating}
                            </p>
                              <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                          </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-green-50 border-green-200">
                          <CardContent className="pt-6">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Status</p>
                            <Badge className="mt-2 bg-green-100 text-green-800 border-green-200 text-base px-3 py-1">
                            {penguluData.status}
                          </Badge>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      </div>
    );
}