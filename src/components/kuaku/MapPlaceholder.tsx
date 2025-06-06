import Image from "next/image";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { Card, CardContent } from "@/components/ui/card";

export function MapPlaceholder() {
  return (
    <SectionWrapper id="map" title="Temukan Kami" subtitle="Lokasi Kantor KUAKU">
      <Card className="overflow-hidden shadow-lg">
        <CardContent className="p-0">
          <div className="aspect-w-16 aspect-h-6 md:aspect-h-5">
            <Image
              src="https://placehold.co/1200x400.png"
              alt="Peta Lokasi KUAKU"
              layout="fill"
              objectFit="cover"
              data-ai-hint="city roadmap"
              className="transform transition-transform duration-500 hover:scale-105"
            />
          </div>
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Untuk peta interaktif, silakan kunjungi kami atau gunakan aplikasi peta favorit Anda dengan alamat di atas.
      </p>
    </SectionWrapper>
  );
}
