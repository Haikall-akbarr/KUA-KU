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
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, UserX, UserCheck } from "lucide-react"

type Staff = {
  id: string
  nip: string
  name: string
  bagian: string
  jabatan: string
  phone: string
  email: string
  status: "Aktif" | "Nonaktif"
}

export function StaffTable() {
  const [staff, setStaff] = React.useState<Staff[]>([]);

  React.useEffect(() => {
    // Load staff data from localStorage
    try {
      const storedStaff = JSON.parse(localStorage.getItem('staff') || '[]');
      setStaff(storedStaff);
    } catch (error) {
      console.error('Error loading staff data:', error);
    }
  }, []);

  const toggleStatus = (staffId: string) => {
    try {
      const updatedStaff = staff.map(s => {
        if (s.id === staffId) {
          return {
            ...s,
            status: (s.status === 'Aktif' ? 'Nonaktif' : 'Aktif') as "Aktif" | "Nonaktif"
          };
        }
        return s;
      });

      setStaff(updatedStaff as typeof staff);
      localStorage.setItem('staff', JSON.stringify(updatedStaff));

      // Update user status in users collection
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map((u: any) => {
        if (u.id === staffId) {
          return {
            ...u,
            status: updatedStaff.find(s => s.id === staffId)?.status
          };
        }
        return u;
      });
      localStorage.setItem('users', JSON.stringify(updatedUsers));

    } catch (error) {
      console.error('Error updating staff status:', error);
      alert('Gagal mengubah status staff');
    }
  };

  if (!staff.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Belum ada data staff.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>NIP</TableHead>
          <TableHead>Nama</TableHead>
          <TableHead>Bagian</TableHead>
          <TableHead>Jabatan</TableHead>
          <TableHead>Kontak</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {staff.map((s) => (
          <TableRow key={s.id}>
            <TableCell>{s.nip}</TableCell>
            <TableCell>{s.name}</TableCell>
            <TableCell>{s.bagian}</TableCell>
            <TableCell>{s.jabatan}</TableCell>
            <TableCell>
              <div className="space-y-1">
                <div className="text-sm">{s.phone}</div>
                <div className="text-xs text-muted-foreground">{s.email}</div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={s.status === 'Aktif' ? 'default' : 'secondary'}>
                {s.status}
              </Badge>
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
                  <DropdownMenuItem onClick={() => toggleStatus(s.id)}>
                    {s.status === 'Aktif' ? (
                      <>
                        <UserX className="mr-2 h-4 w-4" />
                        <span>Nonaktifkan</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="mr-2 h-4 w-4" />
                        <span>Aktifkan</span>
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}