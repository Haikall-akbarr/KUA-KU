
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { ServiceCard } from "./ServiceCard";
import { services } from "@/lib/services-data";

export function ServiceSection() {
  // Sort services to prioritize specific items
  const sortedServices = [...services].sort((a, b) => {
    if (a.slug === 'daftar-nikah') return -1;
    if (b.slug === 'daftar-nikah') return 1;
    if (a.slug === 'surat-menyurat') return -1;
    if (b.slug === 'surat-menyurat') return 1;
    return 0;
  });

  return (
    <SectionWrapper id="services" title="Layanan Kami" subtitle="Apa yang bisa kami bantu?">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sortedServices.map((service, index) => (
          <div 
            key={`${service.slug}-${service.title}`}
            className="animate-fadeInFromBottom opacity-0" 
            style={{ animationDelay: `${0.2 + index * 0.07}s`, animationFillMode: 'forwards' }}
          >
            <ServiceCard
              slug={service.slug}
              icon={service.icon}
              title={service.title}
              description={service.description}
              isExternal={service.isExternal}
            />
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
