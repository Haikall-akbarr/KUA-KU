"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// HAPUS: import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
// HAPUS: import { auth } from '@/lib/firebase';
import { Loader2, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { registerUser, handleApiError } from '@/lib/simnikah-api';

// UBAH: Sesuaikan skema dengan kebutuhan API
const registerSchema = z.object({
  // Ganti 'fullName' menjadi 'nama' agar konsisten dengan API
  nama: z.string().min(3, { message: 'Nama lengkap minimal 3 karakter.' }),
  // TAMBAH: 'username' diperlukan oleh API
  username: z.string().min(3, { message: 'Username minimal 3 karakter.' }),
  email: z.string().email({ message: 'Format email tidak valid.' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter.' }),
});

type RegisterInputs = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInputs>({
    resolver: zodResolver(registerSchema),
  });

  // UBAH: Logika onSubmit diganti total untuk menggunakan registerUser API
  const onSubmit: SubmitHandler<RegisterInputs> = async (data) => {
    setIsLoading(true);
    try {
      // Siapkan body untuk dikirim ke API
      const apiBody = {
        username: data.username,
        email: data.email,
        password: data.password,
        nama: data.nama, // 'nama' dari form
        role: 'user_biasa' as const, // Hardcode 'role' sesuai permintaan API
      };

      // Gunakan registerUser API dari simnikah-api.ts
      const result = await registerUser(apiBody);

      toast({
        title: 'Pendaftaran Berhasil!',
        description: result.message || 'Akun Anda telah berhasil dibuat. Silakan login.',
      });
      router.push('/login'); // Arahkan ke halaman login setelah berhasil

    } catch (error: any) {
      // Tangkap error dan gunakan handleApiError untuk pesan yang konsisten
      const errorMessage = handleApiError(error);
      toast({
        title: 'Pendaftaran Gagal',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

	return (
		<Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold">Daftar Akun Baru</CardTitle>
        <CardDescription className="mt-1">Isi data di bawah untuk membuat akun</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nama" className="text-sm font-medium">Nama Lengkap</Label>
            <Input
              id="nama"
              type="text"
              placeholder="Nama Lengkap Anda"
              {...register('nama')}
              disabled={isLoading}
              autoComplete="name"
              className="w-full"
            />
            {errors.nama && (
              <p className="text-sm text-destructive mt-1">{errors.nama.message}</p>
            )}
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-sm font-medium">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Username unik Anda"
              {...register('username')}
              disabled={isLoading}
              autoComplete="username"
              className="w-full"
            />
            {errors.username && (
              <p className="text-sm text-destructive mt-1">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              {...register('email')}
              disabled={isLoading}
              autoComplete="email"
              className="w-full"
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 6 karakter"
                {...register('password')}
                disabled={isLoading}
                autoComplete="new-password"
                aria-invalid={errors.password ? 'true' : 'false'}
                className="w-full pr-10"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 text-sm text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Daftar'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="pt-4 pb-0">
        <div className="flex flex-col items-center gap-3 w-full">
          <p className="text-center text-sm text-muted-foreground">
            Sudah punya akun?
          </p>
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full" type="button">
              Masuk di sini
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}