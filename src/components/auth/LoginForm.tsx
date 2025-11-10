"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// --- PERBAIKAN: Impor ADMIN_ROLES dari Context ---
import { useAuth, ADMIN_ROLES } from '@/context/AuthContext'; 
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

// Skema Zod
const loginSchema = z.object({
  username: z.string().min(1, { message: 'Username tidak boleh kosong.' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter.' }),
});

type LoginInputs = z.infer<typeof loginSchema>;

// --- PERBAIKAN: HAPUS BLOK INI ---
// const ADMIN_ROLES = [ ... ];

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth(); // Hook di dalam komponen (Sudah Benar)
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
      // ... (Fetch API Anda)
      const response = await fetch('https://simnikah-api-production.up.railway.app/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      // ... (Error handling jika !response.ok)
      if (!response.ok) {
        let errorMessage = 'Login gagal. Silakan coba lagi.';
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          } else if (response.status === 401 || response.status === 400) {
              errorMessage = "Username atau password yang Anda masukkan salah."
          }
        } catch (e) { /* biarkan default */ }
        throw new Error(errorMessage);
      }

      // Jika respons sukses
      const result = await response.json(); 

     

      // Simpan token ke cookies untuk digunakan oleh server actions
      document.cookie = `token=${result.token}; path=/; max-age=${24 * 60 * 60}`;

      // Simpan sesi login ke Context
      login(result.user, result.token);      toast({
        title: 'Login Berhasil!',
        description: `Selamat datang kembali, ${result.user.nama}.`,
      });
      
      // Logika Pengarahan Berbasis Peran
      const userRole = result.user.role; 

      // --- PERBAIKAN: Logika ini sekarang menggunakan ADMIN_ROLES dari Context ---
      if (userRole && ADMIN_ROLES.includes(userRole)) {
        console.log('Mengarahkan ke /admin');
        router.push('/admin'); // Ke dashboard admin
      } else {
        console.log('Mengarahkan ke /');
        router.push('/'); // Ke dashboard user biasa
      }

    } catch (error: any) {
      toast({
        title: 'Gagal Login',
        description: error.message || 'Terjadi kesalahan. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ... (Return JSX Anda)
  return (
    <Card className="w-full max-w-md relative">
      <div className="absolute top-4 right-4">
        <Image 
          alt="Kementerian Agama Logo"
          src="/logo-kemenag.png"
          width={40}
          height={40}
        />
      </div>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Masuk</CardTitle>
        <CardDescription>Silakan masuk ke akun Anda untuk melanjutkan.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text" 
              placeholder="Username Anda"
              {...register('username')} 
              disabled={isLoading}
            />
            {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
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