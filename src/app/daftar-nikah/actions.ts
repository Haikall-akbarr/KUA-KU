
'use server';

import { format, parseISO } from 'date-fns';

export type MarriageRegistrationFormState = {
  message: string;
  success: boolean;
  errors?: string;
  data?: any;
};

const formatDateForAPI = (value: any): string | undefined => {
    if (!value || typeof value !== 'string') return undefined;
    try {
        const date = parseISO(value);
        return format(date, "yyyy-MM-dd");
    } catch (error) {
        return undefined;
    }
};

export async function submitMarriageRegistrationForm(
  prevState: MarriageRegistrationFormState,
  formData: FormData
): Promise<MarriageRegistrationFormState> {

  const rawFormData = Object.fromEntries(formData.entries());

  const apiRequestData = {
    scheduleAndLocation: {
      weddingLocation: rawFormData.weddingLocation,
      weddingAddress: rawFormData.kua,
      weddingDate: formatDateForAPI(rawFormData.weddingDate),
      weddingTime: rawFormData.weddingTime,
      dispensationNumber: rawFormData.dispensationNumber || ""
    },
    groom: {
      groomFullName: rawFormData.groomFullName,
      groomNik: rawFormData.groomNik,
      groomCitizenship: rawFormData.groomCitizenship,
      groomPassportNumber: rawFormData.groomPassportNumber || "",
      groomPlaceOfBirth: rawFormData.groomPlaceOfBirth,
      groomDateOfBirth: formatDateForAPI(rawFormData.groomDateOfBirth),
      groomStatus: rawFormData.groomStatus,
      groomReligion: rawFormData.groomReligion,
      groomEducation: rawFormData.groomEducation,
      groomOccupation: rawFormData.groomOccupation,
      groomOccupationDescription: rawFormData.groomOccupationDescription || "",
      groomPhoneNumber: rawFormData.groomPhoneNumber,
      groomEmail: rawFormData.groomEmail,
      groomAddress: rawFormData.groomAddress
    },
    bride: {
      brideFullName: rawFormData.brideFullName,
      brideNik: rawFormData.brideNik,
      brideCitizenship: rawFormData.brideCitizenship,
      bridePassportNumber: rawFormData.bridePassportNumber || "",
      bridePlaceOfBirth: rawFormData.bridePlaceOfBirth,
      brideDateOfBirth: formatDateForAPI(rawFormData.brideDateOfBirth),
      brideStatus: rawFormData.brideStatus,
      brideReligion: rawFormData.brideReligion,
      brideEducation: rawFormData.brideEducation,
      brideOccupation: rawFormData.brideOccupation,
      brideOccupationDescription: rawFormData.brideOccupationDescription || "",
      bridePhoneNumber: rawFormData.bridePhoneNumber,
      brideEmail: rawFormData.brideEmail,
      brideAddress: rawFormData.brideAddress
    },
    groomParents: {
      groomFather: {
        groomFatherPresenceStatus: rawFormData.groomFatherPresenceStatus,
        groomFatherName: rawFormData.groomFatherName,
        groomFatherNik: rawFormData.groomFatherNik,
        groomFatherCitizenship: rawFormData.groomFatherCitizenship,
        groomFatherCountryOfOrigin: rawFormData.groomFatherCountryOfOrigin || "Indonesia",
        groomFatherPassportNumber: rawFormData.groomFatherPassportNumber || "",
        groomFatherPlaceOfBirth: rawFormData.groomFatherPlaceOfBirth,
        groomFatherDateOfBirth: formatDateForAPI(rawFormData.groomFatherDateOfBirth),
        groomFatherReligion: rawFormData.groomFatherReligion,
        groomFatherOccupation: rawFormData.groomFatherOccupation,
        groomFatherOccupationDescription: rawFormData.groomFatherOccupationDescription || "",
        groomFatherAddress: rawFormData.groomFatherAddress
      },
      groomMother: {
        groomMotherPresenceStatus: rawFormData.groomMotherPresenceStatus,
        groomMotherName: rawFormData.groomMotherName,
        groomMotherNik: rawFormData.groomMotherNik,
        groomMotherCitizenship: rawFormData.groomMotherCitizenship,
        groomMotherCountryOfOrigin: rawFormData.groomMotherCountryOfOrigin || "Indonesia",
        groomMotherPassportNumber: rawFormData.groomMotherPassportNumber || "",
        groomMotherPlaceOfBirth: rawFormData.groomMotherPlaceOfBirth,
        groomMotherDateOfBirth: formatDateForAPI(rawFormData.groomMotherDateOfBirth),
        groomMotherReligion: rawFormData.groomMotherReligion,
        groomMotherOccupation: rawFormData.groomMotherOccupation,
        groomMotherOccupationDescription: rawFormData.groomMotherOccupationDescription || "",
        groomMotherAddress: rawFormData.groomMotherAddress
      }
    },
    brideParents: {
      brideFather: {
        brideFatherPresenceStatus: rawFormData.brideFatherPresenceStatus,
        brideFatherName: rawFormData.brideFatherName,
        brideFatherNik: rawFormData.brideFatherNik,
        brideFatherCitizenship: rawFormData.brideFatherCitizenship,
        brideFatherCountryOfOrigin: rawFormData.brideFatherCountryOfOrigin || "Indonesia",
        brideFatherPassportNumber: rawFormData.brideFatherPassportNumber || "",
        brideFatherPlaceOfBirth: rawFormData.brideFatherPlaceOfBirth,
        brideFatherDateOfBirth: formatDateForAPI(rawFormData.brideFatherDateOfBirth),
        brideFatherReligion: rawFormData.brideFatherReligion,
        brideFatherOccupation: rawFormData.brideFatherOccupation,
        brideFatherOccupationDescription: rawFormData.brideFatherOccupationDescription || "",
        brideFatherAddress: rawFormData.brideFatherAddress
      },
      brideMother: {
        brideMotherPresenceStatus: rawFormData.brideMotherPresenceStatus,
        brideMotherName: rawFormData.brideMotherName,
        brideMotherNik: rawFormData.brideMotherNik,
        brideMotherCitizenship: rawFormData.brideMotherCitizenship,
        brideMotherCountryOfOrigin: rawFormData.brideMotherCountryOfOrigin || "Indonesia",
        brideMotherPassportNumber: rawFormData.brideMotherPassportNumber || "",
        brideMotherPlaceOfBirth: rawFormData.brideMotherPlaceOfBirth,
        brideMotherDateOfBirth: formatDateForAPI(rawFormData.brideMotherDateOfBirth),
        brideMotherReligion: rawFormData.brideMotherReligion,
        brideMotherOccupation: rawFormData.brideMotherOccupation,
        brideMotherOccupationDescription: rawFormData.brideMotherOccupationDescription || "",
        brideMotherAddress: rawFormData.brideMotherAddress
      }
    },
    guardian: {
      guardianFullName: rawFormData.guardianFullName,
      guardianNik: rawFormData.guardianNik,
      guardianRelationship: rawFormData.guardianRelationship,
      guardianStatus: rawFormData.guardianStatus,
      guardianReligion: rawFormData.guardianReligion,
      guardianAddress: rawFormData.guardianAddress,
      guardianPhoneNumber: rawFormData.guardianPhoneNumber
    }
  };

  try {
    const response = await fetch('https://kua-api.vercel.app/simnikah/pendaftaran/form-baru', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiRequestData),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.error || "Terjadi kesalahan validasi",
        errors: typeof result.details === 'string' ? result.details : JSON.stringify(result.details),
      };
    }

    const successDataForUrl = {
        nomor_pendaftaran: result.data.pendaftaran.nomor_pendaftaran,
        status_pendaftaran: result.data.pendaftaran.status_pendaftaran,
        tanggal_nikah: result.data.pendaftaran.tanggal_nikah,
        nama_suami: result.data.calon_suami.nama_lengkap,
        nama_istri: result.data.calon_istri.nama_lengkap,
        next_steps: JSON.stringify(result.next_steps || [])
    }

    return {
      success: true,
      message: result.message,
      data: successDataForUrl, 
    };

  } catch (error) {
    console.error(">>> DETAILED FETCH ERROR:", error);
    return {
      success: false,
      message: "Terjadi masalah koneksi atau kesalahan pada server.",
      errors: error instanceof Error ? error.message : "Tidak dapat terhubung ke server. Silakan coba beberapa saat lagi.",
    };
  }
}
