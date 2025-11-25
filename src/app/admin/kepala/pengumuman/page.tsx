'use client';

import { PengumumanNikahGenerator } from '@/components/admin/PengumumanNikahGenerator';

export default function KepalaKuaPengumumanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Surat Pengumuman Nikah</h1>
        <p className="text-muted-foreground mt-2">
          Generate surat pengumuman nikah untuk periode tertentu dalam format HTML yang siap dicetak
        </p>
      </div>
      <PengumumanNikahGenerator role="kepala_kua" />
    </div>
  );
}

