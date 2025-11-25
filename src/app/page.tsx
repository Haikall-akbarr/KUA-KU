"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, ADMIN_ROLES } from '@/context/AuthContext';
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { ServiceSection } from "@/components/kuaku/ServiceSection";
import { ContactInfo } from "@/components/kuaku/ContactInfo";
import { MapPlaceholder } from "@/components/kuaku/MapPlaceholder";
import { ContactForm } from "@/components/kuaku/ContactForm";
import { HeroSection } from "@/components/kuaku/HeroSection";
import { AvailabilityCalendar } from "@/components/kuaku/AvailabilityCalendar";
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return; // Tunggu sampai loading selesai
    }

    // Jika user adalah admin role, redirect ke dashboard admin
    if (user && userRole && ADMIN_ROLES.includes(userRole)) {
      // Redirect berdasarkan role spesifik
      if (userRole === 'kepala_kua') {
        router.push('/admin/kepala');
      } else if (userRole === 'staff') {
        router.push('/admin/staff');
      } else if (userRole === 'penghulu') {
        router.push('/penghulu');
      } else {
        router.push('/admin');
      }
      return;
    }

    // Jika user_biasa atau role non-admin lainnya, biarkan di homepage
    // Tidak perlu redirect ke login jika sudah login
  }, [user, userRole, loading, router]);

  // Tampilkan loading hanya saat masih loading atau saat redirect admin
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-12 w-12" />
      </div>
    );
  }

  // Jika user adalah admin, tampilkan loading saat redirect
  if (user && userRole && ADMIN_ROLES.includes(userRole)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-12 w-12" />
      </div>
    );
  }

  // Render konten halaman utama untuk semua user (termasuk user_biasa yang sudah login)
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