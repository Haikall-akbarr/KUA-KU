
import Image from 'next/image';

export function LoginInfoPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-accent to-green-400 p-12 text-white md:flex md:flex-col md:justify-center">
      <div className="relative z-10">
        <h1 className="text-4xl font-bold leading-tight tracking-tight">
          Kantor Urusan Agama
          <br />
          Banjarmasin Utara
        </h1>
        <p className="mt-4 text-primary-foreground/80">
          Selamat datang di Sistem Informasi Manajemen Nikah (Simkah)
        </p>
        <div className="mt-12">
          <Image
            src="https://placehold.co/400x300.png"
            alt="Illustrasi verifikasi"
            width={400}
            height={300}
            className="mx-auto"
            data-ai-hint="man sitting laptop verification"
          />
        </div>
      </div>
    </div>
  );
}
