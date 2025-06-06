import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function ServiceCard({ icon: Icon, title, description }: ServiceCardProps) {
  return (
    <Card className="h-full transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-8 w-8" />
        </div>
        <CardTitle className="font-headline text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
