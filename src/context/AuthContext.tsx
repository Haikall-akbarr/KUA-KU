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
    try {
      // --- PERBAIKAN: Karakter '_' yang nyasar telah dihapus ---
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (storedUser && storedToken) {
        const parsedUser: ApiUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        setUserRole(parsedUser.role);
      }
    } catch (error) {
      console.error("Gagal memuat auth dari localStorage", error);
      // Hapus data korup jika ada
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setLoading(false); // Selesai loading
    }
  }, []);

  // Fungsi untuk dipanggil dari LoginForm
  const login = (apiUser: ApiUser, apiToken: string) => {
    setUser(apiUser);
    setToken(apiToken);
    setUserRole(apiUser.role);
    
    // Simpan ke localStorage
    localStorage.setItem('user', JSON.stringify(apiUser));
    localStorage.setItem('token', apiToken);
  };

  // Fungsi untuk logout
  const logout = () => {
    setUser(null);
    setToken(null);
    setUserRole(null);
    
    // Hapus dari localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
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