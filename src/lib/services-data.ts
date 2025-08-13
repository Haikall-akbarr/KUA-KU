
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
} from "lucide-react";

export interface Service {
  slug: string;
  icon: LucideIcon;
  title: string;
  description: string;
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
    slug: "rekomendasi-nikah-pria",
    icon: UserCheck,
    title: "Rekomendasi Nikah (Pria)",
    description: "Layanan penerbitan surat rekomendasi nikah untuk calon pengantin pria.",
    details: {
      subtitle: "Surat rekomendasi nikah untuk calon pengantin pria yang akan melangsungkan pernikahan di luar wilayah kecamatan tempat tinggalnya.",
      sections: [
        {
          title: "Dasar Hukum",
          type: "list",
          content: [
            "Undang-Undang Nomor 1 Tahun 1974 tentang Perkawinan.",
            "Peraturan Pemerintah Nomor 9 Tahun 1975 tentang Pelaksanaan Undang-Undang Nomor 1 Tahun 1974.",
            "Peraturan Menteri Agama Nomor 20 Tahun 2019 tentang Pencatatan Pernikahan.",
          ],
        },
        {
          title: "Persyaratan",
          type: "list",
          content: [
            "Surat Pengantar dari kelurahan/desa setempat (N1, N2, N4).",
            "Fotokopi KTP Calon Pengantin Pria dan kedua orang tua.",
            "Fotokopi Kartu Keluarga (KK).",
            "Fotokopi Akta Kelahiran atau Ijazah terakhir.",
            "Pas foto ukuran 2x3 (4 lembar) dan 4x6 (2 lembar) dengan latar biru.",
            "Surat Pernyataan Belum Pernah Menikah (jika jejaka) bermaterai.",
            "Akta Cerai dari Pengadilan Agama (jika duda cerai).",
            "Surat Keterangan Kematian (N6) dari kelurahan/desa (jika duda ditinggal mati).",
            "Surat Izin dari komandan (bagi anggota TNI/POLRI).",
          ],
        },
        {
          title: "Prosedur",
          type: "list",
          content: [
            "Pemohon datang ke KUA dengan membawa berkas lengkap.",
            "Petugas memeriksa kelengkapan dan keabsahan berkas.",
            "Jika berkas lengkap dan sah, petugas akan memproses pembuatan Surat Rekomendasi Nikah.",
            "Kepala KUA menandatangani Surat Rekomendasi Nikah.",
            "Surat Rekomendasi diserahkan kepada pemohon untuk dibawa ke KUA tempat pernikahan akan dilangsungkan.",
          ],
        },
        {
          title: "Waktu Penyelesaian",
          type: "paragraph",
          content: [
            "1 hari kerja sejak berkas dinyatakan lengkap dan benar."
          ]
        },
        {
          title: "Biaya",
          type: "paragraph",
          content: [
            "Tidak dipungut biaya (Gratis)."
          ]
        }
      ],
    },
  },
  {
    slug: "rekomendasi-nikah-wanita",
    icon: UserCheck2,
    title: "Rekomendasi Nikah (Wanita)",
    description: "Layanan penerbitan surat rekomendasi nikah untuk calon pengantin wanita.",
    details: {
      subtitle: "Surat rekomendasi nikah untuk calon pengantin wanita yang akan melangsungkan pernikahan di luar wilayah kecamatan tempat tinggalnya.",
      sections: [
        {
          title: "Persyaratan",
          type: "list",
          content: [
            "Surat Pengantar dari kelurahan/desa setempat (N1, N2, N4).",
            "Fotokopi KTP Calon Pengantin Wanita, Wali, dan kedua orang tua.",
            "Fotokopi Kartu Keluarga (KK).",
            "Fotokopi Akta Kelahiran atau Ijazah terakhir.",
            "Pas foto ukuran 2x3 (4 lembar) dan 4x6 (2 lembar) dengan latar biru.",
            "Surat Pernyataan Belum Pernah Menikah (jika perawan) bermaterai.",
            "Akta Cerai dari Pengadilan Agama (jika janda cerai).",
            "Surat Keterangan Kematian (N6) dari kelurahan/desa (jika janda ditinggal mati).",
          ],
        },
        {
          title: "Prosedur",
          type: "list",
          content: [
            "Pemohon datang ke KUA dengan membawa berkas lengkap.",
            "Petugas memeriksa kelengkapan dan keabsahan berkas.",
            "Jika berkas lengkap dan sah, petugas akan memproses pembuatan Surat Rekomendasi Nikah.",
            "Surat Rekomendasi diserahkan kepada pemohon.",
          ],
        },
        {
            title: "Waktu Penyelesaian",
            type: "paragraph",
            content: [
              "1 hari kerja."
            ]
          },
          {
            title: "Biaya",
            type: "paragraph",
            content: [
              "Gratis."
            ]
          }
      ],
    },
  },
  {
    slug: "syarat-dan-alur-pendaftaran-nikah",
    icon: ClipboardList,
    title: "Syarat & Alur Pendaftaran Nikah",
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
    slug: "duplikat-akta-nikah",
    icon: BookCopy,
    title: "Duplikat Kutipan Akta Nikah",
    description: "Pengurusan penerbitan duplikat akta nikah yang hilang atau rusak.",
  },
  {
    slug: "ikrar-wakaf",
    icon: HandCoins,
    title: "Ikrar Wakaf",
    description: "Fasilitasi dan pencatatan proses pelaksanaan ikrar wakaf secara resmi.",
  },
  {
    slug: "pengukuran-arah-kiblat",
    icon: Compass,
    title: "Pengukuran Arah Kiblat",
    description: "Layanan akurat untuk pengukuran arah kiblat masjid, mushola, atau rumah.",
  },
  {
    slug: "layanan-rujuk",
    icon: HeartHandshake,
    title: "Layanan Rujuk",
    description: "Proses mediasi dan pencatatan rujuk bagi pasangan setelah talak.",
  },
  {
    slug: "konsultasi-perkawinan",
    icon: MessagesSquare,
    title: "Konsultasi Perkawinan",
    description: "Sesi konsultasi dan bimbingan pra-nikah serta penasihatan keluarga.",
  },
  {
    slug: "legalisasi-buku-nikah",
    icon: BadgeCheck,
    title: "Legalisasi Buku Nikah",
    description: "Layanan legalisasi buku nikah untuk berbagai keperluan administrasi.",
  },
  {
    slug: "taukil-wali-nikah",
    icon: FileSignature,
    title: "Permohonan Taukil Wali Nikah",
    description: "Pengajuan permohonan penunjukan wali hakim atau taukil wali.",
  },
  {
    slug: "perubahan-data-buku-nikah",
    icon: FileEdit,
    title: "Perubahan Data Buku Nikah",
    description: "Pengurusan perubahan nama atau data perseorangan pada buku nikah.",
  },
  {
    slug: "pencatatan-perjanjian-perkawinan",
    icon: FileCheck2,
    title: "Pencatatan Perjanjian Perkawinan",
    description: "Pencatatan resmi perjanjian perkawinan yang dibuat sebelum atau selama pernikahan.",
  },
];