
import type { Metadata } from 'next';
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { ServiceCard } from '@/components/kuaku/ServiceCard';
import { suratServices } from '@/lib/surat-data';

export const metadata: Metadata = {
  title: 'Layanan Pengurusan Surat - KUA Banjarmasin Utara',
  description: 'Pilih jenis surat yang ingin Anda urus di KUA Banjarmasin Utara.',
};

export default function SuratMenyuratPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-grow">
        <SectionWrapper 
            id="surat-services" 
            title="Layanan Pengurusan Surat" 
            subtitle="Pilih layanan surat yang Anda perlukan"
            className="pt-8 md:pt-12"
            hasAnimation={false}
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {suratServices.map((service, index) => (
              <div 
                key={`${service.slug}-${service.title}`}
                className="animate-fadeInFromBottom opacity-0" 
                style={{ animationDelay: `${0.1 + index * 0.07}s`, animationFillMode: 'forwards' }}
              >
                <ServiceCard
                  slug={service.slug}
                  iconName={service.iconName}
                  title={service.title}
                  description={service.description}
                  isExternal={service.isExternal}
                />
              </div>
            ))}
          </div>
        </SectionWrapper>
      </main>
      <AppFooter />
    </div>
  );
}
