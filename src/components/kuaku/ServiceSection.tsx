import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { ServiceCard } from "./ServiceCard";
import { HeartHandshake, BookOpenText, FileText, Users } from "lucide-react";

const services = [
  {
    icon: HeartHandshake,
    title: "Pendaftaran Nikah",
    description: "Layanan pendaftaran dan pencatatan pernikahan secara resmi.",
  },
  {
    icon: BookOpenText,
    title: "Konsultasi Keluarga",
    description: "Bimbingan dan konsultasi pra-nikah serta masalah keluarga.",
  },
  {
    icon: FileText,
    title: "Pengurusan Dokumen",
    description: "Bantuan pengurusan berbagai dokumen keagamaan dan sipil.",
  },
  {
    icon: Users,
    title: "Kegiatan Sosial",
    description: "Informasi dan partisipasi dalam kegiatan sosial keagamaan.",
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
