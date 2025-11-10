"use client"

import { useState } from "react"
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
import { Loader2 } from "lucide-react"

interface AddPenghuluDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddPenghuluDialog({ open, onOpenChange, onSuccess }: AddPenghuluDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nip: '',
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create unique ID for the penghulu
      const penghuluId = `penghulu_${Date.now()}`;
      
      // Create penghulu object
      const penghuluData = {
        id: penghuluId,
        nip: formData.nip,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        status: 'Aktif',
        createdAt: new Date().toISOString()
      };

      // Get existing penghulus from localStorage
      const existingPenghulus = JSON.parse(localStorage.getItem('penghulus') || '[]');

      // Check for duplicate NIP
      if (existingPenghulus.some((p: any) => p.nip === formData.nip)) {
        throw new Error('NIP sudah terdaftar');
      }

      // Add new penghulu
      existingPenghulus.push(penghuluData);

      // Save back to localStorage
      localStorage.setItem('penghulus', JSON.stringify(existingPenghulus));

      // Create user account for penghulu
      const userData = {
        id: penghuluId,
        username: formData.nip, // Use NIP as username
        email: formData.email,
        name: formData.name,
        role: 'penghulu',
        createdAt: new Date().toISOString()
      };

      // Get existing users
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      existingUsers.push(userData);
      localStorage.setItem('users', JSON.stringify(existingUsers));

      // Reset form and close dialog
      setFormData({
        nip: '',
        name: '',
        phone: '',
        email: '',
        address: ''
      });
      
      onSuccess();

    } catch (error) {
      console.error('Error adding penghulu:', error);
      alert(error instanceof Error ? error.message : 'Gagal menambahkan penghulu');
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
            Isi data lengkap penghulu yang akan ditambahkan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nip">NIP <span className="text-destructive">*</span></Label>
            <Input
              id="nip"
              value={formData.nip}
              onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              placeholder="NIP Penghulu"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nama lengkap dengan gelar"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon <span className="text-destructive">*</span></Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Nomor telepon aktif"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email aktif"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Alamat <span className="text-destructive">*</span></Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Alamat lengkap"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}