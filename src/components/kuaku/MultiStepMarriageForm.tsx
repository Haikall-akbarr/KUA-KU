
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
import { Loader2, CalendarIcon, User, Users, FileText, CheckCircle, Info, MapPin, Building, Clock, FileUp } from "lucide-react";
import { educationLevels, occupations } from "@/lib/form-data";


const steps = [
    { id: "01", name: "Jadwal & Lokasi", fields: ['weddingLocation', 'weddingDate', 'weddingTime', 'dispensationNumber'] },
    { id: "02", name: "Calon Suami", fields: ['groomFullName', 'groomNik', 'groomCitizenship', 'groomPassportNumber', 'groomPlaceOfBirth', 'groomDateOfBirth', 'groomStatus', 'groomReligion', 'groomEducation', 'groomOccupation', 'groomOccupationDescription', 'groomPhoneNumber', 'groomEmail', 'groomAddress'] },
    { id: "03", name: "Calon Istri", fields: ['brideFullName', 'brideNik', 'brideCitizenship', 'bridePassportNumber', 'bridePlaceOfBirth', 'brideDateOfBirth', 'brideStatus', 'brideReligion', 'brideEducation', 'brideOccupation', 'brideOccupationDescription', 'bridePhoneNumber', 'brideEmail', 'brideAddress'] },
    { id: "04", name: "Wali Nikah", fields: ['guardianFullName', 'guardianNik', 'guardianRelationship', 'guardianAddress', 'guardianStatus', 'guardianReligion'] },
    { id: "05", name: "Data Dokumen" }, // No validation on this step
    { id: "06", name: "Ringkasan" },
];

const groomSchema = z.object({
  groomFullName: z.string().min(3, "Nama lengkap calon suami minimal 3 karakter."),
  groomNik: z.string().length(16, "NIK calon suami harus 16 digit.").regex(/^\d+$/, "NIK hanya boleh berisi angka."),
  groomCitizenship: z.string({ required_error: "Kewarganegaraan wajib diisi."}),
  groomPassportNumber: z.string().optional(),
  groomPlaceOfBirth: z.string().min(2, "Tempat lahir calon suami minimal 2 karakter."),
  groomDateOfBirth: z.date({ required_error: "Tanggal lahir calon suami wajib diisi." }),
  groomStatus: z.string({ required_error: "Status perkawinan wajib diisi."}),
  groomReligion: z.string({ required_error: "Agama wajib diisi."}),
  groomEducation: z.string({ required_error: "Pendidikan terakhir wajib diisi."}),
  groomOccupation: z.string({ required_error: "Pekerjaan wajib diisi."}),
  groomOccupationDescription: z.string().optional(),
  groomPhoneNumber: z.string().min(10, "Nomor telepon calon suami minimal 10 digit.").regex(/^08\d{8,}$/, "Format nomor telepon tidak valid."),
  groomEmail: z.string().email("Format email tidak valid."),
  groomAddress: z.string().min(10, "Alamat calon suami minimal 10 karakter."),
});

const brideSchema = z.object({
  brideFullName: z.string().min(3, "Nama lengkap calon istri minimal 3 karakter."),
  brideNik: z.string().length(16, "NIK calon istri harus 16 digit.").regex(/^\d+$/, "NIK hanya boleh berisi angka."),
  brideCitizenship: z.string({ required_error: "Kewarganegaraan wajib diisi."}),
  bridePassportNumber: z.string().optional(),
  bridePlaceOfBirth: z.string().min(2, "Tempat lahir calon istri minimal 2 karakter."),
  brideDateOfBirth: z.date({ required_error: "Tanggal lahir calon istri wajib diisi." }),
  brideStatus: z.string({ required_error: "Status perkawinan wajib diisi."}),
  brideReligion: z.string({ required_error: "Agama wajib diisi."}),
  brideEducation: z.string({ required_error: "Pendidikan terakhir wajib diisi."}),
  brideOccupation: z.string({ required_error: "Pekerjaan wajib diisi."}),
  brideOccupationDescription: z.string().optional(),
  bridePhoneNumber: z.string().min(10, "Nomor telepon calon istri minimal 10 digit.").regex(/^08\d{8,}$/, "Format nomor telepon tidak valid."),
  brideEmail: z.string().email("Format email tidak valid."),
  brideAddress: z.string().min(10, "Alamat calon istri minimal 10 karakter."),
});

const guardianSchema = z.object({
    guardianFullName: z.string().min(3, "Nama lengkap wali minimal 3 karakter."),
    guardianNik: z.string().length(16, "NIK wali harus 16 digit.").regex(/^\d+$/, "NIK wali hanya boleh berisi angka."),
    guardianRelationship: z.string().min(3, "Hubungan dengan wali wajib diisi."),
    guardianStatus: z.string({ required_error: "Status wali wajib diisi."}),
    guardianReligion: z.string({ required_error: "Agama wali wajib diisi."}),
    guardianAddress: z.string().min(10, "Alamat wali minimal 10 karakter."),
});

const fileSchema = z.any().optional();

const fullSchema = z.object({
    // Step 1
    weddingLocation: z.string({ required_error: "Lokasi nikah wajib dipilih."}),
    weddingDate: z.date({ required_error: "Tanggal akad wajib diisi." }),
    weddingTime: z.string({ required_error: "Jam akad wajib dipilih."}),
    dispensationNumber: z.string().optional(),
    
    // Step 2, 3, 4
    ...groomSchema.shape,
    ...brideSchema.shape,
    ...guardianSchema.shape,
  
    // Step 5
    docGroomPhoto: fileSchema,
    docBridePhoto: fileSchema,
}).refine(data => {
    if (data.groomOccupation === "Lainnya") {
        return !!data.groomOccupationDescription && data.groomOccupationDescription.length > 2;
    }
    return true;
}, {
    message: "Deskripsi pekerjaan lainnya wajib diisi (minimal 3 karakter).",
    path: ["groomOccupationDescription"],
}).refine(data => {
    if (data.brideOccupation === "Lainnya") {
        return !!data.brideOccupationDescription && data.brideOccupationDescription.length > 2;
    }
    return true;
}, {
    message: "Deskripsi pekerjaan lainnya wajib diisi (minimal 3 karakter).",
    path: ["brideOccupationDescription"],
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

// === Step Components ===

const Step1 = ({ serverErrors }: { serverErrors?: ZodIssue[] }) => {
    const { control } = useFormContext<FullFormData>();
    const [weddingDateOpen, setWeddingDateOpen] = useState(false);
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground flex items-center"><MapPin className="mr-3 h-6 w-6 text-primary"/>Lokasi KUA & Jadwal Nikah</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Static Location Info */}
                <div className="space-y-2">
                    <Label>Provinsi</Label>
                    <Input value="KALIMANTAN SELATAN" disabled />
                </div>
                <div className="space-y-2">
                    <Label>Kabupaten/Kota</Label>
                    <Input value="KOTA BANJARMASIN" disabled />
                </div>
                <div className="space-y-2">
                    <Label>Kecamatan</Label>
                    <Input value="BANJARMASIN UTARA" disabled />
                </div>
                <div className="space-y-2">
                    <Label>KUA</Label>
                    <Input value="KUA BANJARMASIN UTARA" disabled />
                </div>
            </div>
            <Separator/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="weddingLocation">Nikah Di <span className="text-destructive">*</span></Label>
                    <Controller
                        name="weddingLocation"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger id="weddingLocation"><SelectValue placeholder="Pilih Lokasi Nikah" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Di KUA">Di KUA (Pada hari dan jam kerja)</SelectItem>
                                    <SelectItem value="Di Luar KUA">Di Luar KUA</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                     <FieldErrorMessage name="weddingLocation" />
                     <ServerErrorMessage serverErrors={serverErrors} name="weddingLocation" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dispensationNumber">No. Surat Dispensasi Kecamatan (jika ada)</Label>
                    <Controller name="dispensationNumber" control={control} render={({ field }) => <Input {...field} value={field.value || ''} placeholder="No. Surat Dispensasi" />} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="weddingDate">Tanggal Akad <span className="text-destructive">*</span></Label>
                    <Controller
                        name="weddingDate"
                        control={control}
                        render={({ field }) => (
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
                        )}
                    />
                    <FieldErrorMessage name="weddingDate" />
                    <ServerErrorMessage serverErrors={serverErrors} name="weddingDate" />
                </div>
                <div className="space-y-2">
                     <Label htmlFor="weddingTime">Jam Akad <span className="text-destructive">*</span></Label>
                    <Controller
                        name="weddingTime"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger id="weddingTime"><SelectValue placeholder="Pilih Jam Akad" /></SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 10 }, (_, i) => i + 8).map(hour => (
                                        <SelectItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>{`${hour.toString().padStart(2, '0')}:00`}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    <FieldErrorMessage name="weddingTime" />
                    <ServerErrorMessage serverErrors={serverErrors} name="weddingTime" />
                </div>
            </div>
        </div>
    );
};

const Step2 = ({ serverErrors }: { serverErrors?: ZodIssue[] }) => {
    const { control, watch } = useFormContext<FullFormData>();
    const [dobOpen, setDobOpen] = useState(false);
    const groomDob = watch('groomDateOfBirth');
    const age = groomDob ? differenceInYears(new Date(), groomDob) : null;
    const selectedOccupation = watch('groomOccupation');
    
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground flex items-center"><User className="mr-3 h-6 w-6 text-primary"/>Data Calon Suami</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                {/* Row 1 */}
                <div className="space-y-2">
                    <Label htmlFor="groomCitizenship">Warga Negara <span className="text-destructive">*</span></Label>
                    <Controller name="groomCitizenship" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Pilih Kewarganegaraan" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="WNI">WNI</SelectItem>
                                <SelectItem value="WNA">WNA</SelectItem>
                            </SelectContent>
                        </Select>
                    )} />
                    <FieldErrorMessage name="groomCitizenship" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="groomPassportNumber">No. Paspor (jika WNA)</Label>
                    <Controller name="groomPassportNumber" control={control} render={({ field }) => <Input {...field} value={field.value || ''} placeholder="Nomor Paspor" />} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="groomNik">NIK <span className="text-destructive">*</span></Label>
                    <div className="flex gap-2">
                        <Controller name="groomNik" control={control} render={({ field }) => <Input {...field} placeholder="16 Digit NIK" maxLength={16} />} />
                        <Button type="button" variant="outline">Cek NIK</Button>
                    </div>
                    <FieldErrorMessage name="groomNik" />
                </div>

                {/* Row 2 */}
                <div className="space-y-2 lg:col-span-3">
                    <Label htmlFor="groomFullName">Nama Lengkap (sesuai KTP) <span className="text-destructive">*</span></Label>
                    <Controller name="groomFullName" control={control} render={({ field }) => <Input {...field} placeholder="Nama Lengkap Calon Suami" />} />
                    <FieldErrorMessage name="groomFullName" />
                </div>
                
                 {/* Row 3 */}
                <div className="space-y-2">
                    <Label htmlFor="groomPlaceOfBirth">Tempat Lahir <span className="text-destructive">*</span></Label>
                    <Controller name="groomPlaceOfBirth" control={control} render={({ field }) => <Input {...field} placeholder="Kota Kelahiran" />} />
                    <FieldErrorMessage name="groomPlaceOfBirth" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="groomDateOfBirth">Tanggal Lahir <span className="text-destructive">*</span></Label>
                    <Controller name="groomDateOfBirth" control={control} render={({ field }) => (
                        <Popover open={dobOpen} onOpenChange={setDobOpen}>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? format(field.value, "PPP", { locale: IndonesianLocale }) : <span>Pilih tanggal lahir</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={field.value} onSelect={(date) => { field.onChange(date); setDobOpen(false); }} captionLayout="dropdown-buttons" fromYear={1950} toYear={new Date().getFullYear() - 17} disabled={(date) => date > new Date(new Date().setFullYear(new Date().getFullYear() - 17))} initialFocus locale={IndonesianLocale} />
                            </PopoverContent>
                        </Popover>
                    )} />
                    <FieldErrorMessage name="groomDateOfBirth" />
                </div>
                <div className="space-y-2">
                    <Label>Umur</Label>
                    <Input value={age !== null ? `${age} Tahun` : ''} disabled placeholder="Umur akan terisi otomatis"/>
                </div>

                {/* Row 4 */}
                <div className="space-y-2">
                    <Label htmlFor="groomStatus">Status <span className="text-destructive">*</span></Label>
                    <Controller name="groomStatus" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Belum Kawin">Belum Kawin</SelectItem>
                                <SelectItem value="Kawin">Kawin</SelectItem>
                                <SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem>
                                <SelectItem value="Cerai Mati">Cerai Mati</SelectItem>
                            </SelectContent>
                        </Select>
                    )} />
                    <FieldErrorMessage name="groomStatus" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="groomReligion">Agama <span className="text-destructive">*</span></Label>
                    <Controller name="groomReligion" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Pilih Agama" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Islam">Islam</SelectItem>
                            </SelectContent>
                        </Select>
                    )} />
                    <FieldErrorMessage name="groomReligion" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="groomEducation">Pendidikan <span className="text-destructive">*</span></Label>
                    <Controller name="groomEducation" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Pilih Pendidikan" /></SelectTrigger>
                            <SelectContent>
                                {educationLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )} />
                    <FieldErrorMessage name="groomEducation" />
                </div>

                 {/* Row 5 */}
                <div className="space-y-2">
                    <Label htmlFor="groomOccupation">Pekerjaan <span className="text-destructive">*</span></Label>
                    <Controller name="groomOccupation" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Pilih Pekerjaan" /></SelectTrigger>
                            <SelectContent>
                                {occupations.map(job => <SelectItem key={job} value={job}>{job}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )} />
                    <FieldErrorMessage name="groomOccupation" />
                </div>
                 <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor="groomOccupationDescription">Jika Pekerjaan Lainnya</Label>
                    <Controller name="groomOccupationDescription" control={control} render={({ field }) => <Input {...field} value={field.value || ''} placeholder="Sebutkan pekerjaan" disabled={selectedOccupation !== 'Lainnya'} />} />
                    <FieldErrorMessage name="groomOccupationDescription"/>
                </div>

                 {/* Row 6 */}
                 <div className="space-y-2">
                    <Label htmlFor="groomPhoneNumber">Nomor Telepon/HP <span className="text-destructive">*</span></Label>
                    <Controller name="groomPhoneNumber" control={control} render={({ field }) => <Input {...field} type="tel" placeholder="08..." />} />
                    <FieldErrorMessage name="groomPhoneNumber" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="groomEmail">Email <span className="text-destructive">*</span></Label>
                    <Controller name="groomEmail" control={control} render={({ field }) => <Input {...field} type="email" placeholder="nama@email.com" />} />
                    <FieldErrorMessage name="groomEmail" />
                </div>
                <div className="space-y-2 lg:col-span-3">
                    <Label htmlFor="groomAddress">Alamat (sesuai KTP) <span className="text-destructive">*</span></Label>
                    <Controller name="groomAddress" control={control} render={({ field }) => <Textarea {...field} placeholder="Alamat lengkap sesuai KTP" />} />
                    <FieldErrorMessage name="groomAddress" />
                </div>
            </div>
        </div>
    );
};

const Step3 = ({ serverErrors }: { serverErrors?: ZodIssue[] }) => {
    const { control, watch } = useFormContext<FullFormData>();
    const [dobOpen, setDobOpen] = useState(false);
    const brideDob = watch('brideDateOfBirth');
    const age = brideDob ? differenceInYears(new Date(), brideDob) : null;
    const selectedOccupation = watch('brideOccupation');
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground flex items-center"><User className="mr-3 h-6 w-6 text-primary"/>Data Calon Istri</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                {/* Row 1 */}
                <div className="space-y-2">
                    <Label htmlFor="brideCitizenship">Warga Negara <span className="text-destructive">*</span></Label>
                    <Controller name="brideCitizenship" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Pilih Kewarganegaraan" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="WNI">WNI</SelectItem>
                                <SelectItem value="WNA">WNA</SelectItem>
                            </SelectContent>
                        </Select>
                    )} />
                    <FieldErrorMessage name="brideCitizenship" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="bridePassportNumber">No. Paspor (jika WNA)</Label>
                    <Controller name="bridePassportNumber" control={control} render={({ field }) => <Input {...field} value={field.value || ''} placeholder="Nomor Paspor" />} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="brideNik">NIK <span className="text-destructive">*</span></Label>
                     <Controller name="brideNik" control={control} render={({ field }) => <Input {...field} placeholder="16 Digit NIK" maxLength={16} />} />
                    <FieldErrorMessage name="brideNik" />
                </div>

                {/* Row 2 */}
                <div className="space-y-2 lg:col-span-3">
                    <Label htmlFor="brideFullName">Nama Lengkap (sesuai KTP) <span className="text-destructive">*</span></Label>
                    <Controller name="brideFullName" control={control} render={({ field }) => <Input {...field} placeholder="Nama Lengkap Calon Istri" />} />
                    <FieldErrorMessage name="brideFullName" />
                </div>
                
                 {/* Row 3 */}
                <div className="space-y-2">
                    <Label htmlFor="bridePlaceOfBirth">Tempat Lahir <span className="text-destructive">*</span></Label>
                    <Controller name="bridePlaceOfBirth" control={control} render={({ field }) => <Input {...field} placeholder="Kota Kelahiran" />} />
                    <FieldErrorMessage name="bridePlaceOfBirth" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="brideDateOfBirth">Tanggal Lahir <span className="text-destructive">*</span></Label>
                    <Controller name="brideDateOfBirth" control={control} render={({ field }) => (
                         <Popover open={dobOpen} onOpenChange={setDobOpen}>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? format(field.value, "PPP", { locale: IndonesianLocale }) : <span>Pilih tanggal lahir</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={field.value} onSelect={(date) => { field.onChange(date); setDobOpen(false); }} captionLayout="dropdown-buttons" fromYear={1950} toYear={new Date().getFullYear() - 17} disabled={(date) => date > new Date(new Date().setFullYear(new Date().getFullYear() - 17))} initialFocus locale={IndonesianLocale} />
                            </PopoverContent>
                        </Popover>
                    )} />
                    <FieldErrorMessage name="brideDateOfBirth" />
                </div>
                <div className="space-y-2">
                    <Label>Umur</Label>
                    <Input value={age !== null ? `${age} Tahun` : ''} disabled placeholder="Umur akan terisi otomatis"/>
                </div>

                {/* Row 4 */}
                <div className="space-y-2">
                    <Label htmlFor="brideStatus">Status <span className="text-destructive">*</span></Label>
                    <Controller name="brideStatus" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Belum Kawin">Belum Kawin</SelectItem>
                                <SelectItem value="Kawin">Kawin</SelectItem>
                                <SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem>
                                <SelectItem value="Cerai Mati">Cerai Mati</SelectItem>
                            </SelectContent>
                        </Select>
                    )} />
                    <FieldErrorMessage name="brideStatus" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="brideReligion">Agama <span className="text-destructive">*</span></Label>
                    <Controller name="brideReligion" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Pilih Agama" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Islam">Islam</SelectItem>
                            </SelectContent>
                        </Select>
                    )} />
                    <FieldErrorMessage name="brideReligion" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="brideEducation">Pendidikan <span className="text-destructive">*</span></Label>
                    <Controller name="brideEducation" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Pilih Pendidikan" /></SelectTrigger>
                            <SelectContent>
                                {educationLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )} />
                    <FieldErrorMessage name="brideEducation" />
                </div>

                 {/* Row 5 */}
                <div className="space-y-2">
                    <Label htmlFor="brideOccupation">Pekerjaan <span className="text-destructive">*</span></Label>
                    <Controller name="brideOccupation" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Pilih Pekerjaan" /></SelectTrigger>
                            <SelectContent>
                                {occupations.map(job => <SelectItem key={job} value={job}>{job}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )} />
                    <FieldErrorMessage name="brideOccupation" />
                </div>
                 <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor="brideOccupationDescription">Jika Pekerjaan Lainnya</Label>
                    <Controller name="brideOccupationDescription" control={control} render={({ field }) => <Input {...field} value={field.value || ''} placeholder="Sebutkan pekerjaan" disabled={selectedOccupation !== 'Lainnya'} />} />
                     <FieldErrorMessage name="brideOccupationDescription"/>
                </div>

                 {/* Row 6 */}
                 <div className="space-y-2">
                    <Label htmlFor="bridePhoneNumber">Nomor Telepon/HP <span className="text-destructive">*</span></Label>
                    <Controller name="bridePhoneNumber" control={control} render={({ field }) => <Input {...field} type="tel" placeholder="08..." />} />
                    <FieldErrorMessage name="bridePhoneNumber" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="brideEmail">Email <span className="text-destructive">*</span></Label>
                    <Controller name="brideEmail" control={control} render={({ field }) => <Input {...field} type="email" placeholder="nama@email.com" />} />
                    <FieldErrorMessage name="brideEmail" />
                </div>

                <div className="space-y-2 lg:col-span-3">
                    <Label htmlFor="brideAddress">Alamat (sesuai KTP) <span className="text-destructive">*</span></Label>
                    <Controller name="brideAddress" control={control} render={({ field }) => <Textarea {...field} placeholder="Alamat lengkap sesuai KTP" />} />
                    <FieldErrorMessage name="brideAddress" />
                </div>
            </div>
        </div>
    );
};

const Step4 = ({ serverErrors }: { serverErrors?: ZodIssue[] }) => {
    const { control } = useFormContext<FullFormData>();
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground flex items-center"><Users className="mr-3 h-6 w-6 text-primary"/>Data Wali Nikah</h3>
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Informasi Wali</AlertTitle>
                <AlertDescription>
                    Wali nikah adalah seorang laki-laki yang memenuhi syarat hukum Islam dan perundang-undangan untuk menjadi wali dalam pernikahan calon mempelai wanita. Biasanya adalah Ayah Kandung.
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
                    <Label htmlFor="guardianRelationship">Hubungan dengan Calon Istri <span className="text-destructive">*</span></Label>
                    <Controller name="guardianRelationship" control={control} render={({ field }) => <Input {...field} placeholder="Contoh: Ayah Kandung, Kakak Kandung" />} />
                    <FieldErrorMessage name="guardianRelationship" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="guardianStatus">Status <span className="text-destructive">*</span></Label>
                    <Controller name="guardianStatus" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                            <SelectContent>
                               <SelectItem value="Hidup">Hidup</SelectItem>
                               <SelectItem value="Wafat">Wafat</SelectItem>
                            </SelectContent>
                        </Select>
                    )} />
                    <FieldErrorMessage name="guardianStatus" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="guardianReligion">Agama <span className="text-destructive">*</span></Label>
                    <Controller name="guardianReligion" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Pilih Agama" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Islam">Islam</SelectItem>
                            </SelectContent>
                        </Select>
                    )} />
                    <FieldErrorMessage name="guardianReligion" />
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

const FileInput = ({ name, label }: { name: keyof FullFormData, label: string }) => {
    const { control, formState: { errors } } = useFormContext<FullFormData>();
    const error = errors[name];
    
    return (
        <div className="space-y-2">
            <Label htmlFor={name}>{label} <span className="text-destructive">*</span></Label>
            <Controller
                name={name}
                control={control}
                render={({ field: { onChange, value, ...rest } }) => (
                    <Input 
                        id={name} 
                        type="file" 
                        onChange={(e) => onChange(e.target.files?.[0])}
                        className="file:text-primary file:font-medium"
                        {...rest} 
                    />
                )}
            />
            {error && <p className="text-sm text-destructive mt-1">{error.message}</p>}
            <p className="text-xs text-muted-foreground">Max. 200KB. Format: JPG/PNG.</p>
        </div>
    );
};

const Step5 = () => (
    <div className="space-y-6">
        <h3 className="text-xl font-semibold text-foreground flex items-center"><FileUp className="mr-3 h-6 w-6 text-primary"/>Unggah Dokumen</h3>
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Perhatian!</AlertTitle>
            <AlertDescription>
                Unggah pas foto calon suami dan calon istri dengan latar belakang biru. Anda tetap wajib membawa semua dokumen fisik asli ke KUA untuk verifikasi.
            </AlertDescription>
        </Alert>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileInput name="docGroomPhoto" label="Pas Foto Calon Suami" />
            <FileInput name="docBridePhoto" label="Pas Foto Calon Istri" />
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
                 <SummaryItem label="Tempat, Tgl Lahir" value={`${formData.groomPlaceOfBirth}, ${formData.groomDateOfBirth ? format(formData.groomDateOfBirth, "dd MMMM yyyy", { locale: IndonesianLocale }) : '-'}`} />
                <SummaryItem label="Status" value={formData.groomStatus} />
                <SummaryItem label="Pekerjaan" value={formData.groomOccupation === 'Lainnya' ? formData.groomOccupationDescription : formData.groomOccupation} />
                <SummaryItem label="No. Telepon" value={formData.groomPhoneNumber} />
            </div>

            <Separator/>

            <div className="space-y-4">
                <h4 className="font-semibold text-lg text-primary">Calon Istri</h4>
                <SummaryItem label="Nama Lengkap" value={formData.brideFullName} />
                <SummaryItem label="NIK" value={formData.brideNik} />
                <SummaryItem label="Tempat, Tgl Lahir" value={`${formData.bridePlaceOfBirth}, ${formData.brideDateOfBirth ? format(formData.brideDateOfBirth, "dd MMMM yyyy", { locale: IndonesianLocale }) : '-'}`} />
                <SummaryItem label="Status" value={formData.brideStatus} />
                <SummaryItem label="Pekerjaan" value={formData.brideOccupation === 'Lainnya' ? formData.brideOccupationDescription : formData.brideOccupation} />
                <SummaryItem label="No. Telepon" value={formData.bridePhoneNumber} />
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


// === Main Component ===

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
            weddingLocation: '',
            weddingTime: '',
            dispensationNumber: '',
            groomFullName: '',
            groomNik: '',
            groomCitizenship: 'WNI',
            groomPassportNumber: '',
            groomPlaceOfBirth: '',
            groomStatus: '',
            groomReligion: 'Islam',
            groomEducation: '',
            groomOccupation: '',
            groomOccupationDescription: '',
            groomPhoneNumber: '',
            groomEmail: '',
            groomAddress: '',
            brideFullName: '',
            brideNik: '',
            brideCitizenship: 'WNI',
            bridePassportNumber: '',
            bridePlaceOfBirth: '',
            brideStatus: '',
            brideReligion: 'Islam',
            brideEducation: '',
            brideOccupation: '',
            brideOccupationDescription: '',
            bridePhoneNumber: '',
            brideEmail: '',
            brideAddress: '',
            guardianFullName: '',
            guardianNik: '',
            guardianRelationship: '',
            guardianStatus: '',
            guardianReligion: 'Islam',
            guardianAddress: '',
        }
    });

    const { trigger, handleSubmit, formState: { isSubmitting } } = methods;

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
                toast({
                  title: "Berhasil!",
                  description: state.message,
                  variant: "default",
                });
        
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
                toast({
                  title: "Pendaftaran Gagal",
                  description: state.message,
                  variant: "destructive",
                });
              }
        }
    }, [state, toast, router, methods]);

    const delta = currentStep - previousStep;


    const onSubmit = (data: FullFormData) => {
        console.log('Submitting form...');
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value) {
                if (value instanceof Date) {
                    formData.append(key, value.toISOString().split('T')[0]); // Format YYYY-MM-DD
                } else if (value instanceof File) {
                    formData.append(key, value);
                } else {
                    formData.append(key, String(value));
                }
            }
        });
        formAction(formData);
    }
    
    return (
        <Card className="w-full max-w-5xl mx-auto shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Formulir Pendaftaran Nikah</CardTitle>
                <CardDescription>
                    Ikuti langkah-langkah berikut untuk melengkapi pendaftaran.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Stepper */}
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

                {/* Form Content */}
                 <FormProvider {...methods}>
                    <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
                         <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: delta >= 0 ? 50 : -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: delta >= 0 ? -50 : 50 }}
                                transition={{ duration: 0.3 }}
                            >
                                {currentStep === 0 && <Step1 serverErrors={state.errors} />}
                                {currentStep === 1 && <Step2 serverErrors={state.errors} />}
                                {currentStep === 2 && <Step3 serverErrors={state.errors} />}
                                {currentStep === 3 && <Step4 serverErrors={state.errors} />}
                                {currentStep === 4 && <Step5 />}
                                {currentStep === 5 && <Step6 />}
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation */}
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

