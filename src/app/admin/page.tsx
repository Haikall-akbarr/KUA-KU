'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, CreditCard, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Loader2 } from 'lucide-react';
import { getKepalaKUADashboard } from '@/lib/simnikah-api';

interface User {
  role: string;
  nama?: string;
  email?: string;
}

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Load user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Load dashboard data if user is kepala_kua
        if (parsedUser.role === 'kepala_kua') {
          loadDashboardData();
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/login');
      }
    }
    setLoading(false);
  }, [router]);

  const loadDashboardData = async () => {
    try {
      const response = await getKepalaKUADashboard({ period: 'month' });
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If user is staff, show message (they should have been redirected to /admin/staff)
  if (user?.role === 'staff') {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Akses Staff KUA</h1>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-900">Anda adalah Staff KUA</CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-800">
            <p className="mb-4">Dashboard Anda telah dipindahkan ke halaman khusus Staff KUA.</p>
            <Link href="/admin/staff">
              <Button className="bg-yellow-600 hover:bg-yellow-700">
                Buka Dashboard Staff KUA
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show Kepala KUA dashboard for kepala_kua role
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard Kepala KUA</h1>
      
      {/* Quick Access Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            👨‍💼 Manajemen Kepala KUA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 mb-4">
            Kelola staff, penghulu, dan penugasan nikah dari satu dashboard.
          </p>
          <Link href="/admin/kepala">
            <Button className="gap-2">
              Buka Dashboard Kepala KUA
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pendaftaran Bulan Ini
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Hari Ini
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.statistics?.hari_ini || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Pendaftaran hari ini
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.statistics?.selesai || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Pernikahan selesai
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.statistics?.pending || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Menunggu penugasan
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Here you could add more components like Recent Sales or Overview chart */}
    </div>
  );
}
