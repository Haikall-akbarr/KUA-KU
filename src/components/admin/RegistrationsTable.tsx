
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
import { MoreHorizontal, PlusCircle, CheckCircle, XCircle, Clock, Check, HelpCircle } from "lucide-react"

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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

import type { MarriageRegistration } from "@/lib/admin-data"

const getStatusInfo = (status: MarriageRegistration["status"]) => {
    switch (status) {
        case 'Menunggu Verifikasi': return { variant: 'secondary', icon: Clock, label: 'Menunggu Verifikasi' };
        case 'Disetujui': return { variant: 'default', icon: CheckCircle, label: 'Disetujui' };
        case 'Ditolak': return { variant: 'destructive', icon: XCircle, label: 'Ditolak' };
        case 'Selesai': return { variant: 'outline', icon: Check, label: 'Selesai' };
        default: return { variant: 'outline', icon: HelpCircle, label: 'Unknown' };
    }
}

export const columns: ColumnDef<MarriageRegistration>[] = [
  {
    accessorKey: "id",
    header: "ID Pendaftaran",
  },
  {
    accessorKey: "groomName",
    header: "Calon Suami",
  },
  {
    accessorKey: "brideName",
    header: "Calon Istri",
  },
  {
    accessorKey: "weddingDate",
    header: "Tanggal Akad",
    cell: ({ row }) => {
        const date = new Date(row.getValue("weddingDate"))
        return <div>{date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric'})}</div>
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as MarriageRegistration["status"];
        const { variant, icon: Icon, label } = getStatusInfo(status);
        return <Badge variant={variant} className="flex items-center w-fit"><Icon className="mr-2 h-3 w-3" />{label}</Badge>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const registration = row.original
 
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
            <DropdownMenuItem>Lihat Detail Pendaftaran</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
                <DropdownMenuSubTrigger>Ubah Status</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                    <DropdownMenuItem>Setujui</DropdownMenuItem>
                    <DropdownMenuItem>Tolak</DropdownMenuItem>
                </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem>Assign Penghulu</DropdownMenuItem>
            <DropdownMenuItem>Terbitkan Surat</DropdownMenuItem>
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
  )
}
