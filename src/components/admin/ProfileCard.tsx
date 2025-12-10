'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { getProfile, handleApiError } from "@/lib/simnikah-api";
import api from '@/lib/api';

interface ProfileData {
    user_id: string;
    username: string;
    email: string;
    role: string;
    nama: string;
    profile_photo?: string | null;
}

export function ProfileCard() {
    const { token } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic client-side validation
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.type)) {
            setError('Tipe file tidak didukung. Gunakan JPG/PNG/WebP.');
            return;
        }
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setError('Ukuran file terlalu besar. Maksimal 5MB.');
            return;
        }

        setUploading(true);
        setError(null);
        try {
            const fd = new FormData();
            fd.append('photo', file);

            // Post directly to the simplified upload route
            const res = await api.post('/upload-photo', fd);

            const data = res.data;

            // handle variations in response structure
            const newUrl = data?.data?.user?.profile_photo || data?.data?.profile_photo || data?.profile_photo || data?.user?.profile_photo;
            if (newUrl && profile) {
                setProfile({ ...profile, profile_photo: newUrl });
            }
        } catch (err: any) {
            const msg = handleApiError(err);
            setError(msg || 'Gagal mengunggah foto');
        } finally {
            setUploading(false);
            // reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) {
                setError("Token tidak tersedia");
                setLoading(false);
                return;
            }

            try {
                const result = await getProfile();
                if (result.user) {
                    setProfile(result.user);
                    setError(null);
                } else {
                    throw new Error('User data tidak ditemukan dalam response');
                }
            } catch (err) {
                // Fallback ke localStorage jika API gagal
                try {
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        const user = JSON.parse(storedUser);
                        setProfile({
                            user_id: user.user_id || '',
                            username: user.username || user.email || '',
                            email: user.email || '',
                            role: user.role || '',
                            nama: user.nama || 'User',
                        });
                        setError(null);
                        console.warn('⚠️ Using user data from localStorage as fallback');
                    } else {
                        const errorMessage = handleApiError(err);
                        setError(errorMessage);
                    }
                } catch (parseError) {
                    const errorMessage = handleApiError(err);
                    setError(errorMessage);
                }
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
                    <div className="relative">
                        <Avatar className="h-16 w-16">
                            {profile.profile_photo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={profile.profile_photo} alt={profile.nama} className="h-16 w-16 object-cover rounded-full" />
                            ) : (
                                <AvatarFallback className="text-lg">
                                    {profile.nama
                                        .split(' ')
                                        .map(word => word[0])
                                        .join('')
                                        .toUpperCase()}
                                </AvatarFallback>
                            )}
                        </Avatar>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        <button type="button" onClick={triggerFileSelect} className="absolute -bottom-1 -right-1 bg-white border rounded-full p-1 shadow-sm text-xs">
                            {uploading ? '...' : 'Ubah'}
                        </button>
                    </div>
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