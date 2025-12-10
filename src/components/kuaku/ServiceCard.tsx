
"use client";

import { useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';

// Mapping of all lucide-react icons
const icons = LucideIcons as unknown as { [key: string]: LucideIcons.LucideIcon };

interface ServiceCardProps {
  slug: string;
  iconName: keyof typeof icons;
  title: string;
  description: string;
  isExternal?: boolean;
}

export function ServiceCard({ slug, iconName, title, description, isExternal = false }: ServiceCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const href = isExternal ? `/${slug}` : `/layanan/${slug}`;

  const Icon = icons[iconName] || LucideIcons.File; // Fallback to a default icon

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
        <CardHeader className="items-center text-center pb-3">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
            {isLoading ? (
              <LucideIcons.Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <Icon className="h-8 w-8" />
            )}
          </div>
          <CardTitle className="font-sans text-xl font-black text-teal-700 group-hover:text-teal-800 transition-colors">{title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-center text-sm font-semibold text-black/90">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
