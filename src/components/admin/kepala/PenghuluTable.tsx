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

type Penghulu = {
  id: string
  nip: string
  name: string
  phone: string
  email: string
  address: string
  status: "Aktif" | "Nonaktif"
}

export function PenghuluTable() {
  const [penghulus, setPenghulus] = React.useState<Penghulu[]>([]);

  React.useEffect(() => {
    // Load penghulu data from localStorage
    try {
      const storedPenghulus = JSON.parse(localStorage.getItem('penghulus') || '[]');
      setPenghulus(storedPenghulus);
    } catch (error) {
      console.error('Error loading penghulu data:', error);
    }
  }, []);

  const toggleStatus = (penghuluId: string) => {
    try {
      const updatedPenghulus = penghulus.map(p => {
        if (p.id === penghuluId) {
          return {
            ...p,
            status: (p.status === 'Aktif' ? 'Nonaktif' : 'Aktif') as "Aktif" | "Nonaktif"
          };
        }
        return p;
      });

      setPenghulus(updatedPenghulus as typeof penghulus);
      localStorage.setItem('penghulus', JSON.stringify(updatedPenghulus));

      // Update user status in users collection
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map((u: any) => {
        if (u.id === penghuluId) {
          return {
            ...u,
            status: updatedPenghulus.find(p => p.id === penghuluId)?.status
          };
        }
        return u;
      });
      localStorage.setItem('users', JSON.stringify(updatedUsers));

    } catch (error) {
      console.error('Error updating penghulu status:', error);
      alert('Gagal mengubah status penghulu');
    }
  };

  if (!penghulus.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Belum ada data penghulu.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>NIP</TableHead>
          <TableHead>Nama</TableHead>
          <TableHead>Kontak</TableHead>
          <TableHead>Alamat</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {penghulus.map((p) => (
          <TableRow key={p.id}>
            <TableCell>{p.nip}</TableCell>
            <TableCell>{p.name}</TableCell>
            <TableCell>
              <div className="space-y-1">
                <div className="text-sm">{p.phone}</div>
                <div className="text-xs text-muted-foreground">{p.email}</div>
              </div>
            </TableCell>
            <TableCell className="max-w-[200px] truncate" title={p.address}>
              {p.address}
            </TableCell>
            <TableCell>
              <Badge variant={p.status === 'Aktif' ? 'default' : 'secondary'}>
                {p.status}
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
                  <DropdownMenuItem onClick={() => toggleStatus(p.id)}>
                    {p.status === 'Aktif' ? (
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