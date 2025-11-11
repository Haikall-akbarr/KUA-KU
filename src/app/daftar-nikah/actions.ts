
'use server';

import { format, parseISO } from 'date-fns';
import { cookies } from 'next/headers';

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

// Use env var for API base (server-side)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://simnikah-api-production.up.railway.app';

export async function submitMarriageRegistrationForm(
  prevState: MarriageRegistrationFormState,
  formData: FormData
): Promise<MarriageRegistrationFormState> {

  const rawFormData = Object.fromEntries(formData.entries());

  const apiRequestData = {
    scheduleAndLocation: {
      weddingLocation: rawFormData.weddingLocation || "",
      weddingAddress: rawFormData.kua || "",
      weddingDate: formatDateForAPI(rawFormData.weddingDate) || "",
      weddingTime: rawFormData.weddingTime || "",
      dispensationNumber: rawFormData.dispensationNumber || ""
    },
    groom: {
      groomFullName: rawFormData.groomFullName || "",
      groomNik: rawFormData.groomNik || "",
      groomCitizenship: rawFormData.groomCitizenship || "",
      groomPassportNumber: rawFormData.groomPassportNumber || "",
      groomPlaceOfBirth: rawFormData.groomPlaceOfBirth || "",
      groomDateOfBirth: formatDateForAPI(rawFormData.groomDateOfBirth) || "",
      groomStatus: rawFormData.groomStatus || "",
      groomReligion: 'Islam',
      groomEducation: rawFormData.groomEducation || "",
      groomOccupation: rawFormData.groomOccupation || "",
      groomOccupationDescription: rawFormData.groomOccupationDescription || "",
      groomPhoneNumber: rawFormData.groomPhoneNumber || "",
      groomEmail: rawFormData.groomEmail || "",
      groomAddress: rawFormData.groomAddress || ""
    },
    bride: {
      brideFullName: rawFormData.brideFullName || "",
      brideNik: rawFormData.brideNik || "",
      brideCitizenship: rawFormData.brideCitizenship || "",
      bridePassportNumber: rawFormData.bridePassportNumber || "",
      bridePlaceOfBirth: rawFormData.bridePlaceOfBirth || "",
      brideDateOfBirth: formatDateForAPI(rawFormData.brideDateOfBirth) || "",
      brideStatus: rawFormData.brideStatus || "",
      brideReligion: 'Islam',
      brideEducation: rawFormData.brideEducation || "",
      brideOccupation: rawFormData.brideOccupation || "",
      brideOccupationDescription: rawFormData.brideOccupationDescription || "",
      bridePhoneNumber: rawFormData.bridePhoneNumber || "",
      brideEmail: rawFormData.brideEmail || "",
      brideAddress: rawFormData.brideAddress || ""
    },
    groomParents: {
      groomFather: {
        groomFatherPresenceStatus: rawFormData.groomFatherPresenceStatus || "",
        groomFatherName: rawFormData.groomFatherName || "",
        groomFatherNik: rawFormData.groomFatherNik || "",
        groomFatherCitizenship: rawFormData.groomFatherCitizenship || "WNI",
        groomFatherCountryOfOrigin: rawFormData.groomFatherCountryOfOrigin || "Indonesia",
        groomFatherPassportNumber: rawFormData.groomFatherPassportNumber || "",
        groomFatherPlaceOfBirth: rawFormData.groomFatherPlaceOfBirth || "",
        groomFatherDateOfBirth: formatDateForAPI(rawFormData.groomFatherDateOfBirth) || "",
        groomFatherReligion: 'Islam',
        groomFatherOccupation: rawFormData.groomFatherOccupation || "",
        groomFatherOccupationDescription: rawFormData.groomFatherOccupationDescription || "",
        groomFatherAddress: rawFormData.groomFatherAddress || ""
      },
      groomMother: {
        groomMotherPresenceStatus: rawFormData.groomMotherPresenceStatus || "",
        groomMotherName: rawFormData.groomMotherName || "",
        groomMotherNik: rawFormData.groomMotherNik || "",
        groomMotherCitizenship: rawFormData.groomMotherCitizenship || "WNI",
        groomMotherCountryOfOrigin: rawFormData.groomMotherCountryOfOrigin || "Indonesia",
        groomMotherPassportNumber: rawFormData.groomMotherPassportNumber || "",
        groomMotherPlaceOfBirth: rawFormData.groomMotherPlaceOfBirth || "",
        groomMotherDateOfBirth: formatDateForAPI(rawFormData.groomMotherDateOfBirth) || "",
        groomMotherReligion: 'Islam',
        groomMotherOccupation: rawFormData.groomMotherOccupation || "",
        groomMotherOccupationDescription: rawFormData.groomMotherOccupationDescription || "",
        groomMotherAddress: rawFormData.groomMotherAddress || ""
      }
    },
    OrangTuaCalonSuami: {
      Ayah: {
        StatusKeberadaan: rawFormData.groomFatherPresenceStatus || "",
        NamaLengkap: rawFormData.groomFatherName || "",
        Nik: rawFormData.groomFatherNik || "",
        Kewarganegaraan: rawFormData.groomFatherCitizenship || "WNI",
        NegaraAsalWNA: rawFormData.groomFatherCountryOfOrigin || "Indonesia",
        NomorPaspor: rawFormData.groomFatherPassportNumber || "",
        TempatLahir: rawFormData.groomFatherPlaceOfBirth || "",
        TanggalLahir: formatDateForAPI(rawFormData.groomFatherDateOfBirth) || "",
        Agama: 'Islam',
        Pekerjaan: rawFormData.groomFatherOccupation || "",
        KeteranganPekerjaan: rawFormData.groomFatherOccupationDescription || "",
        Alamat: rawFormData.groomFatherAddress || ""
      },
      Ibu: {
        StatusKeberadaan: rawFormData.groomMotherPresenceStatus || "",
        NamaLengkap: rawFormData.groomMotherName || "",
        Nik: rawFormData.groomMotherNik || "",
        Kewarganegaraan: rawFormData.groomMotherCitizenship || "WNI",
        NegaraAsalWNA: rawFormData.groomMotherCountryOfOrigin || "Indonesia",
        NomorPaspor: rawFormData.groomMotherPassportNumber || "",
        TempatLahir: rawFormData.groomMotherPlaceOfBirth || "",
        TanggalLahir: formatDateForAPI(rawFormData.groomMotherDateOfBirth) || "",
        Agama: 'Islam',
        Pekerjaan: rawFormData.groomMotherOccupation || "",
        KeteranganPekerjaan: rawFormData.groomMotherOccupationDescription || "",
        Alamat: rawFormData.groomMotherAddress || ""
      }
    },
    brideParents: {
      brideFather: {
        brideFatherPresenceStatus: rawFormData.brideFatherPresenceStatus || "",
        brideFatherName: rawFormData.brideFatherName || "",
        brideFatherNik: rawFormData.brideFatherNik || "",
        brideFatherCitizenship: rawFormData.brideFatherCitizenship || "WNI",
        brideFatherCountryOfOrigin: rawFormData.brideFatherCountryOfOrigin || "Indonesia",
        brideFatherPassportNumber: rawFormData.brideFatherPassportNumber || "",
        brideFatherPlaceOfBirth: rawFormData.brideFatherPlaceOfBirth || "",
        brideFatherDateOfBirth: formatDateForAPI(rawFormData.brideFatherDateOfBirth) || "",
        brideFatherReligion: 'Islam',
        brideFatherOccupation: rawFormData.brideFatherOccupation || "",
        brideFatherOccupationDescription: rawFormData.brideFatherOccupationDescription || "",
        brideFatherAddress: rawFormData.brideFatherAddress || ""
      },
      brideMother: {
        brideMotherPresenceStatus: rawFormData.brideMotherPresenceStatus || "",
        brideMotherName: rawFormData.brideMotherName || "",
        brideMotherNik: rawFormData.brideMotherNik || "",
        brideMotherCitizenship: rawFormData.brideMotherCitizenship || "WNI",
        brideMotherCountryOfOrigin: rawFormData.brideMotherCountryOfOrigin || "Indonesia",
        brideMotherPassportNumber: rawFormData.brideMotherPassportNumber || "",
        brideMotherPlaceOfBirth: rawFormData.brideMotherPlaceOfBirth || "",
        brideMotherDateOfBirth: formatDateForAPI(rawFormData.brideMotherDateOfBirth) || "",
        brideMotherReligion: 'Islam',
        brideMotherOccupation: rawFormData.brideMotherOccupation || "",
        brideMotherOccupationDescription: rawFormData.brideMotherOccupationDescription || "",
        brideMotherAddress: rawFormData.brideMotherAddress || ""
      }
    },
    OrangTuaCalonIstri: {
      Ayah: {
        StatusKeberadaan: rawFormData.brideFatherPresenceStatus || "",
        NamaLengkap: rawFormData.brideFatherName || "",
        Nik: rawFormData.brideFatherNik || "",
        Kewarganegaraan: rawFormData.brideFatherCitizenship || "WNI",
        NegaraAsalWNA: rawFormData.brideFatherCountryOfOrigin || "Indonesia",
        NomorPaspor: rawFormData.brideFatherPassportNumber || "",
        TempatLahir: rawFormData.brideFatherPlaceOfBirth || "",
        TanggalLahir: formatDateForAPI(rawFormData.brideFatherDateOfBirth) || "",
        Agama: 'Islam',
        Pekerjaan: rawFormData.brideFatherOccupation || "",
        KeteranganPekerjaan: rawFormData.brideFatherOccupationDescription || "",
        Alamat: rawFormData.brideFatherAddress || ""
      },
      Ibu: {
        StatusKeberadaan: rawFormData.brideMotherPresenceStatus || "",
        NamaLengkap: rawFormData.brideMotherName || "",
        Nik: rawFormData.brideMotherNik || "",
        Kewarganegaraan: rawFormData.brideMotherCitizenship || "WNI",
        NegaraAsalWNA: rawFormData.brideMotherCountryOfOrigin || "Indonesia",
        NomorPaspor: rawFormData.brideMotherPassportNumber || "",
        TempatLahir: rawFormData.brideMotherPlaceOfBirth || "",
        TanggalLahir: formatDateForAPI(rawFormData.brideMotherDateOfBirth) || "",
        Agama: 'Islam',
        Pekerjaan: rawFormData.brideMotherOccupation || "",
        KeteranganPekerjaan: rawFormData.brideMotherOccupationDescription || "",
        Alamat: rawFormData.brideMotherAddress || ""
      }
    },
    guardian: {
      guardianFullName: rawFormData.guardianFullName || "",
      guardianNik: rawFormData.guardianNik || "",
      guardianRelationship: rawFormData.guardianRelationship || "",
      guardianStatus: rawFormData.guardianStatus || "",
      guardianReligion: 'Islam',
      guardianAddress: rawFormData.guardianAddress || "",
      guardianPhoneNumber: rawFormData.guardianPhoneNumber || ""
    }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

  try {
    // Get token from cookies (passed from client via form submission)
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return {
        success: false,
        message: "Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.",
        errors: "Token tidak tersedia di cookies. User mungkin belum login.",
      };
    }

  const response = await fetch(`${API_BASE}/simnikah/pendaftaran/form-baru`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(apiRequestData),
      signal: controller.signal, 
    });

    clearTimeout(timeoutId); 

    // Check if the response is not JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error(">>> NON-JSON RESPONSE:", text);
        return {
            success: false,
            message: "Respons server tidak valid.",
            errors: `Server memberikan respons yang tidak terduga. Status: ${response.status}. Isi: ${text.substring(0, 100)}...`,
        };
    }

    const result = await response.json();

    
    console.log(">>> API Response Status:", response.status);
    console.log(">>> API Response Data:", JSON.stringify(result, null, 2));

    if (result.type === "duplicate" && result.data?.nomor_pendaftaran) {
      console.log(">>> DUPLICATE REGISTRATION - EXISTING:", result.data.nomor_pendaftaran);
      const successDataForUrl = {
        nomor_pendaftaran: result.data?.pendaftaran?.nomor_pendaftaran || result.data?.nomor_pendaftaran || '',
        status_pendaftaran: result.data?.pendaftaran?.status_pendaftaran || result.data?.status || "Menunggu Verifikasi",
        tanggal_nikah: result.data?.pendaftaran?.tanggal_nikah || result.data?.tanggal_nikah || '',
        nama_suami: result.data?.calon_suami?.nama_lengkap || result.data?.nama_suami || '',
        nama_istri: result.data?.calon_istri?.nama_lengkap || result.data?.nama_istri || '',
        weddingTime: result.data?.pendaftaran?.waktu_nikah || result.data?.waktu_nikah || apiRequestData.scheduleAndLocation.weddingTime || '',
        weddingLocation: result.data?.pendaftaran?.tempat_nikah || result.data?.tempat_nikah || apiRequestData.scheduleAndLocation.weddingLocation || '',
        next_steps: JSON.stringify(result.data?.next_steps || [])
      };
      
      console.log(">>> DUPLICATE: Redirecting with data:", successDataForUrl);
      
      return {
        success: true,
        message: result.message || "Pendaftaran sudah ada dan masih aktif",
        data: successDataForUrl,
      };
    }

    if (!response.ok || result.error || !result.success) {
      console.error(">>> API ERROR DETECTED:", result.error || result.message || "Unknown error");

      const rawMessage = result.error || result.message || "Terjadi kesalahan dari server.";
      const lowerMsg = String(rawMessage).toLowerCase();

      // Detect specific case where the API says a profile for calon suami/istri already exists
      if (
        lowerMsg.includes('profile calon suami') ||
        lowerMsg.includes('calon suami sudah terdaftar') ||
        lowerMsg.includes('profile calon istri') ||
        lowerMsg.includes('calon istri sudah terdaftar')
      ) {
        // Try to fetch the existing profile so the client can pre-fill or instruct the user
        try {
          const profileResp = await fetch(`${API_BASE}/profile`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            signal: controller.signal,
          });

          let profileData = null;
          if (profileResp.ok) {
            const profileJson = await profileResp.json();
            // API might return { user: {...} } or the user object directly
            profileData = profileJson.user || profileJson;
          } else {
            console.warn('Could not fetch profile, status:', profileResp.status);
          }

          return {
            success: false,
            message: rawMessage + ' Silakan perbarui profil Anda di halaman Profil sebelum melakukan pendaftaran atau gunakan data yang sudah ada.',
            data: { existing_profile: profileData },
            errors: typeof result.details === 'string' ? result.details : JSON.stringify(result.details || {}),
          };
        } catch (e) {
          console.error('Error fetching existing profile:', e);
          return {
            success: false,
            message: rawMessage + ' Silakan perbarui profil Anda di halaman Profil sebelum melakukan pendaftaran.',
            errors: typeof result.details === 'string' ? result.details : JSON.stringify(result.details || {}),
          };
        }
      }

      return {
        success: false,
        message: rawMessage,
        errors: typeof result.details === 'string' ? result.details : JSON.stringify(result.details || {}),
      };
    }

    const successDataForUrl = {
        nomor_pendaftaran: result.data?.pendaftaran?.nomor_pendaftaran || result.data?.nomor_pendaftaran || '',
        status_pendaftaran: result.data?.pendaftaran?.status_pendaftaran || result.data?.status_pendaftaran || '',
        tanggal_nikah: result.data?.pendaftaran?.tanggal_nikah || result.data?.tanggal_nikah || '',
        nama_suami: result.data?.calon_suami?.nama_lengkap || '',
        nama_istri: result.data?.calon_istri?.nama_lengkap || '',
        weddingTime: result.data?.pendaftaran?.waktu_nikah || apiRequestData.scheduleAndLocation.weddingTime || '',
        weddingLocation: result.data?.pendaftaran?.tempat_nikah || apiRequestData.scheduleAndLocation.weddingLocation || '',
        next_steps: JSON.stringify(result.next_steps || [])
    }

    return {
      success: true,
      message: result.message || "Pendaftaran berhasil dibuat",
      data: successDataForUrl, 
    };

  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
        return {
            success: false,
            message: "Gagal terhubung ke server.",
            errors: "Waktu tunggu server habis (timeout). Ini bisa berarti server sedang sibuk atau tidak dapat dijangkau. Silakan coba lagi nanti.",
        };
    }
    
    console.error(">>> DETAILED FETCH ERROR:", error);
    return {
      success: false,
      message: "Terjadi masalah koneksi atau kesalahan pada server.",
      errors: error instanceof Error ? error.message : "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
    };
  } 
}
