'use client';

import { ProfileCard } from "@/components/admin/ProfileCard";

export default function ProfilePage() {
    return (
        <div className="container max-w-2xl py-10">
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profil Saya</h1>
                    <p className="text-muted-foreground">
                        Informasi akun dan profil Anda.
                    </p>
                </div>
                <ProfileCard />
            </div>
        </div>
    );
}