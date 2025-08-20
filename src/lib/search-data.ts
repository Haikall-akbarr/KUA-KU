
export interface SearchableItem {
  id: string;
  category: string;
  title: string;
  description?: string;
  content?: string;
  link: string;
  keywords?: string[];
}

export const searchableData: SearchableItem[] = [
  // Hero Section
  {
    id: 'hero-main',
    category: 'Informasi Umum',
    title: 'Selamat Datang di KUA Banjarmasin Utara',
    content: 'Pusat layanan informasi terpadu untuk kebutuhan Anda. Kami siap melayani dengan hati.',
    link: '/#hero',
    keywords: ['beranda', 'selamat datang', 'layanan utama', 'informasi'],
  },
  // Services (Simplified for brevity - add all 12 for full functionality)
  {
    id: 'service-rekomendasi-pria',
    category: 'Layanan',
    title: 'Rekomendasi Nikah Calon Pengantin Laki-laki',
    description: 'Layanan penerbitan surat rekomendasi nikah untuk calon pengantin pria.',
    link: '/#services',
    keywords: ['nikah', 'rekomendasi', 'pengantin pria', 'surat nikah'],
  },
  {
    id: 'service-rekomendasi-wanita',
    category: 'Layanan',
    title: 'Rekomendasi Nikah Calon Pengantin Perempuan',
    description: 'Layanan penerbitan surat rekomendasi nikah untuk calon pengantin wanita.',
    link: '/#services',
    keywords: ['nikah', 'rekomendasi', 'pengantin wanita', 'surat nikah'],
  },
  {
    id: 'service-syarat-alur-nikah',
    category: 'Layanan',
    title: 'Syarat & Alur Pendaftaran Nikah',
    description: 'Informasi lengkap mengenai syarat dan alur proses pendaftaran pernikahan.',
    link: '/#services',
    keywords: ['syarat nikah', 'alur nikah', 'pendaftaran nikah', 'proses nikah'],
  },
  {
    id: 'service-duplikat-akta',
    category: 'Layanan',
    title: 'Penerbitan Duplikat Kutipan Akta Nikah',
    description: 'Pengurusan penerbitan duplikat atau kutipan akta nikah yang hilang atau rusak.',
    link: '/#services',
    keywords: ['duplikat akta', 'kutipan akta', 'akta nikah hilang', 'akta rusak'],
  },
  // Contact Info
  {
    id: 'contact-alamat',
    category: 'Kontak',
    title: 'Alamat Kantor KUA Banjarmasin Utara',
    content: 'Jl. Cinta Damai No. 123, Kota Kasih, Indonesia',
    link: '/#contact',
    keywords: ['alamat', 'kantor', 'kontak kami'],
  },
  {
    id: 'contact-telepon',
    category: 'Kontak',
    title: 'Nomor Telepon KUA Banjarmasin Utara',
    content: '(021) 123-4567',
    link: '/#contact',
    keywords: ['telepon', 'nomor kontak', 'hubungi kami'],
  },
  {
    id: 'contact-email',
    category: 'Kontak',
    title: 'Alamat Email KUA Banjarmasin Utara',
    content: 'info@kua-banjarmasinutara.go.id',
    link: '/#contact',
    keywords: ['email', 'alamat email', 'surel'],
  },
  {
    id: 'contact-jam-operasional',
    category: 'Kontak',
    title: 'Jam Operasional Kantor',
    content: 'Senin - Kamis: 08:00 - 16:00 WIB, Jumat: 08:00 - 11:00 WIB, 13:00 - 16:00 WIB. Sabtu & Minggu: Tutup.',
    link: '/#contact',
    keywords: ['jam kerja', 'jam buka', 'operasional'],
  },
  // Map
  {
    id: 'map-lokasi',
    category: 'Lokasi',
    title: 'Lokasi Kantor KUA Banjarmasin Utara di Peta',
    content: 'Temukan kami di Jl. Cinta Damai No. 123. Lihat peta untuk detail.',
    link: '/#map',
    keywords: ['peta', 'lokasi kantor', 'denah'],
  },
  // Inquire Form
  {
    id: 'inquire-form',
    category: 'Kontak',
    title: 'Formulir Pertanyaan dan Kontak',
    content: 'Ada Pertanyaan? Kirim Pesan Anda melalui formulir kontak kami.',
    link: '/#inquire',
    keywords: ['tanya kami', 'formulir kontak', 'kirim pesan', 'pertanyaan'],
  },
  // Pendaftaran Page
  {
    id: 'pendaftaran-main',
    category: 'Pendaftaran',
    title: 'Pengambilan Nomor Pendaftaran Online',
    content: 'Lengkapi data diri Anda untuk mendapatkan nomor pendaftaran layanan KUA Banjarmasin Utara.',
    link: '/pendaftaran',
    keywords: ['daftar online', 'nomor antrian', 'registrasi'],
  },
  {
    id: 'pendaftaran-form-title',
    category: 'Pendaftaran',
    title: 'Formulir Data Diri Pendaftaran',
    content: 'Isi Nama Lengkap, NIK, Tempat Lahir, Tanggal Lahir, Nomor Telepon, Email.',
    link: '/pendaftaran',
    keywords: ['isi data', 'formulir pendaftaran', 'data pribadi'],
  },
];
