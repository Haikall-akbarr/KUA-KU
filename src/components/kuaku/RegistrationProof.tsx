
'use client';

import React, { useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { id as IndonesianLocale } from 'date-fns/locale';
import { Download, Printer, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DetailItemProps {
  label: string;
  value: string | undefined | null;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row py-2 border-b border-border/50 last:border-none">
    <dt className="w-full sm:w-1/3 font-medium text-muted-foreground">{label}</dt>
    <dd className="w-full sm:w-2/3 mt-1 sm:mt-0 font-semibold text-foreground">{value || '-'}</dd>
  </div>
);

export function RegistrationProof() {
  const searchParams = useSearchParams();
  const proofRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

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

    setIsDownloading(true);
    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: true,
            backgroundColor: null,
             windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width + 40, canvas.height + 40] // Add padding
        });
        
        pdf.setFillColor(255, 255, 255); // White background
        pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), 'F');
        pdf.addImage(imgData, 'PNG', 20, 20, canvas.width, canvas.height); // Add image with margin
        pdf.save(`bukti-pendaftaran-${registrationData.registrationNumber}.pdf`);
    } catch (error) {
        console.error("Error generating PDF:", error);
    } finally {
        setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setTimeout(() => setIsPrinting(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto">
        <div ref={proofRef} className="bg-card p-2">
            <Card className="shadow-lg border-2 border-primary">
                <CardHeader className="text-center border-b-2 border-primary pb-4">
                    <h1 className="font-headline text-2xl font-bold text-primary">TANDA BUKTI PENDAFTARAN</h1>
                    <p className="text-muted-foreground">Layanan Online KUA Banjarmasin Utara</p>
                </CardHeader>
                <CardContent className="pt-6 px-6">
                    <div className="space-y-6">
                         <div className="text-center bg-accent/20 text-accent-foreground p-4 rounded-lg border border-accent">
                            <p className="font-medium">Nomor Pendaftaran Anda:</p>
                            <strong className="text-3xl font-bold tracking-wider text-primary">{registrationData.registrationNumber}</strong>
                        </div>
                        <dl className="divide-y divide-border/50">
                            <DetailItem label="Nama Lengkap" value={registrationData.fullName} />
                            <DetailItem label="NIK" value={registrationData.nik} />
                            <DetailItem label="Tempat, Tanggal Lahir" value={placeAndDateOfBirth} />
                            <DetailItem label="Nomor Telepon" value={registrationData.phoneNumber} />
                            <DetailItem label="Alamat Email" value={registrationData.email} />
                        </dl>
                    </div>
                </CardContent>
                <CardFooter className="mt-6 border-t-2 border-primary pt-6">
                    <div className="w-full text-xs text-muted-foreground">
                        <p className="font-bold text-destructive">Penting:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Harap simpan dan/atau cetak tanda bukti ini.</li>
                            <li>Tanda bukti ini diperlukan untuk proses verifikasi di kantor kami.</li>
                            <li>Pendaftaran online ini adalah langkah awal. Dokumen fisik asli wajib dibawa saat datang ke kantor.</li>
                        </ul>
                    </div>
                </CardFooter>
            </Card>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 print:hidden">
             <Button onClick={handleDownloadPdf} className="w-full sm:w-auto" disabled={isDownloading || isPrinting}>
                {isDownloading ? (
                    <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengunduh... </>
                ) : (
                    <> <Download className="mr-2 h-4 w-4" /> Unduh sebagai PDF </>
                )}
            </Button>
            <Button variant="outline" onClick={handlePrint} className="w-full sm:w-auto" disabled={isPrinting || isDownloading}>
                 {isPrinting ? (
                    <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mempersiapkan... </>
                ) : (
                    <> <Printer className="mr-2 h-4 w-4" /> Cetak Halaman </>
                )}
            </Button>
        </div>
        <style jsx global>{`
            @media print {
                body * {
                    visibility: hidden;
                }
                .print-container, .print-container * {
                    visibility: visible;
                }
                .print-container {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
            }
        `}</style>
        <div className="print-container hidden print:block">
            <div ref={proofRef} className="bg-white p-4">
                 <Card className="shadow-lg border-2 border-primary">
                <CardHeader className="text-center border-b-2 border-primary pb-4">
                    <h1 className="font-headline text-2xl font-bold text-primary">TANDA BUKTI PENDAFTARAN</h1>
                    <p className="text-muted-foreground">Layanan Online KUA Banjarmasin Utara</p>
                </CardHeader>
                <CardContent className="pt-6 px-6">
                    <div className="space-y-6">
                         <div className="text-center bg-accent/20 text-accent-foreground p-4 rounded-lg border border-accent">
                            <p className="font-medium">Nomor Pendaftaran Anda:</p>
                            <strong className="text-3xl font-bold tracking-wider text-primary">{registrationData.registrationNumber}</strong>
                        </div>
                        <dl className="divide-y divide-border/50">
                            <DetailItem label="Nama Lengkap" value={registrationData.fullName} />
                            <DetailItem label="NIK" value={registrationData.nik} />
                            <DetailItem label="Tempat, Tanggal Lahir" value={placeAndDateOfBirth} />
                            <DetailItem label="Nomor Telepon" value={registrationData.phoneNumber} />
                            <DetailItem label="Alamat Email" value={registrationData.email} />
                        </dl>
                    </div>
                </CardContent>
                <CardFooter className="mt-6 border-t-2 border-primary pt-6">
                    <div className="w-full text-xs text-muted-foreground">
                        <p className="font-bold text-destructive">Penting:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Harap simpan dan/atau cetak tanda bukti ini.</li>
                            <li>Tanda bukti ini diperlukan untuk proses verifikasi di kantor kami.</li>
                            <li>Pendaftaran online ini adalah langkah awal. Dokumen fisik asli wajib dibawa saat datang ke kantor.</li>
                        </ul>
                    </div>
                </CardFooter>
            </Card>
            </div>
        </div>
    </div>
  );
}
