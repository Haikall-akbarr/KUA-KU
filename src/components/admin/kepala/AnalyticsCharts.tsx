"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, Users, Calendar, Clock } from "lucide-react"

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

interface AnalyticsChartsProps {
  dashboardData: {
    trends?: Array<{ date: string; label: string; count: number }>;
    status_distribution?: Array<{ status: string; count: number; label: string }>;
    penghulu_performance?: Array<{
      penghulu_id: number;
      nama_lengkap: string;
      jumlah_nikah: number;
      rating: number;
      jumlah_rating: number;
    }>;
    peak_hours?: Array<{ waktu: string; count: number }>;
    statistics?: {
      total_periode: number;
      hari_ini: number;
      bulan_ini: number;
      tahun_ini: number;
      selesai: number;
      pending: number;
    };
  };
}

export function AnalyticsCharts({ dashboardData }: AnalyticsChartsProps) {
  const trends = dashboardData.trends || []
  const statusDistribution = dashboardData.status_distribution || []
  const penghuluPerformance = dashboardData.penghulu_performance || []
  const peakHours = dashboardData.peak_hours || []

  // Format data untuk chart
  const trendsData = trends.map(item => ({
    name: item.label || item.date,
    value: item.count || 0
  }))

  const statusData = statusDistribution.map(item => ({
    name: item.label || item.status,
    value: item.count || 0
  }))

  const penghuluData = penghuluPerformance
    .sort((a, b) => b.jumlah_nikah - a.jumlah_nikah)
    .slice(0, 10) // Top 10 penghulu
    .map(item => ({
      name: item.nama_lengkap || `Penghulu ${item.penghulu_id}`,
      nikah: item.jumlah_nikah || 0,
      rating: item.rating || 0
    }))

  const peakHoursData = peakHours
    .sort((a, b) => {
      const timeA = a.waktu || '00:00'
      const timeB = b.waktu || '00:00'
      return timeA.localeCompare(timeB)
    })
    .map(item => ({
      waktu: item.waktu || '00:00',
      jumlah: item.count || 0
    }))

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Periode</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.statistics?.total_periode || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total pendaftaran
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hari Ini</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.statistics?.hari_ini || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Pendaftaran hari ini
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.statistics?.selesai || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Pernikahan selesai
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.statistics?.pending || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Menunggu proses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Trends Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Trend Pendaftaran</CardTitle>
            <CardDescription>
              Grafik perkembangan pendaftaran per periode
            </CardDescription>
          </CardHeader>
          <CardContent>
            {trendsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Jumlah Pendaftaran"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Data belum tersedia
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Status</CardTitle>
            <CardDescription>
              Persentase pendaftaran berdasarkan status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Data belum tersedia
              </div>
            )}
          </CardContent>
        </Card>

        {/* Penghulu Performance Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performa Penghulu</CardTitle>
            <CardDescription>
              Top 10 penghulu berdasarkan jumlah pernikahan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {penghuluData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={penghuluData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={120}
                    fontSize={12}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="nikah" fill="#3b82f6" name="Jumlah Nikah" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Data belum tersedia
              </div>
            )}
          </CardContent>
        </Card>

        {/* Peak Hours Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Jam Sibuk</CardTitle>
            <CardDescription>
              Distribusi pendaftaran berdasarkan waktu
            </CardDescription>
          </CardHeader>
          <CardContent>
            {peakHoursData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={peakHoursData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="waktu" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="jumlah" fill="#f59e0b" name="Jumlah Pendaftaran" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Data belum tersedia
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Area Chart - Overview */}
      {trendsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Overview Pendaftaran</CardTitle>
            <CardDescription>
              Grafik area perkembangan pendaftaran
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={trendsData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorValue)"
                  name="Jumlah Pendaftaran"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

