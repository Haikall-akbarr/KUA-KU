
"use client";

import Image from "next/image";

export function LoginInfoPanel() {
  return (
    <div className="relative hidden w-full overflow-hidden bg-primary p-8 text-white md:flex md:w-1/2 flex-col justify-center items-center">
        {/* Lottie Animation Placeholder */}
        <div className="w-full max-w-md">
            <Image
                src="https://placehold.co/400x400.png"
                alt="Ilustrasi Pernikahan"
                width={400}
                height={400}
                data-ai-hint="wedding couple"
            />
        </div>

        {/* Curved overlay shape */}
        <div className="absolute -right-48 -top-48 h-96 w-96 rounded-full bg-primary/50"></div>
        <div className="absolute -bottom-64 -left-32 h-[28rem] w-[28rem] rounded-full bg-accent/30"></div>

        <div className="relative z-10 flex h-full flex-col justify-between text-center mt-4">
            <div>
                <h1 className="font-headline text-4xl font-bold tracking-tight">
                    KUA Banjarmasin Utara
                </h1>
                <p className="mt-2 text-lg text-primary-foreground/80">
                    Melayani Masyarakat dengan Hati.
                </p>
            </div>
            <div className="mt-8 self-center text-center">
                <p className="font-semibold">“Ciptakan Keluarga Sakinah,</p>
                <p className="font-semibold">Mawaddah, wa Rahmah.”</p>
            </div>
        </div>
    </div>
  );
}
