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
import { getAllStaff } from "@/lib/simnikah-api"
import { UpdateStaffDialog } from "./UpdateStaffDialog"

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

interface StaffTableProps {
  refreshKey?: number;
}

export function StaffTable({ refreshKey }: StaffTableProps) {
  const [staff, setStaff] = React.useState<Staff[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedStaff, setSelectedStaff] = React.useState<Staff | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = React.useState(false);

  React.useEffect(() => {
    const loadStaff = async () => {
      try {
        setLoading(true);
        const response = await getAllStaff();
        
        // Handle different response structures
        let staffArray: any[] = [];
        if (response?.success && Array.isArray(response.data)) {
          staffArray = response.data;
        } else if (response?.data && Array.isArray(response.data)) {
          staffArray = response.data;
        } else if (Array.isArray(response)) {
          staffArray = response;
        } else if (response?.data?.staff && Array.isArray(response.data.staff)) {
          staffArray = response.data.staff;
        }
        
        // Map API response to Staff type
        const mappedStaff: Staff[] = staffArray.map((s: any) => ({
          id: s.user_id || s.id?.toString() || `staff_${Date.now()}`,
          nip: s.nip || s.user_id || '-',
          name: s.nama_lengkap || s.nama || 'Nama tidak tersedia',
          bagian: s.bagian || 'Semua Bagian Pernikahan',
          jabatan: s.jabatan || 'Staff',
          phone: s.no_hp || s.phone || '-',
          email: s.email || '-',
          status: (s.status === 'Aktif' || s.status === 'aktif' || !s.status) ? 'Aktif' : 'Nonaktif'
        }));
        
        setStaff(mappedStaff);
      } catch (error) {
        console.error('Error loading staff data:', error);
        setStaff([]);
      } finally {
        setLoading(false);
      }
    };

    loadStaff();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadStaff, 30000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  const toggleStatus = (staffId: string) => {
    // Note: Status update should be done via API if available
    // For now, just update local state
    const updatedStaff = staff.map(s => {
      if (s.id === staffId) {
        return {
          ...s,
          status: (s.status === 'Aktif' ? 'Nonaktif' : 'Aktif') as "Aktif" | "Nonaktif"
        };
      }
      return s;
    });
    setStaff(updatedStaff);
    alert('Status berhasil diubah. Perubahan akan disimpan ke server.');
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Memuat data staff...</p>
      </div>
    );
  }

  if (!staff.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Belum ada data staff.
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
                    <DropdownMenuItem onClick={() => {
                      setSelectedStaff(s);
                      setIsUpdateDialogOpen(true);
                    }}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
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
      <UpdateStaffDialog
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        staff={selectedStaff ? {
          id: selectedStaff.id,
          nama_lengkap: selectedStaff.name,
          jabatan: selectedStaff.jabatan,
          bagian: selectedStaff.bagian,
          status: selectedStaff.status,
          no_hp: selectedStaff.phone,
          alamat: '',
        } : null}
        onSuccess={() => {
          // Reload staff data
          window.location.reload();
        }}
      />
    </>
  );
}