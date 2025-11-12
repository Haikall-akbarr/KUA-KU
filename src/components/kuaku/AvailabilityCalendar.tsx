"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "@/lib/api";
import { Calendar, AlertCircle, Users, MapPin, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { SectionWrapper } from "@/components/shared/SectionWrapper";

interface CalendarDay {
  tanggal: number;
  tanggal_str: string;
  status: string;
  tersedia: boolean;
  jumlah_nikah_total: number;
  jumlah_nikah_kua: number;
  jumlah_nikah_luar: number;
  kuning_count: number;
  hijau_count: number;
  warna: string;
  sisa_kuota_kua: number;
  kapasitas_kua: number;
}

interface CalendarData {
  bulan: number;
  tahun: number;
  nama_bulan: string;
  kapasitas_harian: number;
  penghulu_info: {
    total_penghulu: number;
    penghulu_aktif: number;
    penghulu_cadangan: number;
    slot_waktu_per_hari: number;
    nikah_per_slot: number;
    total_kapasitas_harian: number;
  };
  kalender: CalendarDay[];
}

export function AvailabilityCalendar() {
  const { user, token } = useAuth();
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (user && token) {
      fetchCalendarData();
    } else {
      setLoading(false);
    }
  }, [currentMonth, user, token]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      setError(null);

      const bulan = String(currentMonth.getMonth() + 1).padStart(2, "0");
      const tahun = currentMonth.getFullYear();

      console.log(`📅 Fetching calendar data for ${bulan}/${tahun}`);

      const response = await api.get("/simnikah/kalender-ketersediaan", {
        params: {
          bulan,
          tahun,
        },
      });

      console.log("✅ Calendar data fetched:", response.data);
      setCalendarData(response.data.data);
    } catch (err: any) {
      console.error("❌ Error fetching calendar:", err);
      setError(err.response?.data?.message || "Gagal memuat kalender ketersediaan");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  if (!user || !token) {
    return (
      <SectionWrapper 
        id="availability-calendar" 
        title="Kalender Ketersediaan" 
        subtitle="Transparansi Data Pendaftaran"
      >
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Silakan <a href="/login" className="font-semibold text-blue-600 underline">login</a> untuk melihat kalender ketersediaan
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </SectionWrapper>
    );
  }

  if (loading) {
    return (
      <SectionWrapper 
        id="availability-calendar" 
        title="Kalender Ketersediaan" 
        subtitle="Transparansi Data Pendaftaran"
      >
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex justify-center items-center py-8">
              <div className="animate-pulse space-y-4 w-full">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="grid grid-cols-7 gap-2">
                  {[...Array(35)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-300 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </SectionWrapper>
    );
  }

  if (error) {
    return (
      <SectionWrapper 
        id="availability-calendar" 
        title="Kalender Ketersediaan" 
        subtitle="Transparansi Data Pendaftaran"
      >
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <button
              onClick={fetchCalendarData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Coba Lagi
            </button>
          </CardContent>
        </Card>
      </SectionWrapper>
    );
  }

  if (!calendarData) {
    return null;
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getDateColor = (day: CalendarDay) => {
    if (day.warna === "hijau") {
      return "bg-green-100 border-green-300 hover:bg-green-200";
    } else if (day.warna === "kuning") {
      return "bg-yellow-100 border-yellow-300 hover:bg-yellow-200";
    }
    return "bg-gray-100 border-gray-300 hover:bg-gray-200";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Tersedia":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "Penuh":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-600" />;
    }
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
  const calendarDays: (CalendarDay | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...calendarData.kalender,
  ];

  return (
    <SectionWrapper 
      id="availability-calendar" 
      title="Kalender Ketersediaan" 
      subtitle="Transparansi Data Pendaftaran"
    >
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Kalender {calendarData.nama_bulan} {calendarData.tahun}
            </CardTitle>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Data real-time untuk transparansi siapa saja yang sudah daftar dan menunggu verifikasi
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Info Penghulu */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-blue-100 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-700">
                {calendarData.penghulu_info.total_penghulu}
              </div>
              <div className="text-xs text-blue-600">Total Penghulu</div>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-700">
                {calendarData.penghulu_info.penghulu_aktif}
              </div>
              <div className="text-xs text-green-600">Penghulu Aktif</div>
            </div>
            <div className="bg-yellow-100 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-700">
                {calendarData.kapasitas_harian}
              </div>
              <div className="text-xs text-yellow-600">Kapasitas/Hari</div>
            </div>
            <div className="bg-purple-100 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-700">
                {calendarData.penghulu_info.slot_waktu_per_hari}
              </div>
              <div className="text-xs text-purple-600">Slot Waktu</div>
            </div>
          </div>

          {/* Kontrol Bulan */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePreviousMonth}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
            >
              ← Bulan Lalu
            </button>
            <span className="text-sm font-semibold">
              {currentMonth.toLocaleString("id-ID", { month: "long", year: "numeric" })}
            </span>
            <button
              onClick={handleNextMonth}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
            >
              Bulan Depan →
            </button>
          </div>

          {/* Kalender Grid */}
          <div className="space-y-4">
            {/* Header Hari */}
            <div className="grid grid-cols-7 gap-2">
              {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-gray-700 text-sm py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Kalender */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return (
                    <div key={`empty-${index}`} className="aspect-square bg-gray-50 rounded-lg" />
                  );
                }

                return (
                  <div
                    key={day.tanggal_str}
                    className={`aspect-square rounded-lg border-2 p-2 transition-all cursor-pointer group relative ${getDateColor(day)}`}
                    title={`${day.status} - ${day.jumlah_nikah_kua} di KUA, ${day.jumlah_nikah_luar} di luar KUA`}
                  >
                    {/* Tooltip */}
                    <div className="hidden group-hover:block absolute z-10 bg-gray-800 text-white text-xs rounded-lg p-3 w-48 -mt-20 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <div className="font-bold mb-2 whitespace-normal">{day.tanggal_str}</div>
                      <div className="space-y-1 whitespace-normal text-left">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> {day.status}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {day.jumlah_nikah_kua} di KUA
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {day.jumlah_nikah_luar} di luar
                        </div>
                        <div className="border-t border-gray-600 pt-1 mt-1">
                          Sisa: <span className="font-bold">{day.sisa_kuota_kua}</span> kuota
                        </div>
                      </div>
                    </div>

                    {/* Konten Harian */}
                    <div className="flex flex-col h-full justify-between">
                      <div className="text-lg font-bold text-gray-800">{day.tanggal}</div>

                      <div className="space-y-1">
                        {/* Status Indicator */}
                        <div className="flex items-center justify-center">
                          {getStatusIcon(day.status)}
                        </div>

                        {/* Jumlah Nikah */}
                        <div className="text-xs text-center text-gray-700 font-semibold">
                          {day.jumlah_nikah_total}/{day.kapasitas_kua}
                        </div>

                        {/* Sisa Kuota */}
                        <div className="text-xs text-center">
                          {day.tersedia ? (
                            <span className="text-green-700 font-semibold">
                              {day.sisa_kuota_kua}
                            </span>
                          ) : (
                            <span className="text-red-700 font-semibold">✕</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="text-sm font-semibold text-gray-700">📋 Legend:</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 border-2 border-green-300 rounded"></div>
                <span className="text-sm">
                  <strong className="text-green-700">Hijau</strong> = Ada yang sudah fix
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
                <span className="text-sm">
                  <strong className="text-yellow-700">Kuning</strong> = Masih proses awal
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm">
                  <strong>Tersedia</strong> = Masih ada kuota
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm">
                <strong>Penuh</strong> = Kuota habis
              </span>
            </div>
          </div>

          {/* Info Tambahan */}
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>✓ Transparansi Penuh:</strong> Kalender ini menampilkan data real-time siapa saja yang sudah 
              daftar dan menunggu verifikasi. Hijau = sudah fixed, Kuning = masih proses awal.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </SectionWrapper>
  );
}
