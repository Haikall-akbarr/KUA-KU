
import type { Metadata } from 'next';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { SectionWrapper } from '@/components/shared/SectionWrapper';
import { ServiceCard } from '@/components/kuaku/ServiceCard';
import { letterServices } from '@/lib/surat-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pengurusan Surat - KUA Banjarmasin Utara',
  description: 'Pilih jenis layanan surat yang Anda butuhkan.',
};

export default function SuratMenyuratPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-grow">
        <SectionWrapper 
            id="surat-layanan" 
            title="Layanan Pengurusan Surat"
            subtitle="Pilih salah satu layanan di bawah ini untuk memulai"
            className="pt-8 md:pt-12"
            hasAnimation={false}
        >
             <div className="max-w-5xl mx-auto">
                <Button asChild variant="outline" size="sm" className="mb-8">
                    <Link href="/#services">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Semua Layanan
                    </Link>
                </Button>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {letterServices.map((service, index) => (
                        <div 
                            key={service.title} 
                            className="animate-fadeInFromBottom opacity-0" 
                            style={{ animationDelay: `${0.1 + index * 0.05}s`, animationFillMode: 'forwards' }}
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
            </div>
        </SectionWrapper>
      </main>
      <AppFooter />
    </div>
  );
}
