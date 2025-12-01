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
import { updateStaff, UpdateStaffRequest } from '@/lib/simnikah-api';
import { Loader2 } from 'lucide-react';

const updateStaffSchema = z.object({
  nama_lengkap: z.string().min(3, 'Nama minimal 3 karakter'),
  jabatan: z.string().min(1, 'Jabatan wajib diisi'),
  bagian: z.string().optional(),
  status: z.enum(['Aktif', 'Nonaktif']).optional(),
  no_hp: z.string().optional(),
  alamat: z.string().optional(),
});

type UpdateStaffFormData = z.infer<typeof updateStaffSchema>;

interface UpdateStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: {
    id: string | number;
    nama_lengkap?: string;
    jabatan?: string;
    bagian?: string;
    status?: string;
    no_hp?: string;
    alamat?: string;
  } | null;
  onSuccess?: () => void;
}

export function UpdateStaffDialog({
  open,
  onOpenChange,
  staff,
  onSuccess,
}: UpdateStaffDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateStaffFormData>({
    resolver: zodResolver(updateStaffSchema),
    defaultValues: {
      nama_lengkap: '',
      jabatan: '',
      bagian: '',
      status: 'Aktif',
      no_hp: '',
      alamat: '',
    },
  });

  // Update form when staff data changes
  useEffect(() => {
    if (staff && open) {
      form.reset({
        nama_lengkap: staff.nama_lengkap || '',
        jabatan: staff.jabatan || '',
        bagian: staff.bagian || '',
        status: (staff.status as 'Aktif' | 'Nonaktif') || 'Aktif',
        no_hp: staff.no_hp || '',
        alamat: staff.alamat || '',
      });
    }
  }, [staff, open, form]);

  const onSubmit = async (data: UpdateStaffFormData) => {
    if (!staff) return;

    setIsSubmitting(true);
    try {
      const requestData: UpdateStaffRequest = {
        nama_lengkap: data.nama_lengkap,
        jabatan: data.jabatan,
        ...(data.bagian && { bagian: data.bagian }),
        ...(data.status && { status: data.status }),
        ...(data.no_hp && { no_hp: data.no_hp }),
        ...(data.alamat && { alamat: data.alamat }),
      };

      await updateStaff(staff.id, requestData);

      toast({
        title: 'Berhasil!',
        description: 'Data staff berhasil diperbarui',
        variant: 'default',
      });

      onOpenChange(false);
      form.reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error updating staff:', error);
      toast({
        title: 'Gagal',
        description: error.response?.data?.error || error.message || 'Gagal memperbarui data staff',
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
          <DialogTitle>Update Data Staff</DialogTitle>
          <DialogDescription>
            Perbarui informasi staff KUA
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nama_lengkap"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama lengkap staff" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="jabatan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jabatan *</FormLabel>
                    <FormControl>
                      <Input placeholder="Jabatan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bagian"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bagian</FormLabel>
                    <FormControl>
                      <Input placeholder="Bagian" {...field} />
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
                  'Perbarui Staff'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

