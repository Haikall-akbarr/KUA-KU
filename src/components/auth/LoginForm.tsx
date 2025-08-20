
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

const loginSchema = z.object({
  email: z.string().email({ message: 'Format email tidak valid.' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter.' }),
  remember: z.boolean().optional().default(false),
});

type LoginInputs = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginInputs> = async (data) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: 'Login Berhasil!',
        description: 'Selamat datang kembali.',
      });
      // Refresh the page to trigger AuthContext update and redirection
      router.refresh(); 
    } catch (error: any) {
      let errorMessage = 'Terjadi kesalahan. Silakan coba lagi.';
      // This single check handles user-not-found, wrong-password, etc.
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Email atau password yang Anda masukkan salah.';
      } else if (error.code === 'auth/configuration-not-found') {
          errorMessage = 'Konfigurasi otentikasi tidak ditemukan. Pastikan metode login Email/Password sudah diaktifkan di Firebase Console.';
      }
      toast({
        title: 'Gagal Login',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-left">
        <h1 className="text-3xl font-bold text-gray-800">MASUK</h1>
        <p className="mt-2 text-gray-500">Silahkan masuk ke Aplikasi dengan Akun Anda</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="sr-only">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="Email/Username"
              {...register('email')}
              disabled={isLoading}
              className="pl-10 h-12"
            />
          </div>
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="sr-only">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              {...register('password')}
              disabled={isLoading}
              className="pl-10 pr-10 h-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <Checkbox id="remember" {...register('remember')} />
                <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none text-gray-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Ingat Saya
                </label>
            </div>
            <Link href="#" className="text-sm font-medium text-blue-600 hover:underline">
                Lupa Password?
            </Link>
        </div>
        
        <div className="flex items-center gap-4 pt-2">
          <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-bold" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'MASUK'}
          </Button>
          <Button asChild variant="outline" className="w-full h-12 bg-yellow-500 text-white hover:bg-yellow-600 hover:text-white border-yellow-500 text-base font-bold">
            <Link href="/register">DAFTAR</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
