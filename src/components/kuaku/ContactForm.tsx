
"use client";

import { useFormStatus } from "react-dom";
import { useEffect, useRef, useActionState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { submitContactForm, type ContactFormState } from "@/app/actions";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SendHorizonal } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nama minimal 2 karakter." }),
  email: z.string().email({ message: "Format email tidak valid." }),
  subject: z.string().optional(),
  message: z.string().min(10, { message: "Pesan minimal 10 karakter." }),
});

type FormData = z.infer<typeof formSchema>;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Mengirim...
        </>
      ) : (
        <>
          <SendHorizonal className="mr-2 h-4 w-4" />
          Kirim Pesan
        </>
      )}
    </Button>
  );
}

export function ContactForm() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const initialState: ContactFormState = { message: "", success: false };
  const [state, formAction] = useActionState(submitContactForm, initialState);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Berhasil!" : "Oops!",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
      if (state.success) {
        form.reset();
        formRef.current?.reset(); // Also reset the native form element
      }
    }
  }, [state, toast, form]);

  return (
    <SectionWrapper id="inquire" title="Ada Pertanyaan?" subtitle="Formulir Kontak">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Kirim Pesan Anda</CardTitle>
          <CardDescription>
            Kami akan merespons sesegera mungkin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="John Doe"
                  aria-invalid={form.formState.errors.name || state.errors?.name ? "true" : "false"}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
                {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Alamat Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="anda@email.com"
                  aria-invalid={form.formState.errors.email || state.errors?.email ? "true" : "false"}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
                 {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subjek (Opsional)</Label>
              <Input
                id="subject"
                {...form.register("subject")}
                placeholder="Pertanyaan tentang layanan"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Pesan Anda</Label>
              <Textarea
                id="message"
                {...form.register("message")}
                placeholder="Tuliskan pesan Anda di sini..."
                rows={5}
                aria-invalid={form.formState.errors.message || state.errors?.message ? "true" : "false"}
              />
              {form.formState.errors.message && (
                <p className="text-sm text-destructive">{form.formState.errors.message.message}</p>
              )}
              {state.errors?.message && <p className="text-sm text-destructive">{state.errors.message[0]}</p>}
            </div>
            <div className="flex justify-end">
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </SectionWrapper>
  );
}
