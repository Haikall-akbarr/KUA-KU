/**
 * Marriage Registration Data Mapper
 * Maps frontend form data to API request format (camelCase as per API documentation)
 */

import { format, parseISO } from 'date-fns';

/**
 * Helper function to parse address string into components
 * Since frontend stores address as full string, we'll extract what we can
 */
function parseAddress(address: string): {
  alamat: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
} {
  // Default values - API requires these fields
  const defaultValues = {
    alamat: address || '',
    rt: '',
    rw: '',
    kelurahan: '',
    kecamatan: '',
    kabupaten: '',
    provinsi: 'Kalimantan Selatan', // Default province
  };

  if (!address) return defaultValues;

  // Try to extract RT/RW if present (format: "RT 001/RW 002" or "RT.001/RW.002")
  const rtRwMatch = address.match(/RT\s*\.?\s*(\d+)\s*\/?\s*RW\s*\.?\s*(\d+)/i);
  if (rtRwMatch) {
    defaultValues.rt = rtRwMatch[1];
    defaultValues.rw = rtRwMatch[2];
  }

  // Try to extract kelurahan/kecamatan/kabupaten from address
  // This is a simple heuristic - may need improvement based on actual data
  const parts = address.split(',').map(p => p.trim());
  
  // Usually format: "Street, Kelurahan, Kecamatan, Kabupaten, Provinsi"
  if (parts.length >= 2) {
    defaultValues.kelurahan = parts[parts.length - 4] || '';
    defaultValues.kecamatan = parts[parts.length - 3] || '';
    defaultValues.kabupaten = parts[parts.length - 2] || '';
    if (parts.length >= 5) {
      defaultValues.provinsi = parts[parts.length - 1] || 'Kalimantan Selatan';
    }
  }

  return defaultValues;
}

/**
 * Format date string for API (YYYY-MM-DD)
 */
function formatDateForAPI(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') {
    try {
      const date = parseISO(value);
      return format(date, 'yyyy-MM-dd');
    } catch {
      return value; // Return as-is if parsing fails
    }
  }
  return '';
}

/**
 * Map frontend form data to API request format (camelCase as per API documentation)
 * API expects: scheduleAndLocation, groom, bride, groomParents, brideParents, guardian
 */
export function mapFormDataToApiRequest(formData: any): any {
  // Parse addresses
  const groomAddress = parseAddress(formData.groom?.groomAddress || '');
  const brideAddress = parseAddress(formData.bride?.brideAddress || '');

  // Map scheduleAndLocation (camelCase)
  const scheduleAndLocation = {
    weddingLocation: formData.scheduleAndLocation?.weddingLocation || '',
    weddingAddress: formData.scheduleAndLocation?.weddingAddress || '',
    weddingDate: formatDateForAPI(formData.scheduleAndLocation?.weddingDate),
    weddingTime: formData.scheduleAndLocation?.weddingTime || '',
    dispensationNumber: formData.scheduleAndLocation?.dispensationNumber || '',
  };

  // Map groom (camelCase)
  const groom = {
    groomFullName: formData.groom?.groomFullName || '',
    groomNik: formData.groom?.groomNik || '',
    groomCitizenship: formData.groom?.groomCitizenship || 'WNI',
    groomPassportNumber: formData.groom?.groomPassportNumber || '',
    groomPlaceOfBirth: formData.groom?.groomPlaceOfBirth || '',
    groomDateOfBirth: formatDateForAPI(formData.groom?.groomDateOfBirth),
    groomStatus: formData.groom?.groomStatus || '',
    groomReligion: formData.groom?.groomReligion || 'Islam',
    groomEducation: formData.groom?.groomEducation || '',
    groomOccupation: formData.groom?.groomOccupation || '',
    groomOccupationDescription: formData.groom?.groomOccupationDescription || '',
    groomPhoneNumber: formData.groom?.groomPhoneNumber || '',
    groomEmail: formData.groom?.groomEmail || '',
    groomAddress: formData.groom?.groomAddress || '',
  };

  // Map bride (camelCase)
  const bride = {
    brideFullName: formData.bride?.brideFullName || '',
    brideNik: formData.bride?.brideNik || '',
    brideCitizenship: formData.bride?.brideCitizenship || 'WNI',
    bridePassportNumber: formData.bride?.bridePassportNumber || '',
    bridePlaceOfBirth: formData.bride?.bridePlaceOfBirth || '',
    brideDateOfBirth: formatDateForAPI(formData.bride?.brideDateOfBirth),
    brideStatus: formData.bride?.brideStatus || '',
    brideReligion: formData.bride?.brideReligion || 'Islam',
    brideEducation: formData.bride?.brideEducation || '',
    brideOccupation: formData.bride?.brideOccupation || '',
    brideOccupationDescription: formData.bride?.brideOccupationDescription || '',
    bridePhoneNumber: formData.bride?.bridePhoneNumber || '',
    brideEmail: formData.bride?.brideEmail || '',
    brideAddress: formData.bride?.brideAddress || '',
  };

  // Map groomParents (camelCase)
  const groomParents = {
    groomFather: {
      groomFatherPresenceStatus: formData.groomParents?.groomFather?.groomFatherPresenceStatus || '',
      groomFatherName: formData.groomParents?.groomFather?.groomFatherName || '',
      groomFatherNik: formData.groomParents?.groomFather?.groomFatherNik || '',
      groomFatherCitizenship: formData.groomParents?.groomFather?.groomFatherCitizenship || 'WNI',
      groomFatherCountryOfOrigin: formData.groomParents?.groomFather?.groomFatherCountryOfOrigin || 'Indonesia',
      groomFatherPassportNumber: formData.groomParents?.groomFather?.groomFatherPassportNumber || '',
      groomFatherPlaceOfBirth: formData.groomParents?.groomFather?.groomFatherPlaceOfBirth || '',
      groomFatherDateOfBirth: formatDateForAPI(formData.groomParents?.groomFather?.groomFatherDateOfBirth),
      groomFatherReligion: formData.groomParents?.groomFather?.groomFatherReligion || 'Islam',
      groomFatherOccupation: formData.groomParents?.groomFather?.groomFatherOccupation || '',
      groomFatherOccupationDescription: formData.groomParents?.groomFather?.groomFatherOccupationDescription || '',
      groomFatherAddress: formData.groomParents?.groomFather?.groomFatherAddress || '',
    },
    groomMother: {
      groomMotherPresenceStatus: formData.groomParents?.groomMother?.groomMotherPresenceStatus || '',
      groomMotherName: formData.groomParents?.groomMother?.groomMotherName || '',
      groomMotherNik: formData.groomParents?.groomMother?.groomMotherNik || '',
      groomMotherCitizenship: formData.groomParents?.groomMother?.groomMotherCitizenship || 'WNI',
      groomMotherCountryOfOrigin: formData.groomParents?.groomMother?.groomMotherCountryOfOrigin || 'Indonesia',
      groomMotherPassportNumber: formData.groomParents?.groomMother?.groomMotherPassportNumber || '',
      groomMotherPlaceOfBirth: formData.groomParents?.groomMother?.groomMotherPlaceOfBirth || '',
      groomMotherDateOfBirth: formatDateForAPI(formData.groomParents?.groomMother?.groomMotherDateOfBirth),
      groomMotherReligion: formData.groomParents?.groomMother?.groomMotherReligion || 'Islam',
      groomMotherOccupation: formData.groomParents?.groomMother?.groomMotherOccupation || '',
      groomMotherOccupationDescription: formData.groomParents?.groomMother?.groomMotherOccupationDescription || '',
      groomMotherAddress: formData.groomParents?.groomMother?.groomMotherAddress || '',
    },
  };

  // Map brideParents (camelCase)
  const brideParents = {
    brideFather: {
      brideFatherPresenceStatus: formData.brideParents?.brideFather?.brideFatherPresenceStatus || '',
      brideFatherName: formData.brideParents?.brideFather?.brideFatherName || '',
      brideFatherNik: formData.brideParents?.brideFather?.brideFatherNik || '',
      brideFatherCitizenship: formData.brideParents?.brideFather?.brideFatherCitizenship || 'WNI',
      brideFatherCountryOfOrigin: formData.brideParents?.brideFather?.brideFatherCountryOfOrigin || 'Indonesia',
      brideFatherPassportNumber: formData.brideParents?.brideFather?.brideFatherPassportNumber || '',
      brideFatherPlaceOfBirth: formData.brideParents?.brideFather?.brideFatherPlaceOfBirth || '',
      brideFatherDateOfBirth: formatDateForAPI(formData.brideParents?.brideFather?.brideFatherDateOfBirth),
      brideFatherReligion: formData.brideParents?.brideFather?.brideFatherReligion || 'Islam',
      brideFatherOccupation: formData.brideParents?.brideFather?.brideFatherOccupation || '',
      brideFatherOccupationDescription: formData.brideParents?.brideFather?.brideFatherOccupationDescription || '',
      brideFatherAddress: formData.brideParents?.brideFather?.brideFatherAddress || '',
    },
    brideMother: {
      brideMotherPresenceStatus: formData.brideParents?.brideMother?.brideMotherPresenceStatus || '',
      brideMotherName: formData.brideParents?.brideMother?.brideMotherName || '',
      brideMotherNik: formData.brideParents?.brideMother?.brideMotherNik || '',
      brideMotherCitizenship: formData.brideParents?.brideMother?.brideMotherCitizenship || 'WNI',
      brideMotherCountryOfOrigin: formData.brideParents?.brideMother?.brideMotherCountryOfOrigin || 'Indonesia',
      brideMotherPassportNumber: formData.brideParents?.brideMother?.brideMotherPassportNumber || '',
      brideMotherPlaceOfBirth: formData.brideParents?.brideMother?.brideMotherPlaceOfBirth || '',
      brideMotherDateOfBirth: formatDateForAPI(formData.brideParents?.brideMother?.brideMotherDateOfBirth),
      brideMotherReligion: formData.brideParents?.brideMother?.brideMotherReligion || 'Islam',
      brideMotherOccupation: formData.brideParents?.brideMother?.brideMotherOccupation || '',
      brideMotherOccupationDescription: formData.brideParents?.brideMother?.brideMotherOccupationDescription || '',
      brideMotherAddress: formData.brideParents?.brideMother?.brideMotherAddress || '',
    },
  };

  // Map guardian (camelCase)
  const guardian = {
    guardianFullName: formData.guardian?.guardianFullName || '',
    guardianNik: formData.guardian?.guardianNik || '',
    guardianRelationship: formData.guardian?.guardianRelationship || '',
    guardianStatus: formData.guardian?.guardianStatus || '',
    guardianReligion: formData.guardian?.guardianReligion || 'Islam',
    guardianAddress: formData.guardian?.guardianAddress || '',
    guardianPhoneNumber: formData.guardian?.guardianPhoneNumber || '',
  };

  // Return in camelCase format as per API documentation
  return {
    scheduleAndLocation,
    groom,
    bride,
    groomParents,
    brideParents,
    guardian,
  };
}
