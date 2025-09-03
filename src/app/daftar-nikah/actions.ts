
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
        const name = data[`${prefix}Name`];
        if (!name || name.length < 3) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nama ayah/ibu minimal 3 karakter.", path: [`${prefix}Name`] });
        }
        const nik = data[`${prefix}Nik`];
        if (nik && (!/^\d{16}$/.test(nik))) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "NIK ayah/ibu harus 16 digit angka.", path: [`${prefix}Nik`] });
        }
        const citizenship = data[`${prefix}Citizenship`];
        if (!citizenship) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Kewarganegaraan wajib diisi.", path: [`${prefix}Citizenship`] });
        }
        if (citizenship === 'WNA' && (!data[`${prefix}PassportNumber`] || data[`${prefix}PassportNumber`]?.length < 3) ) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nomor paspor wajib diisi untuk WNA.", path: [`${prefix}PassportNumber`] });
        }
        const placeOfBirth = data[`${prefix}PlaceOfBirth`];
        if (!placeOfBirth || placeOfBirth.length < 2) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Tempat lahir minimal 2 karakter.", path: [`${prefix}PlaceOfBirth`] });
        }
         const dateOfBirth = data[`${prefix}DateOfBirth`];
        if (!dateOfBirth) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Tanggal lahir wajib diisi.", path: [`${prefix}DateOfBirth`] });
        }
        const religion = data[`${prefix}Religion`];
        if (!religion) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Agama wajib diisi.", path: [`${prefix}Religion`] });
        }
        const occupation = data[`${prefix}Occupation`];
        if (!occupation) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Pekerjaan wajib diisi.", path: [`${prefix}Occupation`] });
        }
        if (occupation === "Lainnya" && (!data[`${prefix}OccupationDescription`] || data[`${prefix}OccupationDescription`]?.length < 3)) {
             ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Deskripsi pekerjaan lainnya wajib diisi.", path: [`${prefix}OccupationDescription`] });
        }
        const address = data[`${prefix}Address`];
        if (!address || address.length < 10) {
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

export type MarriageRegistrationFormState = {
  message: string;
  errors?: ZodIssue[];
  success: boolean;
  queueNumber?: string;
  data?: Partial<MarriageRegistrationFormData> & { weddingDate?: string, groomDateOfBirth?: string, brideDateOfBirth?: string, groomFatherDateOfBirth?: string, groomMotherDateOfBirth?: string, brideFatherDateOfBirth?: string, brideMotherDateOfBirth?: string };
};

const toDate = (value: any): Date | undefined => {
    if (!value) return undefined;
    // Handle cases where value might already be a Date object
    if (value instanceof Date) return value;
    const date = new Date(value as string);
    return isNaN(date.getTime()) ? undefined : date;
};

export async function submitMarriageRegistrationForm(
  prevState: MarriageRegistrationFormState,
  formData: FormData
): Promise<MarriageRegistrationFormState> {

  const rawFormData = Object.fromEntries(formData.entries());
  
  // Convert date strings to Date objects, ensuring empty strings are handled
  const dateFields = ['weddingDate', 'groomDateOfBirth', 'brideDateOfBirth', 'groomFatherDateOfBirth', 'groomMotherDateOfBirth', 'brideFatherDateOfBirth', 'brideMotherDateOfBirth'];
  dateFields.forEach(field => {
      if (rawFormData[field] && typeof rawFormData[field] === 'string') {
          rawFormData[field] = toDate(rawFormData[field]);
      } else {
         rawFormData[field] = undefined;
      }
  });

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

    console.log("Marriage Registration Submitted:", validatedFields.data);

    const successData: any = { ...validatedFields.data };
    dateFields.forEach(field => {
        if (successData[field]) {
            successData[field] = format(successData[field], 'yyyy-MM-dd');
        }
    });

    return {
      message: "Pendaftaran antrean nikah berhasil! Silakan periksa dan unduh bukti pendaftaran Anda.",
      success: true,
      queueNumber: queueNumber,
      data: successData
    };
  } catch (error) {
    console.error("Error processing marriage registration:", error);
    return {
      message: "Terjadi kesalahan pada server saat memproses pendaftaran. Silakan coba lagi.",
      success: false,
      errors: [{ path: ['_form'], message: 'Gagal memproses pendaftaran.' }]
    };
  }
}
