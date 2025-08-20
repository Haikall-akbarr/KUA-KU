
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

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
    <Card className="w-full max-w-md">
       <CardHeader>
        <CardTitle className="text-2xl font-bold">Daftar Akun Baru</CardTitle>
        <CardDescription>Isi data di bawah untuk membuat akun</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                id="fullName"
                type="text"
                placeholder="Nama Lengkap Anda"
                {...register('fullName')}
                disabled={isLoading}
                />
                {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
            </div>
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
