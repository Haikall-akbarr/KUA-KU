
'use client';

import type { Metadata } from 'next';
import { RegistrationsTable } from '@/components/admin/RegistrationsTable';
import { marriageRegistrations as initialData, type MarriageRegistration } from '@/lib/admin-data';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

// Metadata for a client component should be defined statically if needed, or moved to a parent server component.
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
      const localRegistrations = storedData ? JSON.parse(storedData) : [];
      
      // Combine initial data with local storage data, avoiding duplicates
      const combinedData = [...initialData];
      const existingIds = new Set(combinedData.map(item => item.id));

      for (const localItem of localRegistrations) {
        if (!existingIds.has(localItem.id)) {
          combinedData.push(localItem);
        }
      }
      
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

    