
import type { LucideIcon } from "lucide-react";

export interface Service {
  slug: string;
  iconName: keyof typeof import('lucide-react').icons;
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
    iconName: "Heart",
    title: "Daftar Nikah Online",
    description: "Ambil nomor antrean dan lengkapi data untuk pendaftaran nikah Anda.",
    isExternal: true,
  },
  {
    slug: "surat-menyurat",
    iconName: "Mail",
    title: "Pengurusan Surat",
    description: "Layanan untuk berbagai keperluan surat keterangan dan rekomendasi dari KUA.",
    isExternal: true,
  },
  {
    slug: "bimbingan-perkawinan",
    iconName: "BookHeart",
    title: "Bimbingan Perkawinan",
    description: "Pendaftaran dan informasi jadwal sesi bimbingan wajib sebelum nikah.",
    details: {
      subtitle: "Persiapan menuju keluarga sakinah, mawaddah, wa rahmah.",
      sections: [
        {
          title: "Tentang Bimbingan Perkawinan",
          type: "paragraph",
          content: [
            "Bimbingan perkawinan (Bimwin) adalah program wajib yang harus diikuti oleh semua calon pengantin. Program ini bertujuan untuk memberikan bekal pengetahuan, pemahaman, dan keterampilan tentang kehidupan berumah tangga.",
          ],
        },
        {
          title: "Materi Bimbingan",
          type: "list",
          content: [
            "Mempersiapkan Keluarga Sakinah",
            "Mengelola Psikologi dan Dinamika Keluarga",
            "Memenuhi Kebutuhan dan Mengelola Keuangan Keluarga",
            "Menjaga Kesehatan Reproduksi Keluarga",
            "Mempersiapkan Generasi Berkualitas",
          ],
        },
        {
          title: "Proses Pendaftaran",
          type: "paragraph",
          content: [
            "Pendaftaran bimbingan perkawinan biasanya dilakukan bersamaan dengan pendaftaran nikah di KUA. Jadwal akan diinformasikan oleh petugas KUA setelah berkas pendaftaran Anda diverifikasi.",
          ],
        },
      ],
    },
  },
   {
    slug: "penjadwalan-nikah",
    iconName: "CalendarClock",
    title: "Penjadwalan Nikah",
    description: "Atur dan konfirmasi jadwal akad nikah Anda dengan penghulu yang tersedia.",
     details: {
      subtitle: "Koordinasi waktu dan tempat pelaksanaan akad nikah.",
      sections: [
        {
          title: "Proses Penjadwalan",
          type: "paragraph",
          content: [
            "Setelah semua berkas pendaftaran nikah Anda dinyatakan lengkap dan diverifikasi oleh petugas KUA, langkah selanjutnya adalah penjadwalan akad nikah. Proses ini melibatkan konfirmasi tanggal, waktu, dan lokasi pelaksanaan akad.",
          ],
        },
        {
          title: "Penentuan Penghulu",
          type: "paragraph",
          content: [
            "Kepala KUA akan menugaskan seorang penghulu untuk memimpin prosesi akad nikah Anda berdasarkan jadwal yang telah disepakati. Anda akan diinformasikan mengenai nama penghulu yang bertugas.",
          ],
        },
        {
          title: "Konfirmasi",
          type: "list",
          content: [
            "Pastikan Anda melakukan konfirmasi ulang jadwal dengan KUA beberapa hari sebelum pelaksanaan.",
            "Jika ada perubahan jadwal atau lokasi dari pihak Anda, segera hubungi KUA untuk koordinasi lebih lanjut.",
            "Biaya pencatatan nikah di luar kantor KUA harus dilunasi sebelum pelaksanaan akad.",
          ],
        },
      ],
    },
  },
  {
    slug: "laporan-dan-dokumentasi",
    iconName: "FileText",
    title: "Laporan & Dokumentasi",
    description: "Akses dan unduh dokumen resmi serta laporan terkait proses pernikahan.",
     details: {
      subtitle: "Manajemen dokumen digital pasca-pernikahan Anda.",
      sections: [
        {
          title: "Dokumen yang Tersedia",
          type: "list",
          content: [
            "Salinan Digital Buku Nikah (setelah diterbitkan).",
            "Bukti Pendaftaran Nikah.",
            "Sertifikat Bimbingan Perkawinan (jika tersedia secara digital).",
          ],
        },
        {
          title: "Cara Mengakses",
          type: "paragraph",
          content: [
            "Dokumen akan tersedia di akun Anda setelah setiap tahapan selesai. Misalnya, salinan digital buku nikah akan muncul setelah buku nikah fisik selesai dicetak dan ditandatangani. Anda akan menerima notifikasi jika ada dokumen baru yang tersedia untuk diunduh.",
          ],
        },
      ],
    },
  },
  {
    slug: "syarat-dan-alur-pendaftaran-nikah",
    iconName: "ClipboardList",
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
