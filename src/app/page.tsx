
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { ServiceSection } from "@/components/kuaku/ServiceSection";
import { ContactInfo } from "@/components/kuaku/ContactInfo";
import { MapPlaceholder } from "@/components/kuaku/MapPlaceholder";
import { ContactForm } from "@/components/kuaku/ContactForm";
import { HeroSection } from "@/components/kuaku/HeroSection";
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Jika proses loading selesai dan tidak ada user, alihkan ke halaman login.
    // Ini adalah fallback jika pengguna mencoba mengakses halaman utama secara langsung.
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Selama loading atau jika tidak ada user (sebelum redirect), tampilkan spinner.
  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  // Jika user sudah login, tampilkan halaman utama.
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-grow">
        <HeroSection />
        <ServiceSection />
        <ContactInfo />
        <MapPlaceholder />
        <ContactForm />
      </main>
      <AppFooter />
    </div>
  );
}
