'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, UserPlus, Users, Calendar, Bell } from "lucide-react";
import { AddStaffDialog } from "@/components/admin/kepala/AddStaffDialog";
import { AddPenghuluDialog } from "@/components/admin/kepala/AddPenghuluDialog";
import { StaffTable } from "@/components/admin/kepala/StaffTable";
import { PenghuluTable } from "@/components/admin/kepala/PenghuluTable";
import { PendingAssignmentsTable } from "@/components/admin/kepala/PendingAssignmentsTable";

export default function KepalaKUADashboard() {
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isAddPenghuluOpen, setIsAddPenghuluOpen] = useState(false);
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [activeTab, setActiveTab] = useState("staff");
  const router = useRouter();

  useEffect(() => {
    // Load pending assignments that need penghulu assignment
    const loadPendingAssignments = () => {
      try {
        const registrations = JSON.parse(localStorage.getItem('marriageRegistrations') || '[]');
        // Filter registrations that are approved but don't have penghulu assigned
        const pending = registrations.filter((reg: any) => 
          reg.status === 'Disetujui' && !reg.penghulu
        );
        setPendingAssignments(pending);
      } catch (error) {
        console.error('Error loading pending assignments:', error);
      }
    };

    loadPendingAssignments();
    // Refresh data every minute
    const interval = setInterval(loadPendingAssignments, 60000);
    return () => clearInterval(interval);
  }, []);

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
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
            <div className="text-2xl font-bold">4</div>
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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="staff">Staff KUA</TabsTrigger>
          <TabsTrigger value="penghulu">Penghulu</TabsTrigger>
          <TabsTrigger value="assignments">Penugasan Pending</TabsTrigger>
        </TabsList>
        
        <TabsContent value="staff" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Daftar Staff KUA</h2>
            <Button onClick={() => setIsAddStaffOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Tambah Staff
            </Button>
          </div>
          <StaffTable />
        </TabsContent>

        <TabsContent value="penghulu" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Daftar Penghulu</h2>
            <Button onClick={() => setIsAddPenghuluOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Tambah Penghulu
            </Button>
          </div>
          <PenghuluTable />
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Penugasan Pending</h2>
          </div>
          <PendingAssignmentsTable data={pendingAssignments} />
        </TabsContent>
      </Tabs>

      <AddStaffDialog 
        open={isAddStaffOpen} 
        onOpenChange={setIsAddStaffOpen}
        onSuccess={() => {
          setIsAddStaffOpen(false);
          router.refresh();
        }} 
      />

      <AddPenghuluDialog
        open={isAddPenghuluOpen}
        onOpenChange={setIsAddPenghuluOpen}
        onSuccess={() => {
          setIsAddPenghuluOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}