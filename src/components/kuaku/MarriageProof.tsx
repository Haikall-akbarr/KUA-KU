
'use client';

import React, { useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { id as IndonesianLocale } from 'date-fns/locale';
import { Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DetailItemProps {
  label: string;
  value: string | undefined | null;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row py-2 border-b last:border-b-0">
    <dt className="w-full sm:w-1/3 font-medium text-muted-foreground">{label}</dt>
    <dd className="w-full sm:w-2/3 mt-1 sm:mt-0 font-semibold text-foreground">{value || '-'}</dd>
  </div>
);

export function MarriageProof() {
  const searchParams = useSearchParams();
  const proofRef = useRef<HTMLDivElement>(null);

  const registrationData = {
    queueNumber: searchParams.get('queueNumber'),
    groomFullName: searchParams.get('groomFullName'),
    brideFullName: searchParams.get('brideFullName'),
    weddingDate: searchParams.get('weddingDate'),
    weddingTime: searchParams.get('weddingTime'),
    kua: searchParams.get('kua'),
    weddingLocation: searchParams.get('weddingLocation'),
  };

  const formattedWeddingDate = registrationData.weddingDate
    ? format(parseISO(registrationData.weddingDate), 'EEEE, dd MMMM yyyy', { locale: IndonesianLocale })
    : '-';
    
  const handleDownloadPdf = async () => {
    const element = proofRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: true, // Enable logging for debugging
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    // Calculate PDF dimensions to maintain aspect ratio
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`bukti-antrean-nikah-${registrationData.queueNumber}.pdf`);
  };

  return (
    <div className="max-w-3xl mx-auto">
        <div ref={proofRef} className="bg-white p-2">
          <Card className="shadow-lg border-2 border-primary">
              <CardHeader className="text-center border-b-2 border-primary pb-4">
                  <h1 className="font-headline text-2xl font-bold text-primary">BUKTI PENDAFTARAN NIKAH</h1>
                  <p className="text-muted-foreground">Layanan Online KUA Banjarmasin Utara</p>
              </CardHeader>
              <CardContent className="pt-6">
                  <div className="space-y-4">
                      <div className="text-center bg-accent/20 text-accent-foreground p-4 rounded-lg border border-accent">
                          <p className="font-medium">Nomor Antrean Pendaftaran Anda:</p>
                          <strong className="text-3xl font-bold tracking-wider text-primary">{registrationData.queueNumber}</strong>
                      </div>
                      <dl className="space-y-1 text-sm mt-6">
                          <DetailItem label="Calon Suami" value={registrationData.groomFullName} />
                          <DetailItem label="Calon Istri" value={registrationData.brideFullName} />
                          <DetailItem label="Tanggal Akad" value={formattedWeddingDate} />
                          <DetailItem label="Waktu Akad" value={registrationData.weddingTime} />
                          <DetailItem label="KUA Pendaftaran" value={registrationData.kua} />
                          <DetailItem label="Lokasi Akad Nikah" value={registrationData.weddingLocation} />
                      </dl>
                  </div>
              </CardContent>
              <CardFooter className="mt-6 border-t-2 border-primary pt-6">
                  <div className="w-full text-xs text-muted-foreground">
                      <p className="font-bold text-destructive">Penting:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Harap simpan dan/atau cetak tanda bukti ini.</li>
                          <li>Ini adalah bukti untuk mengambil nomor antrean di kantor kami, bukan bukti pernikahan.</li>
                          <li>Langkah selanjutnya adalah datang ke kantor KUA dengan membawa semua berkas persyaratan fisik (asli dan fotokopi) sesuai dengan tanggal yang telah dijadwalkan oleh petugas kami (akan dihubungi).</li>
                      </ul>
                  </div>
              </CardFooter>
          </Card>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={handleDownloadPdf} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Unduh sebagai PDF
            </Button>
            <Button variant="outline" onClick={() => window.print()} className="w-full sm:w-auto">
                <Printer className="mr-2 h-4 w-4" />
                Cetak Halaman
            </Button>
        </div>
    </div>
  );
}
