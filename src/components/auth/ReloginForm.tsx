"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { login as loginAPI } from '@/lib/simnikah-api';
import type { LoginResponse } from '@/lib/simnikah-api';

const reloginSchema = z.object({
  password: z.string().min(1, { message: 'Password wajib diisi' }),
});

type ReloginInputs = z.infer<typeof reloginSchema>;

export function ReloginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, login: loginContext } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReloginInputs>({
    resolver: zodResolver(reloginSchema),
  });

  const onSubmit: SubmitHandler<ReloginInputs> = async (data) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Data user tidak ditemukan. Silakan login ulang.',
        variant: 'destructive',
      });
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      // Use login API with username from stored user
      // Try to get username from user object, fallback to email
      const username = (user as any).username || user.email || user.user_id;
      
      const result: LoginResponse = await loginAPI({
        username: username,
        password: data.password,
      });

      // console.log('✅ Relogin Response:', result);

      // Validate response structure
      if (!result || !result.user || !result.token) {
        throw new Error('Invalid login response: missing user or token');
      }

      // Validate user object has required fields
      if (!result.user.role || !result.user.user_id) {
        console.error('❌ Invalid user object:', result.user);
        throw new Error('Invalid user data: missing role or user_id');
      }

      // Simpan token ke cookies untuk digunakan oleh server actions
      document.cookie = `token=${result.token}; path=/; max-age=${24 * 60 * 60}`;

      // Simpan sesi login ke Context
      loginContext(result.user, result.token);

      // 🆕 Jika penghulu, simpan penghulu profile untuk assignment matching
      if (result.user.role === 'penghulu') {
        const penguluProfile = {
          id: 'penghulu-default-001',
          nama_lengkap: result.user.nama,
          email: result.user.email,
          role: result.user.role,
          nip: '199001011990101001'
        };
        localStorage.setItem('penghulu_profile', JSON.stringify(penguluProfile));
        console.log('✅ Penghulu profile saved:', penguluProfile);
      }

      toast({
        title: 'Login Berhasil!',
        description: 'Sesi Anda telah diperbarui. Selamat datang kembali!',
        variant: 'default',
      });

      // Redirect based on role
      setTimeout(() => {
        try {
          let redirectPath = '/';
          const userRole = result.user.role;

          if (userRole === 'penghulu') {
            redirectPath = '/penghulu';
          } else if (userRole === 'kepala_kua') {
            redirectPath = '/admin/kepala';
          } else if (userRole === 'staff') {
            redirectPath = '/admin/staff';
          } else if (userRole === 'administrator') {
            redirectPath = '/admin';
          } else {
            redirectPath = '/';
          }

          router.push(redirectPath);
        } catch (redirectError) {
          console.error('Error during redirect:', redirectError);
          // Fallback: force reload to dashboard
          const fallbackPath = result.user.role === 'penghulu' ? '/penghulu' : 
                              result.user.role === 'kepala_kua' ? '/admin/kepala' :
                              result.user.role === 'staff' ? '/admin/staff' :
                              result.user.role === 'administrator' ? '/admin' : '/';
          window.location.href = fallbackPath;
        }
      }, 150);
    } catch (error: any) {
      console.error('❌ Relogin Form Error:', error);
      
      let errorMessage = 'Password salah. Silakan coba lagi.';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data) {
        if (typeof error.response.data === 'string') {
          const trimmed = error.response.data.trim();
          if (trimmed.startsWith('<') || trimmed.startsWith('<!')) {
            errorMessage = 'Server mengembalikan halaman error. Silakan coba lagi nanti.';
          } else {
            errorMessage = error.response.data;
          }
        } else if (typeof error.response.data === 'object') {
          errorMessage = error.response.data.error || error.response.data.message || errorMessage;
        }
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

  if (!user) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sesi Tidak Valid</CardTitle>
          <CardDescription>
            Data user tidak ditemukan. Silakan login ulang.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/login')} className="w-full">
            Kembali ke Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Sesi Telah Berakhir</CardTitle>
        <CardDescription>
          Sesi Anda telah berakhir. Silakan masukkan password untuk melanjutkan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-muted p-3">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{user.nama}</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password Anda"
                className="pl-10"
                {...register('password')}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-sm text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                {showPassword ? 'Sembunyikan' : 'Tampilkan'}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              // Clear user data and redirect to login
              localStorage.removeItem('user');
              localStorage.removeItem('token');
              router.push('/login');
            }}
            className="text-sm text-muted-foreground hover:text-foreground"
            disabled={isLoading}
          >
            Login dengan akun lain
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

