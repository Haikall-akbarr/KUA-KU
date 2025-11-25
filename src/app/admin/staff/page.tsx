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
    } catch (error) {
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
    } catch (error) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Staff KUA</h1>
          <p className="text-gray-600 mt-2">Verifikasi dokumen pendaftaran pernikahan</p>
          {user && (
            <p className="text-sm text-muted-foreground mt-1">
              👤 {user.nama} ({user.email})
            </p>
          )}
        </div>
        <Button variant="destructive" size="sm" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Menunggu Verifikasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {dashboardData?.pending_verifications?.length || pendingVerification.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Perlu ditugaskan ke penghulu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Dokumen Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {dashboardData?.pending_documents?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Perlu verifikasi dokumen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Ditolak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejected.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Perlu perbaikan</p>
          </CardContent>
        </Card>
      </div>


      {/* Main Content Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Menunggu ({pendingVerification.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Terverifikasi ({approved.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <FileText className="h-4 w-4" />
            Riwayat ({history.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="h-4 w-4" />
            Ditolak ({rejected.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Verification Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-orange-600" />
                Pendaftaran Menunggu Verifikasi
              </CardTitle>
              <CardDescription>
                Pendaftaran yang perlu diverifikasi dan disetujui oleh staff
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingVerification.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Tidak ada pendaftaran yang menunggu verifikasi
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingVerification.map(reg => (
                    <div key={reg.id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{reg.nomorPendaftaran || reg.id}</h4>
                          <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                            <div>
                              <p className="text-gray-600">Calon Suami</p>
                              <p className="font-medium">{reg.groomName}</p>
                              <p className="text-xs text-gray-500">NIK: {reg.groomNik}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Calon Istri</p>
                              <p className="font-medium">{reg.brideName}</p>
                              <p className="text-xs text-gray-500">NIK: {reg.brideNik}</p>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          {reg.status}
                        </Badge>
                      </div>

                      {/* Details */}
                      <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-600">Tanggal Nikah</p>
                          <p className="font-medium">
                            {new Date(reg.weddingDate).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Lokasi</p>
                          <p className="font-medium">{reg.weddingLocation}</p>
                        </div>
                      </div>

                      {/* Action Buttons - Hanya tampilkan untuk status Draft */}
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(reg.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Setujui
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(reg.id)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Tolak
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approved Tab */}
        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Telah Diverifikasi
              </CardTitle>
              <CardDescription>
                Pendaftaran yang sudah ditugaskan ke penghulu atau selesai
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approved.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Tidak ada pendaftaran yang terverifikasi
                </div>
              ) : (
                <div className="space-y-4">
                  {approved.map(reg => (
                    <div key={reg.id} className="border rounded-lg p-4 bg-green-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{reg.nomorPendaftaran || reg.id}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {reg.groomName} & {reg.brideName}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Tanggal: {new Date(reg.weddingDate).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">{reg.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Riwayat Pendaftaran
              </CardTitle>
              <CardDescription>
                Riwayat semua pendaftaran yang sudah disetujui, ditugaskan, atau selesai
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Tidak ada riwayat pendaftaran
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map(reg => (
                    <div key={reg.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-lg">{reg.nomorPendaftaran || reg.id}</h4>
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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Calon Suami</p>
                              <p className="text-sm">{reg.groomName}</p>
                              {reg.groomNik && (
                                <p className="text-xs text-muted-foreground mt-1">NIK: {reg.groomNik}</p>
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Calon Istri</p>
                              <p className="text-sm">{reg.brideName}</p>
                              {reg.brideNik && (
                                <p className="text-xs text-muted-foreground mt-1">NIK: {reg.brideNik}</p>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t flex items-center gap-4 text-sm text-muted-foreground">
                            <span>📅 {new Date(reg.weddingDate).toLocaleDateString('id-ID', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</span>
                            <span>📍 {reg.weddingLocation}</span>
                          </div>
                          {reg.status === 'Disetujui' && (
                            <Alert className="mt-3 bg-blue-50 border-blue-200">
                              <CheckCircle className="h-4 w-4 text-blue-600" />
                              <AlertDescription className="text-blue-800">
                                Pendaftaran sudah disetujui. Menunggu Kepala KUA untuk menugaskan penghulu.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rejected Tab */}
        <TabsContent value="rejected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Pendaftaran Ditolak
              </CardTitle>
              <CardDescription>
                Pendaftaran yang ditolak memerlukan perbaikan dari calon pasangan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rejected.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Tidak ada pendaftaran yang ditolak
                </div>
              ) : (
                <div className="space-y-4">
                  {rejected.map(reg => (
                    <div key={reg.id} className="border rounded-lg p-4 bg-red-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{reg.id}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {reg.groomName} & {reg.brideName}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Tanggal: {new Date(reg.weddingDate).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <Badge variant="destructive">Ditolak</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
}
