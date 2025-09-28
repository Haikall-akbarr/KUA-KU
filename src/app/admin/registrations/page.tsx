
'use client';

// This is a Client Component, so we can't use Metadata directly.
// We'll set the title in the parent layout or a Server Component if needed.
// import type { Metadata } from 'next';
import { RegistrationsTable } from '@/components/admin/RegistrationsTable';
import { marriageRegistrations as initialData, type MarriageRegistration } from '@/lib/admin-data';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

// export const metadata: Metadata = {
//   title: 'Manajemen Pendaftaran Nikah - KUA Banjarmasin Utara',
//   description: 'Verifikasi dan kelola pendaftaran nikah yang masuk.',
// };

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<MarriageRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data, including from localStorage
    try {
      const storedData = localStorage.getItem('marriageRegistrations');
      const localRegistrations: MarriageRegistration[] = storedData ? JSON.parse(storedData) : [];
      
      // Combine initial data with local storage data, avoiding duplicates
      const combinedDataMap = new Map<string, MarriageRegistration>();

      // Add initial data to the map
      for (const item of initialData) {
        combinedDataMap.set(item.id, item);
      }

      // Add/update with local data. If an ID exists, the local one will overwrite it.
      for (const localItem of localRegistrations) {
        combinedDataMap.set(localItem.id, localItem);
      }
      
      const combinedData = Array.from(combinedDataMap.values());

      // Sort by registration date, newest first
      combinedData.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());

      setRegistrations(combinedData);
    } catch (error) {
      console.error("Failed to load registration data:", error);
      setRegistrations(initialData); // Fallback to initial data on error
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pendaftaran Nikah</h1>
        <p className="text-muted-foreground">
          Verifikasi, setujui, dan kelola semua pendaftaran nikah yang masuk.
        </p>
      </div>
      <RegistrationsTable data={registrations} />
    </div>
  );
}
