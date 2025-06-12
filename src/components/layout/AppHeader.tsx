
"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from 'next/navigation'; // Added useRouter
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
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(""); // Clear input after search
      if (isMobileSheetOpen) {
        setIsMobileSheetOpen(false); // Close mobile sheet if open
      }
    }
  };
  
  const NavLink = ({ href, children, onClick: providedOnClick, className }: { href: string, children: React.ReactNode, onClick?: () => void, className?: string }) => {
    const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>) => {
      const isHomepage = pathname === '/';
      const isHashLinkToHomepageSection = href.startsWith("/#") || href.startsWith("#");
      let targetHref = href;

      if (href.startsWith("/#")) { // For links like /#services
         targetHref = href.substring(1); // Convert to #services
      }

      if (isHomepage && isHashLinkToHomepageSection) {
        e.preventDefault();
        const targetId = targetHref.substring(1); // Remove #
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      }
      // If not on homepage and it's a hash link to homepage, Next.js Link handles full navigation.
      // If it's a direct page link (e.g., /pendaftaran), Next.js Link handles it.

      if (providedOnClick) {
        providedOnClick(); // For closing mobile sheet etc.
      }
    };
    
    return (
      <Link
        href={href} // Use original href for NextLink navigation
        onClick={handleLinkClick}
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          className
        )}
      >
        {children}
      </Link>
    );
  };


  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        isScrolled ? "bg-background/95 backdrop-blur-sm shadow-md" : "bg-transparent border-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
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
          <form onSubmit={handleSearchSubmit} className="relative ml-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Cari informasi..."
              className="h-9 w-full rounded-md bg-secondary/50 pl-9 pr-3 text-sm md:w-[200px] lg:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="sr-only">Cari</button>
          </form>
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
                    <Menu className="h-6 w-6 rotate-90" />
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
              <form onSubmit={handleSearchSubmit} className="relative mt-6">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  placeholder="Cari informasi..."
                  className="h-10 w-full rounded-md bg-secondary/50 pl-9 pr-3"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="sr-only">Cari</button>
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
