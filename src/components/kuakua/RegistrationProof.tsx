
'use client';

import React, { useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { id as IndonesianLocale } from 'date-fns/locale';
import { Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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

export function RegistrationProof() {
  const searchParams = useSearchParams();
  const proofRef = useRef<HTMLDivElement>(null);

  const registrationData = {
    registrationNumber: searchParams.get('registrationNumber'),
    fullName: searchParams.get('fullName'),
    nik: searchParams.get('nik'),
    placeOfBirth: searchParams.get('placeOfBirth'),
    dateOfBirth: searchParams.get('dateOfBirth'),
    phoneNumber: searchParams.get('phoneNumber'),
    email: searchParams.get('email'),
  };

  const formattedDateOfBirth = registrationData.dateOfBirth
    ? format(parseISO(registrationData.dateOfBirth), 'dd MMMM yyyy', { locale: IndonesianLocale })
    : '-';
    
  const placeAndDateOfBirth = `${registrationData.placeOfBirth || ''}, ${formattedDateOfBirth}`;

  const handleDownloadPdf = async () => {
    const element = proofRef.current;
    if (!element) return;

    // Temporarily increase scale for better resolution
    element.style.transform = 'scale(1.5)';
    element.style.transformOrigin = 'top left';

    const canvas = await html2canvas(element, {
        scale: 2, // Increase scale for better quality
        useCORS: true,
        logging: false,
    });
    
    // Revert scale
    element.style.transform = '';
    element.style.transformOrigin = '';
    
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`bukti-pendaftaran-${registrationData.registrationNumber}.pdf`);
  };

  return (
    <div className="max-w-2xl mx-auto">
        <Card ref={proofRef} className="shadow-lg p-4">
            <CardHeader className="text-center border-b pb-4">
                <h1 className="font-headline text-2xl font-bold text-primary">TANDA BUKTI PENDAFTARAN</h1>
                <p className="text-muted-foreground">Layanan Online KUA Banjarmasin Utara</p>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <p className="text-center bg-accent/50 text-accent-foreground p-3 rounded-md">
                        Nomor Pendaftaran Anda:
                        <br />
                        <strong className="text-2xl font-bold tracking-wider">{registrationData.registrationNumber}</strong>
                    </p>
                    <dl className="space-y-4 text-sm mt-6">
                        <DetailItem label="Nama Lengkap" value={registrationData.fullName} />
                        <DetailItem label="NIK" value={registrationData.nik} />
                        <DetailItem label="Tempat, Tanggal Lahir" value={placeAndDateOfBirth} />
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
                        <li>Tanda bukti ini diperlukan untuk proses verifikasi di kantor kami.</li>
                        <li>Pendaftaran online ini adalah langkah awal. Dokumen fisik asli wajib dibawa saat datang ke kantor.</li>
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
