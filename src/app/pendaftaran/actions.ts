'use server';

import { z } from 'zod';
import { format } from 'date-fns';


const registrationFormSchema = z.object({
  fullName: z.string().min(3, { message: "Nama lengkap minimal 3 karakter." }),
  nik: z.string().length(16, { message: "NIK harus 16 digit." }).regex(/^\d+$/, { message: "NIK hanya boleh berisi angka." }),
  placeOfBirth: z.string().min(2, { message: "Tempat lahir minimal 2 karakter." }),
  dateOfBirth: z.string().min(1, { message: "Tanggal lahir wajib diisi." }), 
  phoneNumber: z.string().min(10, { message: "Nomor telepon minimal 10 digit." }).regex(/^08\d{8,}$/, { message: "Format nomor telepon tidak valid (contoh: 081234567890)."}),
  email: z.string().email({ message: "Format email tidak valid." }),
});

export type RegistrationFormData = z.infer<typeof registrationFormSchema>;

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
  data?: RegistrationFormData; // Data yang dikembalikan sekarang akan berisi dateOfBirth sebagai string
};

export async function submitRegistrationForm(
  prevState: RegistrationFormState,
  formData: FormData
): Promise<RegistrationFormState> {
  
  // ✅ PERUBAHAN: Jangan konversi dateOfBirth ke new Date(). Biarkan sebagai string.
  const rawFormData = {
    fullName: formData.get("fullName"),
    nik: formData.get("nik"),
    placeOfBirth: formData.get("placeOfBirth"),
    dateOfBirth: formData.get("dateOfBirth"), // Biarkan apa adanya (string "yyyy-MM-dd")
    phoneNumber: formData.get("phoneNumber"),
    email: formData.get("email"),
  };

  // Validasi Zod sekarang akan mencocokkan string dengan string.
  const validatedFields = registrationFormSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    // Jika validasi gagal, ini akan mengembalikan error ke form
    return {
      message: "Formulir tidak valid. Silakan periksa kembali isian Anda.",
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    // Bagian ini (membuat nomor registrasi) sudah benar
    const datePart = format(new Date(), 'yyyyMMddHHmmss');
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    const registrationNumber = `KUA-BU-REG-${datePart}-${randomPart}`;

    // Simulasi API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Jika sukses, 'validatedFields.data' sekarang berisi data yang benar
    // termasuk 'dateOfBirth' sebagai string.
    return {
      message: "Pendaftaran Anda berhasil! Silakan unduh bukti pendaftaran Anda.",
      success: true,
      registrationNumber: registrationNumber,
      data: validatedFields.data // 'dateOfBirth' sudah dalam format string "yyyy-MM-dd"
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