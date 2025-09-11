
import { 
  UserCheck,
  UserCheck2,
  FileText,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";

export interface SuratItem {
  slug: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export const suratItems: SuratItem[] = [
  {
    slug: "rekomendasi-nikah-pria",
    icon: UserCheck,
    title: "Rekomendasi Nikah (Pria)",
    description: "Surat rekomendasi untuk calon pengantin pria yang akan menikah di luar kecamatan domisili.",
  },
  {
    slug: "rekomendasi-nikah-wanita",
    icon: UserCheck2,
    title: "Rekomendasi Nikah (Wanita)",
    description: "Surat rekomendasi untuk calon pengantin wanita yang akan menikah di luar kecamatan domisili.",
  },
  {
    slug: "keterangan-belum-menikah",
    icon: FileText,
    title: "Keterangan Belum Menikah",
    description: "Surat keterangan status perawan atau jejaka untuk berbagai keperluan administrasi.",
  },
  {
    slug: "legalisasi-buku-nikah",
    icon: BadgeCheck,
    title: "Legalisasi Buku Nikah",
    description: "Pengesahan fotokopi buku nikah untuk keperluan seperti pendaftaran sekolah, haji, dll.",
  },
];

    