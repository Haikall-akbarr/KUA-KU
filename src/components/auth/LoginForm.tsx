
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

const loginSchema = z.object({
  email: z.string().email({ message: 'Format email tidak valid.' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter.' }),
});

type LoginInputs = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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
      router.push('/');
    } catch (error: any) {
      let errorMessage = 'Terjadi kesalahan. Silakan coba lagi.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
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
    <Card className="w-full max-w-md">
        <CardHeader>
            <CardTitle className="text-2xl font-bold">Masuk</CardTitle>
            <CardDescription>Silakan masuk ke akun Anda untuk melanjutkan.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    {...register('email')}
                    disabled={isLoading}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                    id="password"
                    type='password'
                    placeholder="Password Anda"
                    {...register('password')}
                    disabled={isLoading}
                    />
                    {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Masuk'}
                </Button>
            </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-4">
             <p className="text-center text-sm text-muted-foreground">
                Belum punya akun?{' '}
                <Link href="/register" className="font-semibold text-primary hover:underline">
                Daftar di sini
                </Link>
            </p>
        </CardFooter>
    </Card>
  );
}
