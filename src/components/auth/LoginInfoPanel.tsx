
import Image from 'next/image';

export function LoginInfoPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-primary/80 p-12 text-white md:flex md:flex-col md:justify-center">
      {/* Curved background element */}
      <div
        className="absolute -right-1/3 top-0 h-[150%] w-full -translate-y-1/4"
        style={{
          borderRadius: '50%',
          background: 'linear-gradient(to bottom, hsl(var(--primary)), hsl(var(--accent)))',
          boxShadow: '0 0 30px rgba(0,0,0,0.2)',
        }}
      ></div>

      <div className="relative z-10">
        <h1 className="text-4xl font-bold leading-tight tracking-tight">
          Sistem Informasi
          <br />
          Manajemen Nikah
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
