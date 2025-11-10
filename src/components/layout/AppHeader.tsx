
"use client";

import Link from "next/link";
import Image from "next/image";
import type { MouseEvent } from "react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet";
import { Menu, Search, Briefcase, Phone, MapPinIcon, Heart, LogIn, LogOut, UserPlus, X, Bell, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { UserProfileMenu } from "@/components/shared/UserProfileMenu";

const navItems = [
  { href: "/#services", label: "Layanan", icon: Briefcase, protected: true },
  { href: "/daftar-nikah", label: "Daftar Nikah", icon: Heart, protected: true },
  { href: "/#contact", label: "Kontak", icon: Phone, protected: true },
  { href: "/#map", label: "Lokasi", icon: MapPinIcon, protected: true },
];

const ADMIN_ROLES = ['Staff KUA', 'Kepala KUA', 'Administrator', 'Penghulu'];

const authNavItems = {
  login: { href: "/login", label: "Login", icon: LogIn },
  register: { href: "/register", label: "Register", icon: UserPlus },
};

// Notifications are loaded per-user from localStorage key `notifications_<user_id>`


export function AppHeader() {
  const { user, userRole, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const key = `notifications_${user.user_id}`;
    try {
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      setNotifications(arr);
    } catch (e) {
      console.error('Failed to load notifications from localStorage', e);
      setNotifications([]);
    }
  }, [user]);
  const router = useRouter();
  const pathname = usePathname();

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const isAdminRoute = pathname.startsWith('/admin');

  // Don't render the header on admin routes
  if (isAdminRoute) {
      return null;
  }

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
      setSearchQuery("");
      if (isMobileSheetOpen) {
        setIsMobileSheetOpen(false);
      }
    }
  };
  
  const handleLogout = () => {
    document.cookie = 'token=; path=/; max-age=0';
    logout();
  };

  const NavLink = ({ href, children, onClick: providedOnClick, className }: { href: string, children: React.ReactNode, onClick?: () => void, className?: string }) => {
    const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>) => {
      const isHomepage = pathname === '/';
      const isHashLink = href.startsWith("#") || href.startsWith("/#");

      if (isHomepage && isHashLink) {
        e.preventDefault();
        const targetId = href.startsWith('/#') ? href.substring(2) : href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      } else if (isHashLink) {
        const targetId = href.startsWith('/#') ? href.substring(2) : href.substring(1);
        router.push('/#' + targetId);
      } else {
        router.push(href);
      }
      
      if (providedOnClick) {
        providedOnClick();
      }
    };
    
    return (
      <Link
        href={href}
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

  const renderNavItems = (isMobile = false) => {
    const linkClass = isMobile ? "flex items-center gap-3 py-2 text-base" : "";
    const showAdminDashboardLink = user && userRole && ADMIN_ROLES.includes(userRole);
    
    const itemsToShow = user ? navItems : [];

    return (
      <>
        {showAdminDashboardLink && (
           <NavLink href="/admin" onClick={() => isMobile && setIsMobileSheetOpen(false)} className={linkClass}>
             {isMobile && <LayoutDashboard className="h-5 w-5 text-primary" />}
             Dashboard
           </NavLink>
        )}
        {itemsToShow.map((item) => (
          <NavLink key={item.href} href={item.href} onClick={() => isMobile && setIsMobileSheetOpen(false)} className={linkClass}>
            {isMobile && <item.icon className="h-5 w-5 text-primary" />}
            {item.label}
          </NavLink>
        ))}
        {!user && (
           <>
            <NavLink href={authNavItems.login.href} onClick={() => isMobile && setIsMobileSheetOpen(false)} className={linkClass}>
              {isMobile && <authNavItems.login.icon className="h-5 w-5 text-primary" />}
              {authNavItems.login.label}
            </NavLink>
            <NavLink href={authNavItems.register.href} onClick={() => isMobile && setIsMobileSheetOpen(false)} className={linkClass}>
              {isMobile && <authNavItems.register.icon className="h-5 w-5 text-primary" />}
              {authNavItems.register.label}
            </NavLink>
          </>
        )}
      </>
    );
  };

  const renderAuthControls = (isMobile = false) => {
     if (!user) return null;
     const buttonClass = isMobile ? "w-full justify-start text-base flex items-center gap-3 py-2 text-sm font-medium transition-colors hover:text-primary" : "";

     return (
       <div className={cn("flex items-center gap-2", isMobile && "flex-col border-t pt-4 mt-4")}>
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5"/>
                    {unreadNotifications > 0 && (
                        <span className="absolute top-1 right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    )}
                    <span className="sr-only">Buka Notifikasi</span>
                </Button>
            </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          notifications.map(notif => (
             <DropdownMenuItem key={notif.id} className={cn("flex-col items-start whitespace-normal", !notif.read && "bg-primary/5")} onClick={() => {
               // mark as read locally
               if (user) {
                 try {
                   const key = `notifications_${user.user_id}`;
                   const arr = JSON.parse(localStorage.getItem(key) || '[]');
                   const updated = arr.map((n: any) => n.id === notif.id ? { ...n, read: true } : n);
                   localStorage.setItem(key, JSON.stringify(updated));
                   setNotifications(updated);
                 } catch (e) {
                   console.error('Failed to mark notification as read', e);
                 }
               }
             }}>
              <div className="flex items-center w-full">
                <p className={cn("font-medium", !notif.read && "font-bold")}>{notif.title}</p>
                {!notif.read && <div className="ml-auto h-2 w-2 rounded-full bg-primary"></div>}
              </div>
              <p className="text-xs text-muted-foreground">{notif.description}</p>
            </DropdownMenuItem>
          ))
        ) : (
          <p className="p-2 text-center text-sm text-muted-foreground">Tidak ada notifikasi baru.</p>
        )}
      </DropdownMenuContent>
        </DropdownMenu>

         {isMobile ? (
            <button onClick={() => { handleLogout(); setIsMobileSheetOpen(false); }} className={buttonClass}>
              <LogOut className="h-5 w-5 text-primary" />
              Logout
            </button>
          ) : (
            <UserProfileMenu />
          )}
       </div>
     )
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        isScrolled ? "bg-background/95 backdrop-blur-sm shadow-md" : "bg-transparent border-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
           <Image
              src="/logo-kemenag.png"
              alt="Logo Kemenag"
              width={32}
              height={32}
              className="h-8 w-8"
            />
          <span className="font-headline text-xl font-bold text-primary">
            KUA Banjarmasin Utara
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-4">
            <nav className="flex items-center gap-4">
                {renderNavItems()}
            </nav>
            <div className="flex items-center gap-2">
                {user && (
                    <form onSubmit={handleSearchSubmit} className="relative">
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
                )}
                {renderAuthControls()}
            </div>
        </div>

        <div className="md:hidden">
          <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Buka menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background p-6 flex flex-col">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="mb-6 flex items-center justify-between">
                <Link href="/" onClick={() => setIsMobileSheetOpen(false)} className="flex items-center gap-2">
                   <Image
                      src="/logo-kemenag.png"
                      alt="Logo Kemenag"
                      width={28}
                      height={28}
                    />
                  <span className="font-headline text-lg font-bold text-primary">
                    KUA Banjarmasin Utara
                  </span>
                </Link>
                <SheetClose asChild>
                   <Button variant="ghost" size="icon">
                    <X className="h-6 w-6" />
                    <span className="sr-only">Tutup menu</span>
                  </Button>
                </SheetClose>
              </div>
              <nav className="flex flex-col gap-4 flex-grow">
                {renderNavItems(true)}
              </nav>
              {user && (
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
              )}
               {renderAuthControls(true)}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
