"use client"

import * as React from "react"
import { useAuth } from '@/context/AuthContext';
import { isKepalaKUA, getUnauthorizedMessage } from '@/lib/role-guards';
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
import { MoreHorizontal, UserCheck } from "lucide-react"
import { format } from "date-fns"
import { id as IndonesianLocale } from 'date-fns/locale'
import { AssignPenghuluDialog } from '@/components/admin/AssignPenghuluDialog'

interface PendingAssignmentsTableProps {
  data: any[]
}

export function PendingAssignmentsTable({ data }: PendingAssignmentsTableProps) {
  const { userRole } = useAuth();
  const [selectedRegistration, setSelectedRegistration] = React.useState<{
    id: string;
    registrationNumber?: string;
    groomName?: string;
    brideName?: string;
  } | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = React.useState(false);
  
  // Role guard - hanya Kepala KUA yang bisa assign penghulu
  const canAssign = isKepalaKUA(userRole);

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
              <TableCell>{registration.nomorPendaftaran || registration.id}</TableCell>
              <TableCell>{registration.groomName}</TableCell>
              <TableCell>{registration.brideName}</TableCell>
              <TableCell>
                {registration.weddingDate ? format(new Date(registration.weddingDate), "EEEE, dd MMMM yyyy", { locale: IndonesianLocale }) : '-'}
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
                    <DropdownMenuItem 
                      onClick={() => {
                        if (!canAssign) {
                          alert(getUnauthorizedMessage('ASSIGN_PENGHULU'));
                          return;
                        }
                        setSelectedRegistration({
                          id: registration.id,
                          registrationNumber: registration.id,
                          groomName: registration.groomName,
                          brideName: registration.brideName,
                        });
                        setIsAssignDialogOpen(true);
                      }}
                      disabled={!canAssign}
                    >
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

      <AssignPenghuluDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        registrationId={selectedRegistration?.id || ''}
        registrationNumber={selectedRegistration?.registrationNumber}
        groomName={selectedRegistration?.groomName}
        brideName={selectedRegistration?.brideName}
        onSuccess={() => {
          // Reload page to show updated data
          window.location.reload();
        }}
      />
    </>
  );
}