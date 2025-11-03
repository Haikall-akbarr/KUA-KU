"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// HAPUS: import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
// HAPUS: import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInputs>({
    resolver: zodResolver(registerSchema),
  });

  // UBAH: Logika onSubmit diganti total untuk menggunakan fetch ke API kustom
  const onSubmit: SubmitHandler<RegisterInputs> = async (data) => {
    setIsLoading(true);
    try {
      // Siapkan body untuk dikirim ke API
      const apiBody = {
        username: data.username,
        email: data.email,
        password: data.password,
        nama: data.nama, // 'nama' dari form
        role: 'user_biasa', // Hardcode 'role' sesuai permintaan API
      };

      // Kirim data ke API registrasi Anda
      const response = await fetch('https://simnikah-api-production.up.railway.app/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiBody),
      });

      // Cek jika respons TIDAK sukses (bukan 200-299)
      if (!response.ok) {
        let errorMessage = 'Pendaftaran gagal. Silakan coba lagi.';
        try {
          // Coba ambil pesan error dari body respons API
          // (Contoh: "Email sudah terdaftar" atau "Username sudah terdaftar")
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // Biarkan errorMessage default jika body error bukan JSON
        }
        throw new Error(errorMessage);
      }

      // Jika respons sukses
      const result = await response.json();

      toast({
        title: 'Pendaftaran Berhasil!',
        description: result.message || 'Akun Anda telah berhasil dibuat. Silakan login.',
      });
      router.push('/login'); // Arahkan ke halaman login setelah berhasil

    } catch (error: any) {
      // Tangkap error dari 'throw new Error' di atas atau error jaringan
      toast({
        title: 'Pendaftaran Gagal',
        description: error.message, // Pesan error dinamis dari 'throw'
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Daftar Akun Baru</CardTitle>
        <CardDescription>Isi data di bawah untuk membuat akun</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* UBAH: 'fullName' menjadi 'nama' */}
            <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                id="nama"
                type="text"
                placeholder="Nama Lengkap Anda"
                {...register('nama')}
                disabled={isLoading}
                />
                {errors.nama && <p className="text-sm text-destructive">{errors.nama.message}</p>}
            </div>
            
            {/* TAMBAH: Input untuk 'username' */}
            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                id="username"
                type="text"
                placeholder="Username unik Anda"
                {...register('username')}
                disabled={isLoading}
                />
                {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
            </div>

            {/* Input 'email' tetap sama */}
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

            {/* Input 'password' tetap sama */}
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                id="password"
                type="password"
                placeholder="Minimal 6 karakter"
                {...register('password')}
                disabled={isLoading}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Daftar'}
            </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="w-full text-center text-sm text-muted-foreground">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Masuk di sini
            </Link>
          </p>
      </CardFooter>
    </Card>
  );
}