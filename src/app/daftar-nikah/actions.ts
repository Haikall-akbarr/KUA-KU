
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
  
  // Since we removed validation, we directly process the data.
  // In a real scenario, you'd have your Zod schema here.
  
  try {
    const datePart = format(new Date(), 'yyyyMMdd');
    const randomPart = Math.floor(100 + Math.random() * 900);
    const queueNumber = `ANTRI-NIKAH-${datePart}-${randomPart}`;

    await new Promise(resolve => setTimeout(resolve, 1000));

    const weddingDate = toDate(rawFormData.weddingDate);

    // This is the data that will be saved to local storage for the admin dashboard
    const newRegistration: FormattedMarriageRegistration = {
        id: `reg_${new Date().getTime()}`,
        groomName: rawFormData.groomFullName as string,
        brideName: rawFormData.brideFullName as string,
        registrationDate: new Date().toISOString(),
        weddingDate: weddingDate ? weddingDate.toISOString() : new Date().toISOString(),
        status: 'Menunggu Verifikasi',
        ...rawFormData,
    };
    
    // This is the data for client-side redirection to the success page
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
      data: successData, // Pass all raw form data
      newRegistration: newRegistration, // Pass the new registration data to be saved in localStorage
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
