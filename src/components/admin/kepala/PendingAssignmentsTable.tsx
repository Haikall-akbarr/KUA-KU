"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, MoreHorizontal, UserCheck } from "lucide-react"
import { format } from "date-fns"
import { id as IndonesianLocale } from 'date-fns/locale'

interface PendingAssignmentsTableProps {
  data: any[]
}

export function PendingAssignmentsTable({ data }: PendingAssignmentsTableProps) {
  const [selectedRegistration, setSelectedRegistration] = React.useState<any>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = React.useState(false);
  const [isAssigning, setIsAssigning] = React.useState(false);
  const [penghulus, setPenghulus] = React.useState<any[]>([]);

  React.useEffect(() => {
    // Load available penghulus from localStorage
    try {
      const storedPenghulus = JSON.parse(localStorage.getItem('penghulus') || '[]');
      setPenghulus(storedPenghulus);
    } catch (error) {
      console.error('Error loading penghulus:', error);
    }
  }, []);

  const handleAssign = async (penghuluId: string) => {
    if (!selectedRegistration) return;

    setIsAssigning(true);
    try {
      // Get the selected penghulu
      const penghulu = penghulus.find(p => p.id === penghuluId);
      if (!penghulu) throw new Error('Penghulu tidak ditemukan');

      // Get all registrations
      const registrations = JSON.parse(localStorage.getItem('marriageRegistrations') || '[]');
      const index = registrations.findIndex((r: any) => r.id === selectedRegistration.id);
      
      if (index !== -1) {
        // Update the registration with penghulu assignment and new status
        registrations[index] = {
          ...registrations[index],
          penghulu: penghulu.name,
          penghuluId: penghulu.id,
          status: 'Menunggu Verifikasi Penghulu', // Change status from 'Disetujui' to 'Menunggu Verifikasi Penghulu'
          assignedAt: new Date().toISOString()
        };

        // Save back to localStorage
        localStorage.setItem('marriageRegistrations', JSON.stringify(registrations));

        // Add notification for the couple
        const userNotif = {
          id: `notif_${Date.now()}`,
          title: 'Penghulu Ditugaskan',
          description: `Penghulu ${penghulu.name} telah ditugaskan untuk acara nikah Anda.`,
          type: 'info',
          read: false,
          registrationId: selectedRegistration.id,
          createdAt: new Date().toISOString()
        };

        const notifications = JSON.parse(localStorage.getItem(`notifications_${selectedRegistration.id}`) || '[]');
        notifications.unshift(userNotif);
        localStorage.setItem(`notifications_${selectedRegistration.id}`, JSON.stringify(notifications));

        // Close dialog and refresh
        setIsAssignDialogOpen(false);
        window.location.reload();
      }
    } catch (error) {
      console.error('Error assigning penghulu:', error);
      alert('Gagal menugaskan penghulu. Silakan coba lagi.');
    } finally {
      setIsAssigning(false);
    }
  };

  if (!data.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Tidak ada pendaftaran yang membutuhkan penugasan penghulu.
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Pendaftaran</TableHead>
            <TableHead>Calon Suami</TableHead>
            <TableHead>Calon Istri</TableHead>
            <TableHead>Tanggal Nikah</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((registration) => (
            <TableRow key={registration.id}>
              <TableCell>{registration.id}</TableCell>
              <TableCell>{registration.groomName}</TableCell>
              <TableCell>{registration.brideName}</TableCell>
              <TableCell>
                {format(new Date(registration.weddingDate), "EEEE, dd MMMM yyyy", { locale: IndonesianLocale })}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Buka menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => {
                      setSelectedRegistration(registration);
                      setIsAssignDialogOpen(true);
                    }}>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Tugaskan Penghulu
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tugaskan Penghulu</DialogTitle>
            <DialogDescription>
              Pilih penghulu untuk ditugaskan pada acara nikah ini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {penghulus.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                Tidak ada penghulu yang tersedia.
              </p>
            ) : (
              <div className="grid gap-4">
                {penghulus.map((penghulu) => (
                  <Button
                    key={penghulu.id}
                    variant="outline"
                    className="justify-start"
                    disabled={isAssigning}
                    onClick={() => handleAssign(penghulu.id)}
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    {penghulu.name}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsAssignDialogOpen(false)} disabled={isAssigning}>
              Batal
            </Button>
            {isAssigning && (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menugaskan...
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}