 'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import React from 'react';

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
  Calendar,
  FileCheck,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/penghulu', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/penghulu/jadwal', label: 'Jadwal', icon: Calendar },
  { href: '/penghulu/verifikasi', label: 'Verifikasi', icon: FileCheck },
  { href: '/penghulu/profil', label: 'Profil', icon: User },
];

export function PenghuluSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleLogout = () => {
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
              <Link href="/penghulu" className="flex items-center gap-2">
                <Image src="/logo-kemenag.png" alt="Logo" width={28} height={28} />
                <span className="font-bold text-lg">Penghulu</span>
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
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href) && (item.href !== '/penghulu' || pathname === '/penghulu');
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
                <p className="text-sm font-semibold truncate">{user?.nama || 'Penghulu'}</p>
                <p className="text-xs text-muted-foreground">{user?.role || 'penghulu'}</p>
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
