
'use server';

import { z } from 'zod';
import { format } from 'date-fns';

export type MarriageRegistrationFormData = {
  [key: string]: any;
};

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
  errors?: { path: string[], message: string }[];
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
  
  try {
    const datePart = format(new Date(), 'yyyyMMdd');
    const randomPart = Math.floor(100 + Math.random() * 900);
    const queueNumber = `ANTRI-NIKAH-${datePart}-${randomPart}`;

    await new Promise(resolve => setTimeout(resolve, 1000));

    const weddingDate = toDate(rawFormData.weddingDate);

    const newRegistration: FormattedMarriageRegistration = {
        id: `reg_${new Date().getTime()}`,
        groomName: rawFormData.groomFullName as string,
        brideName: rawFormData.brideFullName as string,
        registrationDate: new Date().toISOString(),
        weddingDate: weddingDate ? weddingDate.toISOString() : new Date().toISOString(),
        status: 'Menunggu Verifikasi',
        ...rawFormData,
    };
    
    // This is for client-side redirection and data display
    const successData: any = { ...rawFormData };
    const dateFields = ['weddingDate', 'groomDateOfBirth', 'brideDateOfBirth', 'groomFatherDateOfBirth', 'groomMotherDateOfBirth', 'brideFatherDateOfBirth', 'brideMotherDateOfBirth'];
    dateFields.forEach(field => {
        const dateValue = toDate(successData[field]);
        if (dateValue) {
            successData[field] = format(dateValue, 'yyyy-MM-dd');
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
      errors: [{ path: ['_form'], message: 'Gagal memproses pendaftaran.' }],
    };
  }
}
