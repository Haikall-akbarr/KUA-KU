
"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { MarriageRegistration } from "@/lib/admin-data"
import { StatusDropdown } from "./StatusDropdown"
import { AssignPenghuluDialog } from "./AssignPenghuluDialog"

export const columns: ColumnDef<MarriageRegistration>[] = [
  {
    accessorKey: "id",
    header: "ID Pendaftaran",
  },
  {
    accessorKey: "groomName",
    header: "Calon Suami",
    cell: ({ row }) => {
      const name = row.getValue("groomName") as string | null;
      return <div className="font-medium">{name || 'Data tidak tersedia'}</div>;
    }
  },
  {
    accessorKey: "brideName",
    header: "Calon Istri",
    cell: ({ row }) => {
      const name = row.getValue("brideName") as string | null;
      return <div className="font-medium">{name || 'Data tidak tersedia'}</div>;
    }
  },
  {
    accessorKey: "weddingDate",
    header: "Tanggal Akad",
    cell: ({ row }) => {
        const weddingDate = row.getValue("weddingDate") as string;
        if (!weddingDate || weddingDate === '') return <div>-</div>;
        
        try {
            const date = new Date(weddingDate);
            if (isNaN(date.getTime())) {
                console.error("Invalid date:", weddingDate);
                return <div>Format tanggal tidak valid</div>;
            }
            return <div>{date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric'})}</div>;
        } catch (error) {
            console.error("Error parsing date:", error);
            return <div>Format tanggal tidak valid</div>;
        }
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row, table }) => {
        const registration = row.original;
        const status = row.getValue("status") as MarriageRegistration["status"];
        
        // Get user role
        let userRole: string | null = null;
        if (typeof window !== 'undefined') {
          try {
            const user = localStorage.getItem('user');
            if (user) {
              const userData = JSON.parse(user);
              userRole = userData.role || null;
            }
          } catch (error) {
            console.error('Error getting user role:', error);
          }
        }
        
        return (
          <StatusDropdown
            registrationId={registration.id}
            currentStatus={status}
            userRole={userRole}
            onStatusChange={(newStatus) => {
              // Update local data
              const updatedData = table.options.data.map((reg: MarriageRegistration) => 
                reg.id === registration.id ? { ...reg, status: newStatus } : reg
              );
              // Trigger table update (you might need to add state management for this)
              // For now, we'll reload the page
              setTimeout(() => window.location.reload(), 500);
            }}
          />
        );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const registration = row.original
      
      // Get user role for conditional rendering
      // Using useAuth hook would require making this a component, so we use localStorage directly
      let userRole: string | null = null;
      if (typeof window !== 'undefined') {
        try {
          const user = localStorage.getItem('user');
          if (user) {
            const userData = JSON.parse(user);
            userRole = userData.role || null;
          }
        } catch (error) {
          console.error('Error getting user role:', error);
        }
      }
      
      const canAssignPenghulu = userRole === 'kepala_kua';
      const canIssueLetter = userRole === 'kepala_kua';
 
      return (
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
              // TODO: Implement detail view
              alert('Fitur detail pendaftaran akan segera tersedia');
            }}>
              Lihat Detail Pendaftaran
            </DropdownMenuItem>
            {canAssignPenghulu && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  // This will be handled by the parent component via onAssignPenghulu callback
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('open-assign-penghulu', {
                      detail: {
                        registrationId: registration.id,
                        registrationNumber: registration.id,
                        groomName: registration.groomName,
                        brideName: registration.brideName,
                      }
                    }));
                  }
                }}>
                  Assign Penghulu
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

interface RegistrationsTableProps {
  data: MarriageRegistration[];
}

export function RegistrationsTable({ data }: RegistrationsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [assignDialogOpen, setAssignDialogOpen] = React.useState(false)
  const [selectedRegistration, setSelectedRegistration] = React.useState<{
    id: string;
    registrationNumber?: string;
    groomName?: string;
    brideName?: string;
  } | null>(null)

  // Listen for assign penghulu event
  React.useEffect(() => {
    const handleAssignEvent = (event: CustomEvent) => {
      setSelectedRegistration({
        id: event.detail.registrationId,
        registrationNumber: event.detail.registrationNumber,
        groomName: event.detail.groomName,
        brideName: event.detail.brideName,
      });
      setAssignDialogOpen(true);
    };

    window.addEventListener('open-assign-penghulu', handleAssignEvent as EventListener);
    return () => {
      window.removeEventListener('open-assign-penghulu', handleAssignEvent as EventListener);
    };
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
        pagination: {
            pageSize: 5,
        }
    }
  })

  return (
    <>
      <AssignPenghuluDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        registrationId={selectedRegistration?.id || ''}
        registrationNumber={selectedRegistration?.registrationNumber}
        groomName={selectedRegistration?.groomName}
        brideName={selectedRegistration?.brideName}
        onSuccess={() => {
          // Reload page to show updated data
          window.location.reload();
        }}
      />
      <div>
        <div className="flex items-center justify-between py-4">
            <Input
            placeholder="Cari berdasarkan nama..."
            value={(table.getColumn("groomName")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("groomName")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
            />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Selanjutnya
        </Button>
      </div>
    </div>
    </>
  )
}
