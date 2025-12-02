"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// --- PERBAIKAN: Impor ADMIN_ROLES dari Context ---
import { useAuth, ADMIN_ROLES } from '@/context/AuthContext'; 
import { z } from 'zod';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { login as loginAPI, handleApiError, LoginResponse } from '@/lib/simnikah-api';

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
  const { login: loginContext } = useAuth(); // Hook di dalam komponen (Sudah Benar)
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
      // Use login API from simnikah-api.ts
      const result: LoginResponse = await loginAPI({
        username: data.username,
        password: data.password,
      });

      // console.log('✅ Login Response:', result);

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
          id: 'penghulu-default-001',  // 🔑 IMPORTANT: Match dengan ID di PendingAssignmentsTable
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
        description: `Selamat datang kembali, ${result.user.nama}.`,
      });
      
      // Logika Pengarahan Berbasis Peran
      const userRole = result.user.role; 

      // Pengarahan berdasarkan role spesifik
      // Redirect dilakukan dengan setTimeout untuk memastikan state sudah ter-update
      setTimeout(() => {
        try {
          let redirectPath = '/';
          
          switch(userRole) {
            case 'kepala_kua':
              redirectPath = '/admin/kepala';
              break;
            case 'staff':
              redirectPath = '/admin/staff';
              break;
            case 'penghulu':
              redirectPath = '/penghulu';
              break;
            case 'administrator':
              redirectPath = '/admin';
              break;
            case 'user_biasa':
              redirectPath = '/';
              break;
            default:
              redirectPath = '/';
          }
          
          console.log(`🔄 Redirecting ${userRole} to: ${redirectPath}`);
          
          // For penghulu, use window.location.href directly for more reliable redirect
          // This ensures redirect works even if router.push has issues
          if (userRole === 'penghulu') {
            console.log('🔄 Penghulu login detected - redirecting to /penghulu');
            console.log('✅ Token saved, user saved, profile saved - redirecting now');
            // Use window.location.href directly for penghulu to ensure redirect works
            // This forces a full page reload which ensures all state is properly initialized
            window.location.href = redirectPath;
            return; // Exit early to prevent any further execution
          } else {
            // For other roles, use router.push
            router.push(redirectPath);
          }
        } catch (redirectError) {
          console.error('Error during redirect:', redirectError);
          // Fallback: force reload to dashboard
          const fallbackPath = userRole === 'penghulu' ? '/penghulu' : 
                              userRole === 'kepala_kua' ? '/admin/kepala' :
                              userRole === 'staff' ? '/admin/staff' :
                              userRole === 'administrator' ? '/admin' : '/';
          window.location.href = fallbackPath;
        }
      }, 150); // Increased delay to 150ms for better reliability
    } catch (error: any) {
      console.error('❌ Login Form Error:', error);
      
      let errorMessage = 'Gagal melakukan login. Silakan coba lagi.';
      
      // Prioritize error message from enhanced error
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data) {
        // Handle different response data types
        if (typeof error.response.data === 'string') {
          // Check if it's HTML
          const trimmed = error.response.data.trim();
          if (trimmed.startsWith('<') || trimmed.startsWith('<!')) {
            errorMessage = 'Server mengembalikan halaman error. Silakan coba lagi nanti.';
          } else {
            errorMessage = error.response.data;
          }
        } else if (typeof error.response.data === 'object') {
          errorMessage = error.response.data.error || error.response.data.message || errorMessage;
        }
      } else {
        // Use handleApiError as fallback
        errorMessage = handleApiError(error);
      }
      
      // Ensure we have a valid error message
      if (!errorMessage || errorMessage.trim() === '') {
        errorMessage = 'Gagal melakukan login. Silakan coba lagi.';
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
    <Card className="w-full max-w-md mx-auto relative">
      <div className="absolute top-4 right-4">
        <Image 
          alt="Kementerian Agama Logo"
          src="/logo-kemenag.png"
          width={40}
          height={40}
        />
      </div>
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold">Masuk</CardTitle>
        <CardDescription className="mt-1">Silakan masuk ke akun Anda untuk melanjutkan.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-sm font-medium">Username</Label>
            <Input
              id="username"
              type="text" 
              placeholder="Username Anda"
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
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password Anda"
                {...register('password')}
                disabled={isLoading}
                autoComplete="current-password"
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
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Masuk'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="pt-4 pb-0">
        <div className="flex flex-col items-center gap-3 w-full">
          <p className="text-center text-sm text-muted-foreground">
            Belum punya akun?
          </p>
          <Link href="/register" className="w-full">
            <Button variant="outline" className="w-full" type="button">
              Daftar di sini
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}