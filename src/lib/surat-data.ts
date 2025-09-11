
import { 
  UserCheck,
  UserCheck2,
  BookCopy,
  HandCoins,
  Compass,
  HeartHandshake,
  MessagesSquare,
  BadgeCheck,
  FileSignature,
  type LucideIcon,
} from "lucide-react";
import type { Service } from './services-data';

// All services here will now point to the general registration form
const pendaftaranSlug = "pendaftaran";

export const letterServices: Service[] = [
  {
    slug: pendaftaranSlug,
    icon: UserCheck,
    title: "Rekomendasi Nikah (Pria)",
    description: "Penerbitan surat rekomendasi nikah untuk calon pengantin pria.",
    isExternal: true,
  },
  {
    slug: pendaftaranSlug,
    icon: UserCheck2,
    title: "Rekomendasi Nikah (Wanita)",
    description: "Penerbitan surat rekomendasi nikah untuk calon pengantin wanita.",
    isExternal: true,
  },
  {
    slug: pendaftaranSlug,
    icon: BookCopy,
    title: "Duplikat Kutipan Akta Nikah",
    description: "Pengurusan penerbitan duplikat akta nikah yang hilang atau rusak.",
    isExternal: true,
  },
  {
    slug: pendaftaranSlug,
    icon: HandCoins,
    title: "Ikrar Wakaf",
    description: "Fasilitasi dan pencatatan proses pelaksanaan ikrar wakaf secara resmi.",
    isExternal: true,
  },
  {
    slug: pendaftaranSlug,
    icon: Compass,
    title: "Pengukuran Arah Kiblat",
    description: "Layanan akurat untuk pengukuran arah kiblat masjid, mushola, atau rumah.",
    isExternal: true,
  },
  {
    slug: pendaftaranSlug,
    icon: HeartHandshake,
    title: "Layanan Rujuk",
    description: "Proses mediasi dan pencatatan rujuk bagi pasangan setelah talak.",
    isExternal: true,
  },
  {
    slug: pendaftaranSlug,
    icon: MessagesSquare,
    title: "Konsultasi Perkawinan",
    description: "Sesi konsultasi dan bimbingan pra-nikah serta penasihatan keluarga.",
    isExternal: true,
  },
  {
    slug: pendaftaranSlug,
    icon: BadgeCheck,
    title: "Legalisasi Buku Nikah",
    description: "Layanan legalisasi buku nikah untuk berbagai keperluan administrasi.",
    isExternal: true,
  },
  {
    slug: pendaftaranSlug,
    icon: FileSignature,
    title: "Permohonan Taukil Wali Nikah",
    description: "Pengajuan permohonan penunjukan wali hakim atau taukil wali.",
    isExternal: true,
  },
];
