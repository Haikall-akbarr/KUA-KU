'use client';

import dynamic from 'next/dynamic';
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { SectionWrapper } from "@/components/shared/SectionWrapper";

const RegistrationForm = dynamic(() => import("@/components/kuaku/RegistrationForm").then(mod => ({ default: mod.RegistrationForm })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-8"><div className="text-muted-foreground">Memuat form...</div></div>
});

export default function PendaftaranPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-grow">
        <SectionWrapper 
            id="registration" 
            title="Pengambilan Nomor Pendaftaran" 
            subtitle="Layanan Online KUA Banjarmasin Utara"
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
