
'use server';

import { z } from 'zod';
import { format } from 'date-fns';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

const fileSchema = z.any()
  .refine(file => file?.size <= MAX_FILE_SIZE, `Ukuran file maksimal 5MB.`)
  .refine(file => ACCEPTED_IMAGE_TYPES.includes(file?.type), "Format file yang diterima: .jpg, .jpeg, .png, .pdf")
  .optional();
  
const groomSchema = z.object({
  groomFullName: z.string().min(3, "Nama lengkap calon suami minimal 3 karakter."),
  groomNik: z.string().length(16, "NIK calon suami harus 16 digit."),
  groomPlaceOfBirth: z.string().min(2, "Tempat lahir calon suami minimal 2 karakter."),
  groomDateOfBirth: z.date({ required_error: "Tanggal lahir calon suami wajib diisi." }),
  groomAddress: z.string().min(10, "Alamat calon suami minimal 10 karakter."),
  groomPhoneNumber: z.string().min(10, "Nomor telepon calon suami minimal 10 digit.").regex(/^08\d{8,}$/, "Format nomor telepon calon suami tidak valid."),
});

const brideSchema = z.object({
  brideFullName: z.string().min(3, "Nama lengkap calon istri minimal 3 karakter."),
  brideNik: z.string().length(16, "NIK calon istri harus 16 digit."),
  bridePlaceOfBirth: z.string().min(2, "Tempat lahir calon istri minimal 2 karakter."),
  brideDateOfBirth: z.date({ required_error: "Tanggal lahir calon istri wajib diisi." }),
  brideAddress: z.string().min(10, "Alamat calon istri minimal 10 karakter."),
  bridePhoneNumber: z.string().min(10, "Nomor telepon calon istri minimal 10 digit.").regex(/^08\d{8,}$/, "Format nomor telepon calon istri tidak valid."),
});

const guardianSchema = z.object({
    guardianFullName: z.string().min(3, "Nama lengkap wali minimal 3 karakter."),
    guardianNik: z.string().length(16, "NIK wali harus 16 digit."),
    guardianRelationship: z.string().min(3, "Hubungan dengan wali wajib diisi."),
    guardianAddress: z.string().min(10, "Alamat wali minimal 10 karakter."),
});

const marriageRegistrationSchema = z.object({
  // Step 1
  province: z.string(),
  city: z.string(),
  district: z.string(),
  kua: z.string(),
  weddingLocation: z.string({ required_error: "Lokasi nikah wajib dipilih."}),
  weddingDate: z.date({ required_error: "Tanggal akad wajib diisi." }),
  weddingTime: z.string({ required_error: "Jam akad wajib dipilih."}),
  dispensationNumber: z.string().optional(),
  
  // Steps 2, 3, 4
  ...groomSchema.shape,
  ...brideSchema.shape,
  ...guardianSchema.shape,

  // Step 5 - Dokumen (Optional for this implementation, focusing on structure)
  docGroomPhoto: fileSchema,
  docBridePhoto: fileSchema,
  docGroomKtp: fileSchema,
  docBrideKtp: fileSchema,
  docGroomKk: fileSchema,
  docBrideKk: fileSchema,
  docBirthCertificate: fileSchema,
});

export type MarriageRegistrationFormData = z.infer<typeof marriageRegistrationSchema>;

export type MarriageRegistrationFormState = {
  message: string;
  errors?: z.ZodIssue[];
  success: boolean;
  queueNumber?: string;
  data?: Partial<MarriageRegistrationFormData> & { weddingDate?: string, groomDateOfBirth?: string, brideDateOfBirth?: string };
};

export async function submitMarriageRegistrationForm(
  prevState: MarriageRegistrationFormState,
  formData: FormData
): Promise<MarriageRegistrationFormState> {

  // FormData doesn't directly support nested objects or files in Server Actions yet in a clean way.
  // We'll reconstruct the object and manually handle dates.
  const rawFormData = {
    // Step 1
    province: formData.get("province"),
    city: formData.get("city"),
    district: formData.get("district"),
    kua: formData.get("kua"),
    weddingLocation: formData.get("weddingLocation"),
    weddingDate: formData.get("weddingDate") ? new Date(formData.get("weddingDate") as string) : undefined,
    weddingTime: formData.get("weddingTime"),
    dispensationNumber: formData.get("dispensationNumber"),

    // Step 2
    groomFullName: formData.get("groomFullName"),
    groomNik: formData.get("groomNik"),
    groomPlaceOfBirth: formData.get("groomPlaceOfBirth"),
    groomDateOfBirth: formData.get("groomDateOfBirth") ? new Date(formData.get("groomDateOfBirth") as string) : undefined,
    groomAddress: formData.get("groomAddress"),
    groomPhoneNumber: formData.get("groomPhoneNumber"),
    
    // Step 3
    brideFullName: formData.get("brideFullName"),
    brideNik: formData.get("brideNik"),
    bridePlaceOfBirth: formData.get("bridePlaceOfBirth"),
    brideDateOfBirth: formData.get("brideDateOfBirth") ? new Date(formData.get("brideDateOfBirth") as string) : undefined,
    brideAddress: formData.get("brideAddress"),
    bridePhoneNumber: formData.get("bridePhoneNumber"),

    // Step 4
    guardianFullName: formData.get("guardianFullName"),
    guardianNik: formData.get("guardianNik"),
    guardianRelationship: formData.get("guardianRelationship"),
    guardianAddress: formData.get("guardianAddress"),
    
    // Step 5 (Files would need a different handling, e.g., upload to storage and pass URL)
  };

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
    const randomPart = Math.floor(100 + Math.random() * 900); // Generate 3-digit random number
    const queueNumber = `ANTRI-NIKAH-${datePart}-${randomPart}`;

    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demonstration, we'll log the data.
    // In a real app, you would save this to a database.
    console.log("Marriage Registration Submitted:", validatedFields.data);

    // Prepare data to be sent to the success page
    const successData = {
        ...validatedFields.data,
        weddingDate: format(validatedFields.data.weddingDate, 'yyyy-MM-dd'),
        groomDateOfBirth: format(validatedFields.data.groomDateOfBirth, 'yyyy-MM-dd'),
        brideDateOfBirth: format(validatedFields.data.brideDateOfBirth, 'yyyy-MM-dd'),
    };
    // Remove file objects before sending to URL params
    const fileKeys = ['docGroomPhoto', 'docBridePhoto', 'docGroomKtp', 'docBrideKtp', 'docGroomKk', 'docBrideKk', 'docBirthCertificate'];
    fileKeys.forEach(key => delete (successData as any)[key]);


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
