
"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { users } from '@/lib/admin-data'; // Dummy data for roles

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: string | null; // Add userRole to context
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userRole: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        if (user) {
          // In a real app, you would get the role from Firestore/DB or custom claims
          // For now, we'll find the role from our dummy data
          const currentUserData = users.find(u => u.email === user.email);
          setUserRole(currentUserData ? currentUserData.role : 'Calon Pengantin');
        } else {
          setUserRole(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const value = { user, loading, userRole };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
