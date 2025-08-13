
import { RegisterForm } from '@/components/auth/RegisterForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Register - KUAKU',
    description: 'Buat akun baru di KUAKU.',
};

export default function RegisterPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
             <RegisterForm />
        </div>
    );
}
