'use client';

import { useEffect } from 'react';
import { ReloginForm } from '@/components/auth/ReloginForm';

export default function ReloginPage() {
  useEffect(() => {
    // Clear redirect flag when page loads
    sessionStorage.removeItem('redirecting_to_relogin');
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 md:p-8">
      <ReloginForm />
    </div>
  );
}

