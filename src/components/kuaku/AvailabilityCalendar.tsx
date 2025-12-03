"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "@/lib/api";
import { getCalendarAvailability, getAllPenghulu } from "@/lib/simnikah-api";
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
  sisa_kuota?: number; // Optional for backward compatibility
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

      // API expects bulan as number (1-12), not string
      const bulan = currentMonth.getMonth() + 1;
      const tahun = currentMonth.getFullYear();

      console.log(`📅 Fetching calendar data for bulan=${bulan}, tahun=${tahun}`);

      // Fetch calendar data and penghulu data in parallel
      const [calendarResponse, penghuluResponse] = await Promise.all([
        getCalendarAvailability(bulan, tahun),
        getAllPenghulu().catch(() => ({ success: false, data: [] }))
      ]);
      
      console.log("✅ Calendar data fetched:", calendarResponse);
      console.log("✅ Penghulu data fetched:", penghuluResponse);
      
      const response = calendarResponse;
      
      // Handle response structure from getCalendarAvailability
      // Response format: { success: true, message: "...", data: { bulan, tahun, nama_bulan, kapasitas_harian, calendar: [...] } }
      const responseData = response.data;
      
      // Calculate penghulu statistics (moved before response check)
      let totalPenghulu = 0;
      let penghuluAktif = 0;
      let penghuluCadangan = 0;
      
      if (penghuluResponse.success && Array.isArray(penghuluResponse.data)) {
        totalPenghulu = penghuluResponse.data.length;
        penghuluAktif = penghuluResponse.data.filter((p: any) => 
          p.status === 'Aktif' || p.status === 'aktif' || p.status === 'ACTIVE'
        ).length;
        penghuluCadangan = penghuluResponse.data.filter((p: any) => 
          p.status === 'Cadangan' || p.status === 'cadangan' || p.status === 'RESERVE'
        ).length;
        
        console.log('📿 Penghulu Stats:', {
          total: totalPenghulu,
          aktif: penghuluAktif,
          cadangan: penghuluCadangan
        });
      }
      
      // Check if response is empty or invalid
      if (!responseData || typeof responseData !== 'object' || Object.keys(responseData).length === 0) {
        console.warn("⚠️ Empty or invalid calendar response, creating default calendar");
        // Create default calendar data for the current month
        const currentYear = currentMonth.getFullYear();
        const currentMonthNum = currentMonth.getMonth() + 1;
        const daysInMonth = new Date(currentYear, currentMonthNum, 0).getDate();
        
        const defaultData: CalendarData = {
          bulan: currentMonthNum,
          tahun: currentYear,
          nama_bulan: currentMonth.toLocaleString("id-ID", { month: "long" }),
          kapasitas_harian: 9,
          penghulu_info: {
            total_penghulu: totalPenghulu,
            penghulu_aktif: penghuluAktif,
            penghulu_cadangan: penghuluCadangan,
            slot_waktu_per_hari: 9,
            nikah_per_slot: 1,
            total_kapasitas_harian: 9,
          },
          kalender: Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateKey = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            return {
              tanggal: day,
              tanggal_str: dateKey,
              status: "Tersedia",
              tersedia: true,
              jumlah_nikah_total: 0,
              jumlah_nikah_kua: 0,
              jumlah_nikah_luar: 0,
              kuning_count: 0,
              hijau_count: 0,
              warna: "gray",
              sisa_kuota_kua: 9,
              kapasitas_kua: 9,
            };
          }),
        };
        setCalendarData(defaultData);
        return;
      }
      
      // Map new API format to component format (v1.1.0)
      // New API structure: { data: { bulan, tahun, nama_bulan, kapasitas_harian, calendar: [...] } }
      if (responseData.calendar && Array.isArray(responseData.calendar) && responseData.calendar.length > 0) {
        // New API format v1.1.0 - map calendar to kalender
        const mappedData: CalendarData = {
          bulan: responseData.bulan || currentMonth.getMonth() + 1,
          tahun: responseData.tahun || currentMonth.getFullYear(),
          nama_bulan: responseData.nama_bulan || currentMonth.toLocaleString("id-ID", { month: "long" }),
          kapasitas_harian: responseData.kapasitas_harian || 9,
          penghulu_info: {
            total_penghulu: totalPenghulu,
            penghulu_aktif: penghuluAktif,
            penghulu_cadangan: penghuluCadangan,
            slot_waktu_per_hari: responseData.kapasitas_harian || 9,
            nikah_per_slot: 1,
            total_kapasitas_harian: responseData.kapasitas_harian || 9,
          },
          kalender: responseData.calendar.map((day: any) => {
            return {
              tanggal: day.tanggal || parseInt(day.tanggal_str?.split('-')[2] || '0'),
              tanggal_str: day.tanggal_str || '',
              status: day.status || "Tersedia",
              tersedia: day.tersedia !== false,
              jumlah_nikah_total: day.jumlah_nikah || 0,
              jumlah_nikah_kua: 0, // Calculate from time_slots if needed
              jumlah_nikah_luar: 0, // Calculate from time_slots if needed
              kuning_count: day.jumlah_draft || 0,
              hijau_count: day.jumlah_disetujui || 0,
              warna: !day.tersedia ? "gray" : day.status === "Sebagian Tersedia" ? "kuning" : "hijau",
              sisa_kuota: day.sisa_kuota || 0,
              sisa_kuota_kua: day.sisa_kuota || 0,
              kapasitas_kua: day.kapasitas || responseData.kapasitas_harian || 9,
            };
          }),
        };
        setCalendarData(mappedData);
      } else if (responseData.hari && Array.isArray(responseData.hari) && responseData.hari.length > 0) {
        // Old API format (v1.0) - map hari to kalender
        const mappedData: CalendarData = {
          bulan: responseData.bulan || currentMonth.getMonth() + 1,
          tahun: responseData.tahun || currentMonth.getFullYear(),
          nama_bulan: currentMonth.toLocaleString("id-ID", { month: "long" }),
          kapasitas_harian: responseData.kapasitas_per_hari || 9,
          penghulu_info: {
            total_penghulu: totalPenghulu,
            penghulu_aktif: penghuluAktif,
            penghulu_cadangan: penghuluCadangan,
            slot_waktu_per_hari: 9,
            nikah_per_slot: 1,
            total_kapasitas_harian: responseData.kapasitas_per_hari || 9,
          },
          kalender: responseData.hari.map((day: any) => {
            const date = new Date(day.tanggal);
            return {
              tanggal: date.getDate(),
              tanggal_str: day.tanggal,
              status: day.status || "Tersedia",
              tersedia: day.status !== "Penuh",
              jumlah_nikah_total: day.total_nikah || 0,
              jumlah_nikah_kua: 0,
              jumlah_nikah_luar: 0,
              kuning_count: 0,
              hijau_count: 0,
              warna: day.status === "Penuh" ? "gray" : day.status === "Sebagian Tersedia" ? "kuning" : "hijau",
              sisa_kuota: day.sisa_kuota || 0,
              sisa_kuota_kua: day.sisa_kuota || 0,
              kapasitas_kua: responseData.kapasitas_per_hari || 9,
            };
          }),
        };
        setCalendarData(mappedData);
      } else if (responseData.kalender && Array.isArray(responseData.kalender) && responseData.kalender.length > 0) {
        // Very old API format - use as is
        setCalendarData(responseData);
      } else {
        // If no valid data, create default calendar
        console.warn("⚠️ No valid calendar data in response, creating default calendar");
        const currentYear = currentMonth.getFullYear();
        const currentMonthNum = currentMonth.getMonth() + 1;
        const daysInMonth = new Date(currentYear, currentMonthNum, 0).getDate();
        
        const defaultData: CalendarData = {
          bulan: currentMonthNum,
          tahun: currentYear,
          nama_bulan: currentMonth.toLocaleString("id-ID", { month: "long" }),
          kapasitas_harian: 9,
          penghulu_info: {
            total_penghulu: 0,
            penghulu_aktif: 0,
            penghulu_cadangan: 0,
            slot_waktu_per_hari: 9,
            nikah_per_slot: 1,
            total_kapasitas_harian: 9,
          },
          kalender: Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateKey = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            return {
              tanggal: day,
              tanggal_str: dateKey,
              status: "Tersedia",
              tersedia: true,
              jumlah_nikah_total: 0,
              jumlah_nikah_kua: 0,
              jumlah_nikah_luar: 0,
              kuning_count: 0,
              hijau_count: 0,
              warna: "gray",
              sisa_kuota_kua: 9,
              kapasitas_kua: 9,
            };
          }),
        };
        setCalendarData(defaultData);
      }
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
        title="Kalender Ketersediaan Pernikahan" 
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
        title="Kalender Ketersediaan Pernikahan" 
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
        title="Kalender Ketersediaan Pernikahan" 
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

  if (!calendarData || !calendarData.kalender) {
    return (
      <SectionWrapper 
        id="availability-calendar" 
        title="Kalender Ketersediaan Pernikahan" 
        subtitle="Transparansi Data Pendaftaran"
      >
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Data kalender tidak tersedia. Silakan coba lagi nanti.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </SectionWrapper>
    );
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
  
  // Ensure kalender is an array and map to calendar days
  const kalenderArray = Array.isArray(calendarData.kalender) ? calendarData.kalender : [];
  
  // Create a map of dates to calendar days for easy lookup
  const calendarMap = new Map<string, CalendarDay>();
  kalenderArray.forEach((day: CalendarDay) => {
    const dateKey = day.tanggal_str || `${calendarData.tahun}-${String(calendarData.bulan).padStart(2, '0')}-${String(day.tanggal).padStart(2, '0')}`;
    calendarMap.set(dateKey, day);
  });
  
  // Build calendar days array
  const calendarDays: (CalendarDay | null)[] = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${calendarData.tahun}-${String(calendarData.bulan).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const calendarDay = calendarMap.get(dateKey);
    
    if (calendarDay) {
      calendarDays.push(calendarDay);
    } else {
      // Create default day if not in API response
      const date = new Date(calendarData.tahun, calendarData.bulan - 1, day);
      calendarDays.push({
        tanggal: day,
        tanggal_str: dateKey,
        status: "Tersedia",
        tersedia: true,
        jumlah_nikah_total: 0,
        jumlah_nikah_kua: 0,
        jumlah_nikah_luar: 0,
        kuning_count: 0,
        hijau_count: 0,
        warna: "gray",
        sisa_kuota_kua: calendarData.kapasitas_harian,
        kapasitas_kua: calendarData.kapasitas_harian,
      });
    }
  }

  return (
    <SectionWrapper 
      id="availability-calendar" 
      title="Kalender Ketersediaan Pernikahan" 
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
