
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
  type LucideIcon
} from "lucide-react";

export interface SuratService {
  slug: string;
  icon: LucideIcon;
  title: string;
  description: string;
  isExternal?: boolean;
}

const pendaftaranSlug = "pendaftaran";

export const suratServices: SuratService[] = [
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
    title: "Duplikat Akta Nikah",
    description: "Pengurusan duplikat akta nikah yang hilang atau rusak.",
    isExternal: true,
  },
   {
    slug: pendaftaranSlug,
    icon: HandCoins,
    title: "Ikrar Wakaf",
    description: "Fasilitasi dan pencatatan proses pelaksanaan ikrar wakaf.",
    isExternal: true,
  },
  {
    slug: pendaftaranSlug,
    icon: Compass,
    title: "Pengukuran Arah Kiblat",
    description: "Layanan pengukuran arah kiblat untuk masjid atau mushola.",
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
    description: "Sesi konsultasi dan bimbingan pra-nikah serta keluarga.",
    isExternal: true,
  },
  {
    slug: pendaftaranSlug,
    icon: BadgeCheck,
    title: "Legalisasi Buku Nikah",
    description: "Layanan legalisasi buku nikah untuk keperluan administrasi.",
    isExternal: true,
  },
  {
    slug: pendaftaranSlug,
    icon: FileSignature,
    title: "Permohonan Taukil Wali",
    description: "Pengajuan permohonan penunjukan wali hakim atau taukil wali.",
    isExternal: true,
  },
];
