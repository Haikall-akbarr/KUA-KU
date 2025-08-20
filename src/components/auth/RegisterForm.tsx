
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const registerSchema = z.object({
  fullName: z.string().min(3, { message: 'Nama lengkap minimal 3 karakter.' }),
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

  const onSubmit: SubmitHandler<RegisterInputs> = async (data) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: data.fullName,
        });
      }

      toast({
        title: 'Pendaftaran Berhasil!',
        description: 'Akun Anda telah berhasil dibuat. Silakan login.',
      });
      router.push('/login');
    } catch (error: any) {
      let errorMessage = 'Terjadi kesalahan. Silakan coba lagi.';
       if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email ini sudah terdaftar. Silakan gunakan email lain atau login.';
      }
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
    <div className="w-full max-w-md">
       <div className="mb-8 text-left">
        <h1 className="text-3xl font-bold text-gray-800">DAFTAR AKUN BARU</h1>
        <p className="mt-2 text-gray-500">Isi data di bawah untuk membuat akun</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="sr-only">Nama Lengkap</Label>
           <div className="relative">
             <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              id="fullName"
              type="text"
              placeholder="Nama Lengkap Anda"
              {...register('fullName')}
              disabled={isLoading}
              className="pl-10 h-12"
            />
          </div>
          {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="sr-only">Email</Label>
           <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
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
              type={showPassword ? "text" : "password"}
              placeholder="Minimal 6 karakter"
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
        <div className="pt-2">
          <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-bold" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'DAFTAR'}
          </Button>
        </div>
         <p className="text-center text-sm text-muted-foreground pt-4">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-semibold text-blue-600 hover:underline">
              Masuk di sini
            </Link>
          </p>
      </form>
    </div>
  );
}
