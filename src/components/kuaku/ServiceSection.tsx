
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { ServiceCard } from "./ServiceCard";
import { 
  FileText, 
  HeartHandshake, 
  BookCopy, 
  BookOpenCheck, 
  Compass, 
  UserCheck, 
  HandCoins, 
  BadgeCheck 
} from "lucide-react";

const services = [
  {
    icon: FileText,
    title: "Pendaftaran & Rekomendasi Nikah",
    description: "Layanan pendaftaran, pencatatan, dan rekomendasi pernikahan resmi.",
  },
  {
    icon: HeartHandshake,
    title: "Bimbingan & Konsultasi Keluarga",
    description: "Bimbingan pra-nikah, konseling, dan konsultasi masalah keluarga sakinah.",
  },
  {
    icon: BookCopy,
    title: "Duplikat & Legalisasi Buku Nikah",
    description: "Pengurusan duplikat dan legalisasi akta nikah Anda secara resmi.",
  },
  {
    icon: BookOpenCheck,
    title: "Informasi & Manasik Haji",
    description: "Informasi lengkap pendaftaran dan panduan pelaksanaan manasik haji.",
  },
  {
    icon: Compass,
    title: "Pengukuran Arah Kiblat",
    description: "Layanan pengukuran arah kiblat akurat untuk masjid, mushola, dan pribadi.",
  },
  {
    icon: UserCheck,
    title: "Layanan Muallaf & Konversi Agama",
    description: "Proses bimbingan, pencatatan syahadat, dan layanan bagi muallaf.",
  },
  {
    icon: HandCoins,
    title: "Informasi Zakat & Wakaf",
    description: "Informasi mengenai pengelolaan, penyaluran, dan konsultasi zakat serta wakaf.",
  },
  {
    icon: BadgeCheck,
    title: "Sertifikasi Produk Halal",
    description: "Bantuan, informasi, dan pendampingan terkait proses sertifikasi produk halal.",
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
            style={{ animationDelay: `${0.2 + index * 0.1}s`, animationFillMode: 'forwards' }}
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
