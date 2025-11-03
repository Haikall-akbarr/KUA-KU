"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// HAPUS: import { signInWithEmailAndPassword } from 'firebase/auth';
// HAPUS: import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

// UBAH: Sesuaikan skema dengan kebutuhan API (username, bukan email)
const loginSchema = z.object({
  username: z.string().min(1, { message: 'Username tidak boleh kosong.' }),
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

  // UBAH: Logika onSubmit diganti total untuk menggunakan fetch ke API kustom
  const onSubmit: SubmitHandler<LoginInputs> = async (data) => {
    setIsLoading(true);
    try {
      // Kirim data ke API kustom Anda
      const response = await fetch('https://simnikah-api-production.up.railway.app/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // 'data' akan berisi { username: "...", password: "..." }
      });

      // Cek jika respons TIDAK sukses (bukan 200-299)
      if (!response.ok) {
        let errorMessage = 'Login gagal. Silakan coba lagi.';
        try {
          // Coba ambil pesan error dari body respons API
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          } else if (response.status === 401 || response.status === 400) {
              errorMessage = "Username atau password yang Anda masukkan salah."
          }
        } catch (e) {
          // Biarkan errorMessage default jika body error bukan JSON
        }
        throw new Error(errorMessage);
      }

      // Jika respons sukses
      const result = await response.json();

      // --- PENTING ---
      // Anda perlu menyimpan 'result.token' ini di suatu tempat
      // (misalnya di localStorage, sessionStorage, atau cookie)
      // agar pengguna tetap login saat pindah halaman.
      // Contoh: localStorage.setItem('authToken', result.token);
      // console.log('Token diterima:', result.token);
      // ----------------

      toast({
        title: 'Login Berhasil!',
        description: result.message || 'Selamat datang kembali.',
      });
      
      router.push('/'); // Arahkan ke halaman utama

    } catch (error: any) {
      // Tangkap error dari 'throw new Error' di atas atau error jaringan
      toast({
        title: 'Gagal Login',
        description: error.message || 'Terjadi kesalahan. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md relative">
      {/* ... (Bagian Image, CardHeader tetap sama) ... */}
        <CardHeader>
            <CardTitle className="text-2xl font-bold">Masuk</CardTitle>
            <CardDescription>Silakan masuk ke akun Anda untuk melanjutkan.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                {/* UBAH: Input untuk 'username' */}
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
                
                {/* Input 'password' tetap sama */}
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
            {/* ... (Bagian Link 'Daftar di sini' tetap sama) ... */}
            <p className="text-center text-sm text-muted-foreground">
                Belum punya akun?{' '}
                <Link href="/register" className="font-semibold text-primary hover:underline">
                Daftar di sini
                </Link>
  _         </p>
        </CardFooter>
    </Card>
  );
}