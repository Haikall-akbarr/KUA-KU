
export function AppFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t bg-background/80 py-8 text-center">
      <div className="container">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} KUA Banjarmasin Utara. Semua hak dilindungi.
        </p>
      </div>
    </footer>
  );
}
