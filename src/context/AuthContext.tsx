// src/context/AuthContext.tsx

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// --- Ini adalah SATU-SATUNYA sumber kebenaran untuk peran admin ---
export const ADMIN_ROLES = [
  'staff',
  'kepala_kua', 
  'administrator',
  'penghulu'
];
// ------------------------------------

// Definisikan tipe untuk User (berdasarkan respons API Anda)
interface ApiUser {
  user_id: string;
  nama: string;
  email: string;
  role: string;
}

// Definisikan tipe untuk Context
interface AuthContextType {
  user: ApiUser | null;
  userRole: string | null;
  token: string | null;
  loading: boolean;
  login: (user: ApiUser, token: string) => void;
  logout: () => void;
}

// Buat Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Buat Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Mulai dengan loading
  const router = useRouter();

  // Efek ini berjalan saat aplikasi dimuat:
  // Memeriksa localStorage untuk menjaga user tetap login
  useEffect(() => {
    let isMounted = true;
    
    // Add timeout to ensure loading never gets stuck
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('⚠️ AuthContext loading timeout - forcing loading to false');
        setLoading(false);
      }
    }, 3000); // 3 second timeout

    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      // --- PERBAIKAN: Karakter '_' yang nyasar telah dihapus ---
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (storedUser && storedToken) {
        try {
          const parsedUser: ApiUser = JSON.parse(storedUser);
          if (isMounted) {
            setUser(parsedUser);
            setToken(storedToken);
            setUserRole(parsedUser.role);
          }
        } catch (parseError) {
          console.error("Gagal parse user dari localStorage", parseError);
          // Hapus data korup jika ada
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error("Gagal memuat auth dari localStorage", error);
      // Hapus data korup jika ada
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } finally {
      clearTimeout(timeoutId);
      if (isMounted) {
        setLoading(false); // Selesai loading
      }
    }
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // Fungsi untuk dipanggil dari LoginForm
  const login = (apiUser: ApiUser, apiToken: string) => {
    // Validate user object before setting
    if (!apiUser || !apiUser.role || !apiUser.user_id) {
      console.error('❌ Invalid user object passed to login:', apiUser);
      throw new Error('Invalid user object: missing required fields (role, user_id)');
    }
    
    setUser(apiUser);
    setToken(apiToken);
    setUserRole(apiUser.role);
    
    // Simpan ke localStorage
    localStorage.setItem('user', JSON.stringify(apiUser));
    localStorage.setItem('token', apiToken);
    
    // Catatan: Redirect ditangani oleh LoginForm dengan setTimeout untuk memastikan
    // state sudah ter-update dan menghindari konflik redirect
  };

  // Fungsi untuk logout
  const logout = () => {
    // Simpan data registrasi yang ada sebelum logout
    const registrations = localStorage.getItem('marriageRegistrations');
    const notificationsBackup: { [key: string]: string | null } = {};
    
    // Simpan semua notifikasi user yang ada
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('notifications_')) {
        notificationsBackup[key] = localStorage.getItem(key);
      }
    }
    
    // Hapus data autentikasi
    setUser(null);
    setToken(null);
    setUserRole(null);
    
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Kembalikan data registrasi dan notifikasi
    if (registrations) {
      localStorage.setItem('marriageRegistrations', registrations);
    }
    
    // Kembalikan notifikasi
    for (const [key, value] of Object.entries(notificationsBackup)) {
      if (value) {
        localStorage.setItem(key, value);
      }
    }
    
    // Arahkan ke login
    router.push('/login');
  };

  const value = { user, userRole, token, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Buat Hook 'useAuth'
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};