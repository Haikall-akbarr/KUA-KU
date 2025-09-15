
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { scheduleEvents } from '@/lib/admin-data';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const metadata: Metadata = {
  title: 'Manajemen Jadwal - KUA Banjarmasin Utara',
  description: 'Lihat dan kelola semua jadwal akad nikah dan bimbingan.',
};

export default function SchedulesPage() {
  const sortedEvents = [...scheduleEvents].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Jadwal</h1>
        <p className="text-muted-foreground">
          Kalender kegiatan akad nikah dan bimbingan perkawinan.
        </p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Jadwal Mendatang</CardTitle>
            <CardDescription>Daftar semua kegiatan yang telah dijadwalkan.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-6">
                {sortedEvents.map(event => {
                    const startDate = new Date(event.startTime);
                    return (
                        <div key={event.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                           <div className="flex flex-col items-center justify-center p-3 bg-primary/10 rounded-md text-primary">
                                <span className="text-2xl font-bold">{format(startDate, 'dd')}</span>
                                <span className="text-sm font-medium uppercase">{format(startDate, 'MMM', { locale: id })}</span>
                           </div>
                           <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg">{event.title}</h3>
                                        <div className="flex items-center text-sm text-muted-foreground gap-4 mt-1">
                                             <Badge variant={event.type === 'Akad Nikah' ? 'default' : 'secondary'}>{event.type}</Badge>
                                             <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3"/>
                                                <span>{format(startDate, 'HH:mm')} - {format(new Date(event.endTime), 'HH:mm')} WITA</span>
                                             </div>
                                        </div>
                                    </div>
                                    {event.penghulu && (
                                        <p className="text-sm text-muted-foreground hidden md:block">
                                            Penghulu: <span className="font-medium text-foreground">{event.penghulu}</span>
                                        </p>
                                    )}
                                </div>
                               {event.penghulu && (
                                    <p className="text-sm text-muted-foreground mt-2 md:hidden">
                                        Penghulu: <span className="font-medium text-foreground">{event.penghulu}</span>
                                    </p>
                                )}
                           </div>
                        </div>
                    )
                })}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
