'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Calendar, AlertCircle, Clock, MapPin, Loader2, ChevronDown, ChevronUp, History, Eye, CheckCircle } from 'lucide-react';
import { getAssignedRegistrations, completeMarriage, handleApiError } from '@/lib/simnikah-api';
import { format, parseISO, isPast, isToday, isFuture } from 'date-fns';
import { id as IndonesianLocale } from 'date-fns/locale';
import { PenghuluLocationView } from '@/components/kuaku/PenghuluLocationView';
import { useToast } from '@/hooks/use-toast';

export default function JadwalPage() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRegistrations, setExpandedRegistrations] = useState<Set<string>>(new Set());
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; target: any | null }>({
    open: false,
    target: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadSchedule = async () => {
      setLoading(true);
      setError('');

      try {
        // Get all assigned registrations for this penghulu
        const response = await getAssignedRegistrations();
        
        console.log('📥 Raw API Response:', response);
        
        // Handle response structure from API sesuai dokumentasi
        // Response format: { success: true, data: { penghulu: "...", registrations: [...], total: 1 } }
        let registrations: any[] = [];
        
        if (response?.success && response?.data?.registrations) {
          // Format sesuai dokumentasi: { success: true, data: { registrations: [...] } }
          registrations = Array.isArray(response.data.registrations) ? response.data.registrations : [];
          console.log('✅ Using response.data.registrations:', registrations.length);
        } else if (response?.data && Array.isArray(response.data)) {
          // Fallback: jika data langsung array
          registrations = response.data;
          console.log('✅ Using response.data (array):', registrations.length);
        } else if (Array.isArray(response)) {
          // Fallback: jika response langsung array
          registrations = response;
          console.log('✅ Using response (array):', registrations.length);
        } else if (response?.data && typeof response.data === 'object' && response.data.registrations) {
          // Another fallback
          registrations = Array.isArray(response.data.registrations) ? response.data.registrations : [];
          console.log('✅ Using response.data.registrations (fallback):', registrations.length);
        } else {
          console.warn('⚠️ Unknown response structure:', response);
        }
        
        // Log hanya untuk debugging jika diperlukan
        if (process.env.NODE_ENV === 'development' && registrations.length > 0) {
          console.log('📋 Extracted registrations:', registrations.length);
        }
        
        // Map to schedule format and sort by date
        const mappedSchedule = registrations
          .map((reg: any) => {
            // Log hanya jika ada masalah (reduced logging)
            
            // Normalize tanggal_nikah format
            // Handle different formats: "2024-12-15", "2024-12-15T00:00:00Z", "2024-12-15T00:00:00.000Z"
            let tanggal = reg.tanggal_nikah || '';
            if (tanggal) {
              // Extract date part only (YYYY-MM-DD)
              if (tanggal.includes('T')) {
                tanggal = tanggal.split('T')[0];
              }
              // Remove timezone if exists
              if (tanggal.includes('Z')) {
                tanggal = tanggal.split('Z')[0].split('T')[0];
              }
            }
            
            // Extract calon suami name - handle multiple possible structures
            let calonSuami = '';
            if (reg.calon_suami) {
              if (typeof reg.calon_suami === 'string') {
                calonSuami = reg.calon_suami;
              } else if (reg.calon_suami.nama_lengkap) {
                calonSuami = reg.calon_suami.nama_lengkap;
              } else if (reg.calon_suami.nama) {
                calonSuami = reg.calon_suami.nama;
              } else if (reg.calon_suami.nama_dan_bin) {
                calonSuami = reg.calon_suami.nama_dan_bin;
              } else if (reg.calon_suami.groomFullName) {
                calonSuami = reg.calon_suami.groomFullName;
              } else if (reg.calon_suami.brideFullName) {
                // Fallback jika terbalik
                calonSuami = reg.calon_suami.brideFullName;
              }
            } else if (reg.calon_laki_laki?.nama_dan_bin) {
              calonSuami = reg.calon_laki_laki.nama_dan_bin;
            } else if (reg.groomName) {
              calonSuami = reg.groomName;
            } else if (reg.groomFullName) {
              calonSuami = reg.groomFullName;
            }
            
            // Extract calon istri name - handle multiple possible structures
            let calonIstri = '';
            if (reg.calon_istri) {
              if (typeof reg.calon_istri === 'string') {
                calonIstri = reg.calon_istri;
              } else if (reg.calon_istri.nama_lengkap) {
                calonIstri = reg.calon_istri.nama_lengkap;
              } else if (reg.calon_istri.nama) {
                calonIstri = reg.calon_istri.nama;
              } else if (reg.calon_istri.nama_dan_binti) {
                calonIstri = reg.calon_istri.nama_dan_binti;
              } else if (reg.calon_istri.brideFullName) {
                calonIstri = reg.calon_istri.brideFullName;
              } else if (reg.calon_istri.groomFullName) {
                // Fallback jika terbalik
                calonIstri = reg.calon_istri.groomFullName;
              }
            } else if (reg.calon_perempuan?.nama_dan_binti) {
              calonIstri = reg.calon_perempuan.nama_dan_binti;
            } else if (reg.brideName) {
              calonIstri = reg.brideName;
            } else if (reg.brideFullName) {
              calonIstri = reg.brideFullName;
            }
            
            // Log hanya jika ada masalah dengan nama
            if (!calonSuami || !calonIstri) {
              console.warn('⚠️ Missing name data after mapping:', {
                nomor: reg.nomor_pendaftaran || reg.id,
                calon_suami_structure: reg.calon_suami,
                calon_istri_structure: reg.calon_istri,
                extracted_suami: calonSuami || '(empty)',
                extracted_istri: calonIstri || '(empty)'
              });
            }
            
            return {
              id: reg.id || reg.nomor_pendaftaran,
              nomor_pendaftaran: reg.nomor_pendaftaran || reg.id,
              tanggal: tanggal,
              waktu: reg.waktu_nikah,
              tempat: reg.tempat_nikah,
              alamat: reg.alamat_akad || reg.alamat_nikah || reg.alamat || '',
              calon_suami: calonSuami || 'Nama tidak tersedia',
              calon_istri: calonIstri || 'Nama tidak tersedia',
              status: reg.status_pendaftaran || 'Penghulu Ditugaskan',
            };
          })
          .filter((item: any) => item.tanggal) // Filter out items without date
          .sort((a: any, b: any) => {
            // Sort by date, then by time
            const dateA = new Date(a.tanggal + 'T' + (a.waktu || '00:00'));
            const dateB = new Date(b.tanggal + 'T' + (b.waktu || '00:00'));
            return dateA.getTime() - dateB.getTime();
          });
        
        // Debug logging
        const todayDebug = new Date().toISOString().split('T')[0];
        console.log('📅 Mapped Schedule:', mappedSchedule);
        console.log('📅 Today\'s date:', todayDebug);
        console.log('📅 Schedule dates:', mappedSchedule.map((item: any) => {
          const itemDate = item.tanggal?.split('T')[0] || item.tanggal;
          const isToday = itemDate === todayDebug;
          const isFuture = itemDate > todayDebug;
          return {
            tanggal: item.tanggal,
            normalized: itemDate,
            isToday,
            isFuture,
            calon: `${item.calon_suami} & ${item.calon_istri}`
          };
        }));
        
        setSchedule(mappedSchedule);
      } catch (err: any) {
        setError('Gagal memuat jadwal. Silakan coba lagi.');
        console.error('Error loading schedule:', err);
        setSchedule([]);
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadSchedule, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate statistics
  // Kapasitas per penghulu per hari: 3 (karena total kapasitas KUA 9 dibagi 3 penghulu)
  const KAPASITAS_PER_PENGHULU_PER_HARI = 3;
  
  // Helper function to normalize date string
  const normalizeDate = (dateStr: string): string => {
    if (!dateStr) return '';
    let normalized = dateStr;
    if (normalized.includes('T')) {
      normalized = normalized.split('T')[0];
    }
    if (normalized.includes('Z')) {
      normalized = normalized.split('Z')[0].split('T')[0];
    }
    return normalized;
  };
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Separate active schedule (not completed) and history (completed)
  const activeSchedule = schedule.filter((item: any) => item.status !== 'Selesai');
  const historySchedule = schedule.filter((item: any) => item.status === 'Selesai');

  // Group active schedule by date for better organization
  const groupedSchedule = activeSchedule.reduce((acc: any, item: any) => {
    const dateKey = item.tanggal || 'Tidak Diketahui';
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(item);
    return acc;
  }, {});

  // Group history by date
  const groupedHistory = historySchedule.reduce((acc: any, item: any) => {
    const dateKey = item.tanggal || 'Tidak Diketahui';
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(item);
    return acc;
  }, {});
  
  const totalWeddings = activeSchedule.length;
  
  // Calculate upcoming weddings (today and future) - FIXED
  const upcomingWeddings = activeSchedule.filter((item: any) => {
    if (!item.tanggal) return false;
    const itemDateStr = normalizeDate(item.tanggal);
    if (!itemDateStr) return false;
    
    // Compare date strings directly (YYYY-MM-DD format)
    // Dates are in format YYYY-MM-DD, so string comparison works
    return itemDateStr >= todayStr;
  }).length;
  
  // Calculate past weddings (before today) - FIXED
  const pastWeddings = activeSchedule.filter((item: any) => {
    if (!item.tanggal) return false;
    const itemDateStr = normalizeDate(item.tanggal);
    if (!itemDateStr) return false;
    
    // Compare date strings directly
    return itemDateStr < todayStr;
  }).length;
  
  // Calculate today's schedule count - FIXED
  const todaySchedule = activeSchedule.filter((item: any) => {
    if (!item.tanggal) return false;
    const itemDateStr = normalizeDate(item.tanggal);
    if (!itemDateStr) return false;
    
    // Compare dates exactly
    return itemDateStr === todayStr;
  }).length;
  
  // Debug statistics
  console.log('📊 Statistics:', {
    totalWeddings,
    upcomingWeddings,
    pastWeddings,
    todaySchedule,
    todayStr,
    scheduleDates: schedule.map((s: any) => normalizeDate(s.tanggal))
  });
  
  // Calculate utilization for today
  const todayUtilization = todaySchedule > 0 
    ? Math.min((todaySchedule / KAPASITAS_PER_PENGHULU_PER_HARI) * 100, 100) 
    : 0;

  // Open confirmation dialog with selected registration
  const handleOpenConfirmComplete = (item: any) => {
    setConfirmDialog({ open: true, target: item });
  };

  // Execute completion after confirmation
  const handleCompleteMarriage = async () => {
    if (!confirmDialog.target) return;

    const regId = confirmDialog.target.id || confirmDialog.target.nomor_pendaftaran;
    setCompletingId(regId);
    try {
      await completeMarriage(regId, {
        catatan: 'Pernikahan telah dilaksanakan dengan baik'
      });

      toast({
        title: 'Pernikahan selesai',
        description: `${confirmDialog.target.nomor_pendaftaran || regId} berhasil ditandai selesai.`,
      });

      // Update local state immediately
      setSchedule((prev) => 
        prev.map((s: any) => 
          (s.id === regId || s.nomor_pendaftaran === regId)
            ? { ...s, status: 'Selesai' }
            : s
        )
      );

      // Optional refresh for fresh data
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      console.error('Error completing marriage:', error);
      const errorMessage = handleApiError(error);
      toast({
        title: 'Gagal menandai selesai',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setCompletingId(null);
      setConfirmDialog({ open: false, target: null });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Jadwal Akad Nikah</h1>
        <p className="text-gray-600 mt-2">Semua jadwal pernikahan yang ditugaskan kepada Anda</p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Jadwal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{totalWeddings}</p>
            <p className="text-xs text-gray-500 mt-1">Semua jadwal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Akan Datang</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{upcomingWeddings}</p>
            <p className="text-xs text-gray-500 mt-1">Hari ini & mendatang</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Sudah Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-600">{historySchedule.length}</p>
            <p className="text-xs text-gray-500 mt-1">Pernikahan selesai</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Kapasitas Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-purple-600">
                {todaySchedule} / {KAPASITAS_PER_PENGHULU_PER_HARI}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    todayUtilization >= 100
                      ? 'bg-red-500'
                      : todayUtilization >= 66
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(todayUtilization, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">
                {todayUtilization.toFixed(0)}% dari kapasitas harian Anda
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Maksimal {KAPASITAS_PER_PENGHULU_PER_HARI} pernikahan per hari
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Active Schedule and History */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="gap-2">
            <Calendar className="h-4 w-4" />
            Jadwal Aktif ({activeSchedule.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Riwayat ({historySchedule.length})
          </TabsTrigger>
        </TabsList>

        {/* Active Schedule Tab */}
        <TabsContent value="active" className="space-y-6">
          {loading ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">Memuat jadwal...</p>
                </div>
              </CardContent>
            </Card>
          ) : activeSchedule.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">Tidak ada jadwal yang ditugaskan</p>
                  <p className="text-gray-400 text-sm mt-2">Jadwal akan muncul di sini setelah Kepala KUA menugaskan Anda</p>
                </div>
              </CardContent>
            </Card>
          ) : (
          Object.keys(groupedSchedule)
            .sort((a, b) => {
              // Sort dates: past dates first, then future dates
              const dateA = new Date(a);
              const dateB = new Date(b);
              return dateA.getTime() - dateB.getTime();
            })
            .map((dateKey) => {
              const dateItems = groupedSchedule[dateKey];
              
              // Normalize date for comparison
              let normalizedDateKey = dateKey;
              if (normalizedDateKey.includes('T')) {
                normalizedDateKey = normalizedDateKey.split('T')[0];
              }
              if (normalizedDateKey.includes('Z')) {
                normalizedDateKey = normalizedDateKey.split('Z')[0].split('T')[0];
              }
              
              // Get today's date in YYYY-MM-DD format
              const today = new Date();
              const todayStr = today.toISOString().split('T')[0];
              
              const weddingDate = new Date(normalizedDateKey + 'T00:00');
              const isPastDate = isPast(weddingDate) && normalizedDateKey !== todayStr;
              const isTodayDate = normalizedDateKey === todayStr;
              
              return (
                <div key={dateKey} className="space-y-3">
                  {/* Date Header */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <div className="flex items-center gap-2 px-4">
                      <Calendar className={`h-5 w-5 ${isPastDate ? 'text-gray-400' : isTodayDate ? 'text-green-600' : 'text-blue-600'}`} />
                      <h2 className={`text-lg font-semibold ${isPastDate ? 'text-gray-500' : isTodayDate ? 'text-green-700' : 'text-blue-700'}`}>
                        {normalizedDateKey ? (() => {
                          try {
                            return format(parseISO(normalizedDateKey), 'EEEE, dd MMMM yyyy', { locale: IndonesianLocale });
                          } catch (e) {
                            return normalizedDateKey;
                          }
                        })() : 'Tanggal Tidak Diketahui'}
                      </h2>
                      <Badge variant={isPastDate ? 'outline' : isTodayDate ? 'default' : 'secondary'} className="ml-2">
                        {dateItems.length} {dateItems.length === 1 ? 'jadwal' : 'jadwal'}
                      </Badge>
                    </div>
                    <div className="flex-1 border-t border-gray-300"></div>
                  </div>

                  {/* Schedule Items for this date */}
                  <div className="space-y-3">
                    {dateItems.map((item: any, index: number) => {
                      // Normalize date for comparison
                      let itemDateStr = item.tanggal || '';
                      if (itemDateStr.includes('T')) {
                        itemDateStr = itemDateStr.split('T')[0];
                      }
                      if (itemDateStr.includes('Z')) {
                        itemDateStr = itemDateStr.split('Z')[0].split('T')[0];
                      }
                      
                      const today = new Date();
                      const todayStr = today.toISOString().split('T')[0];
                      const isTodayWedding = itemDateStr === todayStr;
                      
                      const weddingDateTime = new Date(item.tanggal + 'T' + (item.waktu || '00:00'));
                      const isPastWedding = isPast(weddingDateTime) && !isTodayWedding;
                      
                      return (
                        <Card 
                          key={item.id || index} 
                          className={`hover:shadow-md transition ${
                            isPastWedding ? 'opacity-75 bg-gray-50' : isTodayWedding ? 'border-green-300 bg-green-50/30' : ''
                          }`}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg">
                                  {item.calon_suami && item.calon_suami !== 'Nama tidak tersedia' && item.calon_istri && item.calon_istri !== 'Nama tidak tersedia' 
                                    ? `${item.calon_suami} & ${item.calon_istri}`
                                    : (
                                      <span className="text-gray-600">
                                        {item.nomor_pendaftaran || item.id}
                                      </span>
                                    )
                                  }
                                </CardTitle>
                                <CardDescription className="mt-1">
                                  {item.calon_suami && item.calon_suami !== 'Nama tidak tersedia' && item.calon_istri && item.calon_istri !== 'Nama tidak tersedia'
                                    ? item.nomor_pendaftaran || item.id
                                    : (
                                      <span className="text-amber-600 text-xs">
                                        ⚠️ Data nama calon pengantin tidak tersedia dari API backend
                                      </span>
                                    )
                                  }
                                </CardDescription>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge 
                                  variant={isPastWedding ? 'outline' : item.status === 'Selesai' ? 'default' : 'secondary'}
                                  className={isPastWedding ? 'text-gray-500' : ''}
                                >
                                  {item.status}
                                </Badge>
                                {isTodayWedding && (
                                  <Badge className="bg-green-600 text-white">Hari Ini</Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Tanggal & Waktu */}
                            <div className="flex items-start gap-4">
                              <Clock className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-gray-600">Tanggal & Waktu Akad</p>
                                <p className="font-medium text-lg mt-1">
                                  {item.tanggal ? (() => {
                                    try {
                                      const dateStr = item.tanggal.includes('T') ? item.tanggal.split('T')[0] : item.tanggal;
                                      return format(parseISO(dateStr), 'EEEE, dd MMMM yyyy', { locale: IndonesianLocale });
                                    } catch (e) {
                                      return item.tanggal;
                                    }
                                  })() : 'Tanggal tidak diketahui'}
                                  {item.waktu && ` • ${item.waktu} WITA`}
                                </p>
                              </div>
                            </div>

                            {/* Lokasi */}
                            <div className="flex items-start gap-4">
                              <MapPin className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm text-gray-600">Tempat</p>
                                <p className="font-medium mt-1">{item.tempat || 'Tidak disebutkan'}</p>
                                {item.alamat && (
                                  <p className="text-sm text-gray-500 mt-1">{item.alamat}</p>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 border-t space-y-2">
                              {/* Button to view location details (especially for outside KUA) */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const regId = item.id || item.nomor_pendaftaran;
                                  setExpandedRegistrations(prev => {
                                    const newSet = new Set(prev);
                                    if (newSet.has(regId)) {
                                      newSet.delete(regId);
                                    } else {
                                      newSet.add(regId);
                                    }
                                    return newSet;
                                  });
                                }}
                                className="w-full"
                              >
                                {expandedRegistrations.has(item.id || item.nomor_pendaftaran) ? (
                                  <>
                                    <ChevronUp className="h-4 w-4 mr-2" />
                                    Sembunyikan Peta Lokasi
                                  </>
                                ) : (
                                  <>
                                    <MapPin className="h-4 w-4 mr-2" />
                                    Lihat Peta Lokasi
                                  </>
                                )}
                              </Button>

                              {/* Complete Marriage Button - Only show if not already completed */}
                              {item.status !== 'Selesai' && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleOpenConfirmComplete(item)}
                                  disabled={completingId === (item.id || item.nomor_pendaftaran)}
                                  className="w-full bg-green-600 hover:bg-green-700"
                                >
                                  {completingId === (item.id || item.nomor_pendaftaran) ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Memproses...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Tandai Selesai
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>

                            {/* Location Details with Map (expanded) */}
                            {expandedRegistrations.has(item.id || item.nomor_pendaftaran) && (
                              <div className="pt-4 border-t">
                                <PenghuluLocationView
                                  registrationId={item.id || item.nomor_pendaftaran}
                                />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">Memuat riwayat...</p>
                </div>
              </CardContent>
            </Card>
          ) : historySchedule.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <History className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">Tidak ada riwayat pernikahan</p>
                  <p className="text-gray-400 text-sm mt-2">Riwayat pernikahan yang sudah selesai akan muncul di sini</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {Object.keys(groupedHistory)
                .sort((a, b) => {
                  // Sort dates: newest first
                  const dateA = new Date(a);
                  const dateB = new Date(b);
                  return dateB.getTime() - dateA.getTime();
                })
                .map((dateKey) => {
                  const dateItems = groupedHistory[dateKey];
                  
                  // Normalize date for comparison
                  let normalizedDateKey = dateKey;
                  if (normalizedDateKey.includes('T')) {
                    normalizedDateKey = normalizedDateKey.split('T')[0];
                  }
                  if (normalizedDateKey.includes('Z')) {
                    normalizedDateKey = normalizedDateKey.split('Z')[0].split('T')[0];
                  }
                  
                  return (
                    <div key={dateKey} className="space-y-2">
                      {/* Date Header */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <div className="flex items-center gap-2 px-4">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <h3 className="text-sm font-medium text-gray-500">
                            {normalizedDateKey ? (() => {
                              try {
                                return format(parseISO(normalizedDateKey), 'EEEE, dd MMMM yyyy', { locale: IndonesianLocale });
                              } catch (e) {
                                return normalizedDateKey;
                              }
                            })() : 'Tanggal Tidak Diketahui'}
                          </h3>
                        </div>
                        <div className="flex-1 border-t border-gray-300"></div>
                      </div>

                      {/* History Items - Simple List */}
                      <div className="space-y-2">
                        {dateItems.map((item: any, index: number) => (
                          <Card 
                            key={item.id || index} 
                            className="hover:shadow-sm transition bg-gray-50"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-sm truncate">
                                      {item.calon_suami && item.calon_suami !== 'Nama tidak tersedia' && item.calon_istri && item.calon_istri !== 'Nama tidak tersedia' 
                                        ? `${item.calon_suami} & ${item.calon_istri}`
                                        : item.nomor_pendaftaran || item.id
                                      }
                                    </p>
                                    <Badge variant="outline" className="text-xs">
                                      Selesai
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    {item.nomor_pendaftaran || item.id}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {item.waktu || '-'} WITA
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {item.tempat || 'Tidak disebutkan'}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedHistoryItem(item);
                                    setIsDetailDialogOpen(true);
                                  }}
                                  className="ml-4"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Detail
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog for History */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pernikahan</DialogTitle>
            <DialogDescription>
              Informasi lengkap pernikahan yang sudah selesai
            </DialogDescription>
          </DialogHeader>
          
          {selectedHistoryItem && (
            <div className="space-y-6 mt-4">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informasi Calon Pengantin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Calon Suami</p>
                      <p className="text-base font-medium mt-1">
                        {selectedHistoryItem.calon_suami || 'Nama tidak tersedia'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Calon Istri</p>
                      <p className="text-base font-medium mt-1">
                        {selectedHistoryItem.calon_istri || 'Nama tidak tersedia'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nomor Pendaftaran</p>
                    <p className="text-base font-medium mt-1">
                      {selectedHistoryItem.nomor_pendaftaran || selectedHistoryItem.id}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Schedule Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Jadwal Pernikahan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tanggal Akad</p>
                      <p className="text-base font-medium mt-1">
                        {selectedHistoryItem.tanggal ? (() => {
                          try {
                            const dateStr = selectedHistoryItem.tanggal.includes('T') 
                              ? selectedHistoryItem.tanggal.split('T')[0] 
                              : selectedHistoryItem.tanggal;
                            return format(parseISO(dateStr), 'EEEE, dd MMMM yyyy', { locale: IndonesianLocale });
                          } catch (e) {
                            return selectedHistoryItem.tanggal;
                          }
                        })() : 'Tanggal tidak diketahui'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Waktu Akad</p>
                      <p className="text-base font-medium mt-1">
                        {selectedHistoryItem.waktu ? `${selectedHistoryItem.waktu} WITA` : '-'}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Tempat</p>
                      <p className="text-base font-medium mt-1">
                        {selectedHistoryItem.tempat || 'Tidak disebutkan'}
                      </p>
                      {selectedHistoryItem.alamat && (
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedHistoryItem.alamat}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location Details */}
              <PenghuluLocationView
                registrationId={selectedHistoryItem.id || selectedHistoryItem.nomor_pendaftaran}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for marking marriage complete */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => {
          if (!open) setConfirmDialog({ open: false, target: null });
        }}
      >
        <AlertDialogContent className="sm:max-w-lg">
          <AlertDialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-700">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <AlertDialogTitle className="text-lg">Tandai pernikahan selesai?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-muted-foreground">
                  Tindakan ini akan menandai pernikahan sebagai selesai dan memindahkannya ke riwayat.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          {confirmDialog.target && (
            <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{confirmDialog.target.calon_suami || confirmDialog.target.calon_laki_laki?.nama_dan_bin || 'Calon suami'}</p>
              <p className="font-medium text-foreground">{confirmDialog.target.calon_istri || confirmDialog.target.calon_perempuan?.nama_dan_binti || 'Calon istri'}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Nomor pendaftaran: {confirmDialog.target.nomor_pendaftaran || confirmDialog.target.id}
              </p>
            </div>
          )}

          <AlertDialogFooter className="pt-2">
            <AlertDialogCancel disabled={!!completingId}>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700"
              onClick={handleCompleteMarriage}
              disabled={!!completingId}
            >
              {completingId ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menandai...
                </div>
              ) : (
                'Ya, tandai selesai'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}