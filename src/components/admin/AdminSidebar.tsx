
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  BookUser,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  FileCheck,
  Bell,
  MessageSquare,
  Menu,
  X,
} from 'lucide-react';
import React from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from '@/components/ui/sheet';

// Menu items dengan role-based access (sesuai dokumentasi API)
const getAllNavItems = (userRole: string | null) => {
  const baseItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['staff', 'kepala_kua'] },
    { href: '/admin/profile', label: 'Profil Saya', icon: UserCircle, roles: ['staff', 'kepala_kua'] },
    { href: '/admin/registrations', label: 'Pendaftaran Nikah', icon: FileText, roles: ['staff', 'kepala_kua'] },
    { href: '/admin/kepala/pengumuman', label: 'Pengumuman Nikah', icon: FileCheck, roles: ['staff', 'kepala_kua'] },
    { href: '/admin/notifications', label: 'Notifikasi', icon: Bell, roles: ['staff', 'kepala_kua'] },
  ];
  
  // Menu khusus kepala_kua (sesuai dokumentasi API - hanya kepala_kua yang bisa manage staff/penghulu)
  const kepalaKUAItems = [
    { href: '/admin/users', label: 'Pengguna', icon: Users, roles: ['kepala_kua'] },
    { href: '/admin/kepala', label: 'Manajemen', icon: Settings, roles: ['kepala_kua'] },
    { href: '/admin/kepala/feedback', label: 'Feedback', icon: MessageSquare, roles: ['kepala_kua'] },
  ];
  
  // Filter menu berdasarkan role
  const allItems = [...baseItems, ...kepalaKUAItems];
  return allItems.filter(item => !item.roles || item.roles.includes(userRole || ''));
};

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userRole, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = React.useState(false);

  const handleLogout = () => {
    // Hapus token dari cookies
    document.cookie = 'token=; path=/; max-age=0';
    logout();
  };

  const navItems = getAllNavItems(userRole);

  const renderNavContent = (isMobile = false) => {
    return (
      <>
        <div className={cn("flex items-center justify-between h-16 px-4 border-b", isMobile && "mb-4")}> 
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{(user?.nama || 'A').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()}</AvatarFallback>
            </Avatar>
            {(!isCollapsed || isMobile) && (
              <div>
                <div className="text-sm font-semibold text-emerald-700">Admin Panel</div>
                <div className="text-xs text-muted-foreground">Kepala / Staff</div>
              </div>
            )}
          </div>

          {!isMobile && (
            <div className="flex items-center gap-2">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button onClick={handleLogout} variant="ghost" size="icon" className="h-9 w-9 text-rose-600 hover:bg-rose-50">
                    <LogOut className="h-5 w-5" />
                    <span className="sr-only">Logout</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">Logout</TooltipContent>
              </Tooltip>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={cn(isCollapsed && 'mx-auto')}
                aria-label="Toggle sidebar"
              >
                {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
            </div>
          )}
        </div>
        <nav className={cn("flex flex-col gap-1 px-2", isCollapsed && !isMobile ? "py-4 items-center" : "py-4")}>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href) && (item.href !== '/admin' || pathname === '/admin');
            return isCollapsed && !isMobile ? (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      buttonVariants({ variant: isActive ? 'default' : 'ghost', size: 'icon' }),
                      'h-10 w-10 flex items-center justify-center'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobile && setIsMobileSheetOpen(false)}
                className={cn(
                  buttonVariants({ variant: isActive ? 'default' : 'ghost', size: 'sm' }),
                  'justify-start w-full px-3 py-2 rounded-md text-sm transition-colors duration-150',
                  isActive ? 'bg-emerald-100 text-emerald-800 shadow-sm' : 'hover:bg-emerald-50 hover:text-emerald-800'
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className={cn("flex items-center gap-3 border-t p-3", isCollapsed && !isMobile ? "flex-col py-4" : "")}> 
           <Avatar className="h-10 w-10">
             <AvatarFallback>{(user?.nama || 'A').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()}</AvatarFallback>
           </Avatar>
           {(!isCollapsed || isMobile) && (
             <>
               <div className="flex-1">
                 <p className="text-sm font-semibold truncate">{user?.nama || 'Admin User'}</p>
                 <p className="text-xs text-muted-foreground">{user?.role || userRole}</p>
               </div>
               <div className="flex items-center gap-2">
                 <Link href="/admin/profile" className="text-sm text-emerald-600 hover:underline">Profil</Link>
                 {isMobile && (
                   <Button onClick={handleLogout} variant="ghost" size="icon" className="h-9 w-9 text-rose-600 hover:bg-rose-50">
                     <LogOut className="h-5 w-5" />
                     <span className="sr-only">Logout</span>
                   </Button>
                 )}
               </div>
             </>
           )}
        </div>
      </>
    );
  };

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-0 left-0 z-50 w-full bg-white border-b shadow-sm">
        <div className="flex items-center justify-between h-16 px-4">
          <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Buka menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] bg-white p-0 flex flex-col">
              <SheetTitle className="sr-only">Menu Admin</SheetTitle>
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{(user?.nama || 'A').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-semibold text-emerald-700">Admin Panel</div>
                      <div className="text-xs text-muted-foreground">Kepala / Staff</div>
                    </div>
                  </div>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-6 w-6" />
                      <span className="sr-only">Tutup menu</span>
                    </Button>
                  </SheetClose>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto flex flex-col">
                <nav className="flex flex-col gap-1 px-2 py-4">
                  {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href) && (item.href !== '/admin' || pathname === '/admin');
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileSheetOpen(false)}
                        className={cn(
                          buttonVariants({ variant: isActive ? 'default' : 'ghost', size: 'sm' }),
                          'justify-start w-full px-3 py-2 rounded-md text-sm transition-colors duration-150',
                          isActive ? 'bg-emerald-100 text-emerald-800 shadow-sm' : 'hover:bg-emerald-50 hover:text-emerald-800'
                        )}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
                <div className="flex items-center gap-3 border-t p-3 mt-auto">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{(user?.nama || 'A').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-semibold truncate">{user?.nama || 'Admin User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.role || userRole}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href="/admin/profile" onClick={() => setIsMobileSheetOpen(false)} className="text-sm text-emerald-600 hover:underline">Profil</Link>
                    <Button onClick={handleLogout} variant="ghost" size="icon" className="h-9 w-9 text-rose-600 hover:bg-rose-50">
                      <LogOut className="h-5 w-5" />
                      <span className="sr-only">Logout</span>
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{(user?.nama || 'A').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold text-emerald-700">Admin Panel</span>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <TooltipProvider>
        <aside
          className={cn(
            'hidden md:flex flex-col justify-between h-screen sticky top-0 transition-all duration-300 ease-in-out bg-white border-r shadow-sm',
            isCollapsed ? 'w-20' : 'w-64'
          )}
          aria-label="Admin sidebar"
        >
          {renderNavContent(false)}
        </aside>
      </TooltipProvider>
    </>
  );
}
