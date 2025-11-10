'use client';

import { ProfileCard } from "@/components/admin/ProfileCard";

export default function ProfilePage() {
    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profil Saya</h1>
                <p className="text-muted-foreground">
                    Lihat dan kelola informasi profil Anda.
                </p>
            </div>
            <ProfileCard />
        </div>
    );
}