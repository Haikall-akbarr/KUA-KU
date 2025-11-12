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
import { AvailabilityCalendar } from "@/components/kuaku/AvailabilityCalendar";
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

  // Tampilkan layar pemuatan saat memeriksa status otentikasi atau saat mengalihkan
  if (loading || !user || (userRole && ADMIN_ROLES.includes(userRole))) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-12 w-12" />
      </div>
    );
  }

  // Render konten halaman utama untuk pengguna non-admin
  return (
    <>
      <AppHeader />
      <main>
        <HeroSection />
        <ServiceSection />
        <AvailabilityCalendar />
        <ContactInfo />
        <MapPlaceholder />
        <ContactForm />
      </main>
      <AppFooter />
    </>
  );
}