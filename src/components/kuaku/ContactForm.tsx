
"use client";

import { useFormStatus } from "react-dom";
import { useEffect, useRef, useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { submitContactForm, type ContactFormState } from "@/app/actions";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SendHorizonal, Loader2 } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

  const initialState: ContactFormState = { message: "", success: false, errors: undefined };
  const [state, formAction] = useActionState(submitContactForm, initialState);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Berhasil!" : "Gagal Mengirim",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
      if (state.success) {
        formRef.current?.reset();
      }
    }
  }, [state, toast]);

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
                  name="name"
                  placeholder="John Doe"
                  aria-invalid={!!state.errors?.name}
                  aria-describedby={state.errors?.name ? "name-error" : undefined}
                />
                {state.errors?.name && <p id="name-error" className="text-sm text-destructive">{state.errors.name[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Alamat Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="anda@email.com"
                  aria-invalid={!!state.errors?.email}
                  aria-describedby={state.errors?.email ? "email-error" : undefined}
                />
                 {state.errors?.email && <p id="email-error" className="text-sm text-destructive">{state.errors.email[0]}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subjek (Opsional)</Label>
              <Input
                id="subject"
                name="subject"
                placeholder="Pertanyaan tentang layanan"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Pesan Anda</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Tuliskan pesan Anda di sini..."
                rows={5}
                aria-invalid={!!state.errors?.message}
                aria-describedby={state.errors?.message ? "message-error" : undefined}
              />
              {state.errors?.message && <p id="message-error" className="text-sm text-destructive">{state.errors.message[0]}</p>}
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
