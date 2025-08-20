
import { RegisterForm } from '@/components/auth/RegisterForm';
import type { Metadata } from 'next';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';

export const metadata: Metadata = {
    title: 'Daftar - Sistem Informasi Manajemen Nikah',
    description: 'Buat akun baru.',
};

export default function RegisterPage() {
    return (
       <div className="flex min-h-screen flex-col bg-background">
            <AppHeader />
            <main className="flex flex-grow items-center justify-center p-4">
               <RegisterForm />
            </main>
            <AppFooter />
        </div>
    );
}
