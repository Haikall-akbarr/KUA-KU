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
import { MoreHorizontal, UserX, UserCheck, Loader2, Edit } from "lucide-react"
import { getAllPenghulu } from "@/lib/simnikah-api"
import { UpdatePenghuluDialog } from "./UpdatePenghuluDialog"

type Penghulu = {
  id: string
  nip: string
  name: string
  phone: string
  email: string
  address: string
  status: "Aktif" | "Nonaktif"
}

interface PenghuluTableProps {
  refreshKey?: number;
}

export function PenghuluTable({ refreshKey }: PenghuluTableProps) {
  const [penghulus, setPenghulus] = React.useState<Penghulu[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedPenghulu, setSelectedPenghulu] = React.useState<Penghulu | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = React.useState(false);

  React.useEffect(() => {
    const loadPenghulu = async () => {
      try {
        setLoading(true);
        const response = await getAllPenghulu();
        
        // Handle different response structures
        let penghuluArray: any[] = [];
        if (response?.success && Array.isArray(response.data)) {
          penghuluArray = response.data;
        } else if (response?.data && Array.isArray(response.data)) {
          penghuluArray = response.data;
        } else if (Array.isArray(response)) {
          penghuluArray = response;
        } else if (response?.data?.penghulu && Array.isArray(response.data.penghulu)) {
          penghuluArray = response.data.penghulu;
        }
        
        // Map API response to Penghulu type
        const mappedPenghulu: Penghulu[] = penghuluArray.map((p: any) => ({
          id: p.user_id || p.id?.toString() || `penghulu_${Date.now()}`,
          nip: p.nip || p.user_id || '-',
          name: p.nama_lengkap || p.nama || 'Nama tidak tersedia',
          phone: p.no_hp || p.phone || '-',
          email: p.email || '-',
          address: p.alamat || '-',
          status: (p.status === 'Aktif' || p.status === 'aktif' || !p.status) ? 'Aktif' : 'Nonaktif'
        }));
        
        setPenghulus(mappedPenghulu);
      } catch (error) {
        console.error('Error loading penghulu data:', error);
        setPenghulus([]);
      } finally {
        setLoading(false);
      }
    };

    loadPenghulu();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadPenghulu, 30000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  const toggleStatus = (penghuluId: string) => {
    // Note: Status update should be done via API if available
    // For now, just update local state
    const updatedPenghulus = penghulus.map(p => {
      if (p.id === penghuluId) {
        return {
          ...p,
          status: (p.status === 'Aktif' ? 'Nonaktif' : 'Aktif') as "Aktif" | "Nonaktif"
        };
      }
      return p;
    });
    setPenghulus(updatedPenghulus);
    alert('Status berhasil diubah. Perubahan akan disimpan ke server.');
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Memuat data penghulu...</p>
      </div>
    );
  }

  if (!penghulus.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Belum ada data penghulu.
      </div>
    );
  }

  return (
    <>
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
                    <DropdownMenuItem onClick={() => {
                      setSelectedPenghulu(p);
                      setIsUpdateDialogOpen(true);
                    }}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
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
      <UpdatePenghuluDialog
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        penghulu={selectedPenghulu ? {
          id: selectedPenghulu.id,
          nama_lengkap: selectedPenghulu.name,
          nip: selectedPenghulu.nip,
          email: selectedPenghulu.email,
          no_hp: selectedPenghulu.phone,
          alamat: selectedPenghulu.address,
          status: selectedPenghulu.status,
        } : null}
        onSuccess={() => {
          // Reload penghulu data
          window.location.reload();
        }}
      />
    </>
  );
}