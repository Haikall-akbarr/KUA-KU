
export function AppFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t bg-background/90 py-10">
      <div className="container grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo-kemenag.png" alt="KUA Logo" className="h-10 w-auto" />
            <span className="font-sans font-bold text-lg">KUA Banjarmasin Utara</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm">Layanan publik terpadu untuk pendaftaran pernikahan, informasi, dan pelaporan. Kami berkomitmen memberikan layanan profesional dan transparan untuk masyarakat.</p>
        </div>

        <div>
          <h4 className="font-sans font-semibold text-teal-700 mb-3">Kontak</h4>
          <p className="text-sm text-muted-foreground">Jl. Wira Karya, Pangeran, Kec. Banjarmasin Utara</p>
          <p className="text-sm text-muted-foreground">Kota Banjarmasin, Kalimantan Selatan 70123</p>
          <p className="text-sm text-muted-foreground mt-2">Tel: (0511) 3301966</p>
          <p className="text-sm text-muted-foreground">Email: info@kua-banjarmasinutara.go.id</p>
        </div>

        <div>
          <h4 className="font-sans font-semibold text-teal-700 mb-3">Tautan Cepat</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/layanan" className="text-muted-foreground hover:text-teal-700">Layanan</a></li>
            <li><a href="/daftar-nikah" className="text-muted-foreground hover:text-teal-700">Daftar Nikah</a></li>
            <li><a href="/pendaftaran" className="text-muted-foreground hover:text-teal-700">Status Pendaftaran</a></li>
            <li><a href="/#contact" className="text-muted-foreground hover:text-teal-700">Kontak</a></li>
          </ul>
        </div>

      </div>

      <div className="border-t mt-8 pt-6">
        <div className="container flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">&copy; {currentYear} KUA Banjarmasin Utara. Semua hak dilindungi.</p>
          <p className="text-sm text-muted-foreground mt-3 md:mt-0">Dikelola oleh Kantor Urusan Agama Banjarmasin Utara</p>
        </div>
      </div>
    </footer>
  );
}
