'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { isKepalaKUA, canAccessFeature, getUnauthorizedMessage } from '@/lib/role-guards';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InfoIcon, UserPlus, Users, Calendar, Bell, FileText, Activity, BarChart3 } from "lucide-react";
import { AddStaffDialog } from "@/components/admin/kepala/AddStaffDialog";
import { AddPenghuluDialog } from "@/components/admin/kepala/AddPenghuluDialog";
import { StaffTable } from "@/components/admin/kepala/StaffTable";
import { PenghuluTable } from "@/components/admin/kepala/PenghuluTable";
import { PendingAssignmentsTable } from "@/components/admin/kepala/PendingAssignmentsTable";
import MarriageCertificateForm from "@/components/admin/kepala/MarriageCertificateForm";
import { AnalyticsCharts } from "@/components/admin/kepala/AnalyticsCharts";
import { getKepalaKUADashboard, getAllStaff, getAllPenghulu } from "@/lib/simnikah-api";

export default function KepalaKUADashboard() {
  const { userRole, loading } = useAuth();
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isAddPenghuluOpen, setIsAddPenghuluOpen] = useState(false);
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [activeTab, setActiveTab] = useState("analytics");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [staffCount, setStaffCount] = useState(0);
  const [penghuluCount, setPenghuluCount] = useState(0);
  const [staffRefreshKey, setStaffRefreshKey] = useState(0);
  const [penghuluRefreshKey, setPenghuluRefreshKey] = useState(0);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [allRegistrationsData, setAllRegistrationsData] = useState<any[]>([]);
  const router = useRouter();

  // Role guard - hanya Kepala KUA yang bisa akses
  useEffect(() => {
    if (loading) return;
    
    if (!isKepalaKUA(userRole)) {
      console.warn('KepalaKUADashboard: Akses ditolak. Role:', userRole);
      router.push('/admin');
      return;
    }
  }, [userRole, loading, router]);

  useEffect(() => {
    // Load dashboard data, pending assignments, staff count, and penghulu count
    const loadData = async () => {
      if (!isKepalaKUA(userRole)) return;
      
      try {
        // Load dashboard data with selected period
        try {
          const dashboardResponse = await getKepalaKUADashboard({ period: analyticsPeriod });
          if (dashboardResponse?.success && dashboardResponse?.data) {
            setDashboardData(dashboardResponse.data);
            console.log('📊 Dashboard Data:', dashboardResponse.data);
          } else {
            console.warn('⚠️ Dashboard response tidak valid:', dashboardResponse);
          }
        } catch (error) {
          console.error('❌ Error loading dashboard data:', error);
          // Set default empty data structure
          setDashboardData({
            statistics: {
              total_periode: 0,
              hari_ini: 0,
              bulan_ini: 0,
              tahun_ini: 0,
              selesai: 0,
              pending: 0
            },
            trends: [],
            status_distribution: [],
            penghulu_performance: [],
            peak_hours: []
          });
        }

        // Load staff count
        try {
          const staffResponse = await getAllStaff();
          if (staffResponse?.success && Array.isArray(staffResponse.data)) {
            setStaffCount(staffResponse.data.length);
            console.log('👥 Staff Count:', staffResponse.data.length);
          } else {
            console.warn('⚠️ Staff response tidak valid:', staffResponse);
            setStaffCount(0);
          }
        } catch (error) {
          console.error('❌ Error loading staff:', error);
          setStaffCount(0);
        }

        // Load penghulu count
        try {
          const penghuluResponse = await getAllPenghulu();
          if (penghuluResponse?.success && Array.isArray(penghuluResponse.data)) {
            setPenghuluCount(penghuluResponse.data.length);
            console.log('📿 Penghulu Count:', penghuluResponse.data.length);
          } else {
            console.warn('⚠️ Penghulu response tidak valid:', penghuluResponse);
            setPenghuluCount(0);
          }
        } catch (error) {
          console.error('❌ Error loading penghulu:', error);
          setPenghuluCount(0);
        }

        // Load pending assignments that need penghulu assignment
        const { getAllRegistrations } = await import('@/lib/simnikah-api');
        
        try {
          // Fetch semua registrations tanpa filter status untuk mendapatkan data lengkap
          const allRegistrationsResponse = await getAllRegistrations({
            page: 1,
            limit: 1000
          }).catch(() => ({ success: false, data: [] }));
          
          // Fetch registrations dengan status Disetujui dan Menunggu Penugasan
          const [disetujuiResponse, menungguResponse] = await Promise.all([
            getAllRegistrations({
              status: 'Disetujui',
              page: 1,
              limit: 1000
            }).catch(() => ({ success: false, data: [] })),
            getAllRegistrations({
              status: 'Menunggu Penugasan',
              page: 1,
              limit: 1000
            }).catch(() => ({ success: false, data: [] }))
          ]);
          
          // Combine both responses
          const allRegistrations: any[] = [];
          
          if (disetujuiResponse.success && Array.isArray(disetujuiResponse.data)) {
            allRegistrations.push(...disetujuiResponse.data);
          }
          
          if (menungguResponse.success && Array.isArray(menungguResponse.data)) {
            allRegistrations.push(...menungguResponse.data);
          }
          
          // Jika tidak ada data dari filtered, coba ambil dari all registrations
          if (allRegistrations.length === 0 && allRegistrationsResponse.success && Array.isArray(allRegistrationsResponse.data)) {
            allRegistrations.push(...allRegistrationsResponse.data);
          }
          
          console.log('📋 Total Registrations:', allRegistrations.length);
          
          // Filter registrations that don't have penghulu assigned
          const pending = allRegistrations
            .filter((reg: any) => {
              const status = reg.status_pendaftaran || reg.status || '';
              const hasPenghulu = reg.penghulu || reg.penghulu_id || reg.penghulu_id;
              const needsAssignment = (status === 'Disetujui' || status === 'Menunggu Penugasan') && !hasPenghulu;
              return needsAssignment;
            })
            .map((reg: any) => ({
              id: reg.id?.toString() || reg.nomor_pendaftaran || reg.id,
              nomorPendaftaran: reg.nomor_pendaftaran || `REG-${reg.id}` || 'N/A',
              groomName: reg.calon_suami?.nama_lengkap || reg.calon_suami?.nama || reg.nama_suami || '',
              brideName: reg.calon_istri?.nama_lengkap || reg.calon_istri?.nama || reg.nama_istri || '',
              weddingDate: reg.tanggal_nikah || reg.weddingDate || '',
              status: reg.status_pendaftaran || reg.status || 'Disetujui'
            }));
          
          console.log('⏳ Pending Assignments:', pending.length);
          setPendingAssignments(pending);
          
          // Simpan data registrations untuk perhitungan statistik
          if (allRegistrationsResponse.success && Array.isArray(allRegistrationsResponse.data)) {
            setAllRegistrationsData(allRegistrationsResponse.data);
            
            // Hitung statistik dari data registrations
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();
            const today = now.toISOString().split('T')[0];
            
            const bulanIni = allRegistrationsResponse.data.filter((reg: any) => {
              const regDate = reg.tanggal_pendaftaran || reg.created_at || reg.tanggal_nikah;
              if (!regDate) return false;
              try {
                const date = new Date(regDate);
                return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
              } catch {
                return false;
              }
            }).length;
            
            const hariIni = allRegistrationsResponse.data.filter((reg: any) => {
              const regDate = reg.tanggal_pendaftaran || reg.created_at || reg.tanggal_nikah;
              if (!regDate) return false;
              try {
                const dateStr = new Date(regDate).toISOString().split('T')[0];
                return dateStr === today;
              } catch {
                return false;
              }
            }).length;
            
            const selesai = allRegistrationsResponse.data.filter((reg: any) => {
              const status = reg.status_pendaftaran || reg.status || '';
              return status === 'Selesai';
            }).length;
            
            const pending = allRegistrationsResponse.data.filter((reg: any) => {
              const status = reg.status_pendaftaran || reg.status || '';
              return status !== 'Selesai' && status !== 'Ditolak';
            }).length;
            
            // Update dashboard data dengan data yang dihitung dari database
            setDashboardData((prev: any) => ({
              ...prev,
              statistics: {
                total_periode: allRegistrationsResponse.data.length,
                hari_ini: hariIni,
                bulan_ini: bulanIni,
                tahun_ini: allRegistrationsResponse.data.filter((reg: any) => {
                  const regDate = reg.tanggal_pendaftaran || reg.created_at || reg.tanggal_nikah;
                  if (!regDate) return false;
                  try {
                    return new Date(regDate).getFullYear() === currentYear;
                  } catch {
                    return false;
                  }
                }).length,
                selesai: selesai,
                pending: pending,
                status_breakdown: prev?.statistics?.status_breakdown || {}
              }
            }));
            
            console.log('📊 Calculated Statistics from DB:', {
              total: allRegistrationsResponse.data.length,
              hari_ini: hariIni,
              bulan_ini: bulanIni,
              selesai: selesai,
              pending: pending
            });
          }
        } catch (error) {
          console.error('❌ Error loading pending assignments:', error);
          setPendingAssignments([]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    if (isKepalaKUA(userRole)) {
      loadData();
      // Refresh data every minute
      const interval = setInterval(loadData, 60000);
      return () => clearInterval(interval);
    }
  }, [userRole, analyticsPeriod]);

  // Show unauthorized message if not Kepala KUA
  if (!loading && !isKepalaKUA(userRole)) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Akses Ditolak</AlertTitle>
          <AlertDescription>
            {getUnauthorizedMessage('CREATE_STAFF')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-muted-foreground">Memuat...</p>
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
              Dashboard Kepala KUA
            </h1>
            <p className="text-muted-foreground mt-2 text-base">
              Manajemen staff, penghulu, dan penugasan nikah dengan efisien
            </p>
          </div>
        </div>

      {pendingAssignments.length > 0 && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Perhatian!</AlertTitle>
          <AlertDescription>
            Ada {pendingAssignments.length} pendaftaran nikah yang sudah diverifikasi dan membutuhkan penugasan penghulu.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group relative overflow-hidden border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-purple-50/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-100">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              Total Staff
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent mb-1">{staffCount}</div>
            <p className="text-xs text-muted-foreground font-medium">
              Staff aktif saat ini
            </p>
          </CardContent>
        </Card>
        <Card className="group relative overflow-hidden border-l-4 border-l-indigo-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-indigo-50/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-100">
                <Users className="h-4 w-4 text-indigo-600" />
              </div>
              Penghulu
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent mb-1">{penghuluCount}</div>
            <p className="text-xs text-muted-foreground font-medium">
              Penghulu aktif saat ini
            </p>
          </CardContent>
        </Card>
        <Card className="group relative overflow-hidden border-l-4 border-l-amber-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-amber-50/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100">
                <Calendar className="h-4 w-4 text-amber-600" />
              </div>
              Menunggu Penugasan
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent mb-1">{pendingAssignments.length}</div>
            <p className="text-xs text-muted-foreground font-medium">
              Pendaftaran perlu penugasan
            </p>
          </CardContent>
        </Card>
        <Card className="group relative overflow-hidden border-l-4 border-l-teal-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-teal-50/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-100">
                <Activity className="h-4 w-4 text-teal-600" />
              </div>
              Bulan Ini
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent mb-1">
              {(() => {
                // Prioritaskan bulan_ini dari API, jika tidak ada gunakan total_periode
                const bulanIni = dashboardData?.statistics?.bulan_ini;
                const totalPeriode = dashboardData?.statistics?.total_periode;
                return bulanIni !== undefined && bulanIni !== null ? bulanIni : (totalPeriode ?? 0);
              })()}
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Total pendaftaran bulan ini
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="staff">Staff KUA</TabsTrigger>
          <TabsTrigger value="penghulu">Penghulu</TabsTrigger>
          <TabsTrigger value="assignments">Penugasan Pending</TabsTrigger>
          <TabsTrigger value="certificates" className="gap-2">
            <FileText className="h-4 w-4" />
            Terbitkan Surat
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Analytics & Laporan</h2>
            <Select value={analyticsPeriod} onValueChange={(value: 'day' | 'week' | 'month' | 'year') => setAnalyticsPeriod(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Hari Ini</SelectItem>
                <SelectItem value="week">Minggu Ini</SelectItem>
                <SelectItem value="month">Bulan Ini</SelectItem>
                <SelectItem value="year">Tahun Ini</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {dashboardData ? (
            <AnalyticsCharts dashboardData={dashboardData} />
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-muted-foreground">Memuat data analytics...</p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Daftar Staff KUA</h2>
            <Button onClick={() => setIsAddStaffOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Tambah Staff
            </Button>
          </div>
          <StaffTable refreshKey={staffRefreshKey} />
        </TabsContent>

        <TabsContent value="penghulu" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Daftar Penghulu</h2>
            <Button onClick={() => setIsAddPenghuluOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Tambah Penghulu
            </Button>
          </div>
          <PenghuluTable refreshKey={penghuluRefreshKey} />
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Penugasan Pending</h2>
          </div>
          <PendingAssignmentsTable data={pendingAssignments} />
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Terbitkan Surat Nikah</h2>
          </div>
          <MarriageCertificateForm />
        </TabsContent>
      </Tabs>

      <AddStaffDialog 
        open={isAddStaffOpen} 
        onOpenChange={setIsAddStaffOpen}
        onSuccess={() => {
          setIsAddStaffOpen(false);
          setStaffRefreshKey(prev => prev + 1);
          // Reload staff count
          getAllStaff().then(response => {
            if (response.success && Array.isArray(response.data)) {
              setStaffCount(response.data.length);
            }
          }).catch(console.error);
        }} 
      />

      <AddPenghuluDialog
        open={isAddPenghuluOpen}
        onOpenChange={setIsAddPenghuluOpen}
        onSuccess={() => {
          setIsAddPenghuluOpen(false);
          setPenghuluRefreshKey(prev => prev + 1);
          // Reload penghulu count
          getAllPenghulu().then(response => {
            if (response.success && Array.isArray(response.data)) {
              setPenghuluCount(response.data.length);
            }
          }).catch(console.error);
        }}
      />
      </div>
    </div>
  );
}