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
        const dashboardResponse = await getKepalaKUADashboard({ period: analyticsPeriod });
        if (dashboardResponse.success) {
          setDashboardData(dashboardResponse.data);
        }

        // Load staff count
        try {
          const staffResponse = await getAllStaff();
          if (staffResponse.success && Array.isArray(staffResponse.data)) {
            setStaffCount(staffResponse.data.length);
          }
        } catch (error) {
          console.error('Error loading staff:', error);
        }

        // Load penghulu count
        try {
          const penghuluResponse = await getAllPenghulu();
          if (penghuluResponse.success && Array.isArray(penghuluResponse.data)) {
            setPenghuluCount(penghuluResponse.data.length);
          }
        } catch (error) {
          console.error('Error loading penghulu:', error);
        }

        // Load pending assignments that need penghulu assignment
        const { getAllRegistrations } = await import('@/lib/simnikah-api');
        
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
        
        // Filter registrations that don't have penghulu assigned
        const pending = allRegistrations
          .filter((reg: any) => {
            const status = reg.status_pendaftaran || reg.status || '';
            const hasPenghulu = reg.penghulu || reg.penghulu_id;
            return (status === 'Disetujui' || status === 'Menunggu Penugasan') && !hasPenghulu;
          })
          .map((reg: any) => ({
            id: reg.id?.toString() || reg.nomor_pendaftaran || reg.id,
            nomorPendaftaran: reg.nomor_pendaftaran || `REG-${reg.id}` || 'N/A',
            groomName: reg.calon_suami?.nama_lengkap || reg.nama_suami || '',
            brideName: reg.calon_istri?.nama_lengkap || reg.nama_istri || '',
            weddingDate: reg.tanggal_nikah || reg.weddingDate || '',
            status: reg.status_pendaftaran || reg.status || 'Disetujui'
          }));
        
        setPendingAssignments(pending);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Kepala KUA</h1>
        <p className="text-muted-foreground">
          Manajemen staff, penghulu, dan penugasan nikah.
        </p>
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffCount}</div>
            <p className="text-xs text-muted-foreground">
              Staff aktif saat ini
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Penghulu</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{penghuluCount}</div>
            <p className="text-xs text-muted-foreground">
              Penghulu aktif saat ini
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Penugasan</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAssignments.length}</div>
            <p className="text-xs text-muted-foreground">
              Pendaftaran perlu penugasan
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bulan Ini</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.statistics?.bulan_ini || 0}
            </div>
            <p className="text-xs text-muted-foreground">
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
  );
}