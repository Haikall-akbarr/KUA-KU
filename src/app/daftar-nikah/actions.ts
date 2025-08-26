
'use server';

import { z } from 'zod';
import { format } from 'date-fns';

const MAX_FILE_SIZE = 200 * 1024; // 200 KB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const fileSchema = z.any()
  .refine(file => file?.size <= MAX_FILE_SIZE, `Ukuran file maksimal 200KB.`)
  .refine(file => ACCEPTED_IMAGE_TYPES.includes(file?.type), "Format file yang diterima: .jpg, .jpeg, .png")
  .optional();
  
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

const marriageRegistrationSchema = z.object({
  // Step 1
  weddingLocation: z.string({ required_error: "Lokasi nikah wajib dipilih."}),
  weddingDate: z.date({ required_error: "Tanggal akad wajib diisi." }),
  weddingTime: z.string({ required_error: "Jam akad wajib dipilih."}),
  dispensationNumber: z.string().optional(),
  
  // Steps 2, 3, 4
  ...groomSchema.shape,
  ...brideSchema.shape,
  ...guardianSchema.shape,

  // Step 5 - Dokumen
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

  const rawFormData = {
    // Step 1
    weddingLocation: formData.get("weddingLocation"),
    weddingDate: toDate(formData.get("weddingDate")),
    weddingTime: formData.get("weddingTime"),
    dispensationNumber: formData.get("dispensationNumber"),

    // Step 2 (Groom)
    groomFullName: formData.get("groomFullName"),
    groomNik: formData.get("groomNik"),
    groomCitizenship: formData.get("groomCitizenship"),
    groomPassportNumber: formData.get("groomPassportNumber"),
    groomPlaceOfBirth: formData.get("groomPlaceOfBirth"),
    groomDateOfBirth: toDate(formData.get("groomDateOfBirth")),
    groomStatus: formData.get("groomStatus"),
    groomReligion: formData.get("groomReligion"),
    groomEducation: formData.get("groomEducation"),
    groomOccupation: formData.get("groomOccupation"),
    groomOccupationDescription: formData.get("groomOccupationDescription"),
    groomPhoneNumber: formData.get("groomPhoneNumber"),
    groomEmail: formData.get("groomEmail"),
    groomAddress: formData.get("groomAddress"),
    
    // Step 3 (Bride)
    brideFullName: formData.get("brideFullName"),
    brideNik: formData.get("brideNik"),
    brideCitizenship: formData.get("brideCitizenship"),
    bridePassportNumber: formData.get("bridePassportNumber"),
    bridePlaceOfBirth: formData.get("bridePlaceOfBirth"),
    brideDateOfBirth: toDate(formData.get("brideDateOfBirth")),
    brideStatus: formData.get("brideStatus"),
    brideReligion: formData.get("brideReligion"),
    brideEducation: formData.get("brideEducation"),
    brideOccupation: formData.get("brideOccupation"),
    brideOccupationDescription: formData.get("brideOccupationDescription"),
    bridePhoneNumber: formData.get("bridePhoneNumber"),
    brideEmail: formData.get("brideEmail"),
    brideAddress: formData.get("brideAddress"),

    // Step 4 (Guardian)
    guardianFullName: formData.get("guardianFullName"),
    guardianNik: formData.get("guardianNik"),
    guardianRelationship: formData.get("guardianRelationship"),
    guardianStatus: formData.get("guardianStatus"),
    guardianReligion: formData.get("guardianReligion"),
    guardianAddress: formData.get("guardianAddress"),
    
    // Step 5 (Files)
    docGroomPhoto: formData.get("docGroomPhoto"),
    docBridePhoto: formData.get("docBridePhoto"),
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

    console.log("Marriage Registration Submitted:", validatedFields.data);

    // Prepare data to be sent to the success page
    const successData = {
        ...validatedFields.data,
        weddingDate: format(validatedFields.data.weddingDate, 'yyyy-MM-dd'),
        groomDateOfBirth: format(validatedFields.data.groomDateOfBirth, 'yyyy-MM-dd'),
        brideDateOfBirth: format(validatedFields.data.brideDateOfBirth, 'yyyy-MM-dd'),
    };
    // Remove file objects before sending to URL params
    const fileKeys = ['docGroomPhoto', 'docBridePhoto'];
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
