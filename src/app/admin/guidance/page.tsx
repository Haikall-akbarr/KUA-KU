
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { guidanceSessions } from '@/lib/admin-data';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const metadata: Metadata = {
  title: 'Bimbingan Perkawinan - KUA Banjarmasin Utara',
  description: 'Kelola sesi bimbingan perkawinan untuk calon pengantin.',
};

export default function GuidancePage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bimbingan Perkawinan</h1>
          <p className="text-muted-foreground">
            Buat dan kelola sesi bimbingan perkawinan (Bimwin).
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Buat Sesi Baru
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {guidanceSessions.map(session => (
            <Card key={session.id} className="flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Calendar className="h-5 w-5 text-primary"/>
                        Sesi {format(new Date(session.sessionDate), 'dd MMMM yyyy', { locale: id })}
                    </CardTitle>
                    <CardDescription>
                        Status: <span className="font-medium text-foreground">{session.status}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground"/>
                        <p className="text-sm text-muted-foreground">
                           Peserta Terdaftar: <span className="font-bold text-foreground">{session.participants} / {session.maxCapacity}</span>
                        </p>
                    </div>
                    <div>
                        <Progress value={(session.participants / session.maxCapacity) * 100} className="h-2"/>
                    </div>
                </CardContent>
                <div className="p-6 pt-0">
                    <Button variant="outline" className="w-full">
                        Lihat Detail & Peserta
                    </Button>
                </div>
            </Card>
        ))}
      </div>
    </div>
  );
}
