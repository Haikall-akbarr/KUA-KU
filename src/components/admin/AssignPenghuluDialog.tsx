'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertCircle, UserCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { assignPenghulu, getAllPenghulu, handleApiError } from '@/lib/simnikah-api';

interface AssignPenghuluDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registrationId: string;
  registrationNumber?: string;
  groomName?: string;
  brideName?: string;
  onSuccess?: () => void;
}

export function AssignPenghuluDialog({
  open,
  onOpenChange,
  registrationId,
  registrationNumber,
  groomName,
  brideName,
  onSuccess,
}: AssignPenghuluDialogProps) {
  const [penghulus, setPenghulus] = useState<any[]>([]);
  const [selectedPenghuluId, setSelectedPenghuluId] = useState<string>('');
  const [catatan, setCatatan] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load penghulus when dialog opens
  useEffect(() => {
    if (open) {
      loadPenghulus();
    }
  }, [open]);

  const loadPenghulus = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getAllPenghulu();
      console.log('📋 Penghulus response:', response);
      
      // Handle different response structures
      let penghulusArray: any[] = [];
      if (Array.isArray(response.data)) {
        penghulusArray = response.data;
      } else if (response.data && Array.isArray(response.data.penghulu)) {
        penghulusArray = response.data.penghulu;
      } else if (Array.isArray(response)) {
        penghulusArray = response;
      }
      
      // Filter only active penghulus
      const activePenghulus = penghulusArray.filter((p: any) => 
        p.status === 'Aktif' || p.status === 'aktif' || !p.status
      );
      
      setPenghulus(activePenghulus);
      console.log('✅ Loaded penghulus:', activePenghulus.length);
    } catch (err: any) {
      console.error('Error loading penghulus:', err);
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPenghuluId) {
      setError('Silakan pilih penghulu terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Get selected penghulu
      const selectedPenghulu = penghulus.find(p => 
        p.id?.toString() === selectedPenghuluId || 
        p.user_id === selectedPenghuluId ||
        p.penghulu_id?.toString() === selectedPenghuluId
      );

      if (!selectedPenghulu) {
        throw new Error('Penghulu tidak ditemukan');
      }

      // Extract numeric ID for API
      const penghuluIdNum = selectedPenghulu.id || 
                           selectedPenghulu.penghulu_id || 
                           parseInt(selectedPenghuluId);

      // console.log('📤 Assigning penghulu:', {
        registrationId,
        penghuluId: penghuluIdNum,
        penghuluName: selectedPenghulu.nama_lengkap || selectedPenghulu.nama,
      });

      const response = await assignPenghulu(registrationId, {
        penghulu_id: typeof penghuluIdNum === 'string' 
          ? parseInt(penghuluIdNum.replace(/\D/g, '')) || parseInt(selectedPenghuluId.replace(/\D/g, ''))
          : penghuluIdNum,
        catatan: catatan || `Penghulu ${selectedPenghulu.nama_lengkap || selectedPenghulu.nama} ditugaskan untuk memverifikasi dokumen pendaftaran nikah`,
      });

      // console.log('✅ Assign response:', response);

      // Simpan data penghulu ke localStorage
      if (registrationNumber) {
        try {
          const stored = localStorage.getItem(`registration_${registrationNumber}`);
          if (stored) {
            const registrationData = JSON.parse(stored);
            registrationData.penghulu = {
              nama: selectedPenghulu.nama_lengkap || selectedPenghulu.nama,
              nama_lengkap: selectedPenghulu.nama_lengkap || selectedPenghulu.nama,
              id: penghuluIdNum,
            };
            localStorage.setItem(`registration_${registrationNumber}`, JSON.stringify(registrationData));
            console.log('✅ Penghulu data saved to localStorage:', registrationData.penghulu);
          } else {
            // Jika belum ada data, buat entry baru
            const registrationData = {
              nomor_pendaftaran: registrationNumber,
              penghulu: {
                nama: selectedPenghulu.nama_lengkap || selectedPenghulu.nama,
                nama_lengkap: selectedPenghulu.nama_lengkap || selectedPenghulu.nama,
                id: penghuluIdNum,
              },
            };
            localStorage.setItem(`registration_${registrationNumber}`, JSON.stringify(registrationData));
            console.log('✅ Created new registration entry with penghulu:', registrationData);
          }
        } catch (e) {
          console.warn('Failed to save penghulu to localStorage:', e);
        }
      }

      setSuccess(`✅ Penghulu ${selectedPenghulu.nama_lengkap || selectedPenghulu.nama} berhasil ditugaskan!`);
      
      // Reset form
      setSelectedPenghuluId('');
      setCatatan('');

      // Close dialog after 1.5 seconds
      setTimeout(() => {
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        } else {
          // Reload page to show updated data
          window.location.reload();
        }
      }, 1500);
    } catch (err: any) {
      console.error('Error assigning penghulu:', err);
      setError(handleApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedPenghuluId('');
      setCatatan('');
      setError('');
      setSuccess('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Assign Penghulu
          </DialogTitle>
          <DialogDescription>
            Pilih penghulu yang akan ditugaskan untuk memverifikasi pendaftaran ini.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Registration Info */}
            {(registrationNumber || groomName || brideName) && (
              <div className="bg-gray-50 p-3 rounded-md space-y-1 text-sm">
                {registrationNumber && (
                  <p><span className="font-medium">No. Pendaftaran:</span> {registrationNumber}</p>
                )}
                {groomName && (
                  <p><span className="font-medium">Calon Suami:</span> {groomName}</p>
                )}
                {brideName && (
                  <p><span className="font-medium">Calon Istri:</span> {brideName}</p>
                )}
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert className="border-green-500 bg-green-50">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-900">Berhasil</AlertTitle>
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            {/* Penghulu Selection */}
            <div className="space-y-2">
              <Label htmlFor="penghulu">Pilih Penghulu *</Label>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">Memuat data penghulu...</span>
                </div>
              ) : (
                <Select
                  value={selectedPenghuluId}
                  onValueChange={setSelectedPenghuluId}
                  disabled={isSubmitting || penghulus.length === 0}
                >
                  <SelectTrigger id="penghulu">
                    <SelectValue placeholder={penghulus.length === 0 ? 'Tidak ada penghulu tersedia' : 'Pilih penghulu'} />
                  </SelectTrigger>
                  <SelectContent>
                    {penghulus.map((penghulu) => {
                      const id = penghulu.id?.toString() || 
                                penghulu.user_id || 
                                penghulu.penghulu_id?.toString() || 
                                '';
                      const name = penghulu.nama_lengkap || penghulu.nama || 'Penghulu';
                      const nip = penghulu.nip || '-';
                      
                      return (
                        <SelectItem key={id} value={id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{name}</span>
                            <span className="text-xs text-muted-foreground">NIP: {nip}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
              {penghulus.length === 0 && !isLoading && (
                <p className="text-xs text-muted-foreground">
                  Tidak ada penghulu aktif. Silakan tambahkan penghulu terlebih dahulu.
                </p>
              )}
            </div>

            {/* Catatan */}
            <div className="space-y-2">
              <Label htmlFor="catatan">Catatan (Opsional)</Label>
              <Textarea
                id="catatan"
                placeholder="Tambahkan catatan untuk penugasan ini..."
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedPenghuluId || penghulus.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menugaskan...
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Assign Penghulu
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

