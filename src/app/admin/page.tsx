
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, CreditCard, Activity } from "lucide-react";

export const metadata: Metadata = {
    title: "Dashboard Admin - KUA Banjarmasin Utara",
    description: "Halaman utama dashboard administrasi.",
};

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pendaftaran Bulan Ini
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+120</div>
                        <p className="text-xs text-muted-foreground">
                            +15.2% dari bulan lalu
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Verifikasi Tertunda
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+15</div>
                        <p className="text-xs text-muted-foreground">
                            Perlu ditinjau segera
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jadwal Minggu Ini</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">24</div>
                        <p className="text-xs text-muted-foreground">
                            Total akad nikah & bimbingan
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Staf & Penghulu Aktif
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">
                           Total personel yang bertugas
                        </p>
                    </CardContent>
                </Card>
            </div>
            {/* Here you could add more components like Recent Sales or Overview chart */}
        </div>
    )
}
