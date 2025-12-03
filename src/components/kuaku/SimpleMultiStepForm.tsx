"use client";

import React, { useState, useActionState, useEffect, useRef, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { format, differenceInYears } from "date-fns";
import { id as IndonesianLocale } from 'date-fns/locale';
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { submitMarriageRegistrationForm, type MarriageRegistrationFormState } from "@/app/daftar-nikah/actions";
import { getCalendarAvailability, getAvailableTimeSlots } from "@/lib/simnikah-api";
import { Loader2, CalendarIcon, User, Users, MapPin, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { SimpleAddressSelector } from "@/components/kuaku/SimpleAddressSelector";

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

// Education levels
const EDUCATION_LEVELS = [
  'SD',
  'SMP',
  'SMA',
  'S1',
  'S2',
  'S3'
];

const steps = [
  { id: "01", name: "Data Calon Suami" },
  { id: "02", name: "Data Calon Istri" },
  { id: "03", name: "Lokasi & Waktu Nikah" },
  { id: "04", name: "Data Wali Nikah" },
];

type FormData = {
  // Calon Suami
  groomNama: string;
  groomBin: string;
  groomPendidikanAkhir: string;
  groomDateOfBirth: Date | null;
  groomUmur: number;
  
  // Calon Istri
  brideNama: string;
  brideBinti: string;
  bridePendidikanAkhir: string;
  brideDateOfBirth: Date | null;
  brideUmur: number;
  
  // Lokasi Nikah
  tempatNikah: 'Di KUA' | 'Di Luar KUA';
  tanggalNikah: Date | null;
  waktuNikah: string;
  alamatNikah: string;
  alamatDetail: string;
  kelurahan: string;
  latitude?: number;
  longitude?: number;
  
  // Wali Nikah
  guardianNama: string;
  guardianBin: string;
  guardianNik: string;
  guardianRelationship: string;
  guardianStatus: string;
  guardianAddress: string;
  guardianPhoneNumber: string;
};

const Step1 = () => {
  const { register, watch, setValue, formState: { errors } } = useFormContext<FormData>();
  const [dateOfBirthOpen, setDateOfBirthOpen] = useState(false);
  const dateOfBirth = watch('groomDateOfBirth');
  const umur = watch('groomUmur');

  useEffect(() => {
    if (dateOfBirth) {
      const age = differenceInYears(new Date(), dateOfBirth);
      setValue('groomUmur', age);
    }
  }, [dateOfBirth, setValue]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Data Calon Suami</h3>
        <p className="text-sm text-muted-foreground">Isi data calon suami dengan lengkap</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="groomNama">Nama Lengkap *</Label>
            <Input
              id="groomNama"
              placeholder="Contoh: Ahmad Wijaya"
              {...register('groomNama', { required: 'Nama lengkap wajib diisi' })}
            />
            {errors.groomNama && (
              <p className="text-sm text-destructive">{errors.groomNama.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="groomBin">Bin *</Label>
            <Input
              id="groomBin"
              placeholder="Contoh: Abdullah"
              {...register('groomBin', { required: 'Bin wajib diisi' })}
            />
            {errors.groomBin && (
              <p className="text-sm text-destructive">{errors.groomBin.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="groomPendidikanAkhir">Pendidikan Akhir *</Label>
          <Select
            value={watch('groomPendidikanAkhir')}
            onValueChange={(value) => setValue('groomPendidikanAkhir', value)}
          >
            <SelectTrigger id="groomPendidikanAkhir">
              <SelectValue placeholder="Pilih pendidikan akhir" />
            </SelectTrigger>
            <SelectContent>
              {EDUCATION_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.groomPendidikanAkhir && (
            <p className="text-sm text-destructive">{errors.groomPendidikanAkhir.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="groomDateOfBirth">Tanggal Lahir *</Label>
            <Popover open={dateOfBirthOpen} onOpenChange={setDateOfBirthOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateOfBirth && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateOfBirth ? format(dateOfBirth, "PPP", { locale: IndonesianLocale }) : "Pilih tanggal lahir"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateOfBirth || undefined}
                  onSelect={(date) => {
                    setValue('groomDateOfBirth', date || null);
                    setDateOfBirthOpen(false);
                  }}
                  captionLayout="dropdown-buttons"
                  fromYear={1950}
                  toYear={new Date().getFullYear() - 17}
                  disabled={(date) => date > new Date() || date < new Date('1950-01-01')}
                  initialFocus
                  locale={IndonesianLocale}
                />
              </PopoverContent>
            </Popover>
            {errors.groomDateOfBirth && (
              <p className="text-sm text-destructive">{errors.groomDateOfBirth.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="groomUmur">Umur *</Label>
            <Input
              id="groomUmur"
              type="number"
              min={19}
              max={100}
              value={umur || ''}
              readOnly
              className="bg-muted"
              {...register('groomUmur', { 
                required: 'Umur wajib diisi',
                min: { value: 19, message: 'Umur minimal 19 tahun' }
              })}
            />
            {errors.groomUmur && (
              <p className="text-sm text-destructive">{errors.groomUmur.message}</p>
            )}
            {umur && umur < 19 && (
              <p className="text-sm text-amber-600">Umur minimal 19 tahun untuk menikah</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Step2 = () => {
  const { register, watch, setValue, formState: { errors } } = useFormContext<FormData>();
  const [dateOfBirthOpen, setDateOfBirthOpen] = useState(false);
  const dateOfBirth = watch('brideDateOfBirth');
  const umur = watch('brideUmur');

  useEffect(() => {
    if (dateOfBirth) {
      const age = differenceInYears(new Date(), dateOfBirth);
      setValue('brideUmur', age);
    }
  }, [dateOfBirth, setValue]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Data Calon Istri</h3>
        <p className="text-sm text-muted-foreground">Isi data calon istri dengan lengkap</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brideNama">Nama Lengkap *</Label>
            <Input
              id="brideNama"
              placeholder="Contoh: Siti Nurhaliza"
              {...register('brideNama', { required: 'Nama lengkap wajib diisi' })}
            />
            {errors.brideNama && (
              <p className="text-sm text-destructive">{errors.brideNama.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="brideBinti">Binti *</Label>
            <Input
              id="brideBinti"
              placeholder="Contoh: Muhammad"
              {...register('brideBinti', { required: 'Binti wajib diisi' })}
            />
            {errors.brideBinti && (
              <p className="text-sm text-destructive">{errors.brideBinti.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bridePendidikanAkhir">Pendidikan Akhir *</Label>
          <Select
            value={watch('bridePendidikanAkhir')}
            onValueChange={(value) => setValue('bridePendidikanAkhir', value)}
          >
            <SelectTrigger id="bridePendidikanAkhir">
              <SelectValue placeholder="Pilih pendidikan akhir" />
            </SelectTrigger>
            <SelectContent>
              {EDUCATION_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.bridePendidikanAkhir && (
            <p className="text-sm text-destructive">{errors.bridePendidikanAkhir.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brideDateOfBirth">Tanggal Lahir *</Label>
            <Popover open={dateOfBirthOpen} onOpenChange={setDateOfBirthOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateOfBirth && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateOfBirth ? format(dateOfBirth, "PPP", { locale: IndonesianLocale }) : "Pilih tanggal lahir"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateOfBirth || undefined}
                  onSelect={(date) => {
                    setValue('brideDateOfBirth', date || null);
                    setDateOfBirthOpen(false);
                  }}
                  captionLayout="dropdown-buttons"
                  fromYear={1950}
                  toYear={new Date().getFullYear() - 17}
                  disabled={(date) => date > new Date() || date < new Date('1950-01-01')}
                  initialFocus
                  locale={IndonesianLocale}
                />
              </PopoverContent>
            </Popover>
            {errors.brideDateOfBirth && (
              <p className="text-sm text-destructive">{errors.brideDateOfBirth.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="brideUmur">Umur *</Label>
            <Input
              id="brideUmur"
              type="number"
              min={19}
              max={100}
              value={umur || ''}
              readOnly
              className="bg-muted"
              {...register('brideUmur', { 
                required: 'Umur wajib diisi',
                min: { value: 19, message: 'Umur minimal 19 tahun' }
              })}
            />
            {errors.brideUmur && (
              <p className="text-sm text-destructive">{errors.brideUmur.message}</p>
            )}
            {umur && umur < 19 && (
              <p className="text-sm text-amber-600">Umur minimal 19 tahun untuk menikah</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Step3 = () => {
  const { register, watch, setValue, trigger, formState: { errors } } = useFormContext<FormData>();
  const { toast } = useToast();
  const [dateOpen, setDateOpen] = useState(false);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [calendarData, setCalendarData] = useState<any>(null);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const tempatNikah = watch('tempatNikah');
  const tanggalNikah = watch('tanggalNikah');
  const selectedTime = watch('waktuNikah');

  // Load calendar when month changes
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
        // Show user-friendly error message
        toast({
          title: 'Gagal Memuat Kalender',
          description: error.message || 'Tidak dapat memuat data ketersediaan kalender. Silakan coba lagi.',
          variant: 'destructive',
        });
        setCalendarData(null);
      } finally {
        setLoadingCalendar(false);
      }
    };
    loadCalendar();
  }, [currentMonth, toast]);

  // Load time slots when date is selected
  useEffect(() => {
    if (tanggalNikah) {
      const loadTimeSlots = async () => {
        setLoadingTimeSlots(true);
        try {
          const dateStr = format(tanggalNikah, 'yyyy-MM-dd');
          const data = await getAvailableTimeSlots(dateStr);
          setTimeSlots(data.data?.time_slots || []);
          // Reset selected time when slots are loaded
          setValue('waktuNikah', '');
        } catch (error: any) {
          console.error('Error loading time slots:', error);
          // Show user-friendly error message
          toast({
            title: 'Gagal Memuat Slot Waktu',
            description: error.message || 'Tidak dapat memuat slot waktu tersedia. Silakan coba lagi.',
            variant: 'destructive',
          });
          setTimeSlots([]);
        } finally {
          setLoadingTimeSlots(false);
        }
      };
      loadTimeSlots();
    } else {
      setTimeSlots([]);
    }
  }, [tanggalNikah, toast, setValue]);

  // Reset selected time when tempat nikah changes
  useEffect(() => {
    if (tempatNikah) {
      setValue('waktuNikah', '');
    }
  }, [tempatNikah, setValue]);

  const isDateDisabled = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    
    // Cek hari Minggu - KUA tutup pada hari Minggu
    if (tempatNikah === 'Di KUA' && date.getDay() === 0) return true;
    
    if (!calendarData?.data?.calendar) return false;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = calendarData.data.calendar.find((h: any) => h.tanggal_str === dateStr);
    
    if (dayData) {
      // Hari libur + nikah Di KUA = disabled
      if (dayData.is_hari_libur && tempatNikah === 'Di KUA') return true;
      
      // Status Penuh (semua slot terpakai)
      if (dayData.status === 'Penuh' || !dayData.tersedia) return true;
      
      // Cek ketersediaan berdasarkan lokasi nikah
      if (tempatNikah === 'Di KUA' && dayData.tersedia_kua === false) return true;
      if (tempatNikah === 'Di Luar KUA' && dayData.tersedia_luar_kua === false) return true;
    }
    
    return false;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Lokasi & Waktu Nikah</h3>
        <p className="text-sm text-muted-foreground">Pilih lokasi dan waktu untuk pernikahan</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Tempat Nikah *</Label>
          <Select
            value={tempatNikah}
            onValueChange={(value) => {
              setValue('tempatNikah', value as 'Di KUA' | 'Di Luar KUA');
              if (value === 'Di KUA') {
                setValue('alamatNikah', '');
                setValue('kelurahan', '');
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih tempat nikah" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Di KUA">Di KUA</SelectItem>
              <SelectItem value="Di Luar KUA">Di Luar KUA</SelectItem>
            </SelectContent>
          </Select>
          {errors.tempatNikah && (
            <p className="text-sm text-destructive">{errors.tempatNikah.message}</p>
          )}
          
          {/* Informasi hari libur untuk nikah Di KUA */}
          {tempatNikah === 'Di KUA' && (
            <Alert className="bg-amber-50 border-amber-200">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm">
                <strong>Perhatian:</strong> KUA tutup pada hari <strong>Minggu</strong> dan <strong>hari libur nasional</strong>. 
                Jika ingin nikah di hari tersebut, pilih "Di Luar KUA".
              </AlertDescription>
            </Alert>
          )}
        </div>

        {tempatNikah === 'Di Luar KUA' && (
          <div className="space-y-3">
            <SimpleAddressSelector
              value={watch('alamatNikah') || ''}
              latitude={watch('latitude') || null}
              longitude={watch('longitude') || null}
              onLocationSelect={(location) => {
                setValue('alamatNikah', location.alamat);
                setValue('latitude', location.latitude);
                setValue('longitude', location.longitude);
                // Trigger validation
                trigger('alamatNikah');
                trigger('latitude');
              }}
              disabled={false}
              error={
                errors.alamatNikah?.message ||
                errors.latitude?.message ||
                undefined
              }
            />

            <div className="space-y-1.5">
              <Label htmlFor="alamatDetail" className="text-sm">Detail Alamat (Opsional)</Label>
              <Textarea
                id="alamatDetail"
                placeholder="RT 05 RW 02, Rumah Pengantin Perempuan"
                {...register('alamatDetail')}
                className="min-h-[60px] text-sm"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Tanggal Nikah *</Label>
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !tanggalNikah && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {tanggalNikah ? format(tanggalNikah, "PPP", { locale: IndonesianLocale }) : "Pilih tanggal nikah"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={tanggalNikah || undefined}
                onSelect={(date) => {
                  setValue('tanggalNikah', date || null);
                  setValue('waktuNikah', '');
                  setDateOpen(false);
                }}
                disabled={isDateDisabled}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.tanggalNikah && (
            <p className="text-sm text-destructive">{errors.tanggalNikah.message}</p>
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
                  // Determine availability based on location
                  const isKUA = tempatNikah === 'Di KUA';
                  
                  // Support both new structure (kua/luar_kua) and legacy structure (tersedia)
                  const hasNewStructure = slot.kua !== undefined || slot.luar_kua !== undefined;
                  
                  let slotInfo, maxCapacity, currentCount, isAvailable, totalCount, isTotalFull;
                  
                  if (hasNewStructure) {
                    slotInfo = isKUA ? slot.kua : slot.luar_kua;
                    maxCapacity = isKUA ? 1 : 3;
                    currentCount = slotInfo?.jumlah_total || 0;
                    isAvailable = slotInfo?.tersedia && currentCount < maxCapacity;
                    totalCount = (slot.kua?.jumlah_total || 0) + (slot.luar_kua?.jumlah_total || 0);
                    isTotalFull = totalCount >= 3;
                  } else {
                    // Legacy structure fallback
                    slotInfo = null;
                    maxCapacity = isKUA ? 1 : 3;
                    currentCount = slot.jumlah_nikah || 0;
                    isAvailable = slot.tersedia && (isKUA ? currentCount < 1 : currentCount < 3);
                    totalCount = currentCount;
                    isTotalFull = totalCount >= 3;
                  }

                  // Slot is disabled if:
                  // - For KUA: not available OR already at capacity (1/1)
                  // - For Luar KUA: not available OR already at capacity (3/3) OR total is full (3/3 combined)
                  const isDisabled = !isAvailable || (isKUA ? currentCount >= 1 : (currentCount >= 3 || isTotalFull));

                  return (
                    <Button
                      key={slot.waktu}
                      type="button"
                      variant={selectedTime === slot.waktu ? 'default' : 'outline'}
                      disabled={isDisabled}
                      onClick={() => setValue('waktuNikah', slot.waktu)}
                      className={cn(
                        'flex flex-col items-center justify-center h-auto py-2',
                        isDisabled && 'opacity-50 cursor-not-allowed'
                      )}
                      title={
                        hasNewStructure
                          ? isDisabled
                            ? isKUA
                              ? currentCount >= 1
                                ? 'Slot KUA sudah penuh (1/1)'
                                : 'Slot tidak tersedia'
                              : isTotalFull
                              ? 'Total slot sudah penuh (3/3)'
                              : currentCount >= 3
                              ? 'Slot Luar KUA sudah penuh (3/3)'
                              : 'Slot tidak tersedia'
                            : isKUA
                            ? `KUA: ${currentCount}/1`
                            : `Luar KUA: ${currentCount}/3 (Total: ${totalCount}/3)`
                          : slot.tersedia
                          ? `${slot.waktu} - Tersedia`
                          : `${slot.waktu} - Terbooking`
                      }
                    >
                      <span className="font-medium">{slot.waktu}</span>
                      {hasNewStructure ? (
                        !isDisabled ? (
                          <span className="text-xs mt-1 opacity-75">
                            {isKUA ? `${currentCount}/1` : `${currentCount}/3`}
                          </span>
                        ) : (
                          <span className="text-xs mt-1 text-destructive">
                            {isKUA
                              ? currentCount >= 1
                                ? 'Penuh'
                                : 'Tidak tersedia'
                              : isTotalFull
                              ? 'Total penuh'
                              : currentCount >= 3
                              ? 'Penuh'
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
          ) : tanggalNikah ? (
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
          {errors.waktuNikah && (
            <p className="text-sm text-destructive">{errors.waktuNikah.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const Step4 = () => {
  const { register, watch, setValue, formState: { errors } } = useFormContext<FormData>();

  // Hubungan wali options
  const HUBUNGAN_WALI = [
    'Ayah Kandung',
    'Kakek (Ayah dari Ayah)',
    'Saudara Laki-laki Kandung',
    'Anak Laki-laki',
    'Paman (Saudara Laki-laki Ayah)',
    'Kepala Negara (Wali Hakim)',
  ];

  // Status wali options
  const STATUS_WALI = [
    'Masih Hidup',
    'Sudah Meninggal',
    'Tidak Diketahui',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Data Wali Nikah
        </h3>
        <p className="text-sm text-muted-foreground">
          Isi data wali nikah dengan lengkap. Wali nikah adalah seorang laki-laki yang memenuhi syarat hukum Islam.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Informasi Wali</AlertTitle>
        <AlertDescription>
          Wali nikah adalah seorang laki-laki yang memenuhi syarat hukum Islam. Biasanya adalah Ayah Kandung dari calon mempelai wanita. Jika ayah kandung tidak bisa menjadi wali, maka posisinya bisa digantikan oleh wali nasab lainnya sesuai urutan.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="guardianNama">Nama Wali *</Label>
            <Input
              id="guardianNama"
              placeholder="Contoh: Abdullah"
              {...register('guardianNama', { required: 'Nama wali wajib diisi' })}
            />
            {errors.guardianNama && (
              <p className="text-sm text-destructive">{errors.guardianNama.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardianBin">Bin *</Label>
            <Input
              id="guardianBin"
              placeholder="Contoh: Muhammad"
              {...register('guardianBin', { required: 'Bin wajib diisi' })}
            />
            {errors.guardianBin && (
              <p className="text-sm text-destructive">{errors.guardianBin.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="guardianNik">NIK *</Label>
            <Input
              id="guardianNik"
              placeholder="16 Digit NIK"
              maxLength={16}
              {...register('guardianNik', { 
                required: 'NIK wali wajib diisi',
                pattern: {
                  value: /^\d{16}$/,
                  message: 'NIK harus 16 digit angka'
                }
              })}
            />
            {errors.guardianNik && (
              <p className="text-sm text-destructive">{errors.guardianNik.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardianRelationship">Hubungan Wali *</Label>
            <Select
              value={watch('guardianRelationship')}
              onValueChange={(value) => setValue('guardianRelationship', value)}
            >
              <SelectTrigger id="guardianRelationship">
                <SelectValue placeholder="Pilih hubungan wali" />
              </SelectTrigger>
              <SelectContent>
                {HUBUNGAN_WALI.map((hubungan) => (
                  <SelectItem key={hubungan} value={hubungan}>
                    {hubungan}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.guardianRelationship && (
              <p className="text-sm text-destructive">{errors.guardianRelationship.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="guardianStatus">Status Wali *</Label>
          <Select
            value={watch('guardianStatus')}
            onValueChange={(value) => setValue('guardianStatus', value)}
          >
            <SelectTrigger id="guardianStatus">
              <SelectValue placeholder="Pilih status wali" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_WALI.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.guardianStatus && (
            <p className="text-sm text-destructive">{errors.guardianStatus.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="guardianAddress">Alamat Wali *</Label>
          <Textarea
            id="guardianAddress"
            placeholder="Jl. Ahmad Yani No. 123, RT 01, RW 02"
            {...register('guardianAddress', { required: 'Alamat wali wajib diisi' })}
          />
          {errors.guardianAddress && (
            <p className="text-sm text-destructive">{errors.guardianAddress.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="guardianPhoneNumber">Nomor Telepon Wali *</Label>
          <Input
            id="guardianPhoneNumber"
            placeholder="081234567890"
            type="tel"
            {...register('guardianPhoneNumber', { 
              required: 'Nomor telepon wali wajib diisi',
              pattern: {
                value: /^[0-9]{10,13}$/,
                message: 'Nomor telepon harus 10-13 digit angka'
              }
            })}
          />
          {errors.guardianPhoneNumber && (
            <p className="text-sm text-destructive">{errors.guardianPhoneNumber.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Mengirim...
        </>
      ) : (
        'Kirim Pendaftaran'
      )}
    </Button>
  );
};

export function SimpleMultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);

  const initialState: MarriageRegistrationFormState = { message: "", success: false };
  const [state, formAction] = useActionState(submitMarriageRegistrationForm, initialState);

  const methods = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      groomNama: '',
      groomBin: '',
      groomPendidikanAkhir: '',
      groomDateOfBirth: null,
      groomUmur: 19,
      brideNama: '',
      brideBinti: '',
      bridePendidikanAkhir: '',
      brideDateOfBirth: null,
      brideUmur: 19,
      tempatNikah: 'Di KUA',
      tanggalNikah: null,
      waktuNikah: '',
      alamatNikah: '',
      alamatDetail: '',
      kelurahan: '',
      latitude: undefined,
      longitude: undefined,
      guardianNama: '',
      guardianBin: '',
      guardianNik: '',
      guardianRelationship: '',
      guardianStatus: '',
      guardianAddress: '',
      guardianPhoneNumber: '',
    },
  });

  const { handleSubmit, getValues } = methods;
  const [isPending, startTransition] = useTransition();

  const onSubmit = async (formData: FormData) => {
    const fd = new FormData();
    
    // Gabungkan nama dan bin/binti untuk calon suami dan istri
    const groomNamaDanBin = `${formData.groomNama} bin ${formData.groomBin}`.trim();
    const brideNamaDanBinti = `${formData.brideNama} binti ${formData.brideBinti}`.trim();
    
    // Map to form field names expected by actions.ts
    fd.append('groomNamaDanBin', groomNamaDanBin);
    fd.append('groomFullName', groomNamaDanBin); // For backward compatibility
    fd.append('groomEducation', formData.groomPendidikanAkhir);
    fd.append('groomDateOfBirth', formData.groomDateOfBirth ? format(formData.groomDateOfBirth, 'yyyy-MM-dd') : '');
    fd.append('groomUmur', formData.groomUmur.toString());

    fd.append('brideNamaDanBinti', brideNamaDanBinti);
    fd.append('brideFullName', brideNamaDanBinti); // For backward compatibility
    fd.append('brideEducation', formData.bridePendidikanAkhir);
    fd.append('brideDateOfBirth', formData.brideDateOfBirth ? format(formData.brideDateOfBirth, 'yyyy-MM-dd') : '');
    fd.append('brideUmur', formData.brideUmur.toString());

    fd.append('weddingLocation', formData.tempatNikah);
    fd.append('weddingDate', formData.tanggalNikah ? format(formData.tanggalNikah, 'yyyy-MM-dd') : '');
    fd.append('weddingTime', formData.waktuNikah);
    fd.append('alamatNikah', formData.alamatNikah);
    fd.append('alamatDetail', formData.alamatDetail);
    fd.append('kelurahan', formData.kelurahan);
    
    // Add coordinates if available
    if (formData.latitude !== undefined && formData.longitude !== undefined) {
      fd.append('latitude', formData.latitude.toString());
      fd.append('longitude', formData.longitude.toString());
    }

    // Add wali nikah data - gabungkan nama dan bin menjadi guardianFullName
    const guardianFullName = `${formData.guardianNama} bin ${formData.guardianBin}`.trim();
    fd.append('guardianFullName', guardianFullName);
    fd.append('guardianNik', formData.guardianNik);
    fd.append('guardianRelationship', formData.guardianRelationship);
    fd.append('guardianStatus', formData.guardianStatus);
    fd.append('guardianAddress', formData.guardianAddress);
    fd.append('guardianPhoneNumber', formData.guardianPhoneNumber);

    startTransition(() => formAction(fd));
  };

  useEffect(() => {
    if (state.message === "") return;

    if (state.success && state.data) {
      toast({ title: "Berhasil!", description: state.message, variant: "default" });
      
      // Save to localStorage for fallback in status page
      if (state.data.nomor_pendaftaran) {
        try {
          const storageKey = `registration_${state.data.nomor_pendaftaran}`;
          const storageData = {
            calon_suami: { nama_lengkap: state.data.nama_suami },
            calon_istri: { nama_lengkap: state.data.nama_istri },
            waktu_nikah: state.data.weddingTime,
            alamat_akad: state.data.alamat_akad,
            tempat_nikah: state.data.weddingLocation,
            tanggal_nikah: state.data.tanggal_nikah
          };
          localStorage.setItem(storageKey, JSON.stringify(storageData));
          console.log('💾 Saved registration to localStorage:', storageKey, storageData);
        } catch (e) {
          console.warn('Failed to save to localStorage:', e);
        }
      }
      
      // Redirect dengan data yang sesuai dengan struktur API response
      const params = new URLSearchParams();
      if (state.data.nomor_pendaftaran) params.set('nomor_pendaftaran', state.data.nomor_pendaftaran);
      if (state.data.status_pendaftaran) params.set('status_pendaftaran', state.data.status_pendaftaran);
      if (state.data.nama_suami) params.set('nama_suami', state.data.nama_suami);
      if (state.data.nama_istri) params.set('nama_istri', state.data.nama_istri);
      if (state.data.tanggal_nikah) params.set('tanggal_nikah', state.data.tanggal_nikah);
      if (state.data.weddingTime) params.set('weddingTime', state.data.weddingTime);
      if (state.data.weddingLocation) params.set('weddingLocation', state.data.weddingLocation);
      if (state.data.alamat_akad) params.set('alamat_akad', state.data.alamat_akad);
      
      router.push(`/pendaftaran/sukses?${params.toString()}`);
    } else if (!state.success) {
      // Show error message with details if available
      const errorDescription = state.errors 
        ? `${state.message}\n\nDetail: ${state.errors}` 
        : state.message;
      
      toast({ 
        title: "Gagal Mendaftar", 
        description: errorDescription, 
        variant: "destructive",
        duration: 10000, // Show longer for errors
      });
    }
  }, [state, toast, router]);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Formulir Pendaftaran Nikah</CardTitle>
        <CardDescription>
          Isi formulir berikut untuk mendaftar nikah. Pastikan semua data yang diisi benar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress Steps */}
        <div className="mb-8">
          <ol className="flex items-center w-full text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base">
            {steps.map((step, index) => (
              <li key={step.id} className={cn(
                "flex items-center",
                index !== steps.length - 1 && "w-full after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block sm:after:mx-6 xl:after:mx-10 dark:after:border-gray-700"
              )}>
                <span className={cn(
                  "flex items-center justify-center w-8 h-8 mr-2 sm:mr-4 rounded-full",
                  index < currentStep ? "bg-green-500 text-white" :
                  index === currentStep ? "bg-blue-600 text-white" :
                  "bg-gray-200 text-gray-500"
                )}>
                  {index < currentStep ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </span>
                <span className={cn(
                  "hidden sm:inline-flex",
                  index === currentStep && "font-semibold text-blue-600"
                )}>
                  {step.name}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {!state.success && state.message && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Pendaftaran Gagal</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        <Separator className="my-8" />

        <FormProvider {...methods}>
          <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 0 && <Step1 />}
                {currentStep === 1 && <Step2 />}
                {currentStep === 2 && <Step3 />}
                {currentStep === 3 && <Step4 />}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 pt-5 border-t flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={prev}
                disabled={currentStep === 0 || isPending}
              >
                Sebelumnya
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={next}>
                  Selanjutnya
                </Button>
              ) : (
                <SubmitButton />
              )}
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}

