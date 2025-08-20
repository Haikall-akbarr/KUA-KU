
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
  <div className="flex flex-col sm:flex-row sm:items-center">
    <dt className="w-full sm:w-1/3 font-medium text-muted-foreground">{label}</dt>
    <dd className="w-full sm:w-2/3 mt-1 sm:mt-0 font-semibold">{value || '-'}</dd>
  </div>
);

export function MarriageProof() {
  const searchParams = useSearchParams();
  const proofRef = useRef<HTMLDivElement>(null);

  const registrationData = {
    queueNumber: searchParams.get('queueNumber'),
    fullName: searchParams.get('fullName'),
    nik: searchParams.get('nik'),
    phoneNumber: searchParams.get('phoneNumber'),
    email: searchParams.get('email'),
    partnerFullName: searchParams.get('partnerFullName'),
    plannedWeddingDate: searchParams.get('plannedWeddingDate'),
  };

  const formattedWeddingDate = registrationData.plannedWeddingDate
    ? format(parseISO(registrationData.plannedWeddingDate), 'EEEE, dd MMMM yyyy', { locale: IndonesianLocale })
    : '-';
    
  const handleDownloadPdf = async () => {
    const element = proofRef.current;
    if (!element) return;

    element.style.transform = 'scale(1.5)';
    element.style.transformOrigin = 'top left';

    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
    });
    
    element.style.transform = '';
    element.style.transformOrigin = '';
    
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`bukti-antrean-nikah-${registrationData.queueNumber}.pdf`);
  };

  return (
    <div className="max-w-2xl mx-auto">
        <Card ref={proofRef} className="shadow-lg p-4">
            <CardHeader className="text-center border-b pb-4">
                <h1 className="font-headline text-2xl font-bold text-primary">BUKTI PENDAFTARAN NIKAH</h1>
                <p className="text-muted-foreground">Layanan Online KUA Banjarmasin Utara</p>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <p className="text-center bg-accent/50 text-accent-foreground p-3 rounded-md">
                        Nomor Antrean Pendaftaran Anda:
                        <br />
                        <strong className="text-2xl font-bold tracking-wider">{registrationData.queueNumber}</strong>
                    </p>
                    <dl className="space-y-4 text-sm mt-6">
                        <DetailItem label="Nama Pemohon" value={registrationData.fullName} />
                        <DetailItem label="NIK Pemohon" value={registrationData.nik} />
                        <DetailItem label="Nama Calon Pasangan" value={registrationData.partnerFullName} />
                        <DetailItem label="Rencana Akad Nikah" value={formattedWeddingDate} />
                        <DetailItem label="Nomor Telepon" value={registrationData.phoneNumber} />
                        <DetailItem label="Alamat Email" value={registrationData.email} />
                    </dl>
                </div>
            </CardContent>
            <CardFooter className="mt-6 border-t pt-6">
                <div className="w-full text-xs text-muted-foreground">
                    <p className="font-bold">Penting:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Harap simpan dan/atau cetak tanda bukti ini.</li>
                        <li>Ini adalah bukti untuk mengambil nomor antrean di kantor kami, bukan bukti pernikahan.</li>
                        <li>Langkah selanjutnya adalah datang ke kantor KUA dengan membawa semua berkas persyaratan fisik (asli dan fotokopi) sesuai dengan tanggal yang telah dijadwalkan oleh petugas kami (akan dihubungi).</li>
                    </ul>
                </div>
            </CardFooter>
        </Card>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
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
