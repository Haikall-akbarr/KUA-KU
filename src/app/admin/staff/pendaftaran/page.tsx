'use client';

import { StaffCreateRegistrationForm } from '@/components/admin/staff/StaffCreateRegistrationForm';
import { useRouter } from 'next/navigation';

export default function StaffPendaftaranPage() {
  const router = useRouter();

  const handleSuccess = () => {
    // Redirect to dashboard after successful registration
    router.push('/admin/staff');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pendaftaran Nikah</h1>
        <p className="text-muted-foreground mt-2">
          Buat pendaftaran nikah untuk calon pengantin. Sistem akan otomatis membuat akun user dan pendaftaran akan langsung disetujui.
        </p>
      </div>
      <StaffCreateRegistrationForm onSuccess={handleSuccess} />
    </div>
  );
}

