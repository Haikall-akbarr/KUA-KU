
"use client";

import React, { useEffect, useRef, useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { id as IndonesianLocale } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { submitRegistrationForm, type RegistrationFormState } from "@/app/pendaftaran/actions";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  fullName: z.string().min(3, { message: "Nama lengkap minimal 3 karakter." }),
  nik: z.string().length(16, { message: "NIK harus 16 digit." }).regex(/^\d+$/, { message: "NIK hanya boleh berisi angka." }),
  placeOfBirth: z.string().min(2, { message: "Tempat lahir minimal 2 karakter." }),
  dateOfBirth: z.date({ required_error: "Tanggal lahir wajib diisi." }),
  phoneNumber: z.string().min(10, { message: "Nomor telepon minimal 10 digit." }).regex(/^08\d{8,}$/, { message: "Format nomor telepon tidak valid (contoh: 081234567890)."}),
  email: z.string().email({ message: "Format email tidak valid." }),
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
        "Dapatkan Nomor Pendaftaran"
      )}
    </Button>
  );
}

export function RegistrationForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [dateOfBirthOpen, setDateOfBirthOpen] = React.useState(false);
  const { toast } = useToast();

  const initialState: RegistrationFormState = { message: "", success: false };
  const [state, formAction] = useActionState(submitRegistrationForm, initialState);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      nik: "",
      placeOfBirth: "",
      dateOfBirth: undefined,
      phoneNumber: "",
      email: "",
    },
  });

  useEffect(() => {
    if (state.message) {
      if (state.success && state.data && state.registrationNumber) {
        toast({
          title: "Berhasil!",
          description: state.message,
          variant: "default",
        });

        // Redirect to success page with data
        const params = new URLSearchParams({
          ...state.data,
          registrationNumber: state.registrationNumber,
        });
        router.push(`/pendaftaran/sukses?${params.toString()}`);
        
        form.reset(); 
      } else if (!state.success) {
        toast({
          title: "Gagal Mendaftar",
          description: state.message + (state.errors?._form ? ` ${state.errors._form.join(', ')}` : ''),
          variant: "destructive",
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    if (state.errors) {
      const fieldErrors = state.errors;
      (Object.keys(fieldErrors) as Array<keyof typeof fieldErrors>).forEach((field) => {
        if (field !== '_form' && field in form.getValues()) {
            const typedField = field as keyof FormData;
            const message = fieldErrors[typedField]?.[0]
            if (message) {
                 form.setError(typedField, { type: 'server', message: message });
            }
        }
      });
    }
  }, [state.errors, form]);

  const onFormSubmit = (data: FormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value instanceof Date) {
            formData.append(key, value.toISOString().split('T')[0]); // Format as YYYY-MM-DD
        } else if (value !== undefined && value !== null) {
            formData.append(key, String(value));
        }
    });
    formAction(formData);
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Formulir Data Diri</CardTitle>
        <CardDescription>
          Lengkapi data berikut untuk mendapatkan nomor pendaftaran Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          action={(payload) => form.handleSubmit(onFormSubmit)(payload as any)}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="fullName">Nama Lengkap (sesuai KTP)</Label>
            <Input id="fullName" {...form.register("fullName")} placeholder="Nama Anda" />
            {form.formState.errors.fullName && <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nik">Nomor Induk Kependudukan (NIK)</Label>
            <Input id="nik" {...form.register("nik")} placeholder="16 digit NIK" type="text" maxLength={16} />
            {form.formState.errors.nik && <p className="text-sm text-destructive">{form.formState.errors.nik.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="placeOfBirth">Tempat Lahir</Label>
              <Input id="placeOfBirth" {...form.register("placeOfBirth")} placeholder="Kota Kelahiran" />
              {form.formState.errors.placeOfBirth && <p className="text-sm text-destructive">{form.formState.errors.placeOfBirth.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Tanggal Lahir</Label>
              <Popover open={dateOfBirthOpen} onOpenChange={setDateOfBirthOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("dateOfBirth") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("dateOfBirth") ? format(form.watch("dateOfBirth")!, "PPP", { locale: IndonesianLocale }) : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch("dateOfBirth")}
                    onSelect={(date) => {
                        form.setValue("dateOfBirth", date as any, { shouldValidate: true });
                        setDateOfBirthOpen(false);
                    }}
                    captionLayout="dropdown-buttons"
                    fromYear={1900}
                    toYear={new Date().getFullYear() - 17}
                    disabled={(date) => date > new Date(new Date().setFullYear(new Date().getFullYear() - 17)) || date < new Date("1900-01-01")}
                    initialFocus
                    locale={IndonesianLocale}
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.dateOfBirth && <p className="text-sm text-destructive">{form.formState.errors.dateOfBirth.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Nomor Telepon Aktif</Label>
            <Input id="phoneNumber" {...form.register("phoneNumber")} placeholder="08123456xxxx" type="tel" />
            {form.formState.errors.phoneNumber && <p className="text-sm text-destructive">{form.formState.errors.phoneNumber.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Alamat Email</Label>
            <Input id="email" {...form.register("email")} placeholder="anda@email.com" type="email" />
            {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
          </div>
          
          <div className="flex justify-end pt-2">
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
