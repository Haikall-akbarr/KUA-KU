
import type { Metadata } from 'next';
import { RegistrationsTable } from '@/components/admin/RegistrationsTable';
import { marriageRegistrations } from '@/lib/admin-data';

export const metadata: Metadata = {
  title: 'Manajemen Pendaftaran Nikah - KUA Banjarmasin Utara',
  description: 'Verifikasi dan kelola pendaftaran nikah yang masuk.',
};

export default function RegistrationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pendaftaran Nikah</h1>
        <p className="text-muted-foreground">
          Verifikasi, setujui, dan kelola semua pendaftaran nikah yang masuk.
        </p>
      </div>
      <RegistrationsTable data={marriageRegistrations} />
    </div>
  );
}
