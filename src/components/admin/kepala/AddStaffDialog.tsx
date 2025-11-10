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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddStaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddStaffDialog({ open, onOpenChange, onSuccess }: AddStaffDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nip: '',
    name: '',
    phone: '',
    email: '',
    bagian: 'Pelayanan',
    jabatan: 'Staff'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      // Create staff data for API
      const staffData = {
        nip: formData.nip,
        nama_lengkap: formData.name,
        jabatan: formData.jabatan,
        bagian: formData.bagian,
        no_hp: formData.phone,
        email: formData.email,
        alamat: "Jl. Pangeran Antasari No. 123, Banjarmasin" // Default alamat
      };

      // Send request to create staff
      const response = await fetch('https://simnikah-api-production.up.railway.app/simnikah/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(staffData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal membuat akun staff');
      }

      const result = await response.json();

      // Save staff data to localStorage for local state management
      const localStaffData = {
        id: result.data.id,
        user_id: result.data.user_id,
        nip: result.data.nip,
        name: result.data.nama_lengkap,
        jabatan: result.data.jabatan,
        bagian: result.data.bagian,
        phone: staffData.no_hp,
        email: staffData.email,
        status: result.data.status,
        createdAt: new Date().toISOString()
      };

      // Update local storage
      const existingStaff = JSON.parse(localStorage.getItem('staff') || '[]');
      existingStaff.push(localStaffData);
      localStorage.setItem('staff', JSON.stringify(existingStaff));

      // Show success message with credentials
      const defaultPassword = "KUA2023!"; // Default password for new staff
      alert(`Akun staff berhasil dibuat!\n\nUsername: ${formData.nip}\nPassword: ${defaultPassword}\n\nMohon simpan informasi ini dan berikan kepada staff yang bersangkutan.`);

      // Subscribe to notifications for this staff
      const notificationSubscription = {
        user_id: result.data.user_id,
        type: "marriage_registration",
        enabled: true
      };

      // Save notification preferences
      const existingSubscriptions = JSON.parse(localStorage.getItem('notification_subscriptions') || '[]');
      existingSubscriptions.push(notificationSubscription);
      localStorage.setItem('notification_subscriptions', JSON.stringify(existingSubscriptions));

      // Reset form
      setFormData({
        nip: '',
        name: '',
        phone: '',
        email: '',
        bagian: 'Pelayanan',
        jabatan: 'Staff'
      });
      
      onSuccess();

    } catch (error) {
      console.error('Error adding staff:', error);
      alert(error instanceof Error ? error.message : 'Gagal menambahkan staff');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Staff KUA Baru</DialogTitle>
          <DialogDescription>
            Isi data lengkap staff yang akan ditambahkan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nip">NIP <span className="text-destructive">*</span></Label>
            <Input
              id="nip"
              value={formData.nip}
              onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              placeholder="NIP Staff"
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
            <Label htmlFor="bagian">Bagian <span className="text-destructive">*</span></Label>
            <Select
              value={formData.bagian}
              onValueChange={(value) => setFormData({ ...formData, bagian: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Bagian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pelayanan">Pelayanan</SelectItem>
                <SelectItem value="Administrasi">Administrasi</SelectItem>
                <SelectItem value="Pengarsipan">Pengarsipan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jabatan">Jabatan <span className="text-destructive">*</span></Label>
            <Select
              value={formData.jabatan}
              onValueChange={(value) => setFormData({ ...formData, jabatan: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Jabatan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Staff">Staff</SelectItem>
                <SelectItem value="Koordinator">Koordinator</SelectItem>
              </SelectContent>
            </Select>
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