'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
    user_id: string;
    username: string;
    email: string;
    role: string;
    nama: string;
}

export function ProfileCard() {
    const { token, login } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<any>({ nama: '', email: '', alamat: '', no_hp: '' });
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) {
                setError("Token tidak tersedia");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('https://simnikah-api-production.up.railway.app/profile', {
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
                <div className="flex items-center justify-between">
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
                    <div>
                        {!isEditing ? (
                            <Button onClick={() => { setIsEditing(true); setForm({ nama: profile.nama, email: profile.email, alamat: (profile as any).alamat || '', no_hp: (profile as any).no_hp || '' }); }}>Edit Profil</Button>
                        ) : (
                            <Button variant="ghost" onClick={() => setIsEditing(false)}>Batal</Button>
                        )}
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

                    {!isEditing ? (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                            <p>{profile.email}</p>
                        </div>
                    ) : (
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            if (!token) {
                                toast({ title: 'Gagal', description: 'Token tidak tersedia. Silakan login ulang.', variant: 'destructive' });
                                return;
                            }

                            setSaving(true);
                            const payload = { nama: form.nama, email: form.email, alamat: form.alamat, no_hp: form.no_hp };

                            const tryRequest = async (method: 'PUT' | 'PATCH') => {
                                try {
                                    const resp = await fetch('https://simnikah-api-production.up.railway.app/profile', {
                                        method,
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${token}`,
                                        },
                                        body: JSON.stringify(payload),
                                    });

                                    const text = await resp.text();
                                    let json: any = null;
                                    try { json = text ? JSON.parse(text) : null; } catch(e) { json = text; }

                                    if (!resp.ok) {
                                        const serverMsg = (json && (json.message || json.error)) ? (json.message || json.error) : null;
                                        const details = serverMsg || (typeof json === 'string' ? json : JSON.stringify(json || {}));
                                        const err = new Error(details || `HTTP ${resp.status}`);
                                        (err as any).status = resp.status;
                                        throw err;
                                    }

                                    return json;
                                } catch (err) {
                                    throw err;
                                }
                            };

                            try {
                                // First try PUT
                                let data = null;
                                try {
                                    data = await tryRequest('PUT');
                                } catch (putErr: any) {
                                    console.warn('PUT /profile failed:', putErr?.message || putErr);
                                    // If PUT not allowed or not found, try PATCH as fallback
                                    if ([404, 405].includes(putErr?.status) || String(putErr?.message).toLowerCase().includes('method')) {
                                        try {
                                            data = await tryRequest('PATCH');
                                        } catch (patchErr) {
                                            throw patchErr;
                                        }
                                    } else {
                                        throw putErr;
                                    }
                                }

                                const updated = data?.user || data;
                                setProfile(updated);

                                // Update auth context and localStorage
                                try {
                                    login(updated, token);
                                } catch (e) {
                                    localStorage.setItem('user', JSON.stringify(updated));
                                }

                                toast({ title: 'Berhasil', description: 'Profil berhasil diperbarui.' });
                                setIsEditing(false);
                            } catch (err: any) {
                                console.error('Update profile failed', err);
                                const msg = err?.message || (err?.toString && err.toString()) || 'Terjadi kesalahan saat memperbarui profil.';
                                toast({ title: 'Gagal memperbarui profil', description: msg, variant: 'destructive' });
                            } finally {
                                setSaving(false);
                            }
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="nama">Nama Lengkap</Label>
                                    <Input id="nama" value={form.nama} onChange={(e) => setForm((f:any) => ({ ...f, nama: e.target.value }))} />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" value={form.email} onChange={(e) => setForm((f:any) => ({ ...f, email: e.target.value }))} />
                                </div>
                                <div>
                                    <Label htmlFor="no_hp">Nomor HP</Label>
                                    <Input id="no_hp" value={form.no_hp} onChange={(e) => setForm((f:any) => ({ ...f, no_hp: e.target.value }))} />
                                </div>
                                <div>
                                    <Label htmlFor="alamat">Alamat</Label>
                                    <Textarea id="alamat" value={form.alamat} onChange={(e) => setForm((f:any) => ({ ...f, alamat: e.target.value }))} />
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
                                    <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Batal</Button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}