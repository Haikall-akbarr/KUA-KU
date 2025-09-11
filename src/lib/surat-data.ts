
import type { LucideIcon } from "lucide-react";

export interface SuratService {
  slug: string;
  iconName: keyof typeof import('lucide-react').icons;
  title: string;
  description: string;
  isExternal?: boolean;
}

const pendaftaranSlug = "pendaftaran";

export const suratServices: SuratService[] = [
  {
    slug: pendaftaranSlug,
    iconName: "UserCheck",
    title: "Rekomendasi Nikah (Pria)",
    description: "Penerbitan surat rekomendasi nikah untuk calon pengantin pria.",
    isExternal: true,
  },
  {
    slug: pendaftaranSlug,
    iconName: "UserCheck2",
    title: "Rekomendasi Nikah (Wanita)",
    description: "Penerbitan surat rekomendasi nikah untuk calon pengantin wanita.",
    isExternal: true,
  },
  {
    slug: pendaftaranSlug,
    iconName: "BookCopy",
    title: "Duplikat Akta Nikah",
    description: "Pengurusan duplikat akta nikah yang hilang atau rusak.",
    isExternal: true,
  },
   {
    slug: pendaftaranSlug,
    iconName: "HandCoins",
    title: "Ikrar Wakaf",
    description: "Fasilitasi dan pencatatan proses pelaksanaan ikrar wakaf.",
    isExternal: true,
  },
  {
    slug: pendaftaranSlug,
    iconName: "Compass",
    title: "Pengukuran Arah Kiblat",
    description: "Layanan pengukuran arah kiblat untuk masjid atau mushola.",
    isExternal: true,
  },
  {
    slug: pendaftaranSlug,
    iconName: "HeartHandshake",
    title: "Layanan Rujuk",
    description: "Proses mediasi dan pencatatan rujuk bagi pasangan setelah talak.",
    isExternal: true,
  },
  {
    slug: pendaftaranSlug,
    iconName: "MessagesSquare",
    title: "Konsultasi Perkawinan",
    description: "Sesi konsultasi dan bimbingan pra-nikah serta keluarga.",
    isExternal: true,
  },
  {
    slug: pendaftaranSlug,
    iconName: "BadgeCheck",
    title: "Legalisasi Buku Nikah",
    description: "Layanan legalisasi buku nikah untuk keperluan administrasi.",
    isExternal: true,
  },
  {
    slug: pendaftaranSlug,
    iconName: "FileSignature",
    title: "Permohonan Taukil Wali",
    description: "Pengajuan permohonan penunjukan wali hakim atau taukil wali.",
    isExternal: true,
  },
];
