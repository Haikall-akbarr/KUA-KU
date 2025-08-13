
'use server';

import { z } from 'zod';
import { format } from 'date-fns';

const marriageRegistrationSchema = z.object({
  fullName: z.string().min(3, { message: "Nama lengkap minimal 3 karakter." }),
  nik: z.string().length(16, { message: "NIK harus 16 digit." }).regex(/^\d+$/, { message: "NIK hanya boleh berisi angka." }),
  phoneNumber: z.string().min(10, { message: "Nomor telepon minimal 10 digit." }).regex(/^08\d{8,}$/, { message: "Format nomor telepon tidak valid (contoh: 081234567890)."}),
  email: z.string().email({ message: "Format email tidak valid." }),
  partnerFullName: z.string().min(3, { message: "Nama pasangan minimal 3 karakter." }),
  plannedWeddingDate: z.date({ required_error: "Tanggal rencana akad wajib diisi." }),
});

export type MarriageRegistrationFormData = z.infer<typeof marriageRegistrationSchema>;

export type MarriageRegistrationFormState = {
  message: string;
  errors?: {
    fullName?: string[];
    nik?: string[];
    phoneNumber?: string[];
    email?: string[];
    partnerFullName?: string[];
    plannedWeddingDate?: string[];
    _form?: string[];
  };
  success: boolean;
  queueNumber?: string;
  data?: Omit<MarriageRegistrationFormData, 'plannedWeddingDate'> & { plannedWeddingDate: string }; // Return string date
};

export async function submitMarriageRegistrationForm(
  prevState: MarriageRegistrationFormState,
  formData: FormData
): Promise<MarriageRegistrationFormState> {
  const rawFormData = {
    fullName: formData.get("fullName"),
    nik: formData.get("nik"),
    phoneNumber: formData.get("phoneNumber"),
    email: formData.get("email"),
    partnerFullName: formData.get("partnerFullName"),
    plannedWeddingDate: formData.get("plannedWeddingDate") ? new Date(formData.get("plannedWeddingDate") as string) : undefined,
  };

  const validatedFields = marriageRegistrationSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      message: "Formulir tidak valid. Silakan periksa kembali isian Anda.",
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const datePart = format(new Date(), 'yyyyMMdd');
    const randomPart = Math.floor(100 + Math.random() * 900); // Generate 3-digit random number
    const queueNumber = `ANTRI-NIKAH-${datePart}-${randomPart}`;

    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      message: "Pendaftaran antrean nikah berhasil! Silakan unduh bukti pendaftaran Anda.",
      success: true,
      queueNumber: queueNumber,
      data: {
        ...validatedFields.data,
        plannedWeddingDate: format(validatedFields.data.plannedWeddingDate, 'yyyy-MM-dd'),
      }
    };
  } catch (error) {
    console.error("Error generating queue number:", error);
    return {
      message: "Terjadi kesalahan pada server. Silakan coba lagi.",
      success: false,
      errors: { _form: ["Gagal memproses pendaftaran."] }
    };
  }
}
