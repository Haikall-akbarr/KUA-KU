'use client';

import React, { useRef, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { id as IndonesianLocale } from 'date-fns/locale';
import { Download, Printer, Loader2, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
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

// Komponen internal yang menggunakan useSearchParams
function RegistrationProofContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, userRole } = useAuth();
  const proofRef = useRef<HTMLDivElement>(null);
  const printProofRef = useRef<HTMLDivElement>(null); // Ref terpisah untuk print
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Fungsi untuk menentukan dashboard berdasarkan role
  const getDashboardPath = () => {
    if (!userRole) return '/';
    
    switch(userRole) {
      case 'kepala_kua':
        return '/admin/kepala';
      case 'staff':
        return '/admin/staff';
      case 'penghulu':
        return '/penghulu';
      case 'administrator':
        return '/admin';
      default:
        return '/';
    }
  };

  const handleBackToDashboard = () => {
    const dashboardPath = getDashboardPath();
    router.push(dashboardPath);
  };

  // Data sesuai dengan struktur yang dikirim dari actions.ts dan dokumentasi API
  const registrationData = {
    nomor_pendaftaran: searchParams.get('nomor_pendaftaran') || searchParams.get('registrationNumber'),
    status_pendaftaran: searchParams.get('status_pendaftaran') || 'Draft',
    nama_suami: searchParams.get('nama_suami') || '',
    nama_istri: searchParams.get('nama_istri') || '',
    tanggal_nikah: searchParams.get('tanggal_nikah') || '',
    waktu_nikah: searchParams.get('weddingTime') || searchParams.get('waktu_nikah') || '',
    tempat_nikah: searchParams.get('weddingLocation') || searchParams.get('tempat_nikah') || '',
    alamat_akad: searchParams.get('alamat_akad') || '',
  };

  // Format tanggal nikah
  const formattedWeddingDate = registrationData.tanggal_nikah
    ? (() => {
        try {
          // Handle ISO format (2024-12-15T00:00:00Z) or date string (2024-12-15)
          const dateStr = registrationData.tanggal_nikah.split('T')[0];
          return format(parseISO(dateStr), 'EEEE, dd MMMM yyyy', { locale: IndonesianLocale });
        } catch (e) {
          return registrationData.tanggal_nikah;
        }
      })()
    : '-';

  const handleDownloadPdf = async () => {
    const element = proofRef.current; // Gunakan ref untuk elemen yang terlihat
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
            format: [canvas.width + 40, canvas.height + 40] // Tambah padding
        });
        
        pdf.setFillColor(255, 255, 255); // Background putih
        pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), 'F');
        pdf.addImage(imgData, 'PNG', 20, 20, canvas.width, canvas.height); // Tambah margin
        pdf.save(`bukti-pendaftaran-nikah-${registrationData.nomor_pendaftaran || 'unknown'}.pdf`);
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

  // Komponen Kartu Bukti (agar bisa dipakai ulang untuk print)
  const ProofCard = () => (
    <Card className="shadow-lg border-2 border-primary">
      <CardHeader className="text-center border-b-2 border-primary pb-4">
        <h1 className="font-headline text-2xl font-bold text-primary">BUKTI PENDAFTARAN NIKAH</h1>
        <p className="text-muted-foreground">Layanan Online KUA Banjarmasin Utara</p>
      </CardHeader>
      <CardContent className="pt-6 px-6">
        <div className="space-y-6">
          <div className="text-center bg-accent/20 text-accent-foreground p-4 rounded-lg border border-accent">
            <p className="font-medium">Nomor Pendaftaran Anda:</p>
            <strong className="text-3xl font-bold tracking-wider text-primary">{registrationData.nomor_pendaftaran || '-'}</strong>
          </div>
          <dl className="divide-y divide-border/50">
            <DetailItem label="Calon Suami" value={registrationData.nama_suami} />
            <DetailItem label="Calon Istri" value={registrationData.nama_istri} />
            <DetailItem label="Tanggal Akad Nikah" value={formattedWeddingDate} />
            <DetailItem label="Waktu Akad Nikah" value={registrationData.waktu_nikah ? `${registrationData.waktu_nikah} WITA` : '-'} />
            <DetailItem label="Tempat Nikah" value={registrationData.tempat_nikah} />
            {registrationData.alamat_akad && (
              <DetailItem label="Alamat Akad" value={registrationData.alamat_akad} />
            )}
            <DetailItem label="Status Pendaftaran" value={registrationData.status_pendaftaran} />
          </dl>
        </div>
      </CardContent>
      <CardFooter className="mt-6 border-t-2 border-primary pt-6">
        <div className="w-full text-xs text-muted-foreground">
          <p className="font-bold text-destructive">Penting:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Harap simpan dan/atau cetak tanda bukti ini.</li>
            <li>Ini adalah bukti pendaftaran nikah online, bukan bukti pernikahan.</li>
            <li>Langkah selanjutnya adalah datang ke kantor KUA dengan membawa semua berkas persyaratan fisik (asli dan fotokopi) sesuai dengan tanggal yang akan diinformasikan oleh petugas kami.</li>
            <li>Status pendaftaran Anda saat ini: <strong>{registrationData.status_pendaftaran}</strong></li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <div className="max-w-3xl mx-auto my-8 px-4"> {/* Tambah margin dan padding */}
      {/* Versi untuk Tampilan Web dan PDF */}
        <div ref={proofRef} className="bg-card p-2 print:hidden"> 
          <ProofCard />
        </div>

      {/* Tombol-tombol Aksi */}
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
            {(userRole && (userRole === 'staff' || userRole === 'kepala_kua' || userRole === 'penghulu' || userRole === 'administrator')) ? (
              <Button 
                variant="default" 
                onClick={handleBackToDashboard} 
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                <Home className="mr-2 h-4 w-4" />
                Kembali ke Dashboard
              </Button>
            ) : (
              <Button 
                variant="default" 
                onClick={() => router.push('/')} 
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Beranda
              </Button>
            )}
        </div>

      {/* Versi Khusus untuk Print */}
        <style jsx global>{`
            @media print {
              @page {
                size: A4;
                margin: 20mm;
              }
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
        <div className="print-container hidden print:block" ref={printProofRef}>
          <ProofCard />
      </div>
    </div>
  );
}

// Ini adalah komponen default untuk halaman /pendaftaran/sukses
export default function RegistrationProofPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <RegistrationProofContent />
    </Suspense>
  );
}