
'use server';

import { z } from 'zod';
import { format } from 'date-fns';

const MAX_FILE_SIZE = 200 * 1024; // 200 KB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const fileSchema = z.any()
  .refine(file => file?.size <= MAX_FILE_SIZE, `Ukuran file maksimal 200KB.`)
  .refine(file => ACCEPTED_IMAGE_TYPES.includes(file?.type), "Format file yang diterima: .jpg, .jpeg, .png")
  .optional();

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

const marriageRegistrationSchema = z.object({
  // Step 1
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
  errors?: z.ZodIssue[];
  success: boolean;
  queueNumber?: string;
  data?: Partial<MarriageRegistrationFormData> & { weddingDate?: string, groomDateOfBirth?: string, brideDateOfBirth?: string };
};

const toDate = (value: any) => value ? new Date(value as string) : undefined;

export async function submitMarriageRegistrationForm(
  prevState: MarriageRegistrationFormState,
  formData: FormData
): Promise<MarriageRegistrationFormState> {

  const rawFormData = Object.fromEntries(formData.entries());
  
  // Convert date strings to Date objects
  const dateFields = ['weddingDate', 'groomDateOfBirth', 'brideDateOfBirth'];
  dateFields.forEach(field => {
      if (rawFormData[field]) {
          rawFormData[field] = toDate(rawFormData[field]);
      }
  });

  const validatedFields = marriageRegistrationSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    console.log("Validation Errors:", validatedFields.error.issues);
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
