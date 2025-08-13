
import { LoginForm } from '@/components/auth/LoginForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login - KUAKU',
    description: 'Masuk ke akun KUAKU Anda.',
};

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
             <LoginForm />
        </div>
    );
}
