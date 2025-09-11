
import type { Metadata } from 'next';
import Link from 'next/link';
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { suratItems } from '@/lib/surat-data';

export const metadata: Metadata = {
  title: 'Layanan Surat Menyurat - KUA Banjarmasin Utara',
  description: 'Pilih jenis layanan surat yang Anda butuhkan.',
};

export default function SuratMenyuratPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-grow">
        <SectionWrapper 
            id="surat-layanan" 
            title="Layanan Surat Menyurat" 
            subtitle="Pilih Jenis Surat yang Anda Butuhkan"
            className="pt-8 md:pt-12"
            hasAnimation={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {suratItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.slug} 
                  className="animate-fadeInFromBottom opacity-0" 
                  style={{ animationDelay: `${0.1 + index * 0.07}s`, animationFillMode: 'forwards' }}
                >
                  <Card className="flex flex-col h-full overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group">
                    <CardHeader className="flex-row items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                          <Icon className="h-7 w-7" />
                        </div>
                      </div>
                      <div>
                        <CardTitle className="font-headline text-lg group-hover:text-primary transition-colors">{item.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <CardDescription>{item.description}</CardDescription>
                    </CardContent>
                    <div className="p-6 pt-0">
                      <Button asChild className="w-full">
                        <Link href={`/layanan/${item.slug}`}>
                          Lihat Detail <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </SectionWrapper>
      </main>
      <AppFooter />
    </div>
  );
}

    