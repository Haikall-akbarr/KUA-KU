'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar, AlertCircle, Clock, MapPin } from 'lucide-react';
import { getPenguluSchedule, cacheSchedule, getCachedSchedule, PenguluSchedule } from '@/lib/penghulu-service';

export default function JadwalPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [schedule, setSchedule] = useState<PenguluSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSchedule = async () => {
      setLoading(true);
      setError('');

      try {
        // Try to get from API
        const data = await getPenguluSchedule(selectedDate);
        setSchedule(data);
        cacheSchedule(selectedDate, data);
      } catch (err) {
        // Fall back to cache
        const cached = getCachedSchedule(selectedDate);
        if (cached.length > 0) {
          setSchedule(cached);
          setError('Menampilkan data dari cache (offline mode)');
        } else {
          setError('Gagal memuat jadwal. Silakan coba lagi.');
          console.error('Error loading schedule:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [selectedDate]);

  const handlePreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const displayDate = new Date(selectedDate).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const capacityPercentage =
    schedule.length > 0
      ? Math.round(
          (schedule.reduce((sum, s) => sum + s.jumlah_pernikahan, 0) /
            schedule.reduce((sum, s) => sum + s.kapasitas, 0)) *
            100
        )
      : 0;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jadwal Akad Nikah</h1>
          <p className="text-gray-600 mt-2">Lihat jadwal pernikahan yang ditugaskan</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            className={error.includes('cache') ? 'border-yellow-500 bg-yellow-50' : 'border-red-500 bg-red-50'}
          >
            <AlertCircle
              className={error.includes('cache') ? 'h-4 w-4 text-yellow-600' : 'h-4 w-4 text-red-600'}
            />
            <AlertTitle className={error.includes('cache') ? 'text-yellow-900' : 'text-red-900'}>
              {error.includes('cache') ? 'Mode Offline' : 'Error'}
            </AlertTitle>
            <AlertDescription className={error.includes('cache') ? 'text-yellow-700' : 'text-red-700'}>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Date Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {displayDate}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePreviousDay}>
                  Sebelumnya
                </Button>
                <Button variant="outline" size="sm" onClick={handleToday}>
                  Hari Ini
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextDay}>
                  Selanjutnya
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Capacity Summary */}
        {schedule.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Kapasitas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Pernikahan Terjadwal</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {schedule.reduce((sum, s) => sum + s.jumlah_pernikahan, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Kapasitas</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {schedule.reduce((sum, s) => sum + s.kapasitas, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Utilisasi</p>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-2xl font-bold text-purple-600">{capacityPercentage}%</p>
                    <Badge
                      className={`${
                        capacityPercentage > 80
                          ? 'bg-red-100 text-red-800'
                          : capacityPercentage > 50
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {capacityPercentage > 80 ? 'Penuh' : capacityPercentage > 50 ? 'Padat' : 'Tersedia'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    capacityPercentage > 80
                      ? 'bg-red-500'
                      : capacityPercentage > 50
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schedule List */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">Memuat jadwal...</p>
                </div>
              </CardContent>
            </Card>
          ) : schedule.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Tidak ada jadwal untuk tanggal ini</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            schedule.map((item, index) => (
              <Card key={item.id} className="hover:shadow-lg transition">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Sesi {index + 1}</CardTitle>
                      <CardDescription className="mt-2">
                        ID: {item.id}
                      </CardDescription>
                    </div>
                    <Badge
                      className={`${
                        (item.jumlah_pernikahan / item.kapasitas) * 100 > 80
                          ? 'bg-red-100 text-red-800'
                          : (item.jumlah_pernikahan / item.kapasitas) * 100 > 50
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {item.jumlah_pernikahan}/{item.kapasitas}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Waktu */}
                  <div className="flex items-start gap-4">
                    <Clock className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Waktu Akad</p>
                      <p className="font-medium text-lg mt-1">
                        {item.waktu_mulai} - {item.waktu_selesai}
                      </p>
                    </div>
                  </div>

                  {/* Lokasi */}
                  {item.lokasi && (
                    <div className="flex items-start gap-4">
                      <MapPin className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Lokasi</p>
                        <p className="font-medium mt-1">{item.lokasi}</p>
                      </div>
                    </div>
                  )}

                  {/* Kapasitas */}
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-600 mb-2">Penggunaan Kapasitas</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {item.jumlah_pernikahan} / {item.kapasitas} Pernikahan
                      </span>
                      <span className="text-sm font-bold text-blue-600">
                        {Math.round((item.jumlah_pernikahan / item.kapasitas) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          (item.jumlah_pernikahan / item.kapasitas) * 100 > 80
                            ? 'bg-red-500'
                            : (item.jumlah_pernikahan / item.kapasitas) * 100 > 50
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            (item.jumlah_pernikahan / item.kapasitas) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Tanggal */}
                  <div className="text-sm text-gray-500 pt-2 border-t">
                    Tanggal: {new Date(item.tanggal).toLocaleDateString('id-ID')}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
}