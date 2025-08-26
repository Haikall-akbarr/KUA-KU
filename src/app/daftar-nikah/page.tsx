
import type { Metadata } from 'next';
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { MultiStepMarriageForm } from "@/components/kuaku/MultiStepMarriageForm";
import { SectionWrapper } from "@/components/shared/SectionWrapper";

export const metadata: Metadata = {
  title: 'Daftar Nikah Online - KUA Banjarmasin Utara',
  description: 'Lengkapi data diri Anda dan pasangan untuk mendapatkan nomor antrean pendaftaran nikah.',
};

export default function DaftarNikahPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-grow">
        <SectionWrapper 
            id="marriage-registration" 
            title="Pendaftaran Nikah Online" 
            subtitle="Layanan Online KUA Banjarmasin Utara"
            className="pt-8 md:pt-12"
            hasAnimation={false}
        >
          <MultiStepMarriageForm />
        </SectionWrapper>
      </main>
      <AppFooter />
    </div>
  );
}
