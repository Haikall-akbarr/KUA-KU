
import { LoginForm } from '@/components/auth/LoginForm';
import type { Metadata } from 'next';
import { LoginInfoPanel } from '@/components/auth/LoginInfoPanel';

export const metadata: Metadata = {
    title: 'Masuk - Sistem Informasi Manajemen Nikah',
    description: 'Masuk ke akun Anda untuk mengakses layanan.',
};

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="relative flex h-full max-h-[900px] w-full max-w-6xl flex-col overflow-hidden rounded-xl shadow-2xl md:flex-row">
                <LoginInfoPanel />
                <div className="flex w-full items-center justify-center bg-card p-8 md:w-1/2">
                    <LoginForm />
                </div>
            </div>
        </div>
    );
}
