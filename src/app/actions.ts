
"use server";

import { z } from "zod";

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Nama minimal 2 karakter." }),
  email: z.string().email({ message: "Format email tidak valid." }),
  subject: z.string().optional(),
  message: z.string().min(10, { message: "Pesan minimal 10 karakter." }),
});

export type ContactFormState = {
  message: string;
  errors?: {
    name?: string[];
    email?: string[];
    subject?: string[];
    message?: string[];
  };
  success: boolean;
};

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const validatedFields = contactFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
//syning infortia inforamtina si dini sdi sana  
  if (!validatedFields.success) {
    return {
      message: "Formulir tidak valid. Silakan periksa kembali isian Anda.",
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  // Simulate form submission (e.g., send email, save to database)
  // In a real app, you'd integrate with an email service or backend API here.
  console.log("Contact form submitted:", validatedFields.data);

  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    message: "Pesan Anda telah berhasil terkirim. Terima kasih!",
    success: true,
  };
}
