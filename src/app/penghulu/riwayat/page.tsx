'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, AlertCircle, Clock, MapPin, Loader2, History, Eye } from 'lucide-react';
import { getAssignedRegistrations } from '@/lib/simnikah-api';
import { format, parseISO } from 'date-fns';
import { id as IndonesianLocale } from 'date-fns/locale';
import { PenghuluLocationView } from '@/components/kuaku/PenghuluLocationView';

export default function RiwayatPage() {
  const [historySchedule, setHistorySchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      setError('');

      try {
        // Get all assigned registrations for this penghulu
        const response = await getAssignedRegistrations();
        
        console.log('📥 Raw API Response:', response);
        
        // Handle response structure from API sesuai dokumentasi
        let registrations: any[] = [];
        
        if (response?.success && response?.data?.registrations) {
          registrations = Array.isArray(response.data.registrations) ? response.data.registrations : [];
        } else if (response?.data && Array.isArray(response.data)) {
          registrations = response.data;
        } else if (Array.isArray(response)) {
          registrations = response;
        } else if (response?.data && typeof response.data === 'object' && response.data.registrations) {
          registrations = Array.isArray(response.data.registrations) ? response.data.registrations : [];
        } else {
          console.warn('⚠️ Unknown response structure:', response);
        }
        
        // Map to schedule format and filter only completed ones
        const mappedSchedule = registrations
          .map((reg: any) => {
            // Normalize tanggal_nikah format
            let tanggal = reg.tanggal_nikah || '';
            if (tanggal) {
              if (tanggal.includes('T')) {
                tanggal = tanggal.split('T')[0];
              }
              if (tanggal.includes('Z')) {
                tanggal = tanggal.split('Z')[0].split('T')[0];
              }
            }
            
            // Extract calon suami name
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
              }
            } else if (reg.calon_laki_laki?.nama_dan_bin) {
              calonSuami = reg.calon_laki_laki.nama_dan_bin;
            } else if (reg.groomName) {
              calonSuami = reg.groomName;
            } else if (reg.groomFullName) {
              calonSuami = reg.groomFullName;
            }
            
            // Extract calon istri name
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
              }
            } else if (reg.calon_perempuan?.nama_dan_binti) {
              calonIstri = reg.calon_perempuan.nama_dan_binti;
            } else if (reg.brideName) {
              calonIstri = reg.brideName;
            } else if (reg.brideFullName) {
              calonIstri = reg.brideFullName;
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
          .filter((item: any) => item.tanggal && item.status === 'Selesai') // Only completed
          .sort((a: any, b: any) => {
            // Sort by date, newest first
            const dateA = new Date(a.tanggal + 'T' + (a.waktu || '00:00'));
            const dateB = new Date(b.tanggal + 'T' + (b.waktu || '00:00'));
            return dateB.getTime() - dateA.getTime();
          });
        
        setHistorySchedule(mappedSchedule);
      } catch (err: any) {
        setError('Gagal memuat riwayat. Silakan coba lagi.');
        console.error('Error loading history:', err);
        setHistorySchedule([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  // Group history by date
  const groupedHistory = historySchedule.reduce((acc: any, item: any) => {
    const dateKey = item.tanggal || 'Tidak Diketahui';
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Riwayat Pernikahan</h1>
        <p className="text-gray-600 mt-2">Pernikahan yang sudah dilaksanakan</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Riwayat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{historySchedule.length}</p>
            <p className="text-xs text-gray-500 mt-1">Pernikahan selesai</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {historySchedule.filter((item: any) => {
                if (!item.tanggal) return false;
                const itemDate = new Date(item.tanggal);
                const now = new Date();
                return itemDate.getMonth() === now.getMonth() && 
                       itemDate.getFullYear() === now.getFullYear();
              }).length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Pernikahan bulan ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tahun Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              {historySchedule.filter((item: any) => {
                if (!item.tanggal) return false;
                const itemDate = new Date(item.tanggal);
                const now = new Date();
                return itemDate.getFullYear() === now.getFullYear();
              }).length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Pernikahan tahun ini</p>
          </CardContent>
        </Card>
      </div>

      {/* History List */}
      <div className="space-y-4">
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
                        <Badge variant="outline" className="ml-2">
                          {dateItems.length} {dateItems.length === 1 ? 'pernikahan' : 'pernikahan'}
                        </Badge>
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
      </div>

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
    </div>
  );
}

