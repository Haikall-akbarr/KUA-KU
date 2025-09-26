
'use server';

import { z } from 'zod';
import { format } from 'date-fns';

// Skema untuk calon pengantin
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

// Skema untuk orang tua dengan validasi kondisional
const parentSchema = (prefix: 'groomFather' | 'groomMother' | 'brideFather' | 'brideMother') => z.object({
    [`${prefix}PresenceStatus`]: z.string({ required_error: "Status keberadaan wajib diisi." }),
    [`${prefix}Name`]: z.string().optional(),
    [`${prefix}Nik`]: z.string().optional(),
    [`${prefix}Citizenship`]: z.string().optional(),
    [`${prefix}CountryOfOrigin`]: z.string().optional(),
    [`${prefix}PassportNumber`]: z.string().optional(),
    [`${prefix}PlaceOfBirth`]: z.string().optional(),
    [`${prefix}DateOfBirth`]: z.date().optional().nullable(),
    [`${prefix}Religion`]: z.string().optional(),
    [`${prefix}Occupation`]: z.string().optional(),
    [`${prefix}OccupationDescription`]: z.string().optional(),
    [`${prefix}Address`]: z.string().optional(),
}).superRefine((data, ctx) => {
    const presenceStatus = data[`${prefix}PresenceStatus`];
    // Hanya validasi jika statusnya 'Hidup'
    if (presenceStatus === "Hidup") {
        if (!data[`${prefix}Name`] || (data[`${prefix}Name`] as string).length < 3) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nama ayah/ibu minimal 3 karakter.", path: [`${prefix}Name`] });
        }
        if (data[`${prefix}Nik`] && (!/^\d{16}$/.test(data[`${prefix}Nik`] as string))) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "NIK ayah/ibu harus 16 digit angka.", path: [`${prefix}Nik`] });
        }
        if (!data[`${prefix}Citizenship`]) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Kewarganegaraan wajib diisi.", path: [`${prefix}Citizenship`] });
        }
        if (data[`${prefix}Citizenship`] === 'WNA' && (!data[`${prefix}PassportNumber`] || (data[`${prefix}PassportNumber`] as string).length < 3) ) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nomor paspor wajib diisi untuk WNA.", path: [`${prefix}PassportNumber`] });
        }
        if (!data[`${prefix}PlaceOfBirth`] || (data[`${prefix}PlaceOfBirth`] as string).length < 2) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Tempat lahir minimal 2 karakter.", path: [`${prefix}PlaceOfBirth`] });
        }
        if (!data[`${prefix}DateOfBirth`]) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Tanggal lahir wajib diisi.", path: [`${prefix}DateOfBirth`] });
        }
        if (!data[`${prefix}Religion`]) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Agama wajib diisi.", path: [`${prefix}Religion`] });
        }
        if (!data[`${prefix}Occupation`]) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Pekerjaan wajib diisi.", path: [`${prefix}Occupation`] });
        }
        if (data[`${prefix}Occupation`] === "Lainnya" && (!data[`${prefix}OccupationDescription`] || (data[`${prefix}OccupationDescription`] as string).length < 3)) {
             ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Deskripsi pekerjaan lainnya wajib diisi.", path: [`${prefix}OccupationDescription`] });
        }
        if (!data[`${prefix}Address`] || (data[`${prefix}Address`] as string).length < 10) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Alamat minimal 10 karakter.", path: [`${prefix}Address`] });
        }
    }
});

// Skema untuk wali
const guardianSchema = z.object({
    guardianFullName: z.string().min(3, "Nama lengkap wali minimal 3 karakter."),
    guardianNik: z.string().length(16, "NIK wali harus 16 digit.").regex(/^\d+$/, "NIK wali hanya boleh berisi angka."),
    guardianRelationship: z.string().min(3, "Hubungan dengan wali wajib diisi."),
    guardianStatus: z.string({ required_error: "Status wali wajib diisi."}),
    guardianReligion: z.string({ required_error: "Agama wali wajib diisi."}),
    guardianAddress: z.string().min(10, "Alamat wali minimal 10 karakter."),
    guardianPhoneNumber: z.string().min(10, "Nomor telepon wali minimal 10 digit.").regex(/^08\d{8,}$/, "Format nomor telepon tidak valid."),
});

// Skema utama yang menggabungkan semua bagian
const marriageRegistrationSchema = z.object({
  // Step 1
  province: z.string({ required_error: "Provinsi wajib dipilih." }),
  regency: z.string({ required_error: "Kabupaten/Kota wajib dipilih." }),
  district: z.string({ required_error: "Kecamatan wajib dipilih." }),
  kua: z.string({ required_error: "KUA wajib dipilih." }),
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
}, { message: "Deskripsi pekerjaan lainnya wajib diisi (minimal 3 karakter).", path: ["groomOccupationDescription"],
}).refine(data => {
    if (data.brideOccupation === "Lainnya") return !!data.brideOccupationDescription && data.brideOccupationDescription.length > 2;
    return true;
}, { message: "Deskripsi pekerjaan lainnya wajib diisi (minimal 3 karakter).", path: ["brideOccupationDescription"],
});


export type MarriageRegistrationFormData = z.infer<typeof marriageRegistrationSchema>;

export type FormattedMarriageRegistration = {
    id: string;
    groomName: string;
    brideName: string;
    registrationDate: string;
    weddingDate: string;
    status: "Menunggu Verifikasi" | "Disetujui" | "Ditolak" | "Selesai";
    penghulu?: string;
    [key: string]: any; // Allow other properties
};

export type MarriageRegistrationFormState = {
  message: string;
  errors?: z.ZodIssue[];
  success: boolean;
  queueNumber?: string;
  data?: Partial<MarriageRegistrationFormData> & { weddingDate?: string, groomDateOfBirth?: string, brideDateOfBirth?: string, groomFatherDateOfBirth?: string, groomMotherDateOfBirth?: string, brideFatherDateOfBirth?: string, brideMotherDateOfBirth?: string };
  newRegistration?: FormattedMarriageRegistration;
};

const toDate = (value: any): Date | undefined => {
    if (!value || typeof value !== 'string') return undefined;
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
};

export async function submitMarriageRegistrationForm(
  prevState: MarriageRegistrationFormState,
  formData: FormData
): Promise<MarriageRegistrationFormState> {

  const rawFormData = Object.fromEntries(formData.entries());
  
  const dateFields = ['weddingDate', 'groomDateOfBirth', 'brideDateOfBirth', 'groomFatherDateOfBirth', 'groomMotherDateOfBirth', 'brideFatherDateOfBirth', 'brideMotherDateOfBirth'];
  
  for (const field of dateFields) {
      if (rawFormData[field]) {
          const convertedDate = toDate(rawFormData[field]);
          if (convertedDate) {
              rawFormData[field] = convertedDate;
          } else {
             delete rawFormData[field]; 
          }
      } else {
          delete rawFormData[field];
      }
  }

  const validatedFields = marriageRegistrationSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    console.log("Validation Errors:", JSON.stringify(validatedFields.error.issues, null, 2));
    return {
      message: "Formulir tidak valid. Silakan periksa kembali isian Anda di setiap langkah.",
      errors: validatedFields.error.issues,
      success: false,
    };
  }

  try {
    const datePart = format(new Date(), 'yyyyMMdd');
    const randomPart = Math.floor(100 + Math.random() * 900);
    const queueNumber = `ANTRI-NIKAH-${datePart}-${randomPart}`;

    await new Promise(resolve => setTimeout(resolve, 1000));

    const newRegistration: FormattedMarriageRegistration = {
        id: `reg_${new Date().getTime()}`,
        groomName: validatedFields.data.groomFullName,
        brideName: validatedFields.data.brideFullName,
        registrationDate: new Date().toISOString(),
        weddingDate: validatedFields.data.weddingDate.toISOString(),
        status: 'Menunggu Verifikasi',
        ...validatedFields.data,
    };
    
    // This is for client-side redirection and data display
    const successData: any = { ...validatedFields.data };
    dateFields.forEach(field => {
        if (successData[field] instanceof Date) {
            successData[field] = format(successData[field], 'yyyy-MM-dd');
        }
    });

    return {
      message: "Pendaftaran antrean nikah berhasil! Data Anda telah diteruskan ke staf KUA untuk verifikasi.",
      success: true,
      queueNumber: queueNumber,
      data: successData,
      newRegistration: newRegistration, // Pass the new registration data to the client
    };
  } catch (error) {
    console.error("Error processing marriage registration:", error);
    return {
      message: "Terjadi kesalahan pada server saat memproses pendaftaran. Silakan coba lagi.",
      success: false,
      errors: [{ path: ['_form'], message: 'Gagal memproses pendaftaran.' }] as z.ZodIssue[],
    };
  }
}

    