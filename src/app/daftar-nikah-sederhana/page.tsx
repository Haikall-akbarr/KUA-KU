import type { Metadata } from 'next';
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { SimpleMarriageRegistrationForm } from "@/components/kuaku/SimpleMarriageRegistrationForm";
import { SectionWrapper } from "@/components/shared/SectionWrapper";

export const metadata: Metadata = {
  title: 'Daftar Nikah Online (Form Sederhana) - KUA Banjarmasin Utara',
  description: 'Formulir pendaftaran nikah sederhana dengan data minimal yang diperlukan.',
};

export default function DaftarNikahSederhanaPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-grow">
        <SectionWrapper 
            id="simple-marriage-registration" 
            title="Pendaftaran Nikah Online (Form Sederhana)" 
            subtitle="Formulir pendaftaran nikah dengan data minimal"
            className="pt-8 md:pt-12"
            hasAnimation={false}
        >
          <SimpleMarriageRegistrationForm />
        </SectionWrapper>
      </main>
      <AppFooter />
    </div>
  );
}

