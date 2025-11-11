'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProfileData {
    user_id: string;
    username: string;
    email: string;
    role: string;
    nama: string;
}

export function ProfileCard() {
    const { token } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) {
                setError("Token tidak tersedia");
                setLoading(false);
                return;
            }

            try {
                const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://simnikah-api-production.up.railway.app';
                const response = await fetch(`${apiBase}/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Gagal mengambil data profil');
                }

                const data = await response.json();
                setProfile(data.user);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [token]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Memuat Profil...
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                    <CardDescription className="text-red-500">{error}</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (!profile) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Profil Tidak Tersedia</CardTitle>
                    <CardDescription>Data profil tidak ditemukan</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profil Pengguna</CardTitle>
                <CardDescription>Informasi akun Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-lg">
                            {profile.nama
                                .split(' ')
                                .map(word => word[0])
                                .join('')
                                .toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="text-xl font-semibold">{profile.nama}</h3>
                        <p className="text-sm text-muted-foreground">{profile.role}</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">ID Pengguna</p>
                        <p>{profile.user_id}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Username</p>
                        <p>{profile.username}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p>{profile.email}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}