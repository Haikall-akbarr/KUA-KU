
import { 
  UserCheck,
  UserCheck2,
  ClipboardList,
  BookCopy,
  HandCoins,
  Compass,
  HeartHandshake,
  MessagesSquare,
  BadgeCheck,
  FileSignature,
  FileEdit,
  FileCheck2,
  type LucideIcon,
  Heart,
  Mail,
  FileText,
} from "lucide-react";

export interface Service {
  slug: string;
  icon: LucideIcon;
  title: string;
  description: string;
  isExternal?: boolean;
  details?: {
    subtitle?: string;
    sections: {
      title: string;
      type: 'list' | 'paragraph';
      content: string[];
    }[];
  };
}

// All services will now point to the general registration form
// The 'pendaftaran' slug will be handled to route to /pendaftaran page.
const pendaftaranSlug = "pendaftaran";

export const services: Service[] = [
  {
    slug: "daftar-nikah",
    icon: Heart,
    title: "Daftar Nikah Online",
    description: "Ambil nomor antrean pendaftaran nikah Anda secara online.",
    isExternal: true,
  },
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
    icon: FileText,
    title: "Keterangan Belum Menikah",
    description: "Pengurusan surat keterangan perawan atau jejaka.",
    isExternal: true,
  },
  {
    slug: "syarat-dan-alur-pendaftaran-nikah",
    icon: ClipboardList,
    title: "Info Syarat & Alur Nikah",
    description: "Informasi lengkap mengenai syarat dan alur proses pendaftaran pernikahan.",
     details: {
      subtitle: "Panduan lengkap untuk mendaftarkan pernikahan di Kantor Urusan Agama (KUA).",
      sections: [
        {
          title: "Waktu Pendaftaran",
          type: "paragraph",
          content: [
            "Pendaftaran nikah dilakukan selambat-lambatnya 10 hari kerja sebelum tanggal pelaksanaan akad nikah. Jika kurang dari 10 hari, harus melampirkan Surat Dispensasi dari Camat.",
          ],
        },
        {
          title: "Persyaratan Umum",
          type: "list",
          content: [
            "Surat Pengantar Nikah dari Kelurahan/Desa (Model N1, N2, N4).",
            "Fotokopi KTP, KK, Akta Kelahiran calon pengantin pria dan wanita.",
            "Pas foto berdampingan ukuran 4x6 dengan latar biru (5 lembar).",
            "Surat Imunisasi/Vaksin Tetanus Toksoid (TT) bagi calon pengantin wanita dari Puskesmas.",
          ],
        },
        {
            title: "Persyaratan Tambahan (jika relevan)",
            type: "list",
            content: [
              "Akta Cerai/Buku Pendaftaran Talak/Cerai bagi yang berstatus duda/janda cerai.",
              "Surat Izin dari atasan bagi anggota TNI/Polri.",
              "Surat Keterangan Kematian (N6) bagi duda/janda ditinggal mati.",
              "Dispensasi dari Pengadilan Agama jika calon pengantin di bawah umur (kurang dari 19 tahun).",
            ],
          },
        {
          title: "Alur Pendaftaran",
          type: "list",
          content: [
            "Mengurus surat pengantar di RT/RW dan Kelurahan/Desa.",
            "Melengkapi semua berkas persyaratan.",
            "Datang ke KUA kecamatan setempat untuk mendaftar dan verifikasi data oleh petugas.",
            "Mengikuti Bimbingan Perkawinan.",
            "Membayar biaya pencatatan nikah jika akad di luar kantor KUA.",
            "Pelaksanaan akad nikah sesuai waktu dan tempat yang disepakati.",
          ],
        },
      ],
    },
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

