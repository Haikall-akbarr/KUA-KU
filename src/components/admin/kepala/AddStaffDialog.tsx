"use client"

import { useState, useEffect } from "react"
import { useAuth } from '@/context/AuthContext';
import { isKepalaKUA, getUnauthorizedMessage } from '@/lib/role-guards';
import { createStaff, handleApiError } from '@/lib/simnikah-api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AddStaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddStaffDialog({ open, onOpenChange, onSuccess }: AddStaffDialogProps) {
  const { userRole } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    nama: '',
    email: '',
    password: 'password123',
    nip: '',
    no_hp: '',
    alamat: ''
  });

  // Role guard - hanya Kepala KUA
  useEffect(() => {
    if (open && !isKepalaKUA(userRole)) {
      setErrorMessage(getUnauthorizedMessage('CREATE_STAFF'));
      onOpenChange(false);
    }
  }, [open, userRole, onOpenChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // console.log('📤 Creating staff via API:', {
        username: formData.username,
        email: formData.email,
        nama: formData.nama,
        nip: formData.nip
      });

      // Call createStaff API
      const data = await createStaff({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        nama: formData.nama,
        nip: formData.nip || formData.username, // Use username as NIP if not provided
        jabatan: 'Staff', // API mengharapkan: Staff, Penghulu, atau Kepala KUA
        bagian: 'Semua Bagian Pernikahan', // Auto-filled, tidak perlu dipilih user
        no_hp: formData.no_hp || undefined,
        alamat: formData.alamat || undefined
      });

      // console.log('✅ API Response:', data);

      // Reset form
      setFormData({
        username: '',
        nama: '',
        email: '',
        password: 'password123',
        nip: '',
        no_hp: '',
        alamat: ''
      });

      const staffName = data.data?.staff?.nama || data.staff?.nama || formData.nama;
      const staffUsername = data.data?.staff?.username || data.staff?.username || formData.username;
      
      setSuccessMessage(`✅ Staff ${staffName} berhasil didaftarkan! Username: ${staffUsername}, Password: ${formData.password}`);
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        onOpenChange(false);
        onSuccess();
        setSuccessMessage('');
      }, 2000);

    } catch (error) {
      console.error('❌ Error adding staff:', error);
      const errorMsg = handleApiError(error);
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Staff Baru</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk menambahkan staff baru ke sistem. Staff akan dapat login dengan kredensial yang dibuat.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Masukkan username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <Label htmlFor="nama">Nama Lengkap</Label>
            <Input
              id="nama"
              placeholder="Masukkan nama lengkap"
              value={formData.nama}
              onChange={(e) => setFormData({...formData, nama: e.target.value})}
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Masukkan email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              disabled={isSubmitting}
              required
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Menambahkan...' : 'Tambah Staff'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}