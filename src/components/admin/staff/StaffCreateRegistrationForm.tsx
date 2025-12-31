'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { id as IndonesianLocale } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { createRegistrationForUser, getCalendarAvailability, getAvailableTimeSlots } from '@/lib/simnikah-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, CalendarIcon, AlertCircle, CheckCircle2, User, Key, Mail, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SimpleAddressSelector } from '@/components/kuaku/SimpleAddressSelector';

// Valid kelurahan list (Kecamatan Banjarmasin Utara)
const VALID_KELURAHAN = [
  'Alalak Utara',
  'Alalak Tengah',
  'Alalak Selatan',
  'Antasan Kecil Timur',
  'Kuin Utara',
  'Pangeran',
  'Sungai Miai',
  'Sungai Andai',
  'Surgi Mufti'
];

// Valid hubungan wali (Urutan Wali Nasab)
const HUBUNGAN_WALI = [
  { value: 'Ayah Kandung', label: 'Ayah Kandung' },
  { value: 'Kakek', label: 'Kakek' },
  { value: 'Saudara Laki-Laki Kandung', label: 'Saudara Laki-Laki Kandung' },
  { value: 'Saudara Laki-Laki Seayah', label: 'Saudara Laki-Laki Seayah' },
  { value: 'Keponakan Laki-Laki', label: 'Keponakan Laki-Laki' },
  { value: 'Paman Kandung', label: 'Paman Kandung' },
  { value: 'Paman Seayah', label: 'Paman Seayah' },
  { value: 'Sepupu Laki-Laki', label: 'Sepupu Laki-Laki' },
  { value: 'Wali Hakim', label: 'Wali Hakim' },
  { value: 'Lainnya', label: 'Lainnya' }
];

// Education levels
const EDUCATION_LEVELS = [
  'SD',
  'SMP',
  'SMA',
  'S1',
  'S2',
  'S3'
];

// Form schema (internal - dengan field terpisah)
const formSchema = z.object({
  calon_laki_laki: z.object({
    nama: z.string().min(2, 'Nama minimal 2 karakter'),
    bin: z.string().min(2, 'Bin minimal 2 karakter'),
    pendidikan_akhir: z.string().min(1, 'Pilih pendidikan akhir'),
    umur: z.number().min(19, 'Umur minimal 19 tahun').max(100, 'Umur maksimal 100 tahun'),
  }),
  calon_perempuan: z.object({
    nama: z.string().min(2, 'Nama minimal 2 karakter'),
    binti: z.string().min(2, 'Binti minimal 2 karakter'),
    pendidikan_akhir: z.string().min(1, 'Pilih pendidikan akhir'),
    umur: z.number().min(19, 'Umur minimal 19 tahun').max(100, 'Umur maksimal 100 tahun'),
  }),
  lokasi_nikah: z.object({
    tempat_nikah: z.enum(['Di KUA', 'Di Luar KUA']),
    tanggal_nikah: z.string().min(1, 'Pilih tanggal nikah'),
    waktu_nikah: z.string().min(1, 'Pilih waktu nikah'),
    // Alamat dan koordinat digabung menjadi satu field wajib
    alamat_nikah: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    // Field ini akan diisi otomatis dari geolocation
    alamat_detail: z.string().optional(),
    kelurahan: z.string().optional(),
  }).refine((data) => {
    // Untuk Di Luar KUA, alamat dan koordinat WAJIB
    if (data.tempat_nikah === 'Di Luar KUA') {
      return data.alamat_nikah && data.alamat_nikah.length > 0;
    }
    return true;
  }, {
    message: 'Alamat nikah wajib diisi untuk nikah di luar KUA',
    path: ['alamat_nikah'],
  }).refine((data) => {
    // Koordinat WAJIB untuk Di Luar KUA
    if (data.tempat_nikah === 'Di Luar KUA') {
      return data.latitude !== undefined && data.longitude !== undefined && 
             data.latitude !== null && data.longitude !== null;
    }
    return true;
  }, {
    message: 'Koordinat lokasi wajib diisi. Silakan pilih lokasi di peta atau cari alamat.',
    path: ['latitude'],
  }),
  wali_nikah: z.object({
    nama: z.string().min(2, 'Nama wali minimal 2 karakter'),
    bin: z.string().min(2, 'Bin minimal 2 karakter'),
    hubungan_wali: z.string().min(1, 'Pilih hubungan wali'),
  }),
});

type FormData = z.infer<typeof formSchema>;

interface StaffCreateRegistrationFormProps {
  onSuccess?: () => void;
}

export function StaffCreateRegistrationForm({ onSuccess }: StaffCreateRegistrationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [calendarData, setCalendarData] = useState<any>(null);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [createdAccount, setCreatedAccount] = useState<any>(null);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calon_laki_laki: {
        nama: '',
        bin: '',
        pendidikan_akhir: '',
        umur: 19,
      },
      calon_perempuan: {
        nama: '',
        binti: '',
        pendidikan_akhir: '',
        umur: 19,
      },
      lokasi_nikah: {
        tempat_nikah: 'Di KUA',
        tanggal_nikah: '',
        waktu_nikah: '',
        alamat_nikah: '',
        alamat_detail: '',
        kelurahan: '',
        latitude: undefined,
        longitude: undefined,
      },
      wali_nikah: {
        nama: '',
        bin: '',
        hubungan_wali: '',
      },
    },
  });

  const tempatNikah = form.watch('lokasi_nikah.tempat_nikah');

  // Load calendar availability
  useEffect(() => {
    const loadCalendar = async () => {
      setLoadingCalendar(true);
      try {
        const month = currentMonth.getMonth() + 1;
        const year = currentMonth.getFullYear();
        const data = await getCalendarAvailability(month, year);
        setCalendarData(data);
      } catch (error: any) {
        console.error('Error loading calendar:', error);
        toast({
          title: 'Error',
          description: 'Gagal memuat kalender ketersediaan',
          variant: 'destructive',
        });
      } finally {
        setLoadingCalendar(false);
      }
    };

    loadCalendar();
  }, [currentMonth, toast]);

  // Load time slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      const loadTimeSlots = async () => {
        setLoadingTimeSlots(true);
        try {
          const dateStr = format(selectedDate, 'yyyy-MM-dd');
          const data = await getAvailableTimeSlots(dateStr);
          setTimeSlots(data.data.time_slots || []);
          form.setValue('lokasi_nikah.tanggal_nikah', dateStr);
          setSelectedTime('');
          form.setValue('lokasi_nikah.waktu_nikah', '');
        } catch (error: any) {
          console.error('Error loading time slots:', error);
          toast({
            title: 'Error',
            description: 'Gagal memuat slot waktu',
            variant: 'destructive',
          });
        } finally {
          setLoadingTimeSlots(false);
        }
      };

      loadTimeSlots();
    }
  }, [selectedDate, form, toast]);

  // Reset selected time when tempat nikah changes
  useEffect(() => {
    if (tempatNikah) {
      setSelectedTime('');
      form.setValue('lokasi_nikah.waktu_nikah', '');
    }
  }, [tempatNikah, form]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Validasi data wali nikah sebelum dikirim
      if (!data.wali_nikah.nama || data.wali_nikah.nama.trim() === '') {
        toast({
          title: 'Validasi Gagal',
          description: 'Nama wali nikah tidak boleh kosong',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!data.wali_nikah.bin || data.wali_nikah.bin.trim() === '') {
        toast({
          title: 'Validasi Gagal',
          description: 'Bin wali nikah tidak boleh kosong',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!data.wali_nikah.hubungan_wali || data.wali_nikah.hubungan_wali.trim() === '') {
        toast({
          title: 'Validasi Gagal',
          description: 'Hubungan wali tidak boleh kosong',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      // Gabungkan nama dan bin/binti sebelum dikirim ke API
      const waliNamaDanBin = `${data.wali_nikah.nama.trim()} bin ${data.wali_nikah.bin.trim()}`;
      
      const apiData = {
        calon_laki_laki: {
          nama_dan_bin: `${data.calon_laki_laki.nama} bin ${data.calon_laki_laki.bin}`,
          pendidikan_akhir: data.calon_laki_laki.pendidikan_akhir,
          umur: data.calon_laki_laki.umur,
        },
        calon_perempuan: {
          nama_dan_binti: `${data.calon_perempuan.nama} binti ${data.calon_perempuan.binti}`,
          pendidikan_akhir: data.calon_perempuan.pendidikan_akhir,
          umur: data.calon_perempuan.umur,
        },
        lokasi_nikah: {
          ...data.lokasi_nikah,
          alamat_detail: data.lokasi_nikah.alamat_detail || undefined,
          ...(data.lokasi_nikah.latitude && data.lokasi_nikah.longitude && {
            latitude: data.lokasi_nikah.latitude,
            longitude: data.lokasi_nikah.longitude,
          }),
        },
        wali_nikah: {
          nama_dan_bin: waliNamaDanBin,
          hubungan_wali: data.wali_nikah.hubungan_wali.trim(),
        },
      };
      
      // console.log('📤 Sending API data:', JSON.stringify(apiData, null, 2));
      // console.log('📤 Wali Nikah data:', apiData.wali_nikah);
      
      const response = await createRegistrationForUser(apiData);
      
      // Simpan informasi akun yang dibuat
      setCreatedAccount(response.data);
      setIsAccountDialogOpen(true);
      
      // Reset form
      form.reset();
      setSelectedDate(undefined);
      setSelectedTime('');
      
      toast({
        title: 'Berhasil!',
        description: 'Pendaftaran nikah berhasil dibuat dan disetujui',
        variant: 'default',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error response headers:', error.response?.headers);
      
      // Extract detailed error message
      let errorMessage = 'Gagal membuat pendaftaran';
      let errorDetails = '';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Log full error data for debugging
        console.error('Full error data:', JSON.stringify(errorData, null, 2));
        
        // Check for different error formats
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
        
        // Get detailed error information
        if (errorData.details) {
          errorDetails = typeof errorData.details === 'string' 
            ? errorData.details 
            : JSON.stringify(errorData.details, null, 2);
        } else if (errorData.errors) {
          errorDetails = typeof errorData.errors === 'string'
            ? errorData.errors
            : JSON.stringify(errorData.errors, null, 2);
        } else if (errorData.data) {
          // Sometimes error details are in data field
          errorDetails = typeof errorData.data === 'string'
            ? errorData.data
            : JSON.stringify(errorData.data, null, 2);
        }
        
        // If no specific message, show the whole error object
        if (!errorMessage || errorMessage === 'Gagal membuat pendaftaran') {
          errorMessage = `Error ${error.response.status}: ${JSON.stringify(errorData, null, 2)}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show error toast with details
      const fullErrorMessage = errorDetails 
        ? `${errorMessage}\n\nDetail:\n${errorDetails}` 
        : errorMessage;
      
      toast({
        title: 'Gagal',
        description: fullErrorMessage,
        variant: 'destructive',
        duration: 15000, // Show for 15 seconds to read details
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get date status from calendar data
  const getDateStatus = (date: Date): 'available' | 'partial' | 'full' | 'unknown' => {
    if (!calendarData) return 'unknown';
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = calendarData.data?.calendar?.find((h: any) => h.tanggal_str === dateStr);
    if (!dayData) return 'unknown';
    if (dayData.status === 'Tersedia' || dayData.status === 'Semua Tersedia') return 'available';
    if (dayData.status === 'Sebagian Tersedia') return 'partial';
    if (dayData.status === 'Penuh') return 'full';
    return 'unknown';
  };

  // Disable dates that are full or in the past
  const isDateDisabled = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    
    const status = getDateStatus(date);
    return status === 'full';
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Berhasil',
      description: `${label} berhasil disalin ke clipboard`,
      variant: 'default',
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Buat Pendaftaran untuk Calon Pengantin</CardTitle>
          <CardDescription>
            Formulir ini akan membuat pendaftaran nikah dan akun user otomatis untuk calon pengantin.
            Pendaftaran akan otomatis berstatus "Disetujui".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Calon Laki-laki */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Data Calon Suami</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nama_laki">Nama Lengkap *</Label>
                  <Input
                    id="nama_laki"
                    placeholder="Ahmad Wijaya"
                    {...form.register('calon_laki_laki.nama')}
                  />
                  {form.formState.errors.calon_laki_laki?.nama && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.calon_laki_laki.nama.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bin_laki">Bin *</Label>
                  <Input
                    id="bin_laki"
                    placeholder="Abdullah"
                    {...form.register('calon_laki_laki.bin')}
                  />
                  {form.formState.errors.calon_laki_laki?.bin && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.calon_laki_laki.bin.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pendidikan_laki">Pendidikan Akhir *</Label>
                  <Select
                    value={form.watch('calon_laki_laki.pendidikan_akhir')}
                    onValueChange={(value) => form.setValue('calon_laki_laki.pendidikan_akhir', value)}
                  >
                    <SelectTrigger id="pendidikan_laki">
                      <SelectValue placeholder="Pilih pendidikan" />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.calon_laki_laki?.pendidikan_akhir && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.calon_laki_laki.pendidikan_akhir.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="umur_laki">Umur *</Label>
                  <Input
                    id="umur_laki"
                    type="number"
                    min={19}
                    max={100}
                    {...form.register('calon_laki_laki.umur', { valueAsNumber: true })}
                  />
                  {form.formState.errors.calon_laki_laki?.umur && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.calon_laki_laki.umur.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Calon Perempuan */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Data Calon Istri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nama_perempuan">Nama Lengkap *</Label>
                  <Input
                    id="nama_perempuan"
                    placeholder="Siti Nurhaliza"
                    {...form.register('calon_perempuan.nama')}
                  />
                  {form.formState.errors.calon_perempuan?.nama && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.calon_perempuan.nama.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="binti_perempuan">Binti *</Label>
                  <Input
                    id="binti_perempuan"
                    placeholder="Muhammad"
                    {...form.register('calon_perempuan.binti')}
                  />
                  {form.formState.errors.calon_perempuan?.binti && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.calon_perempuan.binti.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pendidikan_perempuan">Pendidikan Akhir *</Label>
                  <Select
                    value={form.watch('calon_perempuan.pendidikan_akhir')}
                    onValueChange={(value) => form.setValue('calon_perempuan.pendidikan_akhir', value)}
                  >
                    <SelectTrigger id="pendidikan_perempuan">
                      <SelectValue placeholder="Pilih pendidikan" />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.calon_perempuan?.pendidikan_akhir && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.calon_perempuan.pendidikan_akhir.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="umur_perempuan">Umur *</Label>
                  <Input
                    id="umur_perempuan"
                    type="number"
                    min={19}
                    max={100}
                    {...form.register('calon_perempuan.umur', { valueAsNumber: true })}
                  />
                  {form.formState.errors.calon_perempuan?.umur && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.calon_perempuan.umur.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Wali Nikah */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Data Wali Nikah</h3>
              <p className="text-sm text-muted-foreground">
                Wali nikah wajib diisi untuk calon pengantin perempuan
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nama_wali">Nama Lengkap *</Label>
                  <Input
                    id="nama_wali"
                    placeholder="Abdullah"
                    {...form.register('wali_nikah.nama')}
                  />
                  {form.formState.errors.wali_nikah?.nama && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.wali_nikah.nama.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bin_wali">Bin *</Label>
                  <Input
                    id="bin_wali"
                    placeholder="Muhammad"
                    {...form.register('wali_nikah.bin')}
                  />
                  {form.formState.errors.wali_nikah?.bin && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.wali_nikah.bin.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hubungan_wali">Hubungan Wali *</Label>
                  <Select
                    value={form.watch('wali_nikah.hubungan_wali')}
                    onValueChange={(value) => form.setValue('wali_nikah.hubungan_wali', value)}
                  >
                    <SelectTrigger id="hubungan_wali">
                      <SelectValue placeholder="Pilih hubungan wali" />
                    </SelectTrigger>
                    <SelectContent>
                      {HUBUNGAN_WALI.map((hubungan) => (
                        <SelectItem key={hubungan.value} value={hubungan.value}>
                          {hubungan.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.wali_nikah?.hubungan_wali && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.wali_nikah.hubungan_wali.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Lokasi Nikah */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Lokasi dan Waktu Nikah</h3>
              
              <div className="space-y-2">
                <Label>Tempat Nikah *</Label>
                <Select
                  value={form.watch('lokasi_nikah.tempat_nikah')}
                  onValueChange={(value) => {
                    form.setValue('lokasi_nikah.tempat_nikah', value as 'Di KUA' | 'Di Luar KUA');
                    if (value === 'Di KUA') {
                      form.setValue('lokasi_nikah.alamat_nikah', '');
                      form.setValue('lokasi_nikah.kelurahan', '');
                      form.setValue('lokasi_nikah.latitude', undefined);
                      form.setValue('lokasi_nikah.longitude', undefined);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Di KUA">Di KUA</SelectItem>
                    <SelectItem value="Di Luar KUA">Di Luar KUA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {tempatNikah === 'Di Luar KUA' && (
                <div className="space-y-3">
                  <SimpleAddressSelector
                    value={form.watch('lokasi_nikah.alamat_nikah') || ''}
                    latitude={form.watch('lokasi_nikah.latitude') || null}
                    longitude={form.watch('lokasi_nikah.longitude') || null}
                    onLocationSelect={(location) => {
                      // Simpan alamat dan koordinat
                      form.setValue('lokasi_nikah.alamat_nikah', location.alamat);
                      form.setValue('lokasi_nikah.latitude', location.latitude);
                      form.setValue('lokasi_nikah.longitude', location.longitude);
                      
                      // Trigger validation
                      form.trigger('lokasi_nikah.latitude');
                      form.trigger('lokasi_nikah.alamat_nikah');
                    }}
                    disabled={isSubmitting}
                    error={
                      form.formState.errors.lokasi_nikah?.alamat_nikah?.message ||
                      form.formState.errors.lokasi_nikah?.latitude?.message ||
                      undefined
                    }
                  />
                  
                  {/* Alamat detail opsional */}
                  <div className="space-y-1.5">
                    <Label htmlFor="alamat_detail" className="text-sm">Detail Alamat (Opsional)</Label>
                    <Textarea
                      id="alamat_detail"
                      placeholder="RT 05 RW 02, Rumah Pengantin Perempuan"
                      {...form.register('lokasi_nikah.alamat_detail')}
                      className="min-h-[60px] text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Tanggal Nikah *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !selectedDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, 'PPP', { locale: IndonesianLocale })
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        if (date) {
                          const dateStr = format(date, 'yyyy-MM-dd');
                          form.setValue('lokasi_nikah.tanggal_nikah', dateStr);
                        }
                      }}
                      disabled={isDateDisabled}
                      month={currentMonth}
                      onMonthChange={setCurrentMonth}
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.lokasi_nikah?.tanggal_nikah && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.lokasi_nikah.tanggal_nikah.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Waktu Nikah *</Label>
                {!tempatNikah ? (
                  <p className="text-sm text-muted-foreground">
                    Pilih lokasi nikah terlebih dahulu
                  </p>
                ) : loadingTimeSlots ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="ml-2 text-sm">Memuat slot waktu...</span>
                  </div>
                ) : timeSlots.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((slot) => {
                        const isKUA = tempatNikah === 'Di KUA';
                        // Check for new structure: must have both kua and luar_kua objects (even if null/undefined)
                        const hasNewStructure = slot.kua !== undefined || slot.luar_kua !== undefined;
                        
                        let kuaCount = 0;
                        let luarKuaCount = 0;
                        let totalCount = 0;
                        let isAvailable = false;
                        let isDisabled = false;
                        
                        if (hasNewStructure) {
                          // New structure dengan kua dan luar_kua terpisah
                          kuaCount = slot.kua?.jumlah_total || 0;
                          luarKuaCount = slot.luar_kua?.jumlah_total || 0;
                          // Total count should be sum of both, but also check if API provides total field
                          totalCount = (slot as any).total?.jumlah_total ?? (kuaCount + luarKuaCount);
                          
                          if (isKUA) {
                            // Untuk KUA: bisa dipilih jika kua tersedia, kua < 1, DAN total < 3
                            const kuaAvailable = slot.kua?.tersedia !== false && kuaCount < 1;
                            const totalNotFull = totalCount < 3;
                            isAvailable = kuaAvailable && totalNotFull;
                            isDisabled = !isAvailable || kuaCount >= 1 || totalCount >= 3;
                          } else {
                            // Untuk Luar KUA: bisa dipilih jika luar_kua < 3 DAN total < 3
                            // PENTING: Untuk "Di Luar KUA", kita hanya perlu cek kapasitas, bukan tersedia
                            // karena tersedia bisa false jika ada booking di KUA, tapi luar KUA masih bisa
                            const luarKuaNotFull = luarKuaCount < 3;
                            const totalNotFull = totalCount < 3;
                            // Slot tersedia jika: luar_kua belum penuh DAN total belum penuh
                            // Jangan cek slot.luar_kua?.tersedia karena itu bisa false meskipun masih ada slot
                            isAvailable = luarKuaNotFull && totalNotFull;
                            isDisabled = !isAvailable || luarKuaCount >= 3 || totalCount >= 3;
                          }
                        } else {
                          // Legacy structure fallback
                          const currentCount = slot.jumlah_nikah || 0;
                          totalCount = currentCount;
                          
                          if (isKUA) {
                            // Untuk KUA: max 1
                            isAvailable = slot.tersedia !== false && currentCount < 1 && totalCount < 3;
                            isDisabled = !isAvailable || currentCount >= 1 || totalCount >= 3;
                          } else {
                            // Untuk Luar KUA: max 3
                            // In legacy structure, if tersedia is not explicitly false, assume available
                            // Tapi untuk "Di Luar KUA", kita hanya perlu cek jumlah, bukan tersedia
                            isAvailable = currentCount < 3 && totalCount < 3;
                            isDisabled = !isAvailable || currentCount >= 3 || totalCount >= 3;
                          }
                        }
                        
                        // Get current count for display
                        const currentCount = hasNewStructure 
                          ? (isKUA ? kuaCount : luarKuaCount)
                          : (slot.jumlah_nikah || 0);

                        return (
                          <Button
                            key={slot.waktu}
                            type="button"
                            variant={selectedTime === slot.waktu ? 'default' : 'outline'}
                            disabled={isDisabled}
                            onClick={() => {
                              setSelectedTime(slot.waktu);
                              form.setValue('lokasi_nikah.waktu_nikah', slot.waktu);
                            }}
                            className={cn(
                              'flex flex-col items-center justify-center h-auto py-2',
                              isDisabled && 'opacity-50 cursor-not-allowed'
                            )}
                          >
                            <span className="font-medium">{slot.waktu}</span>
                            {hasNewStructure ? (
                              !isDisabled ? (
                                <span className="text-xs mt-1 opacity-75">
                                  {isKUA ? `KUA: ${kuaCount}/1` : `Luar: ${luarKuaCount}/3`}
                                  {totalCount > 0 && (
                                    <span className="block">Total: {totalCount}/3</span>
                                  )}
                                </span>
                              ) : (
                                <span className="text-xs mt-1 text-destructive">
                                  {isKUA
                                    ? kuaCount >= 1
                                      ? 'KUA penuh'
                                      : totalCount >= 3
                                      ? 'Total penuh'
                                      : slot.kua?.tersedia === false
                                      ? 'Tidak tersedia'
                                      : 'Tidak tersedia'
                                    : (slot.luar_kua?.jumlah_total || 0) >= 3
                                    ? 'Luar KUA penuh'
                                    : totalCount >= 3
                                    ? 'Total penuh'
                                    : slot.luar_kua?.tersedia === false
                                    ? 'Tidak tersedia'
                                    : 'Tidak tersedia'}
                                </span>
                              )
                            ) : (
                              // Legacy structure
                              isDisabled ? (
                                <span className="text-xs mt-1 text-destructive">
                                  {isKUA
                                    ? (slot.jumlah_nikah || 0) >= 1
                                      ? 'Penuh'
                                      : 'Terbooking'
                                    : (slot.jumlah_nikah || 0) >= 3
                                    ? 'Penuh'
                                    : 'Terbooking'}
                                </span>
                              ) : (
                                <span className="text-xs mt-1 opacity-75">
                                  {isKUA ? '0/1' : `${slot.jumlah_nikah || 0}/3`}
                                </span>
                              )
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ) : selectedDate ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Tidak ada slot waktu tersedia untuk tanggal ini
                    </AlertDescription>
                  </Alert>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Pilih tanggal terlebih dahulu untuk melihat slot waktu
                  </p>
                )}
                {form.formState.errors.lokasi_nikah?.waktu_nikah && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.lokasi_nikah.waktu_nikah.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[150px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Membuat Pendaftaran...
                  </>
                ) : (
                  'Buat Pendaftaran'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Dialog untuk menampilkan informasi akun user yang dibuat */}
      <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Pendaftaran Berhasil Dibuat
            </DialogTitle>
            <DialogDescription>
              Pendaftaran nikah telah dibuat dan disetujui. Berikut informasi akun user yang dibuat otomatis.
            </DialogDescription>
          </DialogHeader>

          {createdAccount && (
            <div className="space-y-4">
              {/* Informasi Pendaftaran */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informasi Pendaftaran</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Nomor Pendaftaran:</span>
                    <span className="font-medium">{createdAccount.nomor_pendaftaran}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant="default" className="bg-green-600">
                      {createdAccount.status_pendaftaran}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tanggal Nikah:</span>
                    <span className="font-medium">
                      {format(new Date(createdAccount.tanggal_nikah), 'dd MMMM yyyy', { locale: IndonesianLocale })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Waktu:</span>
                    <span className="font-medium">{createdAccount.waktu_nikah} WITA</span>
                  </div>
                </CardContent>
              </Card>

              {/* Informasi Akun User */}
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informasi Akun User
                  </CardTitle>
                  <CardDescription>
                    Berikan informasi ini kepada calon pengantin untuk login ke sistem
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Penting:</strong> Simpan informasi ini dengan baik. Calon pengantin dapat login menggunakan username dan password default, kemudian mengubah password setelah login pertama kali.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-md border">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Username:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {createdAccount.akun_user?.username}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(createdAccount.akun_user?.username || '', 'Username')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-md border">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Password Default:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {createdAccount.akun_user?.password_default}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(createdAccount.akun_user?.password_default || '', 'Password')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-md border">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Email:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {createdAccount.akun_user?.email}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(createdAccount.akun_user?.email || '', 'Email')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>Catatan:</strong> {createdAccount.akun_user?.catatan || createdAccount.catatan}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => setIsAccountDialogOpen(false)}>
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

