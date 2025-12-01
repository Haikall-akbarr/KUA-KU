'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { updatePenghuluProfile } from '@/lib/simnikah-api';
import { Loader2 } from 'lucide-react';

const updatePenghuluSchema = z.object({
  nama_lengkap: z.string().min(3, 'Nama minimal 3 karakter').optional(),
  nip: z.string().optional(),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  no_hp: z.string().optional(),
  alamat: z.string().optional(),
  status: z.enum(['Aktif', 'Nonaktif']).optional(),
});

type UpdatePenghuluFormData = z.infer<typeof updatePenghuluSchema>;

interface UpdatePenghuluDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  penghulu: {
    id: string | number;
    nama_lengkap?: string;
    nip?: string;
    email?: string;
    no_hp?: string;
    alamat?: string;
    status?: string;
  } | null;
  onSuccess?: () => void;
}

export function UpdatePenghuluDialog({
  open,
  onOpenChange,
  penghulu,
  onSuccess,
}: UpdatePenghuluDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdatePenghuluFormData>({
    resolver: zodResolver(updatePenghuluSchema),
    defaultValues: {
      nama_lengkap: '',
      nip: '',
      email: '',
      no_hp: '',
      alamat: '',
      status: 'Aktif',
    },
  });

  // Update form when penghulu data changes
  useEffect(() => {
    if (penghulu && open) {
      form.reset({
        nama_lengkap: penghulu.nama_lengkap || '',
        nip: penghulu.nip || '',
        email: penghulu.email || '',
        no_hp: penghulu.no_hp || '',
        alamat: penghulu.alamat || '',
        status: (penghulu.status as 'Aktif' | 'Nonaktif') || 'Aktif',
      });
    }
  }, [penghulu, open, form]);

  const onSubmit = async (data: UpdatePenghuluFormData) => {
    if (!penghulu) return;

    setIsSubmitting(true);
    try {
      const requestData: any = {};
      
      if (data.nama_lengkap) requestData.nama_lengkap = data.nama_lengkap;
      if (data.nip) requestData.nip = data.nip;
      if (data.email) requestData.email = data.email;
      if (data.no_hp) requestData.no_hp = data.no_hp;
      if (data.alamat) requestData.alamat = data.alamat;
      if (data.status) requestData.status = data.status;

      await updatePenghuluProfile(penghulu.id, requestData);

      toast({
        title: 'Berhasil!',
        description: 'Data penghulu berhasil diperbarui',
        variant: 'default',
      });

      onOpenChange(false);
      form.reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error updating penghulu:', error);
      toast({
        title: 'Gagal',
        description: error.response?.data?.error || error.message || 'Gagal memperbarui data penghulu',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Data Penghulu</DialogTitle>
          <DialogDescription>
            Perbarui informasi penghulu
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nama_lengkap"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama lengkap penghulu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIP</FormLabel>
                  <FormControl>
                    <Input placeholder="NIP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="no_hp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. HP</FormLabel>
                    <FormControl>
                      <Input placeholder="081234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Aktif">Aktif</SelectItem>
                      <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alamat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat</FormLabel>
                  <FormControl>
                    <Input placeholder="Alamat lengkap" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memperbarui...
                  </>
                ) : (
                  'Perbarui Penghulu'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

