'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { createFeedback, CreateFeedbackRequest } from '@/lib/simnikah-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Star, MessageSquare, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const feedbackSchema = z.object({
  jenis_feedback: z.enum(['Rating', 'Saran', 'Kritik', 'Laporan']),
  rating: z.number().min(1).max(5).optional(),
  judul: z.string().min(5, 'Judul minimal 5 karakter'),
  pesan: z.string().min(10, 'Pesan minimal 10 karakter'),
}).refine((data) => {
  if (data.jenis_feedback === 'Rating') {
    return data.rating !== undefined && data.rating >= 1 && data.rating <= 5;
  }
  return true;
}, {
  message: 'Rating wajib diisi untuk feedback Rating',
  path: ['rating'],
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
  pendaftaranId: number;
  onSuccess?: () => void;
}

export function FeedbackForm({ pendaftaranId, onSuccess }: FeedbackFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      jenis_feedback: 'Rating',
      rating: undefined,
      judul: '',
      pesan: '',
    },
  });

  const jenisFeedback = form.watch('jenis_feedback');

  const onSubmit = async (data: FeedbackFormData) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Anda harus login terlebih dahulu',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData: CreateFeedbackRequest = {
        pendaftaran_id: pendaftaranId,
        jenis_feedback: data.jenis_feedback,
        judul: data.judul,
        pesan: data.pesan,
        ...(data.jenis_feedback === 'Rating' && data.rating && { rating: data.rating }),
      };

      const response = await createFeedback(requestData);
      
      toast({
        title: 'Berhasil!',
        description: response.message || 'Feedback berhasil dikirim',
        variant: 'default',
      });

      setSubmitted(true);
      form.reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Gagal',
        description: error.response?.data?.error || error.message || 'Gagal mengirim feedback',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold">Terima Kasih!</h3>
            <p className="text-muted-foreground">
              Feedback Anda telah berhasil dikirim. Kami akan menindaklanjuti feedback Anda.
            </p>
            <Button onClick={() => setSubmitted(false)} variant="outline">
              Kirim Feedback Lain
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Berikan Feedback
        </CardTitle>
        <CardDescription>
          Bagikan pengalaman Anda setelah pernikahan. Feedback Anda sangat membantu kami untuk meningkatkan pelayanan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label>Jenis Feedback *</Label>
            <Select
              value={form.watch('jenis_feedback')}
              onValueChange={(value) => {
                form.setValue('jenis_feedback', value as any);
                if (value !== 'Rating') {
                  form.setValue('rating', undefined);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Rating">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Rating
                  </div>
                </SelectItem>
                <SelectItem value="Saran">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Saran
                  </div>
                </SelectItem>
                <SelectItem value="Kritik">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Kritik
                  </div>
                </SelectItem>
                <SelectItem value="Laporan">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Laporan
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.jenis_feedback && (
              <p className="text-sm text-red-500">
                {form.formState.errors.jenis_feedback.message}
              </p>
            )}
          </div>

          {jenisFeedback === 'Rating' && (
            <div className="space-y-2">
              <Label>Rating *</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    type="button"
                    variant={form.watch('rating') === rating ? 'default' : 'outline'}
                    onClick={() => form.setValue('rating', rating)}
                    className="flex-1"
                  >
                    <Star className={cn(
                      'h-4 w-4 mr-1',
                      form.watch('rating') === rating ? 'fill-current' : ''
                    )} />
                    {rating}
                  </Button>
                ))}
              </div>
              {form.formState.errors.rating && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.rating.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="judul">Judul *</Label>
            <Input
              id="judul"
              placeholder="Contoh: Pelayanan Sangat Baik"
              {...form.register('judul')}
            />
            {form.formState.errors.judul && (
              <p className="text-sm text-red-500">
                {form.formState.errors.judul.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pesan">Pesan *</Label>
            <Textarea
              id="pesan"
              placeholder="Tuliskan feedback Anda di sini..."
              rows={5}
              {...form.register('pesan')}
            />
            {form.formState.errors.pesan && (
              <p className="text-sm text-red-500">
                {form.formState.errors.pesan.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isSubmitting}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Kirim Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

