
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import Image from "next/image";

const contactItems = [
  {
    icon: MapPin,
    label: "Alamat Kantor",
    value: "Jl. Cinta Damai No. 123, Kota Kasih, Indonesia",
    href: "https://maps.google.com/?q=Jl.CintaDamaiNo.123,KotaKasih,Indonesia",
  },
  {
    icon: Phone,
    label: "Telepon",
    value: "(021) 123-4567",
    href: "tel:+62211234567",
  },
  {
    icon: Mail,
    label: "Email",
    value: "info@kua-banjarmasinutara.go.id",
    href: "mailto:info@kua-banjarmasinutara.go.id",
  },
];

const officeHours = [
  { day: "Senin - Kamis", hours: "08:00 - 16:00 WIB" },
  { day: "Jumat", hours: "08:00 - 11:00 WIB, 13:00 - 16:00 WIB" },
  { day: "Sabtu & Minggu", hours: "Tutup" },
];

export function ContactInfo() {
  return (
    <SectionWrapper id="contact" title="Hubungi Kami" subtitle="Informasi Kontak">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="transform transition-all duration-300 hover:shadow-xl h-full">
              <CardContent className="p-6">
                <h3 className="mb-6 font-headline text-2xl font-semibold">Detail Kontak</h3>
                <ul className="space-y-6">
                  {contactItems.map((item) => (
                    <li key={item.label} className="flex items-start gap-4">
                      <div className="mt-1 flex-shrink-0 text-primary">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold">{item.label}</p>
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {item.value}
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="transform transition-all duration-300 hover:shadow-xl h-full">
              <CardContent className="p-6">
                <h3 className="mb-6 font-headline text-2xl font-semibold">Jam Operasional</h3>
                <ul className="space-y-4">
                  {officeHours.map((item) => (
                    <li key={item.day} className="flex items-start gap-4">
                      <div className="mt-1 flex-shrink-0 text-primary">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold">{item.day}</p>
                        <p className="text-muted-foreground">{item.hours}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
        </div>
      </div>
    </SectionWrapper>
  );
}
