
import type { Metadata } from 'next';
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { RegistrationProof } from "@/components/kuakua/RegistrationProof";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Pendaftaran Berhasil - KUA Banjarmasin Utara',
  description: 'Bukti pendaftaran layanan online KUA Banjarmasin Utara.',
};

function ProofPageContent() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
          <AppHeader />
          <main className="flex-grow">
            <SectionWrapper 
                id="proof" 
                title="Pendaftaran Berhasil" 
                subtitle="Tanda Bukti Pendaftaran Layanan"
                className="pt-8 md:pt-12"
                hasAnimation={false}
            >
              <RegistrationProof />
            </SectionWrapper>
          </main>
          <AppFooter />
        </div>
    );
}


export default function PendaftaranSuksesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProofPageContent />
    </Suspense>
  );
}
