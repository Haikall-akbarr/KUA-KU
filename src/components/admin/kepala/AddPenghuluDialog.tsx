"use client"

import { useState, useEffect } from "react"
import { useAuth } from '@/context/AuthContext';
import { isKepalaKUA, getUnauthorizedMessage } from '@/lib/role-guards';
import { createPenghulu, handleApiError } from '@/lib/simnikah-api';
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

interface AddPenghuluDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddPenghuluDialog({ open, onOpenChange, onSuccess }: AddPenghuluDialogProps) {
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
      setErrorMessage(getUnauthorizedMessage('CREATE_PENGHULU'));
      onOpenChange(false);
    }
  }, [open, userRole, onOpenChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      console.log('📤 Creating penghulu via API:', {
        username: formData.username,
        email: formData.email,
        nama: formData.nama,
        nip: formData.nip
      });

      // Call createPenghulu API
      const data = await createPenghulu({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        nama: formData.nama,
        nip: formData.nip || formData.username, // Use username as NIP if not provided
        no_hp: formData.no_hp || undefined,
        alamat: formData.alamat || undefined
      });

      console.log('✅ API Response:', data);

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

      const penghuluName = data.data?.penghulu?.nama || data.penghulu?.nama || formData.nama;
      const penghuluUsername = data.data?.penghulu?.username || data.penghulu?.username || formData.username;
      
      setSuccessMessage(`✅ Penghulu ${penghuluName} berhasil didaftarkan! Username: ${penghuluUsername}, Password: ${formData.password}`);
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        onOpenChange(false);
        onSuccess();
        setSuccessMessage('');
      }, 2000);

    } catch (error) {
      console.error('❌ Error adding penghulu:', error);
      const errorMsg = handleApiError(error);
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Penghulu Baru</DialogTitle>
          <DialogDescription>
            Isi data penghulu baru. Akun akan didaftarkan langsung ke sistem dengan username dan password default.
          </DialogDescription>
        </DialogHeader>

        {successMessage && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username <span className="text-destructive">*</span></Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="contoh: penghulu1"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">Username untuk login sistem</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nama">Nama Lengkap <span className="text-destructive">*</span></Label>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              placeholder="contoh: Penghulu1 KUA"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contoh: penghulu1@gmail.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="text"
              value={formData.password}
              disabled
              className="bg-gray-100"
            />
            <p className="text-xs text-muted-foreground">Password default: password123</p>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              Penghulu dapat langsung login dengan username dan password di atas setelah pendaftaran berhasil.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => onOpenChange(false)} 
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mendaftarkan...
                </>
              ) : (
                'Daftarkan Penghulu'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}