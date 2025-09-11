
import { 
  Heart,
  Mail,
  ClipboardList,
  type LucideIcon
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

export const services: Service[] = [
  {
    slug: "daftar-nikah",
    icon: Heart,
    title: "Daftar Nikah Online",
    description: "Ambil nomor antrean dan lengkapi data untuk pendaftaran nikah Anda.",
    isExternal: true,
  },
  {
    slug: "surat-menyurat",
    icon: Mail,
    title: "Pengurusan Surat",
    description: "Layanan untuk berbagai jenis surat keterangan dan rekomendasi.",
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
];
