
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

const ADMIN_ROLES = ['Staff KUA', 'Kepala KUA', 'Administrator', 'Penghulu'];

export default function HomePage() {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return; // Tunggu sampai loading selesai
    }

    if (!user) {
      // Jika tidak ada user, alihkan ke halaman login
      router.push('/login');
    } else if (userRole && ADMIN_ROLES.includes(userRole)) {
      // Jika user memiliki peran admin, alihkan ke dashboard admin
      router.push('/admin');
    }
    // Jika user adalah 'Calon Pengantin' atau peran non-admin lainnya, biarkan di halaman utama.

  }, [user, userRole, loading, router]);

  // Tampilkan loading spinner selama proses autentikasi atau sebelum redirect
  if (loading || !user || (userRole && ADMIN_ROLES.includes(userRole))) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  // Jika user adalah non-admin (misal: Calon Pengantin), tampilkan halaman utama
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
