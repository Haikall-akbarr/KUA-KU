
"use client";

import React, { useEffect, useRef, useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { id as IndonesianLocale } from 'date-fns/locale';
import { CalendarIcon, Loader2, User, Users } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { submitMarriageRegistrationForm, type MarriageRegistrationFormState } from "@/app/daftar-nikah/actions";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "../ui/separator";

const formSchema = z.object({
  fullName: z.string().min(3, { message: "Nama lengkap minimal 3 karakter." }),
  nik: z.string().length(16, { message: "NIK harus 16 digit." }).regex(/^\d+$/, { message: "NIK hanya boleh berisi angka." }),
  phoneNumber: z.string().min(10, { message: "Nomor telepon minimal 10 digit." }).regex(/^08\d{8,}$/, { message: "Format nomor telepon tidak valid (contoh: 081234567890)."}),
  email: z.string().email({ message: "Format email tidak valid." }),
  partnerFullName: z.string().min(3, { message: "Nama pasangan minimal 3 karakter." }),
  plannedWeddingDate: z.date({ required_error: "Tanggal rencana akad wajib diisi." }),
});

type FormData = z.infer<typeof formSchema>;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Memproses...
        </>
      ) : (
        "Dapatkan Nomor Antrean Nikah"
      )}
    </Button>
  );
}

export function MarriageRegistrationForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [weddingDateOpen, setWeddingDateOpen] = React.useState(false);
  const { toast } = useToast();

  const initialState: MarriageRegistrationFormState = { message: "", success: false };
  const [state, formAction] = useActionState(submitMarriageRegistrationForm, initialState);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      nik: "",
      phoneNumber: "",
      email: "",
      partnerFullName: "",
      plannedWeddingDate: undefined,
    },
  });

  useEffect(() => {
    if (state.message) {
      if (state.success && state.data && state.queueNumber) {
        toast({
          title: "Berhasil!",
          description: state.message,
          variant: "default",
        });

        const params = new URLSearchParams({
          ...state.data,
          queueNumber: state.queueNumber,
        });
        router.push(`/daftar-nikah/sukses?${params.toString()}`);
        
        form.reset(); 
      } else if (!state.success) {
        toast({
          title: "Pendaftaran Gagal",
          description: state.message + (state.errors?._form ? ` ${state.errors._form.join(', ')}` : ''),
          variant: "destructive",
        });
        if (state.errors) {
          Object.keys(state.errors).forEach((key) => {
            const fieldName = key as keyof FormData;
            const errorMessages = state.errors![fieldName as keyof typeof state.errors];
            if (form.getFieldState(fieldName) && errorMessages) {
              form.setError(fieldName, { type: 'server', message: errorMessages[0] });
            }
          });
        }
      }
    }
  }, [state, toast, form, router]);

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Formulir Pendaftaran Nikah</CardTitle>
        <CardDescription>
          Isi data di bawah sesuai dengan dokumen yang berlaku.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          action={formAction}
          className="space-y-6"
        >
          {/* Data Pemohon */}
          <div className="space-y-4">
            <h3 className="flex items-center font-semibold text-lg text-primary"><User className="mr-2 h-5 w-5"/>Data Diri Pemohon</h3>
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap Pemohon (sesuai KTP)</Label>
              <Input id="fullName" {...form.register("fullName")} placeholder="Nama Lengkap Anda" />
              {state.errors?.fullName && <p className="text-sm text-destructive">{state.errors.fullName[0]}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nik">Nomor Induk Kependudukan (NIK)</Label>
              <Input id="nik" {...form.register("nik")} placeholder="16 digit NIK" type="text" maxLength={16} />
              {state.errors?.nik && <p className="text-sm text-destructive">{state.errors.nik[0]}</p>}
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                 <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Nomor Telepon Aktif</Label>
                    <Input id="phoneNumber" {...form.register("phoneNumber")} placeholder="08123456xxxx" type="tel" />
                    {state.errors?.phoneNumber && <p className="text-sm text-destructive">{state.errors.phoneNumber[0]}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Alamat Email</Label>
                    <Input id="email" {...form.register("email")} placeholder="anda@email.com" type="email" />
                    {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
                </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Data Pasangan dan Akad */}
           <div className="space-y-4">
             <h3 className="flex items-center font-semibold text-lg text-primary"><Users className="mr-2 h-5 w-5"/>Data Pasangan & Akad</h3>
             <div className="space-y-2">
                <Label htmlFor="partnerFullName">Nama Lengkap Calon Pasangan (sesuai KTP)</Label>
                <Input id="partnerFullName" {...form.register("partnerFullName")} placeholder="Nama Lengkap Calon Pasangan" />
                {state.errors?.partnerFullName && <p className="text-sm text-destructive">{state.errors.partnerFullName[0]}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="plannedWeddingDate">Tanggal Rencana Akad Nikah</Label>
              <Popover open={weddingDateOpen} onOpenChange={setWeddingDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("plannedWeddingDate") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("plannedWeddingDate") ? format(form.watch("plannedWeddingDate")!, "PPP", { locale: IndonesianLocale }) : <span>Pilih tanggal rencana akad</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch("plannedWeddingDate")}
                    onSelect={(date) => {
                        form.setValue("plannedWeddingDate", date || undefined, { shouldValidate: true });
                        setWeddingDateOpen(false);
                    }}
                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() + 10))} // Minimum 10 days from now
                    initialFocus
                    locale={IndonesianLocale}
                  />
                </PopoverContent>
              </Popover>
              <input type="hidden" {...form.register("plannedWeddingDate")} value={form.watch("plannedWeddingDate") ? format(form.watch("plannedWeddingDate")!, "yyyy-MM-dd") : ""} />
               {state.errors?.plannedWeddingDate && <p className="text-sm text-destructive">{state.errors.plannedWeddingDate[0]}</p>}
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
