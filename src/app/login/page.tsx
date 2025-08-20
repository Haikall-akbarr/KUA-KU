
import { LoginForm } from '@/components/auth/LoginForm';
import type { Metadata } from 'next';
import { LoginInfoPanel } from '@/components/auth/LoginInfoPanel';

export const metadata: Metadata = {
    title: 'Masuk - Sistem Informasi Manajemen Nikah',
    description: 'Masuk ke akun Anda untuk mengakses layanan.',
};

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 md:p-8">
            <div className="relative flex h-full max-h-[960px] w-full max-w-none flex-col overflow-hidden rounded-xl shadow-2xl md:flex-row">
                <LoginInfoPanel />
                <div className="flex w-full items-center justify-center bg-card p-8 md:w-1/2">
                    <LoginForm />
                </div>
            </div>
        </div>
    );
}
