import Image from "next/image";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { Card, CardContent } from "@/components/ui/card";

export function MapPlaceholder() {
  return (
    <SectionWrapper id="map" title="Kegiatan Kami">
      <Card className="overflow-hidden shadow-lg">
        <CardContent className="p-0">
          <div className="w-full h-[400px] relative">
            <div className="grid grid-cols-3 gap-0 h-full">
              <div className="relative w-full h-full">
                <Image
                  src="/kegiatan1.jpg"
                  alt="Foto Kegiatan KUA 1"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative w-full h-full">
                <Image
                  src="/kegiatan2.jpg"
                  alt="Foto Kegiatan KUA 2"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative w-full h-full">
                <Image
                  src="/kegiatan3.jpg"
                  alt="Foto Kegiatan KUA 3"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </SectionWrapper>
  );
}
