import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  slug: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export function ServiceCard({ slug, icon: Icon, title, description }: ServiceCardProps) {
  return (
    <Link href={`/layanan/${slug}`} className="h-full block group">
      <Card className="h-full transform transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
        <CardHeader className="items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
            <Icon className="h-8 w-8" />
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
