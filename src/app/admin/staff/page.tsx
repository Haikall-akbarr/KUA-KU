'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  FileCheck, 
  FileText,
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User,
  LogOut 
} from 'lucide-react';
import { getAllRegistrations, approveRegistration, handleApiError, getStaffDashboard } from '@/lib/simnikah-api';

interface Registration {
  id: string; // ID numerik untuk API calls
  nomorPendaftaran?: string; // Nomor pendaftaran untuk display
  groomName: string;
  brideName: string;
  groomNik: string;
  brideNik: string;
  weddingDate: string;
  weddingLocation: string;
  status: string;
}

export default function StaffDashboard() {
  const [user, setUser] = useState<any>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const router = useRouter();

  const loadDashboardData = async () => {
    try {
      const response = await getStaffDashboard();
      if (response && response.success) {
        setDashboardData(response.data);
      }
    } catch (error: any) {
      // Don't catch 401 errors here - let interceptor handle redirect
      if (error?.response?.status === 401) {
        console.log('🔄 401 detected in loadDashboardData - letting interceptor handle redirect');
        throw error; // Re-throw to let interceptor handle
      }
      console.error('Error loading staff dashboard:', error);
      setDashboardData(null);
    }
  };

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const response = await getAllRegistrations({
        page: 1,
        limit: 1000,
      });
      
      // Struktur response: { success, data: [...] } (data sudah array dari getAllRegistrations)
      const registrationsArray = Array.isArray(response.data) ? response.data : [];
      
      if (response.success && registrationsArray.length > 0) {
        // Map langsung sesuai struktur backend
        // Endpoint approve menggunakan ID numerik dari backend (reg.id), bukan nomor_pendaftaran
        const mappedRegs = registrationsArray.map((reg: any) => ({
          // ID numerik untuk API calls (backend mengharapkan ID numerik di endpoint approve)
          id: reg.id ? String(reg.id) : (reg.nomor_pendaftaran || ''), 
          // Nomor pendaftaran untuk display (NIKAH-20251119-9148)
          nomorPendaftaran: reg.nomor_pendaftaran || `REG-${reg.id}` || 'N/A',
          groomName: reg.calon_suami?.nama_lengkap || 'Data tidak tersedia',
          brideName: reg.calon_istri?.nama_lengkap || 'Data tidak tersedia',
          groomNik: reg.calon_suami?.nik || '',
          brideNik: reg.calon_istri?.nik || '',
          weddingDate: reg.tanggal_nikah || '',
          weddingLocation: reg.tempat_nikah || '',
          status: reg.status_pendaftaran || 'Draft',
        }));
        
        setRegistrations(mappedRegs);
      } else {
        setRegistrations([]);
      }
    } catch (error: any) {
      // Don't catch 401 errors here - let interceptor handle redirect
      if (error?.response?.status === 401) {
        console.log('🔄 401 detected in loadRegistrations - letting interceptor handle redirect');
        throw error; // Re-throw to let interceptor handle
      }
      console.error('Error loading registrations:', error);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is staff
    const userData = localStorage.getItem('user');
    const userRole = userData ? JSON.parse(userData).role : null;

    if (userRole !== 'staff') {
      router.push('/login');
      return;
    }

    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/login');
        return;
      }
    }
    
    loadRegistrations();
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleApprove = async (regId: string) => {
    try {
      // Staff hanya bisa approve dari Draft ke Disetujui
      // Menggunakan endpoint POST /simnikah/staff/approve/:id sesuai dokumentasi API
      await approveRegistration(regId, {
        status: 'Disetujui',
        catatan: 'Pendaftaran disetujui oleh staff',
      });
      
      // Reload registrations from API
      await loadRegistrations();
      
      alert(`✅ Pendaftaran disetujui! Status berubah menjadi "Disetujui". Kepala KUA akan menugaskan penghulu.`);
    } catch (error) {
      console.error('Error approving registration:', error);
      const errorMessage = handleApiError(error);
      alert(`Gagal menyetujui pendaftaran: ${errorMessage}`);
    }
  };

  const handleReject = async (regId: string) => {
    try {
      // Staff bisa reject ke Ditolak
      // Menggunakan endpoint POST /simnikah/staff/approve/:id dengan status Ditolak
      await approveRegistration(regId, {
        status: 'Ditolak',
        catatan: 'Pendaftaran ditolak oleh staff',
      });
      
      // Reload registrations from API
      await loadRegistrations();
      
      alert(`❌ Pendaftaran ditolak. Calon pasangan perlu memperbaiki dokumen mereka.`);
    } catch (error) {
      console.error('Error rejecting registration:', error);
      const errorMessage = handleApiError(error);
      alert(`Gagal menolak pendaftaran: ${errorMessage}`);
    }
  };

  // Filter registrations by status
  // Tab "Menunggu" hanya menampilkan yang status "Draft" (belum diverifikasi)
  const pendingVerification = registrations.filter(
    r => r.status === 'Draft'
  );
  // Tab "Terverifikasi" menampilkan yang sudah ditugaskan atau selesai
  const approved = registrations.filter(r => 
    r.status === 'Penghulu Ditugaskan' ||
    r.status === 'Selesai'
  );
  // Tab "Riwayat" menampilkan yang sudah disetujui, ditugaskan, atau selesai
  const history = registrations.filter(r => 
    r.status === 'Disetujui' ||
    r.status === 'Penghulu Ditugaskan' ||
    r.status === 'Selesai'
  );
  // Tab "Ditolak" menampilkan yang ditolak
  const rejected = registrations.filter(r => r.status === 'Ditolak');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Clock className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        {/* Header dengan gradient background */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border border-primary/20 shadow-sm">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Dashboard Staff KUA
              </h1>
              <p className="text-muted-foreground mt-2 text-base">Kelola dan verifikasi pendaftaran pernikahan dengan efisien</p>
              {user && (
                <div className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-background/60 backdrop-blur-sm rounded-lg border border-border/50 w-fit">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{user.nama}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout} 
              className="gap-2 hover:bg-destructive hover:text-destructive-foreground transition-colors shadow-sm"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards dengan enhanced design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="group relative overflow-hidden border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-orange-50/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-orange-100">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                Menunggu Verifikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-2">
                {dashboardData?.pending_verifications?.length || pendingVerification.length}
              </div>
              <p className="text-xs text-muted-foreground font-medium">Pendaftaran perlu disetujui</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-blue-50/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100">
                  <FileCheck className="h-4 w-4 text-blue-600" />
                </div>
                Terverifikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-2">
                {approved.length}
              </div>
              <p className="text-xs text-muted-foreground font-medium">Sudah ditugaskan ke penghulu</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-l-4 border-l-red-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-red-50/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-red-100">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
                Ditolak
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent mb-2">
                {rejected.length}
              </div>
              <p className="text-xs text-muted-foreground font-medium">Perlu perbaikan</p>
            </CardContent>
          </Card>
        </div>


      {/* Main Content Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="pending" className="gap-2 text-xs sm:text-sm">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Menunggu</span>
            <span className="sm:hidden">Pending</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {pendingVerification.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2 text-xs sm:text-sm">
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Terverifikasi</span>
            <span className="sm:hidden">Verified</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {approved.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2 text-xs sm:text-sm">
            <FileText className="h-4 w-4" />
            Riwayat
            <Badge variant="secondary" className="ml-1 text-xs">
              {history.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2 text-xs sm:text-sm">
            <XCircle className="h-4 w-4" />
            Ditolak
            <Badge variant="secondary" className="ml-1 text-xs">
              {rejected.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Pending Verification Tab */}
        <TabsContent value="pending" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileCheck className="h-5 w-5 text-orange-600" />
                Pendaftaran Menunggu Verifikasi
              </CardTitle>
              <CardDescription>
                Pendaftaran yang perlu diverifikasi dan disetujui oleh staff
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingVerification.length === 0 ? (
                <div className="text-center py-16">
                  <div className="relative mx-auto w-24 h-24 mb-6">
                    <div className="absolute inset-0 bg-orange-100 rounded-full animate-pulse" />
                    <div className="absolute inset-4 bg-orange-200 rounded-full flex items-center justify-center">
                      <FileCheck className="h-10 w-10 text-orange-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Tidak ada pendaftaran yang menunggu</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Semua pendaftaran sudah diproses. Dashboard akan diperbarui otomatis saat ada pendaftaran baru.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingVerification.map((reg, index) => (
                    <Card 
                      key={reg.id} 
                      className="group border-l-4 border-l-orange-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 bg-gradient-to-br from-white to-orange-50/20"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-3">
                              <h4 className="font-semibold text-lg text-foreground">{reg.nomorPendaftaran || reg.id}</h4>
                              <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
                                {reg.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Calon Suami</p>
                                <p className="font-semibold text-foreground">{reg.groomName}</p>
                                {reg.groomNik && (
                                  <p className="text-xs text-muted-foreground">NIK: {reg.groomNik}</p>
                                )}
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Calon Istri</p>
                                <p className="font-semibold text-foreground">{reg.brideName}</p>
                                {reg.brideNik && (
                                  <p className="text-xs text-muted-foreground">NIK: {reg.brideNik}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Tanggal Nikah</p>
                            <p className="font-medium text-foreground">
                              {new Date(reg.weddingDate).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Lokasi</p>
                            <p className="font-medium text-foreground">{reg.weddingLocation}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 mt-6 pt-4 border-t">
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white flex-1 sm:flex-none shadow-md hover:shadow-lg transition-all duration-200"
                            onClick={() => handleApprove(reg.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Setujui
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1 sm:flex-none shadow-md hover:shadow-lg transition-all duration-200"
                            onClick={() => handleReject(reg.id)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Tolak
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approved Tab */}
        <TabsContent value="approved" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Telah Diverifikasi
              </CardTitle>
              <CardDescription>
                Pendaftaran yang sudah ditugaskan ke penghulu atau selesai
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approved.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground font-medium">Tidak ada pendaftaran yang terverifikasi</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {approved.map(reg => (
                    <Card key={reg.id} className="border-l-4 border-l-green-500 bg-green-50/50 hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-lg text-foreground">{reg.nomorPendaftaran || reg.id}</h4>
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                {reg.status}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-foreground mb-2">
                              {reg.groomName} & {reg.brideName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              📅 {new Date(reg.weddingDate).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5 text-blue-600" />
                Riwayat Pendaftaran
              </CardTitle>
              <CardDescription>
                Riwayat semua pendaftaran yang sudah disetujui, ditugaskan, atau selesai
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground font-medium">Tidak ada riwayat pendaftaran</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map(reg => (
                    <Card key={reg.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-lg text-foreground">{reg.nomorPendaftaran || reg.id}</h4>
                            <Badge 
                              variant={
                                reg.status === 'Selesai' ? 'default' :
                                reg.status === 'Penghulu Ditugaskan' ? 'secondary' :
                                'outline'
                              }
                              className={
                                reg.status === 'Disetujui' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                reg.status === 'Penghulu Ditugaskan' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                'bg-green-100 text-green-800 border-green-200'
                              }
                            >
                              {reg.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Calon Suami</p>
                              <p className="text-sm font-semibold text-foreground">{reg.groomName}</p>
                              {reg.groomNik && (
                                <p className="text-xs text-muted-foreground">NIK: {reg.groomNik}</p>
                              )}
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Calon Istri</p>
                              <p className="text-sm font-semibold text-foreground">{reg.brideName}</p>
                              {reg.brideNik && (
                                <p className="text-xs text-muted-foreground">NIK: {reg.brideNik}</p>
                              )}
                            </div>
                          </div>
                          <div className="pt-3 border-t flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">📅 {new Date(reg.weddingDate).toLocaleDateString('id-ID', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</span>
                            <span className="flex items-center gap-1">📍 {reg.weddingLocation}</span>
                          </div>
                          {reg.status === 'Disetujui' && (
                            <Alert className="mt-2 bg-blue-50 border-blue-200">
                              <CheckCircle className="h-4 w-4 text-blue-600" />
                              <AlertDescription className="text-blue-800">
                                Pendaftaran sudah disetujui. Menunggu Kepala KUA untuk menugaskan penghulu.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rejected Tab */}
        <TabsContent value="rejected" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <XCircle className="h-5 w-5 text-red-600" />
                Pendaftaran Ditolak
              </CardTitle>
              <CardDescription>
                Pendaftaran yang ditolak memerlukan perbaikan dari calon pasangan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rejected.length === 0 ? (
                <div className="text-center py-12">
                  <XCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground font-medium">Tidak ada pendaftaran yang ditolak</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rejected.map(reg => (
                    <Card key={reg.id} className="border-l-4 border-l-red-500 bg-red-50/50 hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-lg text-foreground">{reg.nomorPendaftaran || reg.id}</h4>
                              <Badge variant="destructive">Ditolak</Badge>
                            </div>
                            <p className="text-sm font-medium text-foreground mb-2">
                              {reg.groomName} & {reg.brideName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              📅 {new Date(reg.weddingDate).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
