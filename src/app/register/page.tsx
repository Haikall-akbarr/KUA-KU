
import { RegisterForm } from '@/components/auth/RegisterForm';
import { LoginInfoPanel } from '@/components/auth/LoginInfoPanel';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Daftar - Sistem Informasi Manajemen Nikah',
    description: 'Buat akun baru.',
};

export default function RegisterPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100 via-white to-blue-200 p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid md:grid-cols-2">
                <LoginInfoPanel />
                <div className="flex items-center justify-center p-8 sm:p-12">
                    <RegisterForm />
                </div>
            </div>
        </div>
    );
}
