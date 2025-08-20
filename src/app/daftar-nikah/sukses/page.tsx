
import type { Metadata } from 'next';
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { MarriageProof } from "@/components/kuakua/MarriageProof";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Pendaftaran Nikah Berhasil - KUA Banjarmasin Utara',
  description: 'Bukti pendaftaran antrean nikah online KUA Banjarmasin Utara.',
};

function ProofPageContent() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
          <AppHeader />
          <main className="flex-grow">
            <SectionWrapper 
                id="proof" 
                title="Pendaftaran Berhasil" 
                subtitle="Tanda Bukti Antrean Pendaftaran Nikah"
                className="pt-8 md:pt-12"
                hasAnimation={false}
            >
              <MarriageProof />
            </SectionWrapper>
          </main>
          <AppFooter />
        </div>
    );
}


export default function PendaftaranNikahSuksesPage() {
  return (
    <Suspense fallback={<div>Memuat bukti pendaftaran...</div>}>
      <ProofPageContent />
    </Suspense>
  );
}
