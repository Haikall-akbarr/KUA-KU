
"use client";

import { useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type LucideIcon, Loader2 } from "lucide-react";
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  slug: string;
  icon: LucideIcon;
  title: string;
  description: string;
  isExternal?: boolean;
}

export function ServiceCard({ slug, icon: Icon, title, description, isExternal = false }: ServiceCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const href = isExternal ? `/${slug}` : `/layanan/${slug}`;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsLoading(true);
    router.push(href);
  };
  
  return (
    <Link href={href} onClick={handleClick} className={cn("h-full block group", isLoading && "cursor-wait")}>
      <Card className={cn(
          "h-full transform transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1",
          isLoading && "opacity-70"
        )}>
        <CardHeader className="items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <Icon className="h-8 w-8" />
            )}
          </div>
          <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
