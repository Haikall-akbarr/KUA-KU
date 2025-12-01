
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

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
} from 'lucide-react';
import React from 'react';

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

  const handleLogout = () => {
    // Hapus token dari cookies
    document.cookie = 'token=; path=/; max-age=0';
    logout();
  };

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'hidden md:flex flex-col justify-between h-screen sticky top-0 transition-all duration-300 ease-in-out bg-card border-r',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div>
          <div className={cn("flex items-center border-b", isCollapsed ? "justify-center h-16" : "justify-between h-16 px-4")}>
            {!isCollapsed && (
                <Link href="/admin" className="flex items-center gap-2">
                    <Image src="/logo-kemenag.png" alt="Logo" width={28} height={28} />
                    <span className="font-bold text-lg">Admin Panel</span>
                </Link>
            )}
             <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={cn(isCollapsed && 'mx-auto')}
              >
                {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
          </div>
          <nav className={cn("flex flex-col gap-1 px-2", isCollapsed ? "py-4 items-center" : "py-4")}>
            {getAllNavItems(userRole).map((item) => {
              const isActive = pathname.startsWith(item.href) && (item.href !== '/admin' || pathname === '/admin');
              return isCollapsed ? (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        buttonVariants({ variant: isActive ? 'default' : 'ghost', size: 'icon' }),
                        'h-10 w-10'
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
                  className={cn(
                    buttonVariants({ variant: isActive ? 'default' : 'ghost', size: 'sm' }),
                    'justify-start'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className={cn("flex flex-col gap-2 border-t p-2", isCollapsed ? "items-center" : "")}>
           {isCollapsed ? (
                 <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                         <Button onClick={handleLogout} variant="destructive" size="icon" className="h-10 w-10">
                            <LogOut className="h-5 w-5" />
                            <span className="sr-only">Logout</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Logout</TooltipContent>
                 </Tooltip>
           ) : (
             <>
                <div className="px-2 py-2">
                    <p className="text-sm font-semibold truncate">{user?.nama || 'Admin User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.role || userRole}</p>
                </div>
                <Button onClick={handleLogout} variant="destructive" size="sm" className="justify-start">
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                </Button>
             </>
           )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
