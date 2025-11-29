import { ReloginForm } from '@/components/auth/ReloginForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sesi Berakhir - Sistem Informasi Manajemen Nikah',
  description: 'Sesi Anda telah berakhir. Silakan masukkan password untuk melanjutkan.',
};

export default function ReloginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 md:p-8">
      <ReloginForm />
    </div>
  );
}

