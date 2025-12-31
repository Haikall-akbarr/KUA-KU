
'use server';

import { format, parseISO, differenceInYears } from 'date-fns';
import { cookies } from 'next/headers';
import { createSimpleMarriageRegistration, handleApiError, SimpleMarriageRegistrationRequest } from '@/lib/simnikah-api';

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
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://simnikah-api-production-c05d.up.railway.app';

export async function submitMarriageRegistrationForm(
  prevState: MarriageRegistrationFormState,
  formData: FormData
): Promise<MarriageRegistrationFormState> {

  const rawFormData = Object.fromEntries(formData.entries());

  // Map form data to frontend structure
  const formDataStructured = {
    scheduleAndLocation: {
      weddingLocation: rawFormData.weddingLocation || "",
      weddingAddress: rawFormData.kua || "",
      weddingDate: rawFormData.weddingDate || "",
      weddingTime: rawFormData.weddingTime || "",
      dispensationNumber: rawFormData.dispensationNumber || ""
    },
    groom: {
      groomFullName: rawFormData.groomFullName || "",
      groomNik: rawFormData.groomNik || "",
      groomCitizenship: rawFormData.groomCitizenship || "",
      groomPassportNumber: rawFormData.groomPassportNumber || "",
      groomPlaceOfBirth: rawFormData.groomPlaceOfBirth || "",
      groomDateOfBirth: rawFormData.groomDateOfBirth || "",
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
      brideDateOfBirth: rawFormData.brideDateOfBirth || "",
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
        groomFatherDateOfBirth: rawFormData.groomFatherDateOfBirth || "",
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
        groomMotherDateOfBirth: rawFormData.groomMotherDateOfBirth || "",
        groomMotherReligion: 'Islam',
        groomMotherOccupation: rawFormData.groomMotherOccupation || "",
        groomMotherOccupationDescription: rawFormData.groomMotherOccupationDescription || "",
        groomMotherAddress: rawFormData.groomMotherAddress || ""
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
        brideFatherDateOfBirth: rawFormData.brideFatherDateOfBirth || "",
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
        brideMotherDateOfBirth: rawFormData.brideMotherDateOfBirth || "",
        brideMotherReligion: 'Islam',
        brideMotherOccupation: rawFormData.brideMotherOccupation || "",
        brideMotherOccupationDescription: rawFormData.brideMotherOccupationDescription || "",
        brideMotherAddress: rawFormData.brideMotherAddress || ""
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

  // Map to new simplified API request format
  // Calculate age from date of birth
  let groomAge = 19; // default
  let brideAge = 19; // default
  
  try {
    if (formDataStructured.groom.groomDateOfBirth) {
      const groomDob = parseISO(formDataStructured.groom.groomDateOfBirth);
      groomAge = differenceInYears(new Date(), groomDob);
    }
  } catch (e) {
    console.warn('Error calculating groom age:', e);
  }

  try {
    if (formDataStructured.bride.brideDateOfBirth) {
      const brideDob = parseISO(formDataStructured.bride.brideDateOfBirth);
      brideAge = differenceInYears(new Date(), brideDob);
    }
  } catch (e) {
    console.warn('Error calculating bride age:', e);
  }

  // Get nama_dan_bin/nama_dan_binti from form or use full name
  // If form has separate field for nama_dan_bin, use it; otherwise use full name
  const groomNamaDanBin = rawFormData.groomNamaDanBin || formDataStructured.groom.groomFullName || '';
  const brideNamaDanBinti = rawFormData.brideNamaDanBinti || formDataStructured.bride.brideFullName || '';

  // Validate required fields
  if (!groomNamaDanBin || groomNamaDanBin.trim() === '') {
    return {
      success: false,
      message: "Nama calon suami tidak boleh kosong.",
      errors: "Field nama_dan_bin untuk calon suami wajib diisi.",
    };
  }

  if (!brideNamaDanBinti || brideNamaDanBinti.trim() === '') {
    return {
      success: false,
      message: "Nama calon istri tidak boleh kosong.",
      errors: "Field nama_dan_binti untuk calon istri wajib diisi.",
    };
  }

  // Validate age (minimum 19 years)
  if (groomAge < 19) {
    return {
      success: false,
      message: "Umur calon suami minimal 19 tahun.",
      errors: `Umur calon suami: ${groomAge} tahun. Minimum: 19 tahun.`,
    };
  }

  if (brideAge < 19) {
    return {
      success: false,
      message: "Umur calon istri minimal 19 tahun.",
      errors: `Umur calon istri: ${brideAge} tahun. Minimum: 19 tahun.`,
    };
  }

  // Get education level
  const groomEducation = rawFormData.groomPendidikanAkhir || formDataStructured.groom.groomEducation || 'SMA';
  const brideEducation = rawFormData.bridePendidikanAkhir || formDataStructured.bride.brideEducation || 'SMA';

  // Validate tanggal and waktu before sending
  const tanggalNikahFormatted = formatDateForAPI(formDataStructured.scheduleAndLocation.weddingDate);
  const waktuNikah = formDataStructured.scheduleAndLocation.weddingTime || '';
  
  if (!tanggalNikahFormatted || tanggalNikahFormatted === '') {
    return {
      success: false,
      message: "Tanggal nikah wajib diisi.",
      errors: "Field tanggal nikah tidak boleh kosong.",
    };
  }

  if (!waktuNikah || waktuNikah.trim() === '') {
    return {
      success: false,
      message: "Waktu nikah wajib diisi.",
      errors: "Field waktu nikah tidak boleh kosong.",
    };
  }

  // Validate wali nikah fields
  const guardianFullName = formDataStructured.guardian.guardianFullName || '';
  const guardianRelationship = formDataStructured.guardian.guardianRelationship || '';
  
  if (!guardianFullName || guardianFullName.trim() === '') {
    return {
      success: false,
      message: "Nama wali nikah tidak boleh kosong.",
      errors: "Field nama wali nikah wajib diisi.",
    };
  }

  if (!guardianRelationship || guardianRelationship.trim() === '') {
    return {
      success: false,
      message: "Hubungan wali tidak boleh kosong.",
      errors: "Field hubungan wali wajib diisi.",
    };
  }

  // Map to new simplified API format (sesuai dokumentasi API)
  // Format: snake_case (calon_laki_laki, calon_perempuan, lokasi_nikah, wali_nikah)
  const apiRequestData: SimpleMarriageRegistrationRequest = {
    calon_laki_laki: {
      nama_dan_bin: groomNamaDanBin.trim(),
      pendidikan_akhir: groomEducation,
      umur: groomAge,
    },
    calon_perempuan: {
      nama_dan_binti: brideNamaDanBinti.trim(),
      pendidikan_akhir: brideEducation,
      umur: brideAge,
    },
    lokasi_nikah: {
      tempat_nikah: (formDataStructured.scheduleAndLocation.weddingLocation === 'Di Luar KUA' 
        ? 'Di Luar KUA' 
        : 'Di KUA') as 'Di KUA' | 'Di Luar KUA',
      tanggal_nikah: tanggalNikahFormatted,
      waktu_nikah: waktuNikah.trim(),
      ...(formDataStructured.scheduleAndLocation.weddingLocation === 'Di Luar KUA' && {
        alamat_nikah: (rawFormData.weddingAddress || rawFormData.alamatNikah || '').trim(),
        alamat_detail: (rawFormData.alamatDetail || '').trim(),
        kelurahan: (rawFormData.kelurahan || '').trim(),
        ...(rawFormData.latitude && rawFormData.longitude && {
          latitude: parseFloat(rawFormData.latitude as string),
          longitude: parseFloat(rawFormData.longitude as string),
        }),
      }),
    },
    wali_nikah: {
      nama_dan_bin: guardianFullName.trim(),
      hubungan_wali: guardianRelationship.trim(),
    },
  };

  // Log the request data for debugging
  console.log(">>> API Request Data:", JSON.stringify(apiRequestData, null, 2));

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

    // Use new simplified API endpoint
    const response = await fetch(`${API_BASE}/simnikah/pendaftaran`, {
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
        nomor_pendaftaran: result.data?.nomor_pendaftaran || '',
        status_pendaftaran: result.data?.status_pendaftaran || 'Draft',
        tanggal_nikah: result.data?.tanggal_nikah || formDataStructured.scheduleAndLocation.weddingDate || '',
        nama_suami: result.data?.calon_suami?.nama_dan_bin || groomNamaDanBin || '',
        nama_istri: result.data?.calon_istri?.nama_dan_binti || brideNamaDanBinti || '',
        weddingTime: result.data?.waktu_nikah || formDataStructured.scheduleAndLocation.weddingTime || '',
        weddingLocation: result.data?.tempat_nikah || formDataStructured.scheduleAndLocation.weddingLocation || '',
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
      console.error(">>> Error Type:", result.type || "unknown");
      console.error(">>> Full Error Response:", JSON.stringify(result, null, 2));

      // Build user-friendly error message
      let rawMessage = result.error || result.message || "Terjadi kesalahan dari server.";
      
      // Add more context for database errors
      if (result.type === "database") {
        if (rawMessage.includes("calon suami")) {
          rawMessage = "Gagal menyimpan data calon suami. Pastikan semua data yang diisi sudah benar dan lengkap.";
        } else if (rawMessage.includes("calon istri")) {
          rawMessage = "Gagal menyimpan data calon istri. Pastikan semua data yang diisi sudah benar dan lengkap.";
        } else {
          rawMessage = "Terjadi kesalahan pada database. Silakan coba lagi atau hubungi administrator jika masalah berlanjut.";
        }
      }
      
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
            // Handle API response structure: { success, message, data: { user: {...} } }
            profileData = profileJson.data?.user || profileJson.user || profileJson;
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

      // Include additional error details if available
      let errorDetails = '';
      if (result.details) {
        errorDetails = typeof result.details === 'string' ? result.details : JSON.stringify(result.details);
      } else if (result.error && result.message && result.error !== result.message) {
        errorDetails = result.error;
      }
      
      return {
        success: false,
        message: rawMessage,
        errors: errorDetails || `Error type: ${result.type || 'unknown'}. Status: ${response.status}`,
      };
    }

    const successDataForUrl = {
        nomor_pendaftaran: result.data?.nomor_pendaftaran || '',
        status_pendaftaran: result.data?.status_pendaftaran || 'Draft',
        tanggal_nikah: result.data?.tanggal_nikah || formDataStructured.scheduleAndLocation.weddingDate || '',
        nama_suami: result.data?.calon_suami?.nama_dan_bin || groomNamaDanBin || '',
        nama_istri: result.data?.calon_istri?.nama_dan_binti || brideNamaDanBinti || '',
        weddingTime: result.data?.waktu_nikah || formDataStructured.scheduleAndLocation.weddingTime || '',
        weddingLocation: result.data?.tempat_nikah || formDataStructured.scheduleAndLocation.weddingLocation || '',
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
