
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import Image from "next/image";

const contactItems = [
  {
    icon: MapPin,
    label: "Alamat Kantor",
    value: "Jl. Wira Karya, Pangeran, Kec. Banjarmasin Utara, Kota Banjarmasin, Kalimantan Selatan 70123",
    href: "https://maps.google.com/?q=Jl.WiraKarya,Pangeran,BanjarmasinUtara,Banjarmasin",
  },
  {
    icon: Phone,
    label: "Telepon",
    value: "(0511) 3301966",
    href: "tel:+62511-3301966",
  },
  {
    icon: Mail,
    label: "Email",
    value: "info@kua-banjarmasinutara.go.id",
    href: "mailto:info@kua-banjarmasinutara.go.id",
  },
];

const officeHours = [
    { day: "Senin - Kamis", hours: "08:00 - 12:00, 14:00 - 16:00 WIB" },
    { day: "Jumat", hours: "08:00 - 11:00, 14:00 - 16:00 WIB" },
    { day: "Sabtu & Minggu", hours: "Tutup" },
];

export function ContactInfo() {
  return (
    <SectionWrapper id="contact" title="Hubungi Kami" subtitle="Informasi Kontak">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="transform transition-all duration-300 hover:shadow-xl h-full">
              <CardContent className="p-6">
                <h3 className="mb-6 font-sans text-2xl font-semibold text-teal-700">Detail Kontak</h3>
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
                          className="text-teal-700 font-medium hover:text-teal-800 transition-colors"
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
                <h3 className="mb-6 font-sans text-2xl font-semibold text-teal-700">Jam Operasional</h3>
                <ul className="space-y-4">
                  {officeHours.map((item) => (
                    <li key={item.day} className="flex items-start gap-4">
                      <div className="mt-1 flex-shrink-0 text-primary">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold">{item.day}</p>
                        <p className="text-teal-700 font-medium">{item.hours}</p>
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
