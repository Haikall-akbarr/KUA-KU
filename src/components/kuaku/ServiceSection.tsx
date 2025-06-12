
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { ServiceCard } from "./ServiceCard";
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
  FileCheck2
} from "lucide-react";

const services = [
  {
    icon: UserCheck,
    title: "Rekomendasi Nikah Calon Pengantin Laki-laki",
    description: "Layanan penerbitan surat rekomendasi nikah untuk calon pengantin pria.",
  },
  {
    icon: UserCheck2,
    title: "Rekomendasi Nikah Calon Pengantin Perempuan",
    description: "Layanan penerbitan surat rekomendasi nikah untuk calon pengantin wanita.",
  },
  {
    icon: ClipboardList,
    title: "Syarat & Alur Pendaftaran Nikah",
    description: "Informasi lengkap mengenai syarat dan alur proses pendaftaran pernikahan.",
  },
  {
    icon: BookCopy,
    title: "Penerbitan Duplikat Kutipan Akta Nikah",
    description: "Pengurusan penerbitan duplikat atau kutipan akta nikah yang hilang atau rusak.",
  },
  {
    icon: HandCoins,
    title: "Ikrar Wakaf",
    description: "Fasilitasi dan pencatatan proses pelaksanaan ikrar wakaf secara resmi.",
  },
  {
    icon: Compass,
    title: "Pengukuran Arah Kiblat",
    description: "Layanan akurat untuk pengukuran arah kiblat masjid, mushola, atau rumah.",
  },
  {
    icon: HeartHandshake,
    title: "Layanan Rujuk",
    description: "Proses mediasi dan pencatatan rujuk bagi pasangan setelah talak.",
  },
  {
    icon: MessagesSquare,
    title: "Konsultasi dan Bimbingan Perkawinan",
    description: "Sesi konsultasi dan bimbingan pra-nikah serta penasihatan keluarga.",
  },
  {
    icon: BadgeCheck,
    title: "Legalisasi Buku Nikah",
    description: "Layanan legalisasi buku nikah untuk berbagai keperluan administrasi.",
  },
  {
    icon: FileSignature,
    title: "Permohonan Taukil Wali Nikah",
    description: "Pengajuan permohonan penunjukan wali hakim atau taukil wali.",
  },
  {
    icon: FileEdit,
    title: "Perubahan Data Buku Nikah",
    description: "Pengurusan perubahan nama atau data perseorangan pada buku nikah.",
  },
  {
    icon: FileCheck2,
    title: "Pencatatan Perjanjian Perkawinan",
    description: "Pencatatan resmi perjanjian perkawinan yang dibuat sebelum atau selama pernikahan.",
  },
];

export function ServiceSection() {
  return (
    <SectionWrapper id="services" title="Layanan Kami" subtitle="Apa yang bisa kami bantu?">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service, index) => (
          <div 
            key={service.title} 
            className="animate-fadeInFromBottom opacity-0" 
            style={{ animationDelay: `${0.2 + index * 0.07}s`, animationFillMode: 'forwards' }} // Adjusted delay for more items
          >
            <ServiceCard
              icon={service.icon}
              title={service.title}
              description={service.description}
            />
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
