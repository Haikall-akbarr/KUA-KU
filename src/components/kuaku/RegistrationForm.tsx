
"use client";

import React, { useEffect, useRef, useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { id as IndonesianLocale } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

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
    // Keep form values even if defaultValues change after submission, unless reset explicitly
    resetOptions: {
      keepDirtyValues: true, // This might be relevant if defaultValues were dynamic
    },
  });

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "Berhasil!",
          description: (
            <>
              {state.message}
              {state.registrationNumber && (
                <>
                  <br />
                  Nomor Pendaftaran Anda: <strong className="font-bold text-primary">{state.registrationNumber}</strong>
                  <br/>Harap simpan nomor ini baik-baik.
                </>
              )}
            </>
          ),
          variant: "default",
        });
        form.reset(); // Reset react-hook-form state
        // formRef.current?.reset(); // Remove native form reset, rely on RHF reset
      } else {
        toast({
          title: "Gagal Mendaftar",
          description: state.message + (state.errors?._form ? ` ${state.errors._form.join(', ')}` : ''),
          variant: "destructive",
        });
        // Ensure server-side errors are set to react-hook-form to be displayed
        // and to mark fields as erroneous, which might help with visual state.
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
  }, [state, toast, form]);

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
          action={formAction}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="fullName">Nama Lengkap (sesuai KTP)</Label>
            <Input id="fullName" {...form.register("fullName")} placeholder="Nama Anda" />
            {form.formState.errors.fullName && <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>}
            {state.errors?.fullName && !form.formState.errors.fullName && <p className="text-sm text-destructive">{state.errors.fullName[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nik">Nomor Induk Kependudukan (NIK)</Label>
            <Input id="nik" {...form.register("nik")} placeholder="16 digit NIK" type="text" maxLength={16} />
            {form.formState.errors.nik && <p className="text-sm text-destructive">{form.formState.errors.nik.message}</p>}
            {state.errors?.nik && !form.formState.errors.nik && <p className="text-sm text-destructive">{state.errors.nik[0]}</p>}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="placeOfBirth">Tempat Lahir</Label>
              <Input id="placeOfBirth" {...form.register("placeOfBirth")} placeholder="Kota Kelahiran" />
              {form.formState.errors.placeOfBirth && <p className="text-sm text-destructive">{form.formState.errors.placeOfBirth.message}</p>}
              {state.errors?.placeOfBirth && !form.formState.errors.placeOfBirth && <p className="text-sm text-destructive">{state.errors.placeOfBirth[0]}</p>}
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
                        form.setValue("dateOfBirth", date || undefined, { shouldValidate: true });
                        // The hidden input will update automatically due to form.watch below
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
              {/* This hidden input sends the date to the server action, its value is reactive to form.watch */}
              <input type="hidden" {...form.register("dateOfBirth")} value={form.watch("dateOfBirth") ? format(form.watch("dateOfBirth")!, "yyyy-MM-dd") : ""} />
              {form.formState.errors.dateOfBirth && <p className="text-sm text-destructive">{form.formState.errors.dateOfBirth.message}</p>}
              {/* Show server error for dateOfBirth if not already shown by client validation */}
              {state.errors?.dateOfBirth && !form.formState.errors.dateOfBirth && <p className="text-sm text-destructive">{state.errors.dateOfBirth[0]}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Nomor Telepon Aktif</Label>
            <Input id="phoneNumber" {...form.register("phoneNumber")} placeholder="08123456xxxx" type="tel" />
            {form.formState.errors.phoneNumber && <p className="text-sm text-destructive">{form.formState.errors.phoneNumber.message}</p>}
            {state.errors?.phoneNumber && !form.formState.errors.phoneNumber && <p className="text-sm text-destructive">{state.errors.phoneNumber[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Alamat Email</Label>
            <Input id="email" {...form.register("email")} placeholder="anda@email.com" type="email" />
            {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
            {state.errors?.email && !form.formState.errors.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
          </div>
          
          <div className="flex justify-end pt-2">
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

    