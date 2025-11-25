
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { createStaff, createPenghulu } from '@/lib/simnikah-api';

// Sesuai dokumentasi API, hanya bisa membuat staff dan penghulu
const userRoles = ['Staff KUA', 'Penghulu'];

export function AddUserDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const { toast } = useToast();
  const { userRole } = useAuth();

  // Hanya kepala_kua yang bisa menambahkan pengguna
  if (userRole !== 'kepala_kua') {
    return <>{children}</>;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      // Sesuai dokumentasi API:
      // - POST /simnikah/kepala-kua/staff untuk membuat staff (endpoint #20)
      // - POST /simnikah/kepala-kua/penghulu untuk membuat penghulu (endpoint #21)
      if (data.role === 'Staff KUA') {
        await createStaff({
          username: (data.nip as string) || (data.name as string).toLowerCase().replace(/\s+/g, ''),
          email: data.email as string,
          password: 'password123', // Default password, bisa diubah nanti
          nama: data.name as string,
          nip: data.nip as string,
          jabatan: 'Staff', // API mengharapkan: Staff, Penghulu, atau Kepala KUA
          bagian: 'Semua Bagian Pernikahan', // Auto-filled, tidak perlu dipilih user
        });
      } else if (data.role === 'Penghulu') {
        await createPenghulu({
          username: (data.nip as string) || (data.name as string).toLowerCase().replace(/\s+/g, ''),
          email: data.email as string,
          password: 'password123', // Default password, bisa diubah nanti
          nama: data.name as string,
          nip: data.nip as string,
        });
      }

      toast({
        title: 'Pengguna Berhasil Dibuat',
        description: `Akun untuk ${data.name} dengan peran ${data.role} telah berhasil dibuat. Password default: password123`,
      });

      setOpen(false);
      setSelectedRole(''); // Reset role selection
      // Reload page to refresh user list
      window.location.reload();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: 'Gagal Membuat Pengguna',
        description: error.response?.data?.error || error.message || 'Terjadi kesalahan saat membuat pengguna.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          <DialogDescription>
            Isi detail di bawah ini untuk membuat akun baru. Kredensial login akan
            dikirim ke email pengguna.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nama
              </Label>
              <Input id="name" name="name" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nip" className="text-right">
                NIP/ID
              </Label>
              <Input id="nip" name="nip" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input id="email" name="email" type="email" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Peran
              </Label>
              <Select 
                name="role" 
                required
                onValueChange={(value) => setSelectedRole(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih Peran" />
                </SelectTrigger>
                <SelectContent>
                  {userRoles.map(role => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Bagian field - hidden, auto-filled for Staff KUA */}
            {selectedRole === 'Staff KUA' && (
              <input type="hidden" name="bagian" value="Semua Bagian Pernikahan" />
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Buat Pengguna
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
