
import { LoginForm } from '@/components/auth/LoginForm';
import type { Metadata } from 'next';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';

export const metadata: Metadata = {
    title: 'Masuk - Sistem Informasi Manajemen Nikah',
    description: 'Masuk ke akun Anda untuk mengakses layanan.',
};

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <AppHeader />
            <main className="flex flex-grow items-center justify-center p-4">
               <LoginForm />
            </main>
            <AppFooter />
        </div>
    );
}
