
import type { Metadata } from 'next';
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { RegistrationForm } from "@/components/kuaku/RegistrationForm";
import { SectionWrapper } from "@/components/shared/SectionWrapper";

export const metadata: Metadata = {
  title: 'Pengambilan Nomor Pendaftaran - KUAKU',
  description: 'Lengkapi data diri Anda untuk mendapatkan nomor pendaftaran layanan KUAKU.',
};

export default function PendaftaranPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-grow">
        <SectionWrapper 
            id="registration" 
            title="Pengambilan Nomor Pendaftaran" 
            subtitle="Layanan Online KUAKU"
            className="pt-8 md:pt-12"
            hasAnimation={false}
        >
          <RegistrationForm />
        </SectionWrapper>
      </main>
      <AppFooter />
    </div>
  );
}
