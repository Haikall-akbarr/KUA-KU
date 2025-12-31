
"use client";

import React, { useState, useActionState, useEffect, useRef, useTransition } from "react";
import { useFormStatus, useFormState } from "react-dom";
import { useForm, FormProvider, Controller, useFormContext } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { format, parseISO, differenceInYears, getDay, addDays, addMonths } from "date-fns";
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
import { getAvailableTimeSlots } from "@/lib/simnikah-api";
import { Loader2, CalendarIcon, User, Users, FileText, CheckCircle, Info, MapPin, Building, Clock, FileUp, FileCheck2, AlertCircle } from "lucide-react";
import { educationLevels, occupations } from "@/lib/form-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { kalimantanData } from "@/lib/location-data";
import { OutsideKUALocation } from "./OutsideKUALocation";


const groomPersonFields = ['groomFullName', 'groomNik', 'groomCitizenship', 'groomPassportNumber', 'groomPlaceOfBirth', 'groomDateOfBirth', 'groomStatus', 'groomReligion', 'groomEducation', 'groomOccupation', 'groomOccupationDescription', 'groomPhoneNumber', 'groomEmail', 'groomAddress'];
const groomFatherFields = ['groomFatherPresenceStatus', 'groomFatherName', 'groomFatherNik', 'groomFatherCitizenship', 'groomFatherCountryOfOrigin', 'groomFatherPassportNumber', 'groomFatherPlaceOfBirth', 'groomFatherDateOfBirth', 'groomFatherReligion', 'groomFatherOccupation', 'groomFatherOccupationDescription', 'groomFatherAddress'];
const groomMotherFields = ['groomMotherPresenceStatus', 'groomMotherName', 'groomMotherNik', 'groomMotherCitizenship', 'groomMotherCountryOfOrigin', 'groomMotherPassportNumber', 'groomMotherPlaceOfBirth', 'groomMotherDateOfBirth', 'groomMotherReligion', 'groomMotherOccupation', 'groomMotherOccupationDescription', 'groomMotherAddress'];
const bridePersonFields = ['brideFullName', 'brideNik', 'brideCitizenship', 'bridePassportNumber', 'bridePlaceOfBirth', 'brideDateOfBirth', 'brideStatus', 'brideReligion', 'brideEducation', 'brideOccupation', 'brideOccupationDescription', 'bridePhoneNumber', 'brideEmail', 'brideAddress'];
const brideFatherFields = ['brideFatherPresenceStatus', 'brideFatherName', 'brideFatherNik', 'brideFatherCitizenship', 'brideFatherCountryOfOrigin', 'brideFatherPassportNumber', 'brideFatherPlaceOfBirth', 'brideFatherDateOfBirth', 'brideFatherReligion', 'brideFatherOccupation', 'brideFatherOccupationDescription', 'brideFatherAddress'];
const brideMotherFields = ['brideMotherPresenceStatus', 'brideMotherName', 'brideMotherNik', 'brideMotherCitizenship', 'brideMotherCountryOfOrigin', 'brideMotherPassportNumber', 'brideMotherPlaceOfBirth', 'brideMotherDateOfBirth', 'brideMotherReligion', 'brideMotherOccupation', 'brideMotherOccupationDescription', 'brideMotherAddress'];
const guardianFields = ['guardianFullName', 'guardianNik', 'guardianRelationship', 'guardianAddress', 'guardianStatus', 'guardianReligion', 'guardianPhoneNumber'];

const steps = [
    { id: "01", name: "Jadwal & Lokasi", fields: ['province', 'regency', 'district', 'kua', 'weddingLocation', 'weddingDate', 'weddingTime', 'dispensationNumber'] },
    { id: "02", name: "Calon Suami", subSteps: { groom: groomPersonFields, groomFather: groomFatherFields, groomMother: groomMotherFields } },
    { id: "03", name: "Calon Istri", subSteps: { bride: bridePersonFields, brideFather: brideFatherFields, brideMother: brideMotherFields } },
    { id: "04", name: "Wali Nikah", fields: guardianFields },
    { id: "05", name: "Data Dokumen", fields: [] },
    { id: "06", name: "Ringkasan", fields: [] },
];

type FullFormData = any;

const FieldErrorMessage = ({ name }: { name: string }) => {
    const { formState: { errors } } = useFormContext<any>();
    const error = errors[name];
    
    if (error?.message) {
        return <p className="text-sm text-destructive mt-1">{error.message as string}</p>;
    }
    
    return null;
};


const Step1 = () => {
    const { control, watch, setValue, trigger } = useFormContext<FullFormData>();
    const { toast } = useToast();
    const [weddingDateOpen, setWeddingDateOpen] = useState(false);
    const [timeSlots, setTimeSlots] = useState<any[]>([]);
    const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);

    const selectedProvince = watch("province");
    const selectedRegency = watch("regency");
    const selectedDistrict = watch("district");
    const weddingLocation = watch("weddingLocation");
    const weddingDate = watch("weddingDate");

    const regencies = selectedProvince && Array.isArray(kalimantanData) 
        ? (kalimantanData.find(p => p.name === selectedProvince)?.regencies || [])
        : [];
    const districts = selectedRegency && Array.isArray(regencies)
        ? (regencies.find(r => r.name === selectedRegency)?.districts || [])
        : [];

    useEffect(() => {
        if (selectedDistrict) {
            setValue('kua', `KUA ${selectedDistrict}`);
        } else {
            setValue('kua', '');
        }
    }, [selectedDistrict, setValue]);

    // Load time slots when date is selected
    useEffect(() => {
        if (weddingDate) {
            const loadTimeSlots = async () => {
                setLoadingTimeSlots(true);
                try {
                    const dateStr = format(weddingDate, 'yyyy-MM-dd');
                    const data = await getAvailableTimeSlots(dateStr);
                    setTimeSlots(data.data?.time_slots || []);
                    // Reset selected time when slots are loaded
                    const currentTime = watch('weddingTime');
                    if (currentTime) {
                        const slot = data.data?.time_slots?.find((s: any) => s.waktu === currentTime);
                        const isKUA = weddingLocation === 'Di KUA';
                        const isAvailable = isKUA 
                            ? (slot?.kua?.tersedia && (slot?.kua?.jumlah_total || 0) < 1 && (slot?.total?.jumlah_total || 0) < 3)
                            : (slot?.luar_kua?.tersedia && (slot?.luar_kua?.jumlah_total || 0) < 3 && (slot?.total?.jumlah_total || 0) < 3);
                        if (!isAvailable) {
                            setValue('weddingTime', '');
                        }
                    }
                } catch (error: any) {
                    console.error('Error loading time slots:', error);
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
    }, [weddingDate, toast, setValue, watch, weddingLocation]);

    // Reset selected time when tempat nikah changes
    useEffect(() => {
        if (weddingLocation) {
            setValue('weddingTime', '');
        }
    }, [weddingLocation, setValue]);

    // Get available times from API response
    const getAvailableTimes = () => {
        if (!weddingDate || timeSlots.length === 0) return [];
        
        const isKUA = weddingLocation === 'Di KUA';
        
        return timeSlots
            .filter((slot: any) => {
                if (isKUA) {
                    // Untuk KUA: bisa dipilih jika kua tersedia, kua < 1, dan total < 3
                    return slot.kua?.tersedia 
                        && (slot.kua?.jumlah_total || 0) < 1 
                        && (slot.total?.jumlah_total || 0) < 3;
                } else {
                    // Untuk Luar KUA: bisa dipilih jika luar_kua tersedia, luar_kua < 3, dan total < 3
                    return slot.luar_kua?.tersedia 
                        && (slot.luar_kua?.jumlah_total || 0) < 3 
                        && (slot.total?.jumlah_total || 0) < 3;
                }
            })
            .map((slot: any) => slot.waktu)
            .sort();
    };
    
    const availableTimes = getAvailableTimes();

    // Calculate working days (exclude weekends)
    const calculateWorkingDays = (startDate: Date, endDate: Date): number => {
        let workingDays = 0;
        const current = new Date(startDate);
        current.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);
        
        while (current <= end) {
            const dayOfWeek = getDay(current);
            // Monday = 1, Friday = 5, Saturday = 6, Sunday = 0
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                workingDays++;
            }
            current.setDate(current.getDate() + 1);
        }
        return workingDays;
    };

    // Check if dispensasi is required (less than 10 working days)
    const isDispensasiRequired = (): boolean => {
        if (!weddingDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const wedding = new Date(weddingDate);
        wedding.setHours(0, 0, 0, 0);
        
        if (wedding <= today) return false; // Past date
        
        const workingDays = calculateWorkingDays(today, wedding);
        return workingDays < 10;
    };

    const dispensasiRequired = isDispensasiRequired();

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) return;
        setValue("weddingDate", date, { shouldValidate: true });
        
        // Trigger validation for dispensasi field when date changes
        setTimeout(() => {
            trigger('dispensationNumber');
        }, 100);
        
        setWeddingDateOpen(false);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground flex items-center"><MapPin className="mr-3 h-6 w-6 text-primary"/>Lokasi KUA & Jadwal Nikah</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="province">Provinsi <span className="text-destructive">*</span></Label>
                    <Controller name="province" control={control} render={({ field }) => (
                        <Select onValueChange={(value) => { field.onChange(value); setValue('regency', ''); setValue('district', ''); }} value={field.value} disabled>
                            <SelectTrigger id="province"><SelectValue placeholder="Pilih Provinsi" /></SelectTrigger>
                            <SelectContent>
                                {Array.isArray(kalimantanData) && kalimantanData.length > 0
                                    ? kalimantanData.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)
                                    : null}
                            </SelectContent>
                        </Select>
                    )} />
                    <FieldErrorMessage name="province" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="regency">Kabupaten/Kota <span className="text-destructive">*</span></Label>
                    <Controller name="regency" control={control} render={({ field }) => (
                        <Select onValueChange={(value) => { field.onChange(value); setValue('district', ''); }} value={field.value} disabled>
                            <SelectTrigger id="regency"><SelectValue placeholder="Pilih Kabupaten/Kota" /></SelectTrigger>
                            <SelectContent>
                                {Array.isArray(regencies) && regencies.length > 0
                                    ? regencies.map(r => <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)
                                    : null}
                            </SelectContent>
                        </Select>
                    )} />
                    <FieldErrorMessage name="regency" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="district">Kecamatan <span className="text-destructive">*</span></Label>
                     <Controller name="district" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} disabled>
                            <SelectTrigger id="district"><SelectValue placeholder="Pilih Kecamatan" /></SelectTrigger>
                            <SelectContent>
                                {Array.isArray(districts) && districts.length > 0
                                    ? districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)
                                    : null}
                            </SelectContent>
                        </Select>
                    )} />
                    <FieldErrorMessage name="district" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="kua">KUA <span className="text-destructive">*</span></Label>
                    <Controller name="kua" control={control} render={({ field }) => (
                        <Input {...field} value={field.value || ''} readOnly />
                    )} />
                    <FieldErrorMessage name="kua" />
                </div>
            </div>
            <Separator/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="weddingLocation">Nikah Di <span className="text-destructive">*</span></Label>
                    <Controller name="weddingLocation" control={control} render={({ field }) => (
                        <Select onValueChange={(value) => { field.onChange(value); setValue('weddingDate', undefined, { shouldValidate: true }); setValue('weddingTime', '', { shouldValidate: true }); }} value={field.value}>
                            <SelectTrigger id="weddingLocation"><SelectValue placeholder="Pilih Lokasi Nikah" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Di KUA">Di KUA (Pada hari dan jam kerja)</SelectItem>
                                <SelectItem value="Di Luar KUA">Di Luar KUA</SelectItem>
                            </SelectContent>
                        </Select>
                    )} />
                     <FieldErrorMessage name="weddingLocation" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dispensationNumber">
                        No. Surat Dispensasi Kecamatan
                        {dispensasiRequired && <span className="text-destructive"> *</span>}
                        {!dispensasiRequired && ' (jika ada)'}
                    </Label>
                    {dispensasiRequired && (
                        <p className="text-xs text-amber-600 mb-1">
                            ⚠️ Wajib diisi karena di tanggal nikah kurang dari 10 hari kerja
                        </p>
                    )}
                    <Controller 
                        name="dispensationNumber" 
                        control={control} 
                        rules={{
                            required: dispensasiRequired ? 'Nomor surat dispensasi wajib diisi jika tanggal nikah kurang dari 10 hari kerja' : false
                        }}
                        render={({ field }) => (
                            <Input 
                                {...field} 
                                value={field.value || ''} 
                                placeholder="No. Surat Dispensasi" 
                                className={dispensasiRequired && !field.value ? 'border-amber-500' : ''}
                            />
                        )} 
                    />
                    <FieldErrorMessage name="dispensationNumber" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="weddingDate">Tanggal Akad <span className="text-destructive">*</span></Label>
                    <Controller name="weddingDate" control={control} render={({ field }) => (
                        <>
                            <input type="hidden" {...field} value={field.value ? format(field.value, "yyyy-MM-dd") : ""} />
                            <Popover open={weddingDateOpen} onOpenChange={setWeddingDateOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")} disabled={!weddingLocation}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value ? format(field.value, "PPP", { locale: IndonesianLocale }) : <span>Pilih tanggal</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={field.value} onSelect={handleDateSelect} 
                                    disabled={(date) => {
                                        const today = new Date();
                                        today.setHours(0,0,0,0);
                                        // Allow all future dates, but validate working days
                                        if (date < today) return true; // Only block past dates
                                        if (date > addMonths(today, 3)) return true;
                                        if (weddingLocation === 'Di KUA') {
                                            const day = getDay(date);
                                            return day === 0 || day === 6; // Block weekends for Di KUA
                                        }
                                        return false;
                                    }}
                                    initialFocus locale={IndonesianLocale} />
                                </PopoverContent>
                            </Popover>
                        </>
                    )} />
                    <FieldErrorMessage name="weddingDate" />
                </div>
                <div className="space-y-2">
                     <Label htmlFor="weddingTime">Jam Akad <span className="text-destructive">*</span></Label>
                    <Controller name="weddingTime" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} disabled={!weddingDate || loadingTimeSlots}>
                            <SelectTrigger id="weddingTime">
                                <SelectValue placeholder={loadingTimeSlots ? "Memuat slot waktu..." : "Pilih Jam Akad"} />
                            </SelectTrigger>
                            <SelectContent>
                                {loadingTimeSlots ? (
                                    <SelectItem value="loading" disabled>Memuat slot waktu...</SelectItem>
                                ) : availableTimes.length > 0 ? (
                                    availableTimes.map(time => {
                                        const slot = timeSlots.find((s: any) => s.waktu === time);
                                        const isKUA = weddingLocation === 'Di KUA';
                                        const kuaCount = slot?.kua?.jumlah_total || 0;
                                        const luarKuaCount = slot?.luar_kua?.jumlah_total || 0;
                                        const totalCount = slot?.total?.jumlah_total || 0;
                                        
                                        return (
                                            <SelectItem key={time} value={time}>
                                                {time} WITA
                                                {slot && (
                                                    <span className="text-xs text-muted-foreground ml-2">
                                                        ({isKUA ? `KUA: ${kuaCount}/1` : `Luar: ${luarKuaCount}/3`}, Total: {totalCount}/3)
                                                    </span>
                                                )}
                                            </SelectItem>
                                        );
                                    })
                                ) : (
                                    <SelectItem value="disabled" disabled>
                                        {!weddingDate ? "Pilih tanggal dulu" : !weddingLocation ? "Pilih lokasi dulu" : "Tidak ada slot tersedia"}
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    )} />
                    <FieldErrorMessage name="weddingTime" />
                </div>
            </div>

            {/* Map Selector for Outside KUA */}
            {weddingLocation === 'Di Luar KUA' && (
                <div className="mt-8 pt-6 border-t">
                    <OutsideKUALocation isVisible={true} />
                </div>
            )}
        </div>
    );
};

const PersonSubForm = ({ prefix, personType }: { prefix: 'groom' | 'bride', personType: 'suami' | 'istri'}) => {
    const { control, watch } = useFormContext<FullFormData>();
    const [dobOpen, setDobOpen] = useState(false);
    const dob = watch(`${prefix}DateOfBirth` as any) as Date | undefined;
    const age = dob ? differenceInYears(new Date(), dob) : null;
    const selectedOccupation = watch(`${prefix}Occupation` as any);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}Citizenship`}>Warga Negara <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}Citizenship` as any} control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value as string}>
                            <SelectTrigger><SelectValue placeholder="Pilih Kewarganegaraan" /></SelectTrigger>
                            <SelectContent> <SelectItem value="WNI">WNI</SelectItem> <SelectItem value="WNA">WNA</SelectItem> </SelectContent>
                        </Select>
                    )} />
                    <FieldErrorMessage name={`${prefix}Citizenship`} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}PassportNumber`}>No. Paspor (jika WNA)</Label>
                    <Controller name={`${prefix}PassportNumber` as any} control={control} render={({ field }) => <Input {...field} value={field.value as string || ''} placeholder="Nomor Paspor" />} />
                    <FieldErrorMessage name={`${prefix}PassportNumber`} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}Nik`}>NIK <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}Nik` as any} control={control} render={({ field }) => <Input {...field} placeholder="16 Digit NIK" maxLength={16} />} />
                    <FieldErrorMessage name={`${prefix}Nik`} />
                </div>
                <div className="space-y-2 lg:col-span-3">
                    <Label htmlFor={`${prefix}FullName`}>Nama Lengkap (sesuai KTP) <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}FullName` as any} control={control} render={({ field }) => <Input {...field} placeholder={`Nama Lengkap Calon ${personType}`} />} />
                    <FieldErrorMessage name={`${prefix}FullName`} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}PlaceOfBirth`}>Tempat Lahir <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}PlaceOfBirth` as any} control={control} render={({ field }) => <Input {...field} placeholder="Kota Kelahiran" />} />
                    <FieldErrorMessage name={`${prefix}PlaceOfBirth`} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}DateOfBirth`}>Tanggal Lahir <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}DateOfBirth` as any} control={control} render={({ field }) => (
                        <>
                            <input type="hidden" {...field} value={field.value ? format(field.value, "yyyy-MM-dd") : ""} />
                            <Popover open={dobOpen} onOpenChange={setDobOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value ? format(field.value as Date, "PPP", { locale: IndonesianLocale }) : <span>Pilih tanggal lahir</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={field.value as Date} onSelect={(date) => { field.onChange(date); setDobOpen(false); }} captionLayout="dropdown-buttons" fromYear={1950} toYear={new Date().getFullYear() - 17} disabled={(date) => date > new Date(new Date().setFullYear(new Date().getFullYear() - 17))} initialFocus locale={IndonesianLocale} />
                                </PopoverContent>
                            </Popover>
                        </>
                    )} />
                    <FieldErrorMessage name={`${prefix}DateOfBirth`} />
                </div>
                <div className="space-y-2">
                    <Label>Umur</Label>
                    <Input value={age !== null ? `${age} Tahun` : ''} readOnly placeholder="Umur akan terisi otomatis"/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}Status`}>Status <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}Status` as any} control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value as string}><SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger><SelectContent><SelectItem value="Belum Kawin">Belum Kawin</SelectItem><SelectItem value="Kawin">Kawin</SelectItem><SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem><SelectItem value="Cerai Mati">Cerai Mati</SelectItem></SelectContent></Select>
                    )} />
                    <FieldErrorMessage name={`${prefix}Status`} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}Religion`}>Agama <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}Religion` as any} control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value as string}><SelectTrigger><SelectValue placeholder="Pilih Agama" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Islam">Islam</SelectItem>
                            </SelectContent>
                        </Select>
                    )} />
                    <FieldErrorMessage name={`${prefix}Religion`} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}Education`}>Pendidikan <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}Education` as any} control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value as string}><SelectTrigger><SelectValue placeholder="Pilih Pendidikan" /></SelectTrigger><SelectContent>{educationLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}</SelectContent></Select>
                    )} />
                    <FieldErrorMessage name={`${prefix}Education`} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}Occupation`}>Pekerjaan <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}Occupation` as any} control={control} render={({ field }) => (
                         <Select onValueChange={field.onChange} value={field.value as string}><SelectTrigger><SelectValue placeholder="Pilih Pekerjaan" /></SelectTrigger><SelectContent>{occupations.map(job => <SelectItem key={job} value={job}>{job}</SelectItem>)}</SelectContent></Select>
                    )} />
                    <FieldErrorMessage name={`${prefix}Occupation`} />
                </div>
                 <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor={`${prefix}OccupationDescription`}>Jika Pekerjaan Lainnya</Label>
                    <Controller name={`${prefix}OccupationDescription` as any} control={control} render={({ field }) => <Input {...field} value={field.value as string || ''} placeholder="Sebutkan pekerjaan" readOnly={selectedOccupation !== 'Lainnya'} />} />
                    <FieldErrorMessage name={`${prefix}OccupationDescription`}/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor={`${prefix}PhoneNumber`}>Nomor Telepon/HP <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}PhoneNumber` as any} control={control} render={({ field }) => <Input {...field} type="tel" placeholder="08..." />} />
                    <FieldErrorMessage name={`${prefix}PhoneNumber`} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}Email`}>Email <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}Email` as any} control={control} render={({ field }) => <Input {...field} type="email" placeholder="nama@email.com" />} />
                    <FieldErrorMessage name={`${prefix}Email`} />
                </div>
                <div className="space-y-2 lg:col-span-3">
                    <Label htmlFor={`${prefix}Address`}>Alamat (sesuai KTP) <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}Address` as any} control={control} render={({ field }) => <Textarea {...field} placeholder="Alamat lengkap sesuai KTP" />} />
                    <FieldErrorMessage name={`${prefix}Address`} />
                </div>
            </div>
        </div>
    )
}

const ParentSubForm = ({ prefix, personType }: { prefix: 'groomFather' | 'groomMother' | 'brideFather' | 'brideMother', personType: 'Ayah' | 'Ibu' }) => {
    const { control, watch, setValue } = useFormContext<FullFormData>();
    const [dobOpen, setDobOpen] = useState(false);
    
    const presenceStatus = watch(`${prefix}PresenceStatus` as any);
    const citizenship = watch(`${prefix}Citizenship` as any);
    const selectedOccupation = watch(`${prefix}Occupation` as any);

    const isReadOnly = presenceStatus === "Wafat" || presenceStatus === "Tidak Diketahui";

    useEffect(() => {
        if (citizenship === 'WNI') {
            setValue(`${prefix}CountryOfOrigin` as any, 'INDONESIA');
        }
    }, [citizenship, setValue, prefix]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 items-start">
                 <div className="space-y-2">
                    <Label htmlFor={`${prefix}PresenceStatus`}>Status Keberadaan <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}PresenceStatus` as any} control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value as string}>
                            <SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Hidup">Hidup</SelectItem>
                                <SelectItem value="Wafat">Wafat</SelectItem>
                                <SelectItem value="Tidak Diketahui">Tidak Diketahui</SelectItem>
                            </SelectContent>
                        </Select>
                    )} />
                    <FieldErrorMessage name={`${prefix}PresenceStatus`} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor={`${prefix}Citizenship`}>Warga Negara {isReadOnly ? '' : <span className="text-destructive">*</span>}</Label>
                    <Controller name={`${prefix}Citizenship` as any} control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value as string} disabled={isReadOnly}>
                            <SelectTrigger><SelectValue placeholder="Pilih Kewarganegaraan" /></SelectTrigger>
                            <SelectContent> <SelectItem value="WNI">WNI</SelectItem> <SelectItem value="WNA">WNA</SelectItem> </SelectContent>
                        </Select>
                    )} />
                    <FieldErrorMessage name={`${prefix}Citizenship`} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}CountryOfOrigin`}>Negara Asal {citizenship !== 'WNA' || isReadOnly ? '' : <span className="text-destructive">*</span>}</Label>
                    <Controller name={`${prefix}CountryOfOrigin` as any} control={control} render={({ field }) => (
                        <Input {...field} value={field.value as string || ''} placeholder="Negara Asal" readOnly={isReadOnly || citizenship !== 'WNA'} />
                    )} />
                    <FieldErrorMessage name={`${prefix}CountryOfOrigin`} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor={`${prefix}PassportNumber`}>No. Paspor (jika WNA)</Label>
                    <Controller name={`${prefix}PassportNumber` as any} control={control} render={({ field }) => <Input {...field} value={field.value as string || ''} placeholder="Nomor Paspor" readOnly={isReadOnly || citizenship !== 'WNA'}/>} />
                     <FieldErrorMessage name={`${prefix}PassportNumber`} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}Nik`}>NIK {isReadOnly ? '' : <span className="text-destructive">*</span>}</Label>
                    <Controller
                        name={`${prefix}Nik` as any}
                        control={control}
                        rules={{
                            required: presenceStatus === 'Hidup' ? 'NIK wajib diisi jika status hidup' : false,
                            minLength: presenceStatus === 'Hidup' ? { value: 16, message: 'NIK harus 16 digit' } : undefined
                        }}
                        render={({ field }) => <Input {...field} value={field.value as string || ''} placeholder={`16 Digit NIK ${personType}`} maxLength={16} readOnly={isReadOnly} />}
                    />
                    <FieldErrorMessage name={`${prefix}Nik`} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}Name`}>Nama Lengkap {personType} {isReadOnly ? '' : <span className="text-destructive">*</span>}</Label>
                    <Controller
                        name={`${prefix}Name` as any}
                        control={control}
                        rules={{ required: presenceStatus === 'Hidup' ? 'Nama wajib diisi jika status hidup' : false }}
                        render={({ field }) => <Input {...field} value={field.value as string || ''} placeholder={`Nama Lengkap ${personType}`} readOnly={isReadOnly} />}
                    />
                    <FieldErrorMessage name={`${prefix}Name`} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}PlaceOfBirth`}>Tempat Lahir {isReadOnly ? '' : <span className="text-destructive">*</span>}</Label>
                    <Controller
                        name={`${prefix}PlaceOfBirth` as any}
                        control={control}
                        rules={{ required: presenceStatus === 'Hidup' ? 'Tempat lahir wajib diisi jika status hidup' : false }}
                        render={({ field }) => <Input {...field} value={field.value as string || ''} placeholder="Kota Kelahiran" readOnly={isReadOnly} />}
                    />
                    <FieldErrorMessage name={`${prefix}PlaceOfBirth`} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}DateOfBirth`}>Tanggal Lahir {isReadOnly ? '' : <span className="text-destructive">*</span>}</Label>
                    <Controller
                        name={`${prefix}DateOfBirth` as any}
                        control={control}
                        rules={{ required: presenceStatus === 'Hidup' ? 'Tanggal lahir wajib diisi jika status hidup' : false }}
                        render={({ field }) => (
                        <>
                            <input type="hidden" {...field} value={field.value ? format(field.value, "yyyy-MM-dd") : ""} />
                            <Popover open={dobOpen} onOpenChange={setDobOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")} disabled={isReadOnly}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value ? format(field.value as Date, "PPP", { locale: IndonesianLocale }) : <span>Pilih tanggal lahir</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={field.value as Date | undefined} onSelect={(date) => { field.onChange(date); setDobOpen(false); }} captionLayout="dropdown-buttons" fromYear={1920} toYear={new Date().getFullYear()} initialFocus locale={IndonesianLocale} />
                                </PopoverContent>
                            </Popover>
                        </>
                    )} />
                    <FieldErrorMessage name={`${prefix}DateOfBirth`} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}Religion`}>Agama {isReadOnly ? '' : <span className="text-destructive">*</span>}</Label>
                    <Controller name={`${prefix}Religion` as any} control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value as string} disabled={isReadOnly}><SelectTrigger><SelectValue placeholder="Pilih Agama" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Islam">Islam</SelectItem>
                            </SelectContent>
                        </Select>
                    )} />
                    <FieldErrorMessage name={`${prefix}Religion`} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}Occupation`}>Pekerjaan {isReadOnly ? '' : <span className="text-destructive">*</span>}</Label>
                    <Controller name={`${prefix}Occupation` as any} control={control} render={({ field }) => (
                         <Select onValueChange={field.onChange} value={field.value as string} disabled={isReadOnly}><SelectTrigger><SelectValue placeholder="Pilih Pekerjaan" /></SelectTrigger><SelectContent>{occupations.map(job => <SelectItem key={job} value={job}>{job}</SelectItem>)}</SelectContent></Select>
                    )} />
                    <FieldErrorMessage name={`${prefix}Occupation`} />
                </div>
                 <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor={`${prefix}OccupationDescription`}>Jika Pekerjaan Lainnya</Label>
                    <Controller name={`${prefix}OccupationDescription` as any} control={control} render={({ field }) => <Input {...field} value={field.value as string || ''} placeholder="Sebutkan pekerjaan" readOnly={isReadOnly || selectedOccupation !== 'Lainnya'} />} />
                    <FieldErrorMessage name={`${prefix}OccupationDescription`}/>
                </div>
                 <div className="space-y-2 md:col-span-3">
                    <Label htmlFor={`${prefix}Address`}>Alamat (sesuai KTP) {isReadOnly ? '' : <span className="text-destructive">*</span>}</Label>
                    <Controller name={`${prefix}Address` as any} control={control} render={({ field }) => <Textarea {...field} value={field.value as string || ''} placeholder={`Alamat lengkap ${personType} sesuai KTP`} readOnly={isReadOnly} />} />
                    <FieldErrorMessage name={`${prefix}Address`} />
                </div>
            </div>
        </div>
    )
}

const Step2 = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (value: string) => void }) => (
    <div className="space-y-6">
        <h3 className="text-xl font-semibold text-foreground flex items-center"><User className="mr-3 h-6 w-6 text-primary"/>Data Calon Suami & Keluarga</h3>
         <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="groom">Calon Suami</TabsTrigger>
                <TabsTrigger value="groomFather">Ayah Suami</TabsTrigger>
                <TabsTrigger value="groomMother">Ibu Suami</TabsTrigger>
            </TabsList>
            <TabsContent value="groom" className="mt-6"> <PersonSubForm prefix="groom" personType="suami" /> </TabsContent>
            <TabsContent value="groomFather" className="mt-6"> <ParentSubForm prefix="groomFather" personType="Ayah" /> </TabsContent>
            <TabsContent value="groomMother" className="mt-6"> <ParentSubForm prefix="groomMother" personType="Ibu" /> </TabsContent>
        </Tabs>
    </div>
);

const Step3 = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (value: string) => void }) => (
    <div className="space-y-6">
        <h3 className="text-xl font-semibold text-foreground flex items-center"><User className="mr-3 h-6 w-6 text-primary"/>Data Calon Istri & Keluarga</h3>
        <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="bride">Calon Istri</TabsTrigger>
                <TabsTrigger value="brideFather">Ayah Istri</TabsTrigger>
                <TabsTrigger value="brideMother">Ibu Istri</TabsTrigger>
            </TabsList>
            <TabsContent value="bride" className="mt-6"> <PersonSubForm prefix="bride" personType="istri" /> </TabsContent>
            <TabsContent value="brideFather" className="mt-6"> <ParentSubForm prefix="brideFather" personType="Ayah" /> </TabsContent>
            <TabsContent value="brideMother" className="mt-6"> <ParentSubForm prefix="brideMother" personType="Ibu" /> </TabsContent>
        </Tabs>
    </div>
);

const Step4 = () => {
    const { control } = useFormContext<FullFormData>();
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground flex items-center"><Users className="mr-3 h-6 w-6 text-primary"/>Data Wali Nikah</h3>
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Informasi Wali</AlertTitle>
                <AlertDescription>
                    Wali nikah adalah seorang laki-laki yang memenuhi syarat hukum Islam. Biasanya adalah Ayah Kandung dari calon mempelai wanita. Jika ayah kandung tidak bisa menjadi wali, maka posisinya bisa digantikan oleh wali nasab lainnya sesuai urutan.
                </AlertDescription>
            </Alert>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="guardianFullName">Nama Lengkap Wali (sesuai KTP) <span className="text-destructive">*</span></Label>
                    <Controller name="guardianFullName" control={control} render={({ field }) => <Input {...field} placeholder="Nama Lengkap Wali" />} />
                    <FieldErrorMessage name="guardianFullName" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="guardianNik">NIK <span className="text-destructive">*</span></Label>
                    <Controller name="guardianNik" control={control} render={({ field }) => <Input {...field} placeholder="16 Digit NIK" maxLength={16} />} />
                    <FieldErrorMessage name="guardianNik" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="guardianStatus">Status <span className="text-destructive">*</span></Label>
                    <Controller name="guardianStatus" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Pilih Status Wali" /></SelectTrigger><SelectContent><SelectItem value="Hidup">Hidup</SelectItem><SelectItem value="Wafat">Wafat</SelectItem></SelectContent></Select>
                    )} />
                    <FieldErrorMessage name="guardianStatus" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="guardianRelationship">Hubungan dengan Calon Istri <span className="text-destructive">*</span></Label>
                    <Controller name="guardianRelationship" control={control} render={({ field }) => <Input {...field} placeholder="Contoh: Ayah Kandung, Kakak Kandung" />} />
                    <FieldErrorMessage name="guardianRelationship" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="guardianReligion">Agama <span className="text-destructive">*</span></Label>
                    <Controller name="guardianReligion" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Pilih Agama" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Islam">Islam</SelectItem>
                            </SelectContent>
                        </Select>
                    )} />
                    <FieldErrorMessage name="guardianReligion" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="guardianPhoneNumber">Nomor Telepon/HP <span className="text-destructive">*</span></Label>
                    <Controller name="guardianPhoneNumber" control={control} render={({ field }) => <Input {...field} type="tel" placeholder="08..." />} />
                    <FieldErrorMessage name="guardianPhoneNumber" />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="guardianAddress">Alamat (sesuai KTP) <span className="text-destructive">*</span></Label>
                    <Controller name="guardianAddress" control={control} render={({ field }) => <Textarea {...field} placeholder="Alamat lengkap wali sesuai KTP" />} />
                    <FieldErrorMessage name="guardianAddress" />
                </div>
            </div>
        </div>
    );
};

const Step5 = () => (
    <div className="space-y-6">
        <h3 className="text-xl font-semibold text-foreground flex items-center"><FileCheck2 className="mr-3 h-6 w-6 text-primary"/>Dokumen Persyaratan</h3>
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Perhatian!</AlertTitle>
            <AlertDescription>
                Ini adalah daftar dokumen yang wajib Anda siapkan dan bawa (ASLI dan FOTOKOPI) ke KUA untuk verifikasi. Pendaftaran online ini hanya untuk pendataan awal.
            </AlertDescription>
        </Alert>
        <div className="p-6 border rounded-lg space-y-4">
            <h4 className="font-semibold text-lg">Dokumen Calon Pengantin (Pria & Wanita)</h4>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Surat Pengantar Nikah dari Kelurahan/Desa (Model N1).</li>
                <li>Fotokopi KTP Elektronik.</li>
                <li>Fotokopi Kartu Keluarga (KK).</li>
                <li>Fotokopi Akta Kelahiran atau Ijazah terakhir.</li>
                <li>Pas foto terbaru ukuran 2x3 dan 4x6 dengan latar belakang biru (masing-masing 4 lembar).</li>
                <li>Surat Rekomendasi Nikah dari KUA asal (jika menikah di luar kecamatan tempat tinggal).</li>
                <li>Surat Imunisasi Tetanus Toksoid (TT) dari Puskesmas untuk calon pengantin wanita.</li>
            </ul>

             <h4 className="font-semibold text-lg pt-4">Dokumen Tambahan (jika diperlukan)</h4>
             <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Akta Cerai asli dari Pengadilan Agama bagi yang berstatus Cerai Hidup.</li>
                <li>Surat Keterangan Kematian (Model N6) dari Kelurahan/Desa bagi yang berstatus Cerai Mati.</li>
                <li>Surat Izin dari atasan bagi anggota TNI/POLRI.</li>
                <li>Surat Dispensasi dari Pengadilan Agama jika usia calon pengantin di bawah 19 tahun.</li>
                <li>Surat Izin dari Kedutaan Besar untuk Warga Negara Asing (WNA).</li>
            </ul>
        </div>
    </div>
);


const SummaryItem = ({ label, value }: { label: string, value: any }) => (
    <div className="flex flex-col sm:flex-row py-2 border-b">
        <p className="w-full sm:w-1/3 font-medium text-muted-foreground">{label}</p>
        <p className="w-full sm:w-2/3 mt-1 sm:mt-0 font-semibold">{value || '-'}</p>
    </div>
);

const Step6 = () => {
    const { getValues } = useFormContext<FullFormData>();
    const formData = getValues();

    return (
         <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground flex items-center"><CheckCircle className="mr-3 h-6 w-6 text-primary"/>Ringkasan & Konfirmasi</h3>
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Periksa Kembali Data Anda</AlertTitle>
                <AlertDescription>
                   Pastikan semua data yang Anda masukkan sudah benar sebelum mengirim formulir. Kesalahan data dapat menghambat proses pendaftaran Anda.
                </AlertDescription>
            </Alert>

            <div className="space-y-4">
                <h4 className="font-semibold text-lg text-primary">Jadwal & Lokasi</h4>
                <SummaryItem label="Lokasi Nikah" value={formData.weddingLocation} />
                <SummaryItem label="Tanggal Akad" value={formData.weddingDate ? format(new Date(formData.weddingDate), "EEEE, dd MMMM yyyy", { locale: IndonesianLocale }) : '-'} />
                <SummaryItem label="Jam Akad" value={formData.weddingTime ? `${formData.weddingTime} WITA` : '-'} />
            </div>
            
            <Separator/>

            <div className="space-y-4">
                <h4 className="font-semibold text-lg text-primary">Calon Suami</h4>
                <SummaryItem label="Nama Lengkap" value={formData.groomFullName} />
                <SummaryItem label="NIK" value={formData.groomNik} />
                <SummaryItem label="Ayah" value={formData.groomFatherName} />
                <SummaryItem label="Ibu" value={formData.groomMotherName} />
            </div>

            <Separator/>

            <div className="space-y-4">
                <h4 className="font-semibold text-lg text-primary">Calon Istri</h4>
                 <SummaryItem label="Nama Lengkap" value={formData.brideFullName} />
                <SummaryItem label="NIK" value={formData.brideNik} />
                <SummaryItem label="Ayah" value={formData.brideFatherName} />
                <SummaryItem label="Ibu" value={formData.brideMotherName} />
            </div>

             <Separator/>

            <div className="space-y-4">
                <h4 className="font-semibold text-lg text-primary">Wali Nikah</h4>
                <SummaryItem label="Nama Lengkap" value={formData.guardianFullName} />
                <SummaryItem label="Hubungan" value={formData.guardianRelationship} />
            </div>

        </div>
    )
};

const SubmitButton = () => {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Mengirim...</> : 'Kirim Pendaftaran'}
        </Button>
    );
}

export function MultiStepMarriageForm() {
    const [currentStep, setCurrentStep] = useState(0);
    const [previousStep, setPreviousStep] = useState(0);
    const [activeTabs, setActiveTabs] = useState<{ [key: number]: string }>({ 1: "groom", 2: "bride" });
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();
    const formRef = useRef<HTMLFormElement>(null);
    
    // Reset registration data when component mounts with a new user
    useEffect(() => {
      if (user?.user_id) {
        // Check if there's any existing registration
        const existingData = localStorage.getItem('marriageRegistrations');
        if (existingData) {
          const registrations = JSON.parse(existingData);
          const userHasActiveRegistration = registrations.some((reg: any) => 
            reg.userId === user.user_id && 
            reg.status !== "Ditolak" && 
            reg.status !== "Selesai"
          );
          
          if (!userHasActiveRegistration) {
            // Clean up old registrations for this user
            const filteredRegistrations = registrations.filter((reg: any) => reg.userId !== user.user_id);
            localStorage.setItem('marriageRegistrations', JSON.stringify(filteredRegistrations));
          }
        }
      }
    }, [user]);
    
    const initialState: MarriageRegistrationFormState = { message: "", success: false };
    const [state, formAction] = useActionState(submitMarriageRegistrationForm, initialState);
    
    const methods = useForm<FullFormData>({
        mode: 'onChange',
        defaultValues: {
            province: 'KALIMANTAN SELATAN', 
            regency: 'KOTA BANJARMASIN', 
            district: 'BANJARMASIN UTARA', 
            kua: 'KUA BANJARMASIN UTARA',
            weddingLocation: '', weddingTime: '', dispensationNumber: '',
            groomFullName: '', groomNik: '', groomCitizenship: 'WNI', groomPassportNumber: '', groomPlaceOfBirth: '', groomDateOfBirth: undefined, groomStatus: '', groomReligion: 'Islam', groomEducation: '', groomOccupation: '', groomOccupationDescription: '', groomPhoneNumber: '', groomEmail: '', groomAddress: '',
            brideFullName: '', brideNik: '', brideCitizenship: 'WNI', bridePassportNumber: '', bridePlaceOfBirth: '', brideDateOfBirth: undefined, brideStatus: '', brideReligion: 'Islam', brideEducation: '', brideOccupation: '', brideOccupationDescription: '', bridePhoneNumber: '', brideEmail: '', brideAddress: '',
            groomFatherPresenceStatus: '', groomFatherName: '', groomFatherNik: '', groomFatherCitizenship: 'WNI', groomFatherCountryOfOrigin: 'INDONESIA', groomFatherPassportNumber: '', groomFatherPlaceOfBirth: '', groomFatherDateOfBirth: null, groomFatherReligion: 'Islam', groomFatherOccupation: '', groomFatherOccupationDescription: '', groomFatherAddress: '',
            groomMotherPresenceStatus: '', groomMotherName: '', groomMotherNik: '', groomMotherCitizenship: 'WNI', groomMotherCountryOfOrigin: 'INDONESIA', groomMotherPassportNumber: '', groomMotherPlaceOfBirth: '', groomMotherDateOfBirth: null, groomMotherReligion: 'Islam', groomMotherOccupation: '', groomMotherOccupationDescription: '', groomMotherAddress: '',
            brideFatherPresenceStatus: '', brideFatherName: '', brideFatherNik: '', brideFatherCitizenship: 'WNI', brideFatherCountryOfOrigin: 'INDONESIA', brideFatherPassportNumber: '', brideFatherPlaceOfBirth: '', brideFatherDateOfBirth: null, brideFatherReligion: 'Islam', brideFatherOccupation: '', brideFatherOccupationDescription: '', brideFatherAddress: '',
            brideMotherPresenceStatus: '', brideMotherName: '', brideMotherNik: '', brideMotherCitizenship: 'WNI', brideMotherCountryOfOrigin: 'INDONESIA', brideMotherPassportNumber: '', brideMotherPlaceOfBirth: '', brideMotherDateOfBirth: null, brideMotherReligion: 'Islam', brideMotherOccupation: '', brideMotherOccupationDescription: '', brideMotherAddress: '',
            guardianFullName: '', guardianNik: '', guardianRelationship: '', guardianStatus: 'Hidup', guardianReligion: 'Islam', guardianAddress: '', guardianPhoneNumber: ''
        }
    });

    const { trigger, handleSubmit, getValues } = methods;
    const [isPending, startTransition] = useTransition();

    const onSubmit = async (formData: FullFormData) => {
        // Build FormData from form state explicitly
        const fd = new FormData();
        for (const [key, value] of Object.entries(formData)) {
            if (value === null || value === undefined) {
                fd.append(key, "");
            } else if (value instanceof Date) {
                fd.append(key, format(value, "yyyy-MM-dd"));
            } else {
                fd.append(key, String(value));
            }
        }
        
        // Submit to server action with transition
        startTransition(() => formAction(fd));
    };

    const next = async () => {
        const currentStepConfig = steps[currentStep];
        
        // No validation, just move to the next step/tab
        if (currentStepConfig.subSteps) {
            const currentSubStepName = activeTabs[currentStep];
            const subStepKeys = Object.keys(currentStepConfig.subSteps);
            const currentSubStepIndex = subStepKeys.indexOf(currentSubStepName);

            if (currentSubStepIndex < subStepKeys.length - 1) {
                const nextSubStep = subStepKeys[currentSubStepIndex + 1];
                setActiveTabs(prev => ({ ...prev, [currentStep]: nextSubStep }));
                return;
            }
        }

        if (currentStep < steps.length - 1) {
            setPreviousStep(currentStep);
            setCurrentStep(step => step + 1);
        }
    };
    
    const prev = () => {
        const currentStepConfig = steps[currentStep];
    
        if (currentStepConfig.subSteps) {
            const currentSubStepName = activeTabs[currentStep];
            const subStepKeys = Object.keys(currentStepConfig.subSteps);
            const currentSubStepIndex = subStepKeys.indexOf(currentSubStepName);
    
            if (currentSubStepIndex > 0) {
                const prevSubStep = subStepKeys[currentSubStepIndex - 1];
                setActiveTabs(prev => ({ ...prev, [currentStep]: prevSubStep }));
                return;
            }
        }
    
        if (currentStep > 0) {
            setPreviousStep(currentStep);
            setCurrentStep(step => step - 1);
        }
    };

    useEffect(() => {
        if (state.message === "") return;

        console.log('Form submission state:', state);
        
        if (state.success && state.data) {
            toast({ title: "Berhasil!", description: state.message, variant: "default" });

            try {
                console.log('Starting to save registration data...');
                // Generate unique ID if not provided
                const registrationId = state.data.nomor_pendaftaran || `reg_${Date.now()}`;                    // Ambil data dari form state untuk memastikan data yang valid
                    const values = getValues();
                    
                    // Get the raw form values
                    const formValues = methods.getValues();
                    
                    const registrationData = {
                        id: registrationId,
                        userId: user?.user_id,  // Tambahkan userId
                        groomName: formValues.groomFullName || state.data?.nama_suami || '',
                        brideName: formValues.brideFullName || state.data?.nama_istri || '',
                        registrationDate: new Date().toISOString(),
                        weddingDate: formValues.weddingDate ? 
                          (formValues.weddingDate instanceof Date ? 
                            formValues.weddingDate.toISOString().split('T')[0] : 
                            String(formValues.weddingDate)
                          ) : state.data?.tanggal_nikah || '',
                        weddingTime: formValues.weddingTime || state.data?.weddingTime || '',
                        weddingLocation: formValues.weddingLocation || state.data?.weddingLocation || '',
                        status: "Menunggu Verifikasi",
                        penghulu: null,
                        groomNik: formValues.groomNik || '',  // Tambahkan NIK untuk pengecekan duplikasi
                        brideNik: formValues.brideNik || ''
                    };
                    
                    console.log('Saving registration data:', registrationData);
                    
                    const existing = JSON.parse(localStorage.getItem('marriageRegistrations') || '[]');                // Tambah data baru di awal array (unshift) agar muncul di paling atas
                existing.unshift(registrationData);
                
                // Simpan ke localStorage
                localStorage.setItem('marriageRegistrations', JSON.stringify(existing));
            } catch (e) {
                console.error("Could not save to localStorage", e);
            }

            // Tambahkan notifikasi untuk user yang melakukan pendaftaran
            try {
                if (user && user.user_id) {
                    const userNotifKey = `notifications_${user.user_id}`;
                    const notif = {
                        id: `notif_${Date.now()}`,
                        title: 'Pendaftaran Nikah Diterima',
                        description: 'Berkas Anda sedang diverifikasi oleh staf kami.',
                        read: false,
                        related_registration: state.data?.nomor_pendaftaran || null,
                        createdAt: new Date().toISOString()
                    };
                    const existingNotifs = JSON.parse(localStorage.getItem(userNotifKey) || '[]');
                    existingNotifs.unshift(notif);
                    localStorage.setItem(userNotifKey, JSON.stringify(existingNotifs));
                }

                // Tambahkan notifikasi untuk staff (agar muncul di dashboard admin yang membaca dari localStorage)
                const staffKey = 'staff_notifications';
                const staffNotif = {
                    id: `staff_notif_${Date.now()}`,
                    title: `Pendaftaran baru: ${state.data?.nomor_pendaftaran || 'N/A'}`,
                    description: `${state.data?.nama_suami || ''} & ${state.data?.nama_istri || ''}`,
                    registrationId: state.data?.nomor_pendaftaran || null,
                    read: false,
                    createdAt: new Date().toISOString()
                };
                const existingStaff = JSON.parse(localStorage.getItem(staffKey) || '[]');
                existingStaff.unshift(staffNotif);
                localStorage.setItem(staffKey, JSON.stringify(existingStaff));
            } catch (e) {
                console.error('Could not save notifications to localStorage', e);
            }

            const params = new URLSearchParams();
            for (const [key, value] of Object.entries(state.data)) {
                if (value !== null && value !== undefined && typeof value !== 'object') {
                    params.append(key, String(value));
                }
            }
            router.push(`/daftar-nikah/sukses?${params.toString()}`);
            methods.reset();
        } else if (!state.success) {
             toast({ title: "Pendaftaran Gagal", description: state.message, variant: "destructive" });
        }
    }, [state, toast, router, methods]);
    
    const delta = currentStep - previousStep;
    
    return (
        <Card className="w-full max-w-5xl mx-auto shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Formulir Pendaftaran Nikah</CardTitle>
                <CardDescription> Ikuti langkah-langkah berikut untuk melengkapi pendaftaran. </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-8 overflow-x-auto pb-4">
                    <ol className="flex items-center w-full min-w-max">
                        {steps.map((step, index) => (
                            <li key={step.name} className={cn("flex w-full items-center", {"after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:inline-block": index !== steps.length - 1 })}>
                                <div className="flex flex-col items-center">
                                    <span className={cn("flex items-center justify-center w-10 h-10 rounded-full text-sm lg:w-12 lg:h-12 shrink-0 transition-colors duration-300", 
                                        index === currentStep ? 'bg-primary text-primary-foreground' : (index < currentStep ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500')
                                    )}>
                                        {index < currentStep ? <CheckCircle className="w-6 h-6"/> : step.id}
                                    </span>
                                     <p className={cn("text-center text-xs font-medium mt-2", index === currentStep ? "text-primary" : "text-muted-foreground")}>{step.name}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
                
                 { !state.success && state.message && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Pendaftaran Gagal</AlertTitle>
                        <AlertDescription>
                           {state.message}
                        </AlertDescription>
                    </Alert>
                 )}

                 <Separator className="my-8"/>
                 
                 <FormProvider {...methods}>
                    <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
                         <AnimatePresence mode="wait">
                            <motion.div
                                key={`${currentStep}-${activeTabs[1]}-${activeTabs[2]}`}
                                initial={{ opacity: 0, x: delta >= 0 ? 50 : -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: delta >= 0 ? -50 : 50 }}
                                transition={{ duration: 0.3 }}
                            >
                                {currentStep === 0 && <Step1 />}
                                {currentStep === 1 && <Step2 activeTab={activeTabs[1]} onTabChange={(value) => setActiveTabs(p => ({...p, 1: value}))} />}
                                {currentStep === 2 && <Step3 activeTab={activeTabs[2]} onTabChange={(value) => setActiveTabs(p => ({...p, 2: value}))} />}
                                {currentStep === 3 && <Step4 />}
                                {currentStep === 4 && <Step5 />}
                                {currentStep === 5 && <Step6 />}
                            </motion.div>
                        </AnimatePresence>
                        <div className="mt-8 pt-5 border-t">
                            <div className="flex justify-between">
                                <Button type="button" onClick={prev} variant="outline" disabled={currentStep === 0 && activeTabs[1] === 'groom' && activeTabs[2] === 'bride'}>
                                    Sebelumnya
                                </Button>
                                {currentStep === steps.length - 1 ? (
                                     <SubmitButton />
                                ) : (
                                    <Button type="button" onClick={next}>
                                        Selanjutnya
                                    </Button>
                                )}
                            </div>
                        </div>
                    </form>
                 </FormProvider>
            </CardContent>
        </Card>
    );
}
