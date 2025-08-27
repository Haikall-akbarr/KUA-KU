"use client";

import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export function LoginInfoPanel() {
  return (
    <div className="relative hidden w-full overflow-hidden bg-primary p-8 text-white md:flex md:w-1/2 flex-col justify-center items-center">
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-24 -right-2 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="w-full max-w-md">
            <DotLottieReact
              src="https://lottie.host/a94356f3-ad72-4a9d-a141-edd697b2bc69/BKMQRlHksC.lottie"
              loop
              autoplay
            />
        </div>

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
