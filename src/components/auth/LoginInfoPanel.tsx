
"use client";

import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export function LoginInfoPanel() {
  return (
    <div className="relative hidden w-full overflow-hidden bg-primary p-8 text-white md:flex md:w-1/2 flex-col justify-center items-center">
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
