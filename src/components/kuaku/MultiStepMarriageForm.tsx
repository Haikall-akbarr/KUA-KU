
"use client";

import React, { useState, useActionState, useEffect, useRef } from "react";
import { useForm, FormProvider, Controller, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodIssue } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { format, parseISO, differenceInYears } from "date-fns";
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
import { submitMarriageRegistrationForm, type MarriageRegistrationFormState } from "@/app/daftar-nikah/actions";
import { Loader2, CalendarIcon, User, Users, FileText, CheckCircle, Info, MapPin, Building, Clock, FileUp, FileCheck2 } from "lucide-react";
import { educationLevels, occupations } from "@/lib/form-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const steps = [
    { id: "01", name: "Jadwal & Lokasi", fields: ['weddingLocation', 'weddingDate', 'weddingTime', 'dispensationNumber'] },
    { id: "02", name: "Calon Suami", fields: ['groomFullName', 'groomNik', 'groomCitizenship', 'groomPassportNumber', 'groomPlaceOfBirth', 'groomDateOfBirth', 'groomStatus', 'groomReligion', 'groomEducation', 'groomOccupation', 'groomOccupationDescription', 'groomPhoneNumber', 'groomEmail', 'groomAddress', 'groomFatherName', 'groomFatherNik', 'groomFatherReligion', 'groomFatherOccupation', 'groomFatherAddress', 'groomMotherName', 'groomMotherNik', 'groomMotherReligion', 'groomMotherOccupation', 'groomMotherAddress'] },
    { id: "03", name: "Calon Istri", fields: ['brideFullName', 'brideNik', 'brideCitizenship', 'bridePassportNumber', 'bridePlaceOfBirth', 'brideDateOfBirth', 'brideStatus', 'brideReligion', 'brideEducation', 'brideOccupation', 'brideOccupationDescription', 'bridePhoneNumber', 'brideEmail', 'brideAddress', 'brideFatherName', 'brideFatherNik', 'brideFatherReligion', 'brideFatherOccupation', 'brideFatherAddress', 'brideMotherName', 'brideMotherNik', 'brideMotherReligion', 'brideMotherOccupation', 'brideMotherAddress'] },
    { id: "04", name: "Wali Nikah", fields: ['guardianFullName', 'guardianNik', 'guardianRelationship', 'guardianAddress', 'guardianStatus', 'guardianReligion', 'guardianPhoneNumber'] },
    { id: "05", name: "Data Dokumen" },
    { id: "06", name: "Ringkasan" },
];

const personSchema = (prefix: 'groom' | 'bride') => z.object({
  [`${prefix}FullName`]: z.string().min(3, `Nama lengkap calon ${prefix === 'groom' ? 'suami' : 'istri'} minimal 3 karakter.`),
  [`${prefix}Nik`]: z.string().length(16, `NIK calon ${prefix === 'groom' ? 'suami' : 'istri'} harus 16 digit.`).regex(/^\d+$/, "NIK hanya boleh berisi angka."),
  [`${prefix}Citizenship`]: z.string({ required_error: "Kewarganegaraan wajib diisi."}),
  [`${prefix}PassportNumber`]: z.string().optional(),
  [`${prefix}PlaceOfBirth`]: z.string().min(2, `Tempat lahir calon ${prefix === 'groom' ? 'suami' : 'istri'} minimal 2 karakter.`),
  [`${prefix}DateOfBirth`]: z.date({ required_error: `Tanggal lahir calon ${prefix === 'groom' ? 'suami' : 'istri'} wajib diisi.` }),
  [`${prefix}Status`]: z.string({ required_error: "Status perkawinan wajib diisi."}),
  [`${prefix}Religion`]: z.string({ required_error: "Agama wajib diisi."}),
  [`${prefix}Education`]: z.string({ required_error: "Pendidikan terakhir wajib diisi."}),
  [`${prefix}Occupation`]: z.string({ required_error: "Pekerjaan wajib diisi."}),
  [`${prefix}OccupationDescription`]: z.string().optional(),
  [`${prefix}PhoneNumber`]: z.string().min(10, `Nomor telepon minimal 10 digit.`).regex(/^08\d{8,}$/, "Format nomor telepon tidak valid."),
  [`${prefix}Email`]: z.string().email("Format email tidak valid."),
  [`${prefix}Address`]: z.string().min(10, `Alamat minimal 10 karakter.`),
});

const parentSchema = (prefix: 'groomFather' | 'groomMother' | 'brideFather' | 'brideMother') => z.object({
    [`${prefix}Name`]: z.string().min(3, `Nama ayah/ibu minimal 3 karakter.`),
    [`${prefix}Nik`]: z.string().length(16, `NIK ayah/ibu harus 16 digit.`).regex(/^\d+$/, "NIK hanya boleh berisi angka."),
    [`${prefix}Religion`]: z.string({ required_error: "Agama ayah/ibu wajib diisi."}),
    [`${prefix}Occupation`]: z.string({ required_error: "Pekerjaan ayah/ibu wajib diisi."}),
    [`${prefix}Address`]: z.string().min(10, `Alamat ayah/ibu minimal 10 karakter.`),
});

const guardianSchema = z.object({
    guardianFullName: z.string().min(3, "Nama lengkap wali minimal 3 karakter."),
    guardianNik: z.string().length(16, "NIK wali harus 16 digit.").regex(/^\d+$/, "NIK wali hanya boleh berisi angka."),
    guardianRelationship: z.string().min(3, "Hubungan dengan wali wajib diisi."),
    guardianStatus: z.string({ required_error: "Status wali wajib diisi."}),
    guardianReligion: z.string({ required_error: "Agama wali wajib diisi."}),
    guardianAddress: z.string().min(10, "Alamat wali minimal 10 karakter."),
    guardianPhoneNumber: z.string().min(10, "Nomor telepon wali minimal 10 digit.").regex(/^08\d{8,}$/, "Format nomor telepon tidak valid."),
});

const fileSchema = z.any().optional();

const fullSchema = z.object({
    weddingLocation: z.string({ required_error: "Lokasi nikah wajib dipilih."}),
    weddingDate: z.date({ required_error: "Tanggal akad wajib diisi." }),
    weddingTime: z.string({ required_error: "Jam akad wajib dipilih."}),
    dispensationNumber: z.string().optional(),
    
    ...personSchema('groom').shape,
    ...personSchema('bride').shape,
    ...parentSchema('groomFather').shape,
    ...parentSchema('groomMother').shape,
    ...parentSchema('brideFather').shape,
    ...parentSchema('brideMother').shape,
    ...guardianSchema.shape,
}).refine(data => {
    if (data.groomOccupation === "Lainnya") return !!data.groomOccupationDescription && data.groomOccupationDescription.length > 2;
    return true;
}, { message: "Deskripsi pekerjaan lainnya wajib diisi (minimal 3 karakter).", path: ["groomOccupationDescription"]
}).refine(data => {
    if (data.brideOccupation === "Lainnya") return !!data.brideOccupationDescription && data.brideOccupationDescription.length > 2;
    return true;
}, { message: "Deskripsi pekerjaan lainnya wajib diisi (minimal 3 karakter).", path: ["brideOccupationDescription"]
});

type FullFormData = z.infer<typeof fullSchema>;

const FieldErrorMessage = ({ name }: { name: keyof FullFormData }) => {
    const { formState: { errors } } = useFormContext<FullFormData>();
    const error = errors[name];
    return error ? <p className="text-sm text-destructive mt-1">{error.message}</p> : null;
};

const ServerErrorMessage = ({ serverErrors, name }: { serverErrors: ZodIssue[] | undefined, name: string }) => {
    const error = serverErrors?.find(e => e.path.includes(name));
    return error ? <p className="text-sm text-destructive mt-1">{error.message}</p> : null;
}

const Step1 = ({ serverErrors }: { serverErrors?: ZodIssue[] }) => {
    const { control } = useFormContext<FullFormData>();
    const [weddingDateOpen, setWeddingDateOpen] = useState(false);
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground flex items-center"><MapPin className="mr-3 h-6 w-6 text-primary"/>Lokasi KUA & Jadwal Nikah</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"> <Label>Provinsi</Label> <Input value="KALIMANTAN SELATAN" disabled /> </div>
                <div className="space-y-2"> <Label>Kabupaten/Kota</Label> <Input value="KOTA BANJARMASIN" disabled /> </div>
                <div className="space-y-2"> <Label>Kecamatan</Label> <Input value="BANJARMASIN UTARA" disabled /> </div>
                <div className="space-y-2"> <Label>KUA</Label> <Input value="KUA BANJARMASIN UTARA" disabled /> </div>
            </div>
            <Separator/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="weddingLocation">Nikah Di <span className="text-destructive">*</span></Label>
                    <Controller name="weddingLocation" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
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
                    <Label htmlFor="dispensationNumber">No. Surat Dispensasi Kecamatan (jika ada)</Label>
                    <Controller name="dispensationNumber" control={control} render={({ field }) => <Input {...field} value={field.value || ''} placeholder="No. Surat Dispensasi" />} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="weddingDate">Tanggal Akad <span className="text-destructive">*</span></Label>
                    <Controller name="weddingDate" control={control} render={({ field }) => (
                        <Popover open={weddingDateOpen} onOpenChange={setWeddingDateOpen}>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? format(field.value, "PPP", { locale: IndonesianLocale }) : <span>Pilih tanggal</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={field.value} onSelect={(date) => { field.onChange(date); setWeddingDateOpen(false); }} disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() + 10))} initialFocus locale={IndonesianLocale} />
                            </PopoverContent>
                        </Popover>
                    )} />
                    <FieldErrorMessage name="weddingDate" />
                </div>
                <div className="space-y-2">
                     <Label htmlFor="weddingTime">Jam Akad <span className="text-destructive">*</span></Label>
                    <Controller name="weddingTime" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger id="weddingTime"><SelectValue placeholder="Pilih Jam Akad" /></SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 10 }, (_, i) => i + 8).map(hour => (
                                    <SelectItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>{`${hour.toString().padStart(2, '0')}:00`}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )} />
                    <FieldErrorMessage name="weddingTime" />
                </div>
            </div>
        </div>
    );
};

const PersonSubForm = ({ prefix, personType }: { prefix: 'groom' | 'bride', personType: 'suami' | 'istri'}) => {
    const { control, watch } = useFormContext<FullFormData>();
    const [dobOpen, setDobOpen] = useState(false);
    const dob = watch(`${prefix}DateOfBirth` as keyof FullFormData) as Date | undefined;
    const age = dob ? differenceInYears(new Date(), dob) : null;
    const selectedOccupation = watch(`${prefix}Occupation` as keyof FullFormData);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}Citizenship`}>Warga Negara <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}Citizenship` as keyof FullFormData} control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value as string}>
                            <SelectTrigger><SelectValue placeholder="Pilih Kewarganegaraan" /></SelectTrigger>
                            <SelectContent> <SelectItem value="WNI">WNI</SelectItem> <SelectItem value="WNA">WNA</SelectItem> </SelectContent>
                        </Select>
                    )} />
                    <FieldErrorMessage name={`${prefix}Citizenship` as keyof FullFormData} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}PassportNumber`}>No. Paspor (jika WNA)</Label>
                    <Controller name={`${prefix}PassportNumber` as keyof FullFormData} control={control} render={({ field }) => <Input {...field} value={field.value as string || ''} placeholder="Nomor Paspor" />} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}Nik`}>NIK <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}Nik` as keyof FullFormData} control={control} render={({ field }) => <Input {...field} placeholder="16 Digit NIK" maxLength={16} />} />
                    <FieldErrorMessage name={`${prefix}Nik` as keyof FullFormData} />
                </div>
                <div className="space-y-2 lg:col-span-3">
                    <Label htmlFor={`${prefix}FullName`}>Nama Lengkap (sesuai KTP) <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}FullName` as keyof FullFormData} control={control} render={({ field }) => <Input {...field} placeholder={`Nama Lengkap Calon ${personType}`} />} />
                    <FieldErrorMessage name={`${prefix}FullName` as keyof FullFormData} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}PlaceOfBirth`}>Tempat Lahir <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}PlaceOfBirth` as keyof FullFormData} control={control} render={({ field }) => <Input {...field} placeholder="Kota Kelahiran" />} />
                    <FieldErrorMessage name={`${prefix}PlaceOfBirth` as keyof FullFormData} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}DateOfBirth`}>Tanggal Lahir <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}DateOfBirth` as keyof FullFormData} control={control} render={({ field }) => (
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
                    )} />
                    <FieldErrorMessage name={`${prefix}DateOfBirth` as keyof FullFormData} />
                </div>
                <div className="space-y-2">
                    <Label>Umur</Label>
                    <Input value={age !== null ? `${age} Tahun` : ''} disabled placeholder="Umur akan terisi otomatis"/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}Status`}>Status <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}Status` as keyof FullFormData} control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value as string}><SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger><SelectContent><SelectItem value="Belum Kawin">Belum Kawin</SelectItem><SelectItem value="Kawin">Kawin</SelectItem><SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem><SelectItem value="Cerai Mati">Cerai Mati</SelectItem></SelectContent></Select>
                    )} />
                    <FieldErrorMessage name={`${prefix}Status` as keyof FullFormData} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}Religion`}>Agama <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}Religion` as keyof FullFormData} control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value as string}><SelectTrigger><SelectValue placeholder="Pilih Agama" /></SelectTrigger><SelectContent><SelectItem value="Islam">Islam</SelectItem></SelectContent></Select>
                    )} />
                    <FieldErrorMessage name={`${prefix}Religion` as keyof FullFormData} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}Education`}>Pendidikan <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}Education` as keyof FullFormData} control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value as string}><SelectTrigger><SelectValue placeholder="Pilih Pendidikan" /></SelectTrigger><SelectContent>{educationLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}</SelectContent></Select>
                    )} />
                    <FieldErrorMessage name={`${prefix}Education` as keyof FullFormData} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}Occupation`}>Pekerjaan <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}Occupation` as keyof FullFormData} control={control} render={({ field }) => (
                         <Select onValueChange={field.onChange} value={field.value as string}><SelectTrigger><SelectValue placeholder="Pilih Pekerjaan" /></SelectTrigger><SelectContent>{occupations.map(job => <SelectItem key={job} value={job}>{job}</SelectItem>)}</SelectContent></Select>
                    )} />
                    <FieldErrorMessage name={`${prefix}Occupation` as keyof FullFormData} />
                </div>
                 <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor={`${prefix}OccupationDescription`}>Jika Pekerjaan Lainnya</Label>
                    <Controller name={`${prefix}OccupationDescription` as keyof FullFormData} control={control} render={({ field }) => <Input {...field} value={field.value as string || ''} placeholder="Sebutkan pekerjaan" disabled={selectedOccupation !== 'Lainnya'} />} />
                    <FieldErrorMessage name={`${prefix}OccupationDescription` as keyof FullFormData}/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor={`${prefix}PhoneNumber`}>Nomor Telepon/HP <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}PhoneNumber` as keyof FullFormData} control={control} render={({ field }) => <Input {...field} type="tel" placeholder="08..." />} />
                    <FieldErrorMessage name={`${prefix}PhoneNumber` as keyof FullFormData} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}Email`}>Email <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}Email` as keyof FullFormData} control={control} render={({ field }) => <Input {...field} type="email" placeholder="nama@email.com" />} />
                    <FieldErrorMessage name={`${prefix}Email` as keyof FullFormData} />
                </div>
                <div className="space-y-2 lg:col-span-3">
                    <Label htmlFor={`${prefix}Address`}>Alamat (sesuai KTP) <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}Address` as keyof FullFormData} control={control} render={({ field }) => <Textarea {...field} placeholder="Alamat lengkap sesuai KTP" />} />
                    <FieldErrorMessage name={`${prefix}Address` as keyof FullFormData} />
                </div>
            </div>
        </div>
    )
}

const ParentSubForm = ({ prefix, personType }: { prefix: 'groomFather' | 'groomMother' | 'brideFather' | 'brideMother', personType: 'Ayah' | 'Ibu' }) => {
    const { control } = useFormContext<FullFormData>();
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                 <div className="space-y-2">
                    <Label htmlFor={`${prefix}Name`}>Nama Lengkap {personType} <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}Name` as keyof FullFormData} control={control} render={({ field }) => <Input {...field} placeholder={`Nama Lengkap ${personType}`} />} />
                    <FieldErrorMessage name={`${prefix}Name` as keyof FullFormData} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}Nik`}>NIK {personType} <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}Nik` as keyof FullFormData} control={control} render={({ field }) => <Input {...field} placeholder={`16 Digit NIK ${personType}`} maxLength={16} />} />
                    <FieldErrorMessage name={`${prefix}Nik` as keyof FullFormData} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}Religion`}>Agama <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}Religion` as keyof FullFormData} control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value as string}><SelectTrigger><SelectValue placeholder="Pilih Agama" /></SelectTrigger><SelectContent><SelectItem value="Islam">Islam</SelectItem></SelectContent></Select>
                    )} />
                    <FieldErrorMessage name={`${prefix}Religion` as keyof FullFormData} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${prefix}Occupation`}>Pekerjaan <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}Occupation` as keyof FullFormData} control={control} render={({ field }) => (
                         <Select onValueChange={field.onChange} value={field.value as string}><SelectTrigger><SelectValue placeholder="Pilih Pekerjaan" /></SelectTrigger><SelectContent>{occupations.map(job => <SelectItem key={job} value={job}>{job}</SelectItem>)}</SelectContent></Select>
                    )} />
                    <FieldErrorMessage name={`${prefix}Occupation` as keyof FullFormData} />
                </div>
                 <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`${prefix}Address`}>Alamat (sesuai KTP) <span className="text-destructive">*</span></Label>
                    <Controller name={`${prefix}Address` as keyof FullFormData} control={control} render={({ field }) => <Textarea {...field} placeholder={`Alamat lengkap ${personType} sesuai KTP`} />} />
                    <FieldErrorMessage name={`${prefix}Address` as keyof FullFormData} />
                </div>
            </div>
        </div>
    )
}

const Step2 = () => (
    <div className="space-y-6">
        <h3 className="text-xl font-semibold text-foreground flex items-center"><User className="mr-3 h-6 w-6 text-primary"/>Data Calon Suami & Keluarga</h3>
         <Tabs defaultValue="groom">
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

const Step3 = () => (
    <div className="space-y-6">
        <h3 className="text-xl font-semibold text-foreground flex items-center"><User className="mr-3 h-6 w-6 text-primary"/>Data Calon Istri & Keluarga</h3>
        <Tabs defaultValue="bride">
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
                        <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Pilih Agama" /></SelectTrigger><SelectContent><SelectItem value="Islam">Islam</SelectItem></SelectContent></Select>
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
                <SummaryItem label="Tanggal Akad" value={formData.weddingDate ? format(formData.weddingDate, "EEEE, dd MMMM yyyy", { locale: IndonesianLocale }) : '-'} />
                <SummaryItem label="Jam Akad" value={formData.weddingTime} />
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

export function MultiStepMarriageForm() {
    const [currentStep, setCurrentStep] = useState(0);
    const [previousStep, setPreviousStep] = useState(0);
    const router = useRouter();
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    
    const initialState: MarriageRegistrationFormState = { message: "", success: false };
    const [state, formAction] = useActionState(submitMarriageRegistrationForm, initialState);

    const methods = useForm<FullFormData>({
        resolver: zodResolver(fullSchema),
        defaultValues: {
            weddingLocation: '', weddingTime: '', dispensationNumber: '',
            groomFullName: '', groomNik: '', groomCitizenship: 'WNI', groomPassportNumber: '', groomPlaceOfBirth: '', groomStatus: '', groomReligion: 'Islam', groomEducation: '', groomOccupation: '', groomOccupationDescription: '', groomPhoneNumber: '', groomEmail: '', groomAddress: '',
            brideFullName: '', brideNik: '', brideCitizenship: 'WNI', bridePassportNumber: '', bridePlaceOfBirth: '', brideStatus: '', brideReligion: 'Islam', brideEducation: '', brideOccupation: '', brideOccupationDescription: '', bridePhoneNumber: '', brideEmail: '', brideAddress: '',
            groomFatherName: '', groomFatherNik: '', groomFatherReligion: 'Islam', groomFatherOccupation: '', groomFatherAddress: '',
            groomMotherName: '', groomMotherNik: '', groomMotherReligion: 'Islam', groomMotherOccupation: '', groomMotherAddress: '',
            brideFatherName: '', brideFatherNik: '', brideFatherReligion: 'Islam', brideFatherOccupation: '', brideFatherAddress: '',
            brideMotherName: '', brideMotherNik: '', brideMotherReligion: 'Islam', brideMotherOccupation: '', brideMotherAddress: '',
            guardianFullName: '', guardianNik: '', guardianRelationship: '', guardianStatus: '', guardianReligion: 'Islam', guardianAddress: '', guardianPhoneNumber: ''
        }
    });

    const { trigger, handleSubmit, formState: { isSubmitting, errors }, getValues } = methods;

    const next = async () => {
        const fields = steps[currentStep].fields;
        // @ts-ignore
        const output = await trigger(fields as (keyof FullFormData)[], { shouldFocus: true });

        if (!output) return;

        if (currentStep < steps.length - 1) {
            setPreviousStep(currentStep);
            setCurrentStep(step => step + 1);
        }
    };

    const prev = () => {
        if (currentStep > 0) {
            setPreviousStep(currentStep);
            setCurrentStep(step => step - 1);
        }
    };

    useEffect(() => {
        if (state.message) {
            if (state.success && state.data && state.queueNumber) {
                toast({ title: "Berhasil!", description: state.message, variant: "default" });
                const params = new URLSearchParams();
                for (const [key, value] of Object.entries(state.data)) {
                    if (value !== null && value !== undefined && typeof value !== 'object') {
                        params.append(key, String(value));
                    }
                }
                params.append('queueNumber', state.queueNumber);
                router.push(`/daftar-nikah/sukses?${params.toString()}`);
                methods.reset(); 
              } else if (!state.success) {
                toast({ title: "Pendaftaran Gagal", description: state.message, variant: "destructive" });
              }
        }
    }, [state, toast, router, methods]);

    const delta = currentStep - previousStep;

    const onSubmit = (data: FullFormData) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value instanceof Date) {
                formData.append(key, format(value, "yyyy-MM-dd"));
            } else if (value !== null && value !== undefined) {
                formData.append(key, String(value));
            }
        });
        formAction(formData);
    };
    
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
                 <Separator className="my-8"/>
                 <FormProvider {...methods}>
                    <form
                        ref={formRef}
                        onSubmit={handleSubmit(onSubmit)}
                     >
                         <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: delta >= 0 ? 50 : -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: delta >= 0 ? -50 : 50 }}
                                transition={{ duration: 0.3 }}
                            >
                                {currentStep === 0 && <Step1 />}
                                {currentStep === 1 && <Step2 />}
                                {currentStep === 2 && <Step3 />}
                                {currentStep === 3 && <Step4 />}
                                {currentStep === 4 && <Step5 />}
                                {currentStep === 5 && <Step6 />}
                            </motion.div>
                        </AnimatePresence>
                        <div className="mt-8 pt-5 border-t">
                            <div className="flex justify-between">
                                <Button type="button" onClick={prev} variant="outline" disabled={currentStep === 0 || isSubmitting}>
                                    Sebelumnya
                                </Button>
                                {currentStep === steps.length - 1 ? (
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Mengirim...</> : 'Kirim Pendaftaran'}
                                    </Button>
                                ) : (
                                    <Button type="button" onClick={next} disabled={isSubmitting}>
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

    