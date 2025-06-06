
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, Search, Briefcase, Phone, MapPinIcon, MessageSquare, ClipboardPenLine } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/#services", label: "Layanan", icon: Briefcase },
  { href: "/pendaftaran", label: "No. Pendaftaran", icon: ClipboardPenLine },
  { href: "/#contact", label: "Kontak", icon: Phone },
  { href: "/#map", label: "Lokasi", icon: MapPinIcon },
  { href: "/#inquire", label: "Tanya Kami", icon: MessageSquare },
];

export function AppHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const NavLink = ({ href, children, onClick, className }: { href: string, children: React.ReactNode, onClick?: () => void, className?: string }) => (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "text-sm font-medium transition-colors hover:text-primary",
        className
      )}
    >
      {children}
    </Link>
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        isScrolled ? "bg-background/95 backdrop-blur-sm shadow-md" : "bg-transparent border-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {/* You can replace this with an SVG logo if you have one */}
          <span className="font-headline text-2xl font-bold text-primary">
            KUAKU
          </span>
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
          <div className="relative ml-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari informasi..."
              className="h-9 w-full rounded-md bg-secondary/50 pl-9 pr-3 text-sm md:w-[200px] lg:w-[250px]"
            />
          </div>
        </nav>

        <div className="md:hidden">
          <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Buka menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background p-6">
              <div className="mb-6 flex items-center justify-between">
                <Link href="/" onClick={() => setIsMobileSheetOpen(false)}>
                  <span className="font-headline text-xl font-bold text-primary">
                    KUAKU
                  </span>
                </Link>
                <SheetClose asChild>
                   <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6 rotate-90" /> {/* Using Menu and rotating it to resemble X */}
                    <span className="sr-only">Tutup menu</span>
                  </Button>
                </SheetClose>
              </div>
              <nav className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <NavLink key={item.href} href={item.href} onClick={() => setIsMobileSheetOpen(false)} className="flex items-center gap-3 py-2 text-base">
                    <item.icon className="h-5 w-5 text-primary" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <div className="relative mt-6">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari informasi..."
                  className="h-10 w-full rounded-md bg-secondary/50 pl-9 pr-3"
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
