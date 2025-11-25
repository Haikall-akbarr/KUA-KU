'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { PenghuluSidebar } from '@/components/penghulu/PenghuluSidebar';

export default function PenguluLayout({ children }: { children: React.ReactNode }) {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const [timeoutReached, setTimeoutReached] = React.useState(false);

  // Add timeout to prevent infinite loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ Loading timeout reached in PenguluLayout');
        setTimeoutReached(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timer);
  }, [loading]);

  React.useEffect(() => {
    if (loading) return;

    // Pastikan hanya role penghulu yang boleh mengakses
    // Tambahkan delay untuk memastikan state sudah ter-update setelah login
    const checkAuth = setTimeout(() => {
      if (!user || !userRole || userRole !== 'penghulu') {
        console.log('⚠️ Unauthorized access to penghulu layout:', { user: !!user, userRole, loading });
        // Check localStorage as fallback
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role === 'penghulu') {
              console.log('✅ Found penghulu in localStorage, allowing access');
              return; // Allow access
            }
          } catch (e) {
            console.error('Error parsing stored user:', e);
          }
        }
        router.push('/login');
      }
    }, 300); // Small delay to ensure state is updated

    return () => clearTimeout(checkAuth);
  }, [user, userRole, loading, router]);

  // If loading timeout reached, try to load from localStorage directly
  if (timeoutReached && loading) {
    console.warn('⚠️ Loading timeout - checking localStorage directly');
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role === 'penghulu') {
          // User is valid, allow access
          return (
            <div className="flex min-h-screen">
              <PenghuluSidebar />
              <main className="flex-1 p-4 md:p-8 lg:p-10">{children}</main>
            </div>
          );
        }
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
    
    // If still can't verify, redirect to login
    router.push('/login');
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // More lenient check - allow access if user is in localStorage even if context not ready
  const hasValidUser = user && userRole === 'penghulu';
  const hasStoredUser = typeof window !== 'undefined' && (() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        return parsed.role === 'penghulu';
      }
    } catch (e) {
      return false;
    }
    return false;
  })();

  if (loading && !hasStoredUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!hasValidUser && !hasStoredUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <PenghuluSidebar />
      <main className="flex-1 p-4 md:p-8 lg:p-10">{children}</main>
    </div>
  );
}