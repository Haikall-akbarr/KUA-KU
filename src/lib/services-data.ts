
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
  FileText, // Import FileText
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
    slug: "surat-menyurat",
    icon: Mail,
    title: "Surat Menyurat",
    description: "Pengurusan berbagai jenis surat keterangan dan legalisasi.",
    isExternal: true,
  },
  {
    slug: "daftar-nikah",
    icon: Heart,
    title: "Daftar Nikah Online",
    description: "Ambil nomor antrean pendaftaran nikah Anda secara online.",
    isExternal: true, // This indicates it's a link to a page within the app
  },
  {
    slug: "rekomendasi-nikah-pria",
    icon: UserCheck,
    title: "Rekomendasi Nikah (Pria)",
    description: "Penerbitan surat rekomendasi nikah untuk calon pengantin pria.",
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
            "Surat Rekomendasi diserahkan kepada pemohon untuk dibawa ke ke KUA tempat pernikahan akan dilangsungkan.",
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
    description: "Penerbitan surat rekomendasi nikah untuk calon pengantin wanita.",
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
    slug: "keterangan-belum-menikah",
    icon: FileText,
    title: "Keterangan Belum Menikah",
    description: "Pengurusan surat keterangan perawan atau jejaka.",
     details: {
      subtitle: "Layanan penerbitan surat keterangan yang menyatakan status seseorang belum pernah menikah.",
      sections: [
        {
            title: "Kegunaan",
            type: "paragraph",
            content: [
              "Umumnya digunakan untuk keperluan melamar pekerjaan (TNI, POLRI, BUMN), pendaftaran pernikahan, atau administrasi lainnya yang memerlukan bukti status perkawinan.",
            ],
          },
        {
          title: "Persyaratan",
          type: "list",
          content: [
            "Surat pengantar dari RT/RW dan Kelurahan/Desa setempat.",
            "Surat pernyataan pribadi belum pernah menikah, ditandatangani di atas materai.",
            "Fotokopi KTP pemohon.",
            "Fotokopi Kartu Keluarga.",
            "Fotokopi KTP kedua orang tua.",
             "Fotokopi KTP dua orang saksi.",
          ],
        },
        {
          title: "Prosedur",
          type: "list",
          content: [
            "Pemohon melengkapi semua berkas.",
            "Datang ke KUA Kecamatan sesuai domisili.",
            "Menyerahkan berkas ke petugas untuk diverifikasi.",
            "Petugas akan membuatkan draf Surat Keterangan Belum Menikah.",
            "Kepala KUA menandatangani surat tersebut.",
          ],
        },
        {
            title: "Waktu Penyelesaian",
            type: "paragraph",
            content: [
              "1 hari kerja jika berkas lengkap dan pimpinan ada di tempat."
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
    details: {
      subtitle: "Layanan untuk menerbitkan kembali Kutipan Akta Nikah karena hilang atau rusak.",
      sections: [
        {
          title: "Persyaratan",
          type: "list",
          content: [
            "Surat Keterangan Kehilangan dari kepolisian (jika hilang).",
            "Buku Nikah asli yang rusak (jika rusak).",
            "Fotokopi KTP suami dan istri.",
            "Fotokopi Kartu Keluarga.",
            "Pas foto suami dan istri ukuran 2x3 (masing-masing 2 lembar) latar biru.",
          ],
        },
        {
          title: "Prosedur",
          type: "list",
          content: [
            "Pemohon (suami/istri) datang ke KUA tempat menikah.",
            "Mengisi formulir permohonan Duplikat Buku Nikah.",
            "Menyerahkan semua berkas persyaratan kepada petugas.",
            "Petugas akan melakukan verifikasi data pernikahan di arsip KUA.",
            "Penerbitan Duplikat Kutipan Akta Nikah.",
          ],
        },
        {
          title: "Waktu Penyelesaian",
          type: "paragraph",
          content: [
            "1-3 hari kerja, tergantung kelengkapan data dan arsip.",
          ],
        },
        {
          title: "Biaya",
          type: "paragraph",
          content: [
            "Tidak dipungut biaya (Gratis).",
          ],
        },
      ],
    },
  },
  {
    slug: "ikrar-wakaf",
    icon: HandCoins,
    title: "Ikrar Wakaf",
    description: "Fasilitasi dan pencatatan proses pelaksanaan ikrar wakaf secara resmi.",
    details: {
        subtitle: "Layanan pembuatan Akta Ikrar Wakaf (AIW) untuk tanah dan/atau bangunan.",
        sections: [
          {
            title: "Persyaratan",
            type: "list",
            content: [
              "Data Wakif (perorangan/organisasi/badan hukum): Fotokopi KTP, NPWP.",
              "Data Nazhir (penerima wakaf): Fotokopi KTP pengurus, SK Kepengurusan.",
              "Data Saksi: Fotokopi KTP (minimal 2 orang).",
              "Sertifikat Hak Milik (SHM) atau bukti kepemilikan sah lainnya atas harta yang diwakafkan.",
              "Surat pernyataan dari Wakif tentang tujuan wakaf.",
              "Surat Keterangan dari pemerintah desa/kelurahan setempat.",
            ],
          },
          {
            title: "Prosedur",
            type: "list",
            content: [
              "Calon Wakif mendaftarkan rencana wakaf ke KUA.",
              "Petugas (PPAIW) memeriksa kelengkapan dokumen.",
              "Pelaksanaan Ikrar Wakaf di hadapan Pejabat Pembuat Akta Ikrar Wakaf (PPAIW), dihadiri oleh Nazhir dan saksi.",
              "Penandatanganan Akta Ikrar Wakaf (AIW).",
              "PPAIW mendaftarkan AIW ke Badan Pertanahan Nasional (BPN) untuk proses balik nama.",
            ],
          },
          {
            title: "Waktu Penyelesaian",
            type: "paragraph",
            content: [
              "Proses di KUA sekitar 3-5 hari kerja. Proses di BPN tergantung pada kebijakan BPN setempat.",
            ],
          },
          {
            title: "Biaya",
            type: "paragraph",
            content: [
              "Biaya administrasi sesuai dengan peraturan yang berlaku.",
            ],
          },
        ],
      },
  },
  {
    slug: "pengukuran-arah-kiblat",
    icon: Compass,
    title: "Pengukuran Arah Kiblat",
    description: "Layanan akurat untuk pengukuran arah kiblat masjid, mushola, atau rumah.",
    details: {
        subtitle: "Layanan untuk membantu masyarakat dalam menentukan arah kiblat yang akurat untuk bangunan masjid, mushola, atau rumah pribadi.",
        sections: [
          {
            title: "Persyaratan",
            type: "list",
            content: [
              "Mengajukan surat permohonan resmi dari pengurus masjid/mushola atau perorangan.",
              "Fotokopi KTP pemohon/ketua pengurus.",
              "Menyertakan alamat lengkap lokasi yang akan diukur.",
              "Nomor telepon yang bisa dihubungi untuk penjadwalan.",
            ],
          },
          {
            title: "Prosedur",
            type: "list",
            content: [
              "Pemohon mengajukan surat permohonan ke KUA.",
              "Tim Hisab Rukyat KUA akan menghubungi pemohon untuk menjadwalkan waktu pengukuran.",
              "Tim datang ke lokasi pada waktu yang telah ditentukan.",
              "Melakukan pengukuran menggunakan alat seperti kompas, theodolit, dan data astronomi.",
              "Memberikan hasil pengukuran dan penandaan arah kiblat.",
              "Penerbitan surat keterangan hasil pengukuran arah kiblat.",
            ],
          },
          {
            title: "Waktu Penyelesaian",
            type: "paragraph",
            content: [
              "Pengukuran 1 hari. Jadwal pengukuran disesuaikan dengan antrean dan kesepakatan (biasanya dalam 1-2 minggu setelah permohonan).",
            ],
          },
          {
            title: "Biaya",
            type: "paragraph",
            content: [
              "Tidak dipungut biaya (Gratis).",
            ],
          },
        ],
      },
  },
  {
    slug: "layanan-rujuk",
    icon: HeartHandshake,
    title: "Layanan Rujuk",
    description: "Proses mediasi dan pencatatan rujuk bagi pasangan setelah talak.",
    details: {
        subtitle: "Layanan pencatatan rujuk bagi pasangan suami-istri yang ingin kembali setelah terjadi perceraian talak raj'i (talak satu atau dua) dan masih dalam masa iddah.",
        sections: [
          {
            title: "Persyaratan",
            type: "list",
            content: [
              "Kutipan Akta Cerai dari Pengadilan Agama.",
              "Kutipan Buku Nikah asli.",
              "Fotokopi KTP suami dan istri.",
              "Surat pernyataan rujuk dari suami yang ditandatangani di atas materai.",
              "Menghadirkan 2 orang saksi beserta fotokopi KTP-nya.",
            ],
          },
          {
            title: "Prosedur",
            type: "list",
            content: [
              "Suami dan istri datang bersama ke KUA.",
              "Mengisi formulir permohonan rujuk.",
              "Menyerahkan berkas persyaratan kepada petugas.",
              "Suami mengucapkan ikrar rujuk di hadapan Kepala KUA/Penghulu dan disaksikan oleh 2 orang saksi.",
              "Penandatanganan berita acara rujuk.",
              "Penerbitan Kutipan Buku Pendaftaran Rujuk.",
            ],
          },
          {
            title: "Waktu Penyelesaian",
            type: "paragraph",
            content: [
              "1 hari kerja sejak berkas dinyatakan lengkap dan ikrar rujuk dilaksanakan.",
            ],
          },
          {
            title: "Biaya",
            type: "paragraph",
            content: [
              "Tidak dipungut biaya (Gratis).",
            ],
          },
        ],
      },
  },
  {
    slug: "konsultasi-perkawinan",
    icon: MessagesSquare,
    title: "Konsultasi Perkawinan",
    description: "Sesi konsultasi dan bimbingan pra-nikah serta penasihatan keluarga.",
    details: {
        subtitle: "Menyediakan layanan bimbingan, mediasi, dan penasihatan untuk calon pengantin dan keluarga yang menghadapi masalah.",
        sections: [
          {
            title: "Jenis Layanan",
            type: "list",
            content: [
              "Bimbingan Perkawinan Pra-Nikah bagi calon pengantin.",
              "Konsultasi dan penasihatan bagi keluarga yang mengalami permasalahan rumah tangga.",
              "Mediasi konflik keluarga.",
            ],
          },
          {
            title: "Prosedur",
            type: "list",
            content: [
              "Datang langsung ke KUA pada jam kerja.",
              "Menyampaikan maksud dan tujuan untuk berkonsultasi kepada petugas.",
              "Petugas akan mengarahkan ke konselor/penasihat perkawinan yang bertugas.",
              "Sesi konsultasi akan dilaksanakan secara privat dan rahasia.",
            ],
          },
           {
            title: "Waktu",
            type: "paragraph",
            content: [
              "Dilayani pada jam kerja kantor.",
            ],
          },
          {
            title: "Biaya",
            type: "paragraph",
            content: [
              "Tidak dipungut biaya (Gratis).",
            ],
          },
        ],
      },
  },
  {
    slug: "legalisasi-buku-nikah",
    icon: BadgeCheck,
    title: "Legalisasi Buku Nikah",
    description: "Layanan legalisasi buku nikah untuk berbagai keperluan administrasi.",
    details: {
        subtitle: "Layanan pengesahan fotokopi Kutipan Akta Nikah (Buku Nikah) untuk berbagai keperluan administrasi.",
        sections: [
          {
            title: "Persyaratan",
            type: "list",
            content: [
              "Membawa Buku Nikah (Kutipan Akta Nikah) asli suami dan istri.",
              "Membawa fotokopi Buku Nikah yang akan dilegalisasi (secukupnya).",
              "Membawa fotokopi KTP pemohon.",
            ],
          },
          {
            title: "Prosedur",
            type: "list",
            content: [
              "Pemohon datang ke KUA yang menerbitkan Buku Nikah.",
              "Menyerahkan dokumen persyaratan kepada petugas.",
              "Petugas akan mencocokkan data antara fotokopi dengan buku nikah asli dan arsip KUA.",
              "Jika sesuai, petugas akan memberikan stempel legalisasi pada lembar fotokopi.",
              "Kepala KUA akan menandatangani fotokopi yang telah distempel.",
            ],
          },
          {
            title: "Waktu Penyelesaian",
            type: "paragraph",
            content: [
              "Dapat ditunggu (sekitar 15-30 menit) tergantung antrean.",
            ],
          },
          {
            title: "Biaya",
            type: "paragraph",
            content: [
              "Tidak dipungut biaya (Gratis).",
            ],
          },
        ],
      },
  },
  {
    slug: "taukil-wali-nikah",
    icon: FileSignature,
    title: "Permohonan Taukil Wali Nikah",
    description: "Pengajuan permohonan penunjukan wali hakim atau taukil wali.",
    details: {
        subtitle: "Layanan perwakilan (taukil) wali nasab kepada Kepala KUA atau Penghulu untuk menikahkan calon pengantin wanita.",
        sections: [
          {
            title: "Kondisi",
            type: "list",
            content: [
              "Wali nikah tidak dapat hadir pada saat akad nikah karena alasan yang sah (sakit, berada di tempat yang sangat jauh, dll).",
            ],
          },
          {
            title: "Persyaratan",
            type: "list",
            content: [
              "Surat Taukil Wali bil-Kitabah (perwakilan secara tertulis) yang ditandatangani oleh wali nikah di atas materai.",
              "Surat tersebut diketahui dan disahkan oleh KUA setempat dimana wali berada atau oleh pejabat perwakilan RI jika di luar negeri.",
              "Fotokopi KTP wali nikah yang memberi kuasa.",
              "Fotokopi KTP calon pengantin wanita.",
            ],
          },
          {
            title: "Prosedur",
            type: "list",
            content: [
               "Wali nikah membuat Surat Taukil Wali di KUA tempat tinggalnya.",
               "Surat Taukil yang sudah jadi diserahkan kepada calon pengantin atau keluarganya.",
               "Surat tersebut dilampirkan dalam berkas pendaftaran nikah di KUA tempat akad akan dilaksanakan.",
            ],
          },
           {
            title: "Biaya",
            type: "paragraph",
            content: [
              "Tidak dipungut biaya (Gratis).",
            ],
          },
        ],
      },
  },
  {
    slug: "perubahan-data-buku-nikah",
    icon: FileEdit,
    title: "Perubahan Data Buku Nikah",
    description: "Pengurusan perubahan nama atau data perseorangan pada buku nikah.",
    details: {
        subtitle: "Layanan untuk melakukan koreksi atau perubahan data pada buku nikah jika terdapat kesalahan penulisan.",
        sections: [
          {
            title: "Persyaratan",
            type: "list",
            content: [
              "Mengajukan permohonan tertulis kepada Pengadilan Agama untuk mendapatkan penetapan perubahan data.",
              "Salinan penetapan dari Pengadilan Agama.",
              "Buku Nikah asli yang akan diubah.",
              "Dokumen pendukung perubahan data (misal: Akta Kelahiran, Ijazah, atau KTP yang sudah benar).",
            ],
          },
          {
            title: "Prosedur",
            type: "list",
            content: [
              "Pemohon mendapatkan penetapan dari Pengadilan Agama.",
              "Datang ke KUA yang menerbitkan Buku Nikah dengan membawa semua persyaratan.",
              "Petugas akan membuat catatan pinggir pada Akta Nikah sesuai dengan penetapan pengadilan.",
              "Perubahan juga dicatat pada Buku Nikah.",
            ],
          },
           {
            title: "Waktu Penyelesaian",
            type: "paragraph",
            content: [
              "1-2 hari kerja di KUA setelah penetapan pengadilan diterima.",
            ],
          },
          {
            title: "Biaya",
            type: "paragraph",
            content: [
              "Tidak dipungut biaya di KUA. Biaya mungkin timbul pada proses di Pengadilan Agama.",
            ],
          },
        ],
      },
  },
  {
    slug: "pencatatan-perjanjian-perkawinan",
    icon: FileCheck2,
    title: "Pencatatan Perjanjian Perkawinan",
    description: "Pencatatan resmi perjanjian perkawinan yang dibuat sebelum atau selama pernikahan.",
     details: {
        subtitle: "Layanan untuk mencatatkan perjanjian perkawinan yang dibuat oleh calon pengantin atau pasangan suami-istri.",
        sections: [
          {
            title: "Persyaratan",
            type: "list",
            content: [
              "Akta Perjanjian Perkawinan asli yang dibuat di hadapan Notaris.",
              "Fotokopi KTP calon pengantin atau suami-istri.",
              "Jika akan menikah, dilampirkan bersamaan dengan berkas pendaftaran nikah.",
              "Jika sudah menikah, melampirkan fotokopi Buku Nikah.",
            ],
          },
          {
            title: "Prosedur",
            type: "list",
            content: [
              "Pasangan membuat perjanjian perkawinan di hadapan Notaris.",
              "Menyerahkan Akta Notaris tersebut kepada Pegawai Pencatat Nikah di KUA.",
              "Pegawai Pencatat Nikah akan membuat catatan mengenai perjanjian tersebut pada Akta Nikah dan Buku Nikah.",
            ],
          },
           {
            title: "Waktu Penyelesaian",
            type: "paragraph",
            content: [
              "Dilakukan bersamaan dengan proses pencatatan nikah atau segera setelah akta notaris diserahkan.",
            ],
          },
          {
            title: "Biaya",
            type: "paragraph",
            content: [
              "Tidak dipungut biaya di KUA. Biaya timbul pada saat pembuatan akta di Notaris.",
            ],
          },
        ],
      },
  },
];

    