
'use server';

import { z } from 'zod';
import { format } from 'date-fns';

const registrationFormSchema = z.object({
  fullName: z.string().min(3, { message: "Nama lengkap minimal 3 karakter." }),
  nik: z.string().length(16, { message: "NIK harus 16 digit." }).regex(/^\d+$/, { message: "NIK hanya boleh berisi angka." }),
  placeOfBirth: z.string().min(2, { message: "Tempat lahir minimal 2 karakter." }),
  dateOfBirth: z.date({ required_error: "Tanggal lahir wajib diisi." }),
  phoneNumber: z.string().min(10, { message: "Nomor telepon minimal 10 digit." }).regex(/^08\d{8,}$/, { message: "Format nomor telepon tidak valid (contoh: 081234567890)."}),
  email: z.string().email({ message: "Format email tidak valid." }),
});

export type RegistrationFormState = {
  message: string;
  errors?: {
    fullName?: string[];
    nik?: string[];
    placeOfBirth?: string[];
    dateOfBirth?: string[];
    phoneNumber?: string[];
    email?: string[];
    _form?: string[];
  };
  success: boolean;
  registrationNumber?: string;
};

export async function submitRegistrationForm(
  prevState: RegistrationFormState,
  formData: FormData
): Promise<RegistrationFormState> {
  const rawFormData = {
    fullName: formData.get("fullName"),
    nik: formData.get("nik"),
    placeOfBirth: formData.get("placeOfBirth"),
    // Ensure dateOfBirth is parsed correctly, it comes as YYYY-MM-DD string from FormData
    dateOfBirth: formData.get("dateOfBirth") ? new Date(formData.get("dateOfBirth") as string) : undefined,
    phoneNumber: formData.get("phoneNumber"),
    email: formData.get("email"),
  };

  const validatedFields = registrationFormSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      message: "Formulir tidak valid. Silakan periksa kembali isian Anda.",
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const datePart = format(new Date(), 'yyyyMMddHHmmss');
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    const registrationNumber = `KUAKU-REG-${datePart}-${randomPart}`;

    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      message: "Pendaftaran Anda berhasil! Nomor pendaftaran Anda telah diterbitkan.",
      success: true,
      registrationNumber: registrationNumber,
    };
  } catch (error) {
    console.error("Error generating registration number:", error);
    return {
      message: "Terjadi kesalahan pada server. Silakan coba lagi.",
      success: false,
      errors: { _form: ["Gagal memproses pendaftaran."] }
    };
  }
}
