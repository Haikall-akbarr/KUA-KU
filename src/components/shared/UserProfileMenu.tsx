'use client';

import { useState, useEffect } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { UserCircle, LogOut, Loader2, FileText } from "lucide-react";
import Link from "next/link";
import { getProfile } from "@/lib/simnikah-api";

interface ProfileData {
    user_id: string;
    username: string;
    email: string;
    role: string;
    nama: string;
}

export function UserProfileMenu() {
    const { token, logout } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const result = await getProfile();
                
                // Validate response structure
                if (!result || !result.user) {
                    console.warn('⚠️ Invalid profile response structure:', result);
                    // Try to use user from localStorage as fallback
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        try {
                            const user = JSON.parse(storedUser);
                            setProfile({
                                user_id: user.user_id || '',
                                username: user.username || '',
                                email: user.email || '',
                                role: user.role || '',
                                nama: user.nama || 'User',
                            });
                        } catch (parseErr) {
                            console.error('Error parsing stored user:', parseErr);
                        }
                    }
                    return;
                }
                
                setProfile(result.user);
            } catch (err: any) {
                console.error('Error fetching profile:', err);
                
                // Try to use user from localStorage as fallback
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    try {
                        const user = JSON.parse(storedUser);
                        setProfile({
                            user_id: user.user_id || '',
                            username: user.username || '',
                            email: user.email || '',
                            role: user.role || '',
                            nama: user.nama || 'User',
                        });
                    } catch (parseErr) {
                        console.error('Error parsing stored user:', parseErr);
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [token]);

    const handleLogout = () => {
        document.cookie = 'token=; path=/; max-age=0';
        logout();
    };

    if (loading) {
        return (
            <Button variant="ghost" size="icon" disabled>
                <Loader2 className="h-5 w-5 animate-spin" />
            </Button>
        );
    }

    if (!profile) {
        return (
            <Button variant="ghost" asChild>
                <Link href="/login">
                    Login
                </Link>
            </Button>
        );
    }

    const initials = profile.nama
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();

    return (
        <div className="flex items-center gap-2">
            <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{profile.nama}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {profile.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href="/profile" className="w-full cursor-pointer">
                            <UserCircle className="mr-2 h-4 w-4" />
                            <span>Profil Saya</span>
                        </Link>
                    </DropdownMenuItem>
                    {profile.role === 'user_biasa' && (
                        <DropdownMenuItem asChild>
                            <Link href="/pendaftaran/status" className="w-full cursor-pointer">
                                <FileText className="mr-2 h-4 w-4" />
                                <span>Status Pendaftaran</span>
                            </Link>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        </div>
    );
}