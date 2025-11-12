'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Download, Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CertificateData {
  nomor_pendaftaran: string;
  nomor_surat_nikah: string;
  tanggal_surat: string;
  nama_suami: string;
  nama_istri: string;
  tanggal_nikah: string;
  waktu_nikah: string;
  tempat_nikah: string;
  penghulu_nama: string;
  diterbitkan_oleh: string;
}

export default function CertificatePreviewPage() {
  const params = useParams();
  const registrationId = params.id as string;
  
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCertificate();
  }, [registrationId]);

  const loadCertificate = () => {
    try {
      const allRegs = JSON.parse(localStorage.getItem('marriageRegistrations') || '[]');
      const reg = allRegs.find((r: any) => r.id === registrationId);

      if (!reg) {
        setError('Registrasi tidak ditemukan');
        setLoading(false);
        return;
      }

      const certificates = JSON.parse(localStorage.getItem('marriage_certificates') || '[]');
      const cert = certificates.find((c: any) => c.id === registrationId);

      if (!cert) {
        setError('Surat nikah belum diterbitkan untuk registrasi ini');
        setLoading(false);
        return;
      }

      setCertificate(cert);
      setLoading(false);
    } catch (err) {
      console.error('Error loading certificate:', err);
      setError('Gagal memuat surat nikah');
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      setDownloading(true);
      const element = document.getElementById('certificate-content');
      
      if (!element) {
        setError('Gagal menemukan konten surat');
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Surat-Nikah-${certificate?.nomor_surat_nikah}.pdf`);
      
      console.log('✅ PDF berhasil diunduh');
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Gagal mengunduh PDF. Silakan coba lagi.');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat surat nikah...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Link href="/admin/kepala">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Link href="/admin/kepala">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Tidak Ada Data</AlertTitle>
          <AlertDescription>Surat nikah tidak ditemukan</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin/kepala">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="gap-2 print:hidden"
          >
            <Printer className="w-4 h-4" />
            Cetak
          </Button>
          <Button
            onClick={downloadPDF}
            disabled={downloading}
            className="gap-2 bg-blue-600 hover:bg-blue-700 print:hidden"
          >
            {downloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Mengunduh...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Unduh PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Certificate Content */}
      <Card className="border-2">
        <CardContent className="p-0">
          <div
            id="certificate-content"
            className="p-12 bg-white"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse"%3E%3Ctext x="50" y="50" font-size="60" fill="rgba(200,200,200,0.05)" text-anchor="middle" dominant-baseline="middle"%3E✓%3C/text%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100" height="100" fill="url(%23pattern)"/%3E%3C/svg%3E")',
            }}
          >
            {/* Header */}
            <div className="text-center mb-8 pb-8 border-b-4 border-gray-800">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                SURAT NIKAH
              </h1>
              <p className="text-lg text-gray-700 mb-4">
                Kantor Urusan Agama (KUA)
              </p>
              <p className="text-sm text-gray-600">
                Nomor Surat: {certificate.nomor_surat_nikah}
              </p>
            </div>

            {/* Main Content */}
            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-1">
                    CALON SUAMI:
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {certificate.nama_suami}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-1">
                    CALON ISTRI:
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {certificate.nama_istri}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded border-l-4 border-gray-800">
                <h3 className="font-bold text-gray-900 mb-4">
                  DETAIL PERNIKAHAN
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Tanggal Nikah:</p>
                    <p className="font-semibold text-gray-900">
                      {certificate.tanggal_nikah}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Waktu Nikah:</p>
                    <p className="font-semibold text-gray-900">
                      {certificate.waktu_nikah}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600">Tempat Nikah:</p>
                    <p className="font-semibold text-gray-900">
                      {certificate.tempat_nikah}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Penghulu:</p>
                  <p className="font-semibold text-gray-900 mb-8">
                    {certificate.penghulu_nama}
                  </p>
                  <div className="mt-12">
                    <p className="text-xs text-gray-600 mb-1">(Tanda Tangan)</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Kepala KUA:</p>
                  <p className="font-semibold text-gray-900 mb-8">
                    {certificate.diterbitkan_oleh}
                  </p>
                  <div className="mt-12">
                    <p className="text-xs text-gray-600 mb-1">(Tanda Tangan)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-8 border-t-2 border-gray-800">
              <p className="text-xs text-gray-600 mb-1">
                Diterbitkan: {certificate.tanggal_surat}
              </p>
              <p className="text-xs text-gray-600">
                Nomor Pendaftaran: {certificate.nomor_pendaftaran}
              </p>
              <p className="text-xs text-gray-500 mt-4">
                Surat ini adalah bukti sah pernikahan yang telah terdaftar pada
                KUA
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          #certificate-content {
            width: 100%;
            height: 100%;
          }
        }
      `}</style>
    </div>
  );
}
