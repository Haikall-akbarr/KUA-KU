'use client';

import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { sendNotificationToRole, SendNotificationToRoleRequest } from '@/lib/simnikah-api';
import { Loader2, Send } from 'lucide-react';

const sendNotificationSchema = z.object({
  role: z.enum(['user_biasa', 'staff', 'penghulu', 'kepala_kua']),
  judul: z.string().min(3, 'Judul minimal 3 karakter'),
  pesan: z.string().min(5, 'Pesan minimal 5 karakter'),
  tipe: z.enum(['Info', 'Success', 'Warning', 'Error']).optional(),
  tautan: z.string().url('URL tidak valid').optional().or(z.literal('')),
});

type SendNotificationFormData = z.infer<typeof sendNotificationSchema>;

interface SendNotificationToRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function SendNotificationToRoleDialog({
  open,
  onOpenChange,
  onSuccess,
}: SendNotificationToRoleDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SendNotificationFormData>({
    resolver: zodResolver(sendNotificationSchema),
    defaultValues: {
      role: 'user_biasa',
      judul: '',
      pesan: '',
      tipe: 'Info',
      tautan: '',
    },
  });

  const onSubmit = async (data: SendNotificationFormData) => {
    setIsSubmitting(true);
    try {
      const requestData: SendNotificationToRoleRequest = {
        role: data.role,
        judul: data.judul,
        pesan: data.pesan,
        tipe: data.tipe,
        ...(data.tautan && { tautan: data.tautan }),
      };

      await sendNotificationToRole(requestData);

      toast({
        title: 'Berhasil!',
        description: 'Notifikasi berhasil dikirim ke semua user dengan role tersebut',
        variant: 'default',
      });

      onOpenChange(false);
      form.reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Gagal',
        description: error.response?.data?.error || error.message || 'Gagal mengirim notifikasi',
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
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Kirim Notifikasi ke Role
          </DialogTitle>
          <DialogDescription>
            Kirim notifikasi ke semua user dengan role tertentu
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Target *</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user_biasa">User Biasa</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="penghulu">Penghulu</SelectItem>
                      <SelectItem value="kepala_kua">Kepala KUA</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Notifikasi</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Info">Info</SelectItem>
                      <SelectItem value="Success">Success</SelectItem>
                      <SelectItem value="Warning">Warning</SelectItem>
                      <SelectItem value="Error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="judul"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul *</FormLabel>
                  <FormControl>
                    <Input placeholder="Judul notifikasi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pesan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pesan *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Isi pesan notifikasi" 
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tautan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tautan (Opsional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="url"
                      placeholder="https://example.com/page" 
                      {...field} 
                    />
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
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Kirim Notifikasi
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

