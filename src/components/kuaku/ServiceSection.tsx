
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { ServiceCard } from "./ServiceCard";
import { services } from "@/lib/services-data"; // Import from the new data file

export function ServiceSection() {
  return (
    <SectionWrapper id="services" title="Layanan Kami" subtitle="Apa yang bisa kami bantu?">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service, index) => (
          <div 
            key={service.title} 
            className="animate-fadeInFromBottom opacity-0" 
            style={{ animationDelay: `${0.2 + index * 0.07}s`, animationFillMode: 'forwards' }}
          >
            <ServiceCard
              slug={service.slug}
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
