'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, addMonths, startOfMonth } from 'date-fns';
import { id as IndonesianLocale } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { createSimpleMarriageRegistration, getCalendarAvailability, getAvailableTimeSlots, getWeddingsByDate } from '@/lib/simnikah-api';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, CalendarIcon, MapPin, Clock, AlertCircle, CheckCircle2, Users, Info, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SimpleAddressSelector } from './SimpleAddressSelector';

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

export function SimpleMarriageRegistrationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [calendarData, setCalendarData] = useState<any>(null);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [weddingsData, setWeddingsData] = useState<any>(null);
  const [loadingWeddings, setLoadingWeddings] = useState(false);
  const [selectedDateForInfo, setSelectedDateForInfo] = useState<Date | null>(null);
  const [isWeddingsDialogOpen, setIsWeddingsDialogOpen] = useState(false);

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
        latitude: undefined,
        longitude: undefined,
        alamat_detail: '',
        kelurahan: '',
      },
      wali_nikah: {
        nama: '',
        bin: '',
        hubungan_wali: '',
      },
    },
  });

  const tempatNikah = form.watch('lokasi_nikah.tempat_nikah');
  
  // Watch form values to determine step completion
  const calonLakiLaki = form.watch('calon_laki_laki');
  const calonPerempuan = form.watch('calon_perempuan');
  const lokasiNikah = form.watch('lokasi_nikah');
  const waliNikah = form.watch('wali_nikah');
  
  // Check if steps are completed
  const isStep1Complete = calonLakiLaki?.nama && calonLakiLaki?.bin && calonLakiLaki?.pendidikan_akhir && calonLakiLaki?.umur;
  const isStep2Complete = calonPerempuan?.nama && calonPerempuan?.binti && calonPerempuan?.pendidikan_akhir && calonPerempuan?.umur;
  const isStep3Complete = lokasiNikah?.tanggal_nikah && lokasiNikah?.waktu_nikah && 
    (lokasiNikah?.tempat_nikah === 'Di KUA' || (lokasiNikah?.tempat_nikah === 'Di Luar KUA' && lokasiNikah?.alamat_nikah && lokasiNikah?.latitude && lokasiNikah?.longitude));
  const isStep4Complete = waliNikah?.nama && waliNikah?.bin && waliNikah?.hubungan_wali;
  
  const steps = [
    { id: '01', name: 'Data Calon Suami', completed: !!isStep1Complete },
    { id: '02', name: 'Data Calon Istri', completed: !!isStep2Complete },
    { id: '03', name: 'Lokasi & Waktu Nikah', completed: !!isStep3Complete },
    { id: '04', name: 'Data Wali Nikah', completed: !!isStep4Complete },
  ];

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
          // Reset selected time when slots are loaded
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

  // Handler untuk saat tanggal diklik di kalender
  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) return;
    
    // Set tanggal yang dipilih
    setSelectedDate(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    form.setValue('lokasi_nikah.tanggal_nikah', dateStr);
    
    // Fetch data pernikahan untuk tanggal tersebut
    setSelectedDateForInfo(date);
    setLoadingWeddings(true);
    setIsWeddingsDialogOpen(true);
    
    try {
      const weddingsResponse = await getWeddingsByDate(dateStr);
      setWeddingsData(weddingsResponse.data);
    } catch (error: any) {
      console.error('Error loading weddings data:', error);
      // Tidak perlu show error toast, karena ini hanya info tambahan
      setWeddingsData(null);
    } finally {
      setLoadingWeddings(false);
    }
  };

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: 'Perhatian',
        description: 'Anda harus login terlebih dahulu untuk mendaftar',
        variant: 'destructive',
      });
      router.push('/login');
    }
  }, [user, router, toast]);

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Anda harus login terlebih dahulu',
        variant: 'destructive',
      });
      return;
    }

    // Validate time slot availability before submitting
    if (data.lokasi_nikah.waktu_nikah && selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const selectedSlot = timeSlots.find((slot) => slot.waktu === data.lokasi_nikah.waktu_nikah);
      
      if (selectedSlot) {
        const isKUA = data.lokasi_nikah.tempat_nikah === 'Di KUA';
        const hasNewStructure = selectedSlot.kua !== undefined || selectedSlot.luar_kua !== undefined;
        
        let kuaCount = 0;
        let luarKuaCount = 0;
        let totalCount = 0;
        
        if (hasNewStructure) {
          kuaCount = selectedSlot.kua?.jumlah_total || 0;
          luarKuaCount = selectedSlot.luar_kua?.jumlah_total || 0;
          totalCount = kuaCount + luarKuaCount;
        } else {
          // Legacy structure fallback
          const currentCount = selectedSlot.jumlah_nikah || 0;
          totalCount = currentCount;
          if (isKUA) {
            kuaCount = currentCount;
          } else {
            luarKuaCount = currentCount;
          }
        }
        
        // Check if slot is still available
        if (isKUA) {
          // Untuk KUA: cek apakah kua < 1 DAN total < 3
          if (kuaCount >= 1) {
            toast({
              title: 'Slot Tidak Tersedia',
              description: 'Slot KUA untuk waktu ini sudah penuh (1/1). Silakan pilih waktu lain.',
              variant: 'destructive',
            });
            return;
          }
          if (totalCount >= 3) {
            toast({
              title: 'Slot Tidak Tersedia',
              description: 'Total slot untuk waktu ini sudah penuh (3/3). Silakan pilih waktu lain.',
              variant: 'destructive',
            });
            return;
          }
        } else {
          // Untuk Luar KUA: cek apakah luar_kua < 3 DAN total < 3
          if (luarKuaCount >= 3) {
            toast({
              title: 'Slot Tidak Tersedia',
              description: 'Slot Luar KUA untuk waktu ini sudah penuh (3/3). Silakan pilih waktu lain.',
              variant: 'destructive',
            });
            return;
          }
          if (totalCount >= 3) {
            toast({
              title: 'Slot Tidak Tersedia',
              description: 'Total slot untuk waktu ini sudah penuh (3/3). Silakan pilih waktu lain.',
              variant: 'destructive',
            });
            return;
          }
        }
      }
    }

    setIsSubmitting(true);
    try {
      // Gabungkan nama dan bin/binti sebelum dikirim ke API
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
          tempat_nikah: data.lokasi_nikah.tempat_nikah,
          tanggal_nikah: data.lokasi_nikah.tanggal_nikah,
          waktu_nikah: data.lokasi_nikah.waktu_nikah,
          // Untuk Di Luar KUA, kirim alamat dan koordinat (wajib)
          ...(data.lokasi_nikah.tempat_nikah === 'Di Luar KUA' && {
            alamat_nikah: data.lokasi_nikah.alamat_nikah || '',
            ...(data.lokasi_nikah.alamat_detail && { alamat_detail: data.lokasi_nikah.alamat_detail }),
            ...(data.lokasi_nikah.kelurahan && { kelurahan: data.lokasi_nikah.kelurahan }),
            // Koordinat wajib untuk Di Luar KUA
            latitude: data.lokasi_nikah.latitude,
            longitude: data.lokasi_nikah.longitude,
          }),
        },
        wali_nikah: {
          nama_dan_bin: `${data.wali_nikah.nama} bin ${data.wali_nikah.bin}`,
          hubungan_wali: data.wali_nikah.hubungan_wali,
        },
      };
      
      const response = await createSimpleMarriageRegistration(apiData);
      
      toast({
        title: 'Berhasil!',
        description: response.message || 'Pendaftaran nikah berhasil dibuat',
        variant: 'default',
      });

      // Simpan data ke localStorage untuk digunakan di halaman status
      // Pastikan selalu simpan data dari form, bahkan jika API tidak mengembalikan
      const nomorPendaftaran = response.data?.nomor_pendaftaran;
      if (nomorPendaftaran) {
        // Buat nama lengkap dari form data
        const namaSuamiLengkap = `${data.calon_laki_laki.nama} bin ${data.calon_laki_laki.bin}`;
        const namaIstriLengkap = `${data.calon_perempuan.nama} binti ${data.calon_perempuan.binti}`;
        
        const registrationData = {
          nomor_pendaftaran: nomorPendaftaran,
          calon_suami: {
            nama_lengkap: response.data.calon_suami?.nama_dan_bin || 
                         response.data.calon_suami?.nama_lengkap || 
                         namaSuamiLengkap,
            nama_dan_bin: response.data.calon_suami?.nama_dan_bin || namaSuamiLengkap,
            nama: data.calon_laki_laki.nama, // Simpan juga nama saja untuk fallback
            bin: data.calon_laki_laki.bin, // Simpan juga bin untuk fallback
          },
          calon_istri: {
            nama_lengkap: response.data.calon_istri?.nama_dan_binti || 
                         response.data.calon_istri?.nama_lengkap || 
                         namaIstriLengkap,
            nama_dan_binti: response.data.calon_istri?.nama_dan_binti || namaIstriLengkap,
            nama: data.calon_perempuan.nama, // Simpan juga nama saja untuk fallback
            binti: data.calon_perempuan.binti, // Simpan juga binti untuk fallback
          },
          tanggal_nikah: response.data.tanggal_nikah || data.lokasi_nikah.tanggal_nikah,
          waktu_nikah: response.data.waktu_nikah || data.lokasi_nikah.waktu_nikah,
          tempat_nikah: response.data.tempat_nikah || data.lokasi_nikah.tempat_nikah,
          alamat_akad: response.data.alamat_akad || data.lokasi_nikah.alamat_nikah || '',
          status_pendaftaran: response.data.status_pendaftaran || 'Draft',
        };
        
        // Simpan dengan key berdasarkan nomor_pendaftaran
        const storageKey = `registration_${nomorPendaftaran}`;
        localStorage.setItem(storageKey, JSON.stringify(registrationData));
        console.log('✅ Registration data saved to localStorage:', {
          key: storageKey,
          data: registrationData,
          calonSuami: registrationData.calon_suami,
          calonIstri: registrationData.calon_istri,
        });
      } else {
        console.warn('⚠️ No nomor_pendaftaran in response, cannot save to localStorage');
        console.log('Response data:', response.data);
      }

      // Redirect to success page with data sesuai struktur API response
      const params = new URLSearchParams();
      if (response.data?.nomor_pendaftaran) params.set('nomor_pendaftaran', response.data.nomor_pendaftaran);
      if (response.data?.status_pendaftaran) params.set('status_pendaftaran', response.data.status_pendaftaran);
      if (response.data?.calon_suami?.nama_dan_bin) params.set('nama_suami', response.data.calon_suami.nama_dan_bin);
      if (response.data?.calon_istri?.nama_dan_binti) params.set('nama_istri', response.data.calon_istri.nama_dan_binti);
      if (response.data?.tanggal_nikah) params.set('tanggal_nikah', response.data.tanggal_nikah);
      if (response.data?.waktu_nikah) params.set('weddingTime', response.data.waktu_nikah);
      if (response.data?.tempat_nikah) params.set('weddingLocation', response.data.tempat_nikah);
      if (response.data?.alamat_akad) params.set('alamat_akad', response.data.alamat_akad);
      
      router.push(`/pendaftaran/sukses?${params.toString()}`);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      
      // Extract error message
      let errorMessage = 'Gagal membuat pendaftaran nikah. Silakan coba lagi.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.detail) {
          errorMessage = `Terjadi masalah koneksi atau kesalahan pada server. Detail: ${error.response.data.detail.message || error.response.data.detail.error || 'Unknown error'}`;
        }
      }
      
      // Check for URL parsing errors
      if (errorMessage.includes('Failed to parse URL') || errorMessage.includes('Invalid URL')) {
        errorMessage = 'Terjadi masalah koneksi atau kesalahan pada server. Silakan hubungi administrator atau coba lagi nanti.';
      }
      
      toast({
        title: 'Gagal Mendaftar',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get date status from calendar data
  const getDateStatus = (date: Date): 'available' | 'partial' | 'full' | 'unknown' => {
    if (!calendarData) return 'unknown';
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = calendarData.data.hari.find((h: any) => h.tanggal === dateStr);
    if (!dayData) return 'unknown';
    if (dayData.status === 'Semua Tersedia') return 'available';
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

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold" style={{ color: '#1a4d3a', lineHeight: '1.5' }}>Formulir Pendaftaran Nikah</CardTitle>
          <CardDescription className="text-base" style={{ color: '#1a4d3a', lineHeight: '1.6' }}>
            Isi formulir berikut untuk mendaftar nikah. Pastikan semua data yang diisi benar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step Indicators */}
          <div className="mb-8">
            <ol className="flex items-center w-full text-sm font-medium text-center sm:text-base">
              {steps.map((step, index) => (
                <li key={step.id} className={cn(
                  "flex items-center",
                  index !== steps.length - 1 && "w-full after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block sm:after:mx-6 xl:after:mx-10"
                )}>
                  <div className="flex flex-col items-center">
                    <span className={cn(
                      "flex items-center justify-center rounded-full text-white font-semibold flex-shrink-0",
                      step.completed ? "bg-green-600" : "bg-blue-600"
                    )} style={{ 
                      width: '48px', 
                      height: '48px', 
                      minWidth: '48px', 
                      minHeight: '48px',
                      aspectRatio: '1 / 1',
                      padding: 0
                    }}>
                      {step.completed ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <span className="leading-none">{step.id}</span>
                      )}
                    </span>
                    <span className={cn(
                      "mt-2 text-xs sm:text-sm",
                      step.completed ? "text-green-600 font-semibold" : "text-gray-600"
                    )} style={{ color: step.completed ? '#16a34a' : '#1a4d3a' }}>
                      {step.name.split(' ').map((word, i) => (
                        <span key={i} className="block">{word}</span>
                      ))}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Calon Laki-laki */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold" style={{ color: '#1a4d3a', lineHeight: '1.5' }}>Data Calon Suami</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nama_laki" style={{ color: '#1a4d3a' }}>Nama Lengkap *</Label>
                  <Input
                    id="nama_laki"
                    placeholder="Ahmad Wijaya"
                    {...form.register('calon_laki_laki.nama')}
                  />
                  {form.formState.errors.calon_laki_laki?.nama && (
                    <p className="text-base text-red-500 font-medium">
                      {form.formState.errors.calon_laki_laki.nama.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bin_laki" style={{ color: '#1a4d3a' }}>Bin *</Label>
                  <Input
                    id="bin_laki"
                    placeholder="Abdullah"
                    {...form.register('calon_laki_laki.bin')}
                  />
                  {form.formState.errors.calon_laki_laki?.bin && (
                    <p className="text-base text-red-500 font-medium">
                      {form.formState.errors.calon_laki_laki.bin.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pendidikan_laki" style={{ color: '#1a4d3a' }}>Pendidikan Akhir *</Label>
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
                    <p className="text-base text-red-500 font-medium">
                      {form.formState.errors.calon_laki_laki.pendidikan_akhir.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="umur_laki" style={{ color: '#1a4d3a' }}>Umur *</Label>
                  <Input
                    id="umur_laki"
                    type="number"
                    min={19}
                    max={100}
                    {...form.register('calon_laki_laki.umur', { valueAsNumber: true })}
                  />
                  {form.formState.errors.calon_laki_laki?.umur && (
                    <p className="text-base text-red-500 font-medium">
                      {form.formState.errors.calon_laki_laki.umur.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Calon Perempuan */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold" style={{ color: '#1a4d3a', lineHeight: '1.5' }}>Data Calon Istri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nama_perempuan" style={{ color: '#1a4d3a' }}>Nama Lengkap *</Label>
                  <Input
                    id="nama_perempuan"
                    placeholder="Siti Nurhaliza"
                    {...form.register('calon_perempuan.nama')}
                  />
                  {form.formState.errors.calon_perempuan?.nama && (
                    <p className="text-base text-red-500 font-medium">
                      {form.formState.errors.calon_perempuan.nama.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="binti_perempuan" style={{ color: '#1a4d3a' }}>Binti *</Label>
                  <Input
                    id="binti_perempuan"
                    placeholder="Muhammad"
                    {...form.register('calon_perempuan.binti')}
                  />
                  {form.formState.errors.calon_perempuan?.binti && (
                    <p className="text-base text-red-500 font-medium">
                      {form.formState.errors.calon_perempuan.binti.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pendidikan_perempuan" style={{ color: '#1a4d3a' }}>Pendidikan Akhir *</Label>
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
                    <p className="text-base text-red-500 font-medium">
                      {form.formState.errors.calon_perempuan.pendidikan_akhir.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="umur_perempuan" style={{ color: '#1a4d3a' }}>Umur *</Label>
                  <Input
                    id="umur_perempuan"
                    type="number"
                    min={19}
                    max={100}
                    {...form.register('calon_perempuan.umur', { valueAsNumber: true })}
                  />
                  {form.formState.errors.calon_perempuan?.umur && (
                    <p className="text-base text-red-500 font-medium">
                      {form.formState.errors.calon_perempuan.umur.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Wali Nikah */}
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-bold" style={{ color: '#1a4d3a', lineHeight: '1.5' }}>Data Wali Nikah</h3>
                <p className="text-sm text-muted-foreground mt-0.5" style={{ color: '#1a4d3a', lineHeight: '1.5' }}>
                  Wali nikah wajib diisi untuk calon pengantin perempuan
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nama_wali" style={{ color: '#1a4d3a' }}>Nama Lengkap *</Label>
                  <Input
                    id="nama_wali"
                    placeholder="Abdullah"
                    {...form.register('wali_nikah.nama')}
                  />
                  {form.formState.errors.wali_nikah?.nama && (
                    <p className="text-base text-red-500 font-medium">
                      {form.formState.errors.wali_nikah.nama.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bin_wali" style={{ color: '#1a4d3a' }}>Bin *</Label>
                  <Input
                    id="bin_wali"
                    placeholder="Muhammad"
                    {...form.register('wali_nikah.bin')}
                  />
                  {form.formState.errors.wali_nikah?.bin && (
                    <p className="text-base text-red-500 font-medium">
                      {form.formState.errors.wali_nikah.bin.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hubungan_wali" style={{ color: '#1a4d3a' }}>Hubungan Wali *</Label>
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
                    <p className="text-base text-red-500 font-medium">
                      {form.formState.errors.wali_nikah.hubungan_wali.message}
                    </p>
                  )}
                </div>
              </div>
              <details className="text-sm bg-blue-50 p-3 rounded border border-blue-100">
                <summary className="font-semibold cursor-pointer" style={{ color: '#1a4d3a' }}>Urutan Wali Nasab (klik untuk lihat)</summary>
                <ol className="list-decimal list-inside space-y-1 mt-2 pl-2" style={{ color: '#1a4d3a', lineHeight: '1.6' }}>
                  <li>Ayah Kandung</li>
                  <li>Kakek</li>
                  <li>Saudara Laki-Laki Kandung</li>
                  <li>Saudara Laki-Laki Seayah</li>
                  <li>Keponakan Laki-Laki</li>
                  <li>Paman Kandung</li>
                  <li>Paman Seayah</li>
                  <li>Sepupu Laki-Laki</li>
                  <li>Wali Hakim</li>
                  <li>Lainnya</li>
                </ol>
              </details>
            </div>

            {/* Lokasi Nikah */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold" style={{ color: '#1a4d3a', lineHeight: '1.5' }}>Lokasi dan Waktu Nikah</h3>
              
              <div className="space-y-2">
                <Label style={{ color: '#1a4d3a' }}>Tempat Nikah *</Label>
                <Select
                  value={form.watch('lokasi_nikah.tempat_nikah')}
                  onValueChange={(value) => {
                    form.setValue('lokasi_nikah.tempat_nikah', value as 'Di KUA' | 'Di Luar KUA');
                    if (value === 'Di KUA') {
                      form.setValue('lokasi_nikah.alamat_nikah', '');
                      form.setValue('lokasi_nikah.kelurahan', '');
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
                    <Label htmlFor="alamat_detail" className="text-base" style={{ color: '#1a4d3a' }}>Detail Alamat (Opsional)</Label>
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
                <Label style={{ color: '#1a4d3a' }}>Tanggal Nikah *</Label>
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
                      onSelect={handleDateSelect}
                      disabled={isDateDisabled}
                      month={currentMonth}
                      onMonthChange={setCurrentMonth}
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.lokasi_nikah?.tanggal_nikah && (
                  <p className="text-base text-red-500 font-medium">
                    {form.formState.errors.lokasi_nikah.tanggal_nikah.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label style={{ color: '#1a4d3a' }}>Waktu Nikah *</Label>
                {!tempatNikah ? (
                  <p className="text-base" style={{ color: '#1a4d3a' }}>
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
                        // Determine availability based on location
                        const isKUA = tempatNikah === 'Di KUA';
                        
                        // Support both new structure (kua/luar_kua) and legacy structure (tersedia)
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
                          totalCount = kuaCount + luarKuaCount;
                          
                          if (isKUA) {
                            // Untuk KUA: bisa dipilih jika kua < 1 DAN total < 3
                            const kuaAvailable = slot.kua?.tersedia && kuaCount < 1;
                            const totalNotFull = totalCount < 3;
                            isAvailable = kuaAvailable && totalNotFull;
                            isDisabled = !isAvailable || kuaCount >= 1 || totalCount >= 3;
                          } else {
                            // Untuk Luar KUA: bisa dipilih jika luar_kua < 3 DAN total < 3
                            const luarKuaAvailable = slot.luar_kua?.tersedia && luarKuaCount < 3;
                            const totalNotFull = totalCount < 3;
                            isAvailable = luarKuaAvailable && totalNotFull;
                            isDisabled = !isAvailable || luarKuaCount >= 3 || totalCount >= 3;
                          }
                        } else {
                          // Legacy structure fallback
                          const currentCount = slot.jumlah_nikah || 0;
                          totalCount = currentCount;
                          
                          if (isKUA) {
                            // Untuk KUA: max 1
                            isAvailable = slot.tersedia && currentCount < 1 && totalCount < 3;
                            isDisabled = !isAvailable || currentCount >= 1 || totalCount >= 3;
                          } else {
                            // Untuk Luar KUA: max 3
                            isAvailable = slot.tersedia && currentCount < 3 && totalCount < 3;
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
                            title={
                              hasNewStructure
                                ? isDisabled
                                  ? isKUA
                                    ? kuaCount >= 1
                                      ? 'Slot KUA sudah penuh (1/1)'
                                      : totalCount >= 3
                                      ? 'Total slot sudah penuh (3/3)'
                                      : 'Slot tidak tersedia'
                                    : luarKuaCount >= 3
                                    ? 'Slot Luar KUA sudah penuh (3/3)'
                                    : totalCount >= 3
                                    ? 'Total slot sudah penuh (3/3)'
                                    : 'Slot tidak tersedia'
                                  : isKUA
                                  ? `KUA: ${kuaCount}/1 (Total: ${totalCount}/3)`
                                  : `Luar KUA: ${luarKuaCount}/3 (Total: ${totalCount}/3)`
                                : slot.tersedia
                                ? `${slot.waktu} - Tersedia`
                                : `${slot.waktu} - Terbooking`
                            }
                          >
                            <span className="font-medium">{slot.waktu}</span>
                            {hasNewStructure ? (
                              !isDisabled ? (
                                <span className="text-xs mt-1 opacity-75">
                                  {isKUA ? `${kuaCount}/1` : `${luarKuaCount}/3`}
                                </span>
                              ) : (
                                <span className="text-xs mt-1 text-destructive">
                                  {isKUA
                                    ? kuaCount >= 1
                                      ? 'Penuh'
                                      : totalCount >= 3
                                      ? 'Total penuh'
                                      : 'Tidak tersedia'
                                    : luarKuaCount >= 3
                                    ? 'Penuh'
                                    : totalCount >= 3
                                    ? 'Total penuh'
                                    : 'Tidak tersedia'}
                                </span>
                              )
                            ) : (
                              !slot.tersedia && (
                                <span className="text-xs mt-1 text-destructive">Terbooking</span>
                              )
                            )}
                          </Button>
                        );
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>
                        <strong>Aturan:</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-0.5 ml-2">
                        <li>Nikah di KUA: maksimal 1 slot per waktu</li>
                        <li>Nikah di Luar KUA: maksimal 3 slot per waktu</li>
                        <li>Total gabungan: maksimal 3 slot per waktu</li>
                      </ul>
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
                  <p className="text-base" style={{ color: '#1a4d3a' }}>
                    Pilih tanggal terlebih dahulu untuk melihat slot waktu
                  </p>
                )}
                {form.formState.errors.lokasi_nikah?.waktu_nikah && (
                  <p className="text-base text-red-500 font-medium">
                    {form.formState.errors.lokasi_nikah.waktu_nikah.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  'Kirim Pendaftaran'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Dialog untuk menampilkan informasi pernikahan */}
      <Dialog open={isWeddingsDialogOpen} onOpenChange={setIsWeddingsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Informasi Pernikahan
            </DialogTitle>
            <DialogDescription>
              {selectedDateForInfo && (
                <span>
                  Data pernikahan pada {format(selectedDateForInfo, 'EEEE, dd MMMM yyyy', { locale: IndonesianLocale })}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {loadingWeddings ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Memuat data pernikahan...</span>
            </div>
          ) : weddingsData ? (
            <div className="space-y-4">
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ringkasan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {weddingsData.summary?.total_nikah || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Pernikahan</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {weddingsData.summary?.nikah_di_kua || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Di KUA</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {weddingsData.summary?.nikah_di_luar || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Di Luar KUA</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Daftar Pernikahan */}
              {weddingsData.pernikahan && weddingsData.pernikahan.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Daftar Pernikahan</h3>
                  {weddingsData.pernikahan.map((pernikahan: any, index: number) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">
                              {pernikahan.calon_suami?.nama_lengkap || 'Nama tidak tersedia'} & {' '}
                              {pernikahan.calon_istri?.nama_lengkap || 'Nama tidak tersedia'}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {pernikahan.nomor_pendaftaran}
                            </CardDescription>
                          </div>
                          <Badge variant={
                            pernikahan.status_pendaftaran === 'Selesai' ? 'default' :
                            pernikahan.status_pendaftaran === 'Penghulu Ditugaskan' ? 'secondary' :
                            'outline'
                          }>
                            {pernikahan.status_pendaftaran}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-start gap-2">
                            <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">Waktu</div>
                              <div className="text-muted-foreground">{pernikahan.waktu_nikah} WITA</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">Tempat</div>
                              <div className="text-muted-foreground">{pernikahan.tempat_nikah}</div>
                            </div>
                          </div>
                          {pernikahan.penghulu && (
                            <div className="flex items-start gap-2 md:col-span-2">
                              <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <div>
                                <div className="font-medium">Penghulu</div>
                                <div className="text-muted-foreground">
                                  {pernikahan.penghulu.nama} (NIP: {pernikahan.penghulu.nip})
                                </div>
                              </div>
                            </div>
                          )}
                          {pernikahan.alamat_akad && (
                            <div className="flex items-start gap-2 md:col-span-2">
                              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <div>
                                <div className="font-medium">Alamat Akad</div>
                                <div className="text-muted-foreground">{pernikahan.alamat_akad}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Tidak ada pernikahan yang terjadwal pada tanggal ini
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Gagal memuat data pernikahan. Silakan coba lagi.
              </AlertDescription>
            </Alert>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

