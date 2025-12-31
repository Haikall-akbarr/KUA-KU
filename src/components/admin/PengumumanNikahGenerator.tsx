'use client';

import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, addDays, differenceInYears, parseISO } from 'date-fns';
import { id as IndonesianLocale } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { 
  generatePengumumanNikah,
  generatePengumumanNikahKepalaKUA,
  getPengumumanList,
  getPengumumanListKepalaKUA,
  type CustomKopSurat,
  type PengumumanListRequestBody,
  type PengumumanListResponse
} from '@/lib/simnikah-api';
import {
  parsePengumumanHTML,
  printPengumumanHTML,
  downloadPengumumanHTML,
  validateTanggalFormat,
  getDefaultDateRange
} from '@/utils/helpers/pengumuman';
import { handleApiError } from '@/utils/errorHandler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, FileText, Download, Printer, Settings, Calendar, AlertCircle, List, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

interface PengumumanNikahGeneratorProps {
  role?: 'staff' | 'kepala_kua';
}

export function PengumumanNikahGenerator({ role = 'staff' }: PengumumanNikahGeneratorProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [html, setHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showCustomKop, setShowCustomKop] = useState(false);
  const [listData, setListData] = useState<PengumumanListResponse | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [showList, setShowList] = useState(false);
  
  // Get current week (Monday to Sunday)
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
  
  const [tanggalAwal, setTanggalAwal] = useState<string>(
    format(weekStart, 'yyyy-MM-dd')
  );
  const [tanggalAkhir, setTanggalAkhir] = useState<string>(
    format(weekEnd, 'yyyy-MM-dd')
  );
  
  const [kopSurat, setKopSurat] = useState<CustomKopSurat>({
    nama_kua: 'KANTOR URUSAN AGAMA KECAMATAN BANJARMASIN UTARA',
    alamat_kua: 'PH5Q+F8C, Jl. Wira Karya, Pangeran',
    kota: 'Kota Banjarmasin',
    provinsi: 'Kalimantan Selatan',
    kode_pos: '70123',
    telepon: '-',
    email: '-',
    website: '',
    logo_url: '',
  });

  const loadList = async () => {
    setLoadingList(true);
    setError(null);
    setShowList(false);

    try {
      // Validasi tanggal
      if (tanggalAwal && tanggalAkhir) {
        const startDate = new Date(tanggalAwal);
        const endDate = new Date(tanggalAkhir);
        
        if (startDate > endDate) {
          const errorMsg = 'Tanggal awal tidak boleh lebih besar dari tanggal akhir';
          setError(errorMsg);
          toast({
            title: 'Validasi Gagal',
            description: errorMsg,
            variant: 'destructive',
          });
          setLoadingList(false);
          return;
        }
      }

      // Pastikan format tanggal YYYY-MM-DD
      let formattedTanggalAwal = tanggalAwal && tanggalAwal.trim() !== '' ? tanggalAwal : undefined;
      let formattedTanggalAkhir = tanggalAkhir && tanggalAkhir.trim() !== '' ? tanggalAkhir : undefined;

      // Validasi format tanggal (harus YYYY-MM-DD)
      if (formattedTanggalAwal && !/^\d{4}-\d{2}-\d{2}$/.test(formattedTanggalAwal)) {
        const errorMsg = 'Format tanggal awal tidak valid. Harus YYYY-MM-DD';
        setError(errorMsg);
        toast({
          title: 'Format Tanggal Salah',
          description: errorMsg,
          variant: 'destructive',
        });
        setLoadingList(false);
        return;
      }

      if (formattedTanggalAkhir && !/^\d{4}-\d{2}-\d{2}$/.test(formattedTanggalAkhir)) {
        const errorMsg = 'Format tanggal akhir tidak valid. Harus YYYY-MM-DD';
        setError(errorMsg);
        toast({
          title: 'Format Tanggal Salah',
          description: errorMsg,
          variant: 'destructive',
        });
        setLoadingList(false);
        return;
      }

      // Sesuai dokumentasi API: POST request dengan body
      const requestBody: PengumumanListRequestBody = {
        tanggal_awal: formattedTanggalAwal,
        tanggal_akhir: formattedTanggalAkhir,
        // Optional: kop_surat bisa ditambahkan jika diperlukan
      };

      console.log('📅 POST Request Body:', {
        tanggal_awal: formattedTanggalAwal,
        tanggal_akhir: formattedTanggalAkhir,
      });

      const data = role === 'kepala_kua'
        ? await getPengumumanListKepalaKUA(requestBody)
        : await getPengumumanList(requestBody);
      
      console.log('✅ Pengumuman list loaded:', data);
      
      setListData(data);
      setShowList(true);
      
      // Format periode dari tanggal yang dipilih user, bukan dari API
      const periodeText = tanggalAwal && tanggalAkhir
        ? `${format(new Date(tanggalAwal), 'dd MMMM yyyy', { locale: IndonesianLocale })} s/d ${format(new Date(tanggalAkhir), 'dd MMMM yyyy', { locale: IndonesianLocale })}`
        : data.data.periode || 'Semua periode';

      toast({
        title: 'Berhasil!',
        description: `Ditemukan ${data.data.total} pendaftaran untuk periode ${periodeText}`,
        variant: 'default',
      });
    } catch (err: any) {
      console.error('❌ Error loading list:', err);
      console.error('❌ Error response:', err.response);
      
      let errorMessage = 'Terjadi kesalahan saat memuat daftar';
      let errorTitle = 'Gagal';
      
      if (err.response) {
        const status = err.response.status;
        const errorData = err.response.data;
        
        if (status === 400) {
          errorTitle = 'Format Tanggal Tidak Valid';
          errorMessage = errorData?.error || errorData?.message || 'Format tanggal tidak valid. Pastikan format YYYY-MM-DD';
        } else if (status === 401) {
          errorTitle = 'Sesi Berakhir';
          errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
        } else if (status === 403) {
          errorTitle = 'Akses Ditolak';
          errorMessage = 'Anda tidak memiliki izin untuk mengakses fitur ini.';
        } else if (status === 404) {
          errorTitle = 'Endpoint Tidak Ditemukan';
          errorMessage = 'Endpoint tidak ditemukan. Pastikan API backend sudah ter-update.';
        } else if (status === 500) {
          errorTitle = 'Kesalahan Server';
          errorMessage = 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
        duration: 10000,
      });
    } finally {
      setLoadingList(false);
    }
  };

  // Helper function untuk get bulan tahun dari periode
  const getBulanTahun = (tanggalAwal: string, tanggalAkhir: string): string => {
    try {
      const start = new Date(tanggalAwal);
      const bulan = format(start, 'MMMM', { locale: IndonesianLocale }).toUpperCase();
      const tahun = start.getFullYear();
      return `${bulan} ${tahun}`;
    } catch {
      return format(new Date(), 'MMMM yyyy', { locale: IndonesianLocale }).toUpperCase();
    }
  };

  // Generate HTML content from data - Format Excel Standar KUA (15 kolom, Landscape A4)
  const generateHTMLFromData = (data: PengumumanListResponse) => {
    const { registrations, kop_surat, periode, tanggal_awal, tanggal_akhir } = data.data;
    const today = new Date();
    const formattedDate = format(today, 'dd MMMM yyyy', { locale: IndonesianLocale });
    const bulanTahun = getBulanTahun(tanggal_awal || '', tanggal_akhir || '');

    const rows = registrations.map((reg, index) => {
      // Gunakan data yang sudah diformat dari backend (sesuai dokumentasi terbaru)
      // Jika backend belum mengirim field tersebut, fallback ke perhitungan manual
      const hari = reg.hari || (() => {
        try {
          const tanggalNikah = new Date(reg.tanggal_nikah);
          const hariFormat = format(tanggalNikah, 'EEEE', { locale: IndonesianLocale }).toUpperCase();
          const hariMap: { [key: string]: string } = {
            'SENIN': 'SENIN',
            'SELASA': 'SELASA',
            'RABU': 'RABU',
            'KAMIS': 'KAMIS',
            'JUMAT': 'JUM\'AT',
            'SABTU': 'SABTU',
            'MINGGU': 'AHAD',
          };
          return hariMap[hariFormat] || hariFormat;
        } catch {
          return '-';
        }
      })();
      
      const tanggal = reg.tanggal || (() => {
        try {
          return new Date(reg.tanggal_nikah).getDate().toString();
        } catch {
          return '-';
        }
      })();
      
      // Gunakan waktu_nikah_formatted jika ada, jika tidak format manual
      const waktu = reg.waktu_nikah_formatted || reg.waktu_nikah?.replace(':', '.') || '-';
      
      // Gunakan usia dari backend jika ada, jika tidak hitung manual
      const usiaPria = reg.calon_suami.usia ?? (() => {
        if (reg.calon_suami.tanggal_lahir) {
          try {
            return differenceInYears(new Date(), parseISO(reg.calon_suami.tanggal_lahir));
          } catch {
            return '-';
          }
        }
        return '-';
      })();
      
      const usiaWanita = reg.calon_istri.usia ?? (() => {
        if (reg.calon_istri.tanggal_lahir) {
          try {
            return differenceInYears(new Date(), parseISO(reg.calon_istri.tanggal_lahir));
          } catch {
            return '-';
          }
        }
        return '-';
      })();
      
      // Get data lainnya
      const namaPria = reg.calon_suami.nama_lengkap || '-';
      const namaWanita = reg.calon_istri.nama_lengkap || '-';
      const pendkPria = reg.calon_suami.pendidikan_terakhir || '-';
      const pendkWanita = reg.calon_istri.pendidikan_terakhir || '-';
      const waliNikah = reg.wali_nikah?.nama_dan_bin || '-';
      const penghulu = reg.penghulu?.nama_lengkap || '-';
      const kelurahan = reg.kelurahan || '-';
      
      // Tempat nikah: jika "Di KUA" tampilkan "Di KUA", jika "Di Luar KUA" tampilkan alamat_akad
      const tempat = reg.tempat_nikah === 'Di KUA' 
        ? 'Di KUA' 
        : (reg.alamat_akad || reg.tempat_nikah || '-');

      return `
        <tr>
          <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 8pt;">${index + 1}</td>
          <td style="border: 1px solid #000; padding: 4px; font-size: 8pt;">${namaPria}</td>
          <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 8pt;">${usiaPria}</td>
          <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 8pt;">${pendkPria}</td>
          <td style="border: 1px solid #000; padding: 4px; font-size: 8pt;">${namaWanita}</td>
          <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 8pt;">${usiaWanita}</td>
          <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 8pt;">${pendkWanita}</td>
          <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 8pt;">${hari}</td>
          <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 8pt;">${tanggal}</td>
          <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 8pt;">${waktu}</td>
          <td style="border: 1px solid #000; padding: 4px; font-size: 8pt;">${tempat}</td>
          <td style="border: 1px solid #000; padding: 4px; font-size: 8pt;">${waliNikah}</td>
          <td style="border: 1px solid #000; padding: 4px; font-size: 8pt;">${penghulu}</td>
          <td style="border: 1px solid #000; padding: 4px; font-size: 8pt;">${kelurahan}</td>
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Jadual Nikah ${bulanTahun}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 1cm;
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            margin: 0;
            padding: 0;
          }
          .page-content {
            width: 100%;
            max-width: 29.7cm;
            margin: 0 auto;
            padding: 0.5cm;
          }
          .kop-surat {
            margin-bottom: 15px;
            text-align: center;
          }
          .kop-surat img {
            height: 80px;
            width: auto;
            margin-bottom: 10px;
            display: block;
            margin-left: auto;
            margin-right: auto;
          }
          .kop-surat h3 {
            margin: 0;
            font-size: 11pt;
            font-weight: bold;
            line-height: 1.2;
            text-align: center;
          }
          .kop-surat h2 {
            margin: 5px 0;
            font-size: 12pt;
            font-weight: bold;
            text-align: center;
          }
          .kop-surat p {
            margin: 0;
            font-size: 9pt;
            line-height: 1.3;
            text-align: center;
          }
          .judul {
            text-align: center;
            font-size: 12pt;
            font-weight: bold;
            margin: 15px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 8pt;
          }
          table th {
            border: 1px solid #000;
            padding: 4px;
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: center;
            font-size: 8pt;
          }
          table td {
            border: 1px solid #000;
            padding: 4px;
            font-size: 8pt;
          }
          .ttd {
            margin-top: 30px;
            text-align: right;
            float: right;
            width: 40%;
          }
          .ttd p {
            margin: 5px 0;
            font-size: 11pt;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            .page-content {
              max-width: 100%;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="page-content">
          <div class="kop-surat">
            ${kop_surat.logo_url ? `<img src="${kop_surat.logo_url}" alt="Logo">` : ''}
            <h3>KEMENTERIAN AGAMA REPUBLIK INDONESIA</h3>
            <h3>KANTOR KEMENTERIAN AGAMA ${kop_surat.kota?.toUpperCase() || ''}</h3>
            <h2>${kop_surat.nama_kua?.toUpperCase() || 'KANTOR URUSAN AGAMA'}</h2>
            <p>${kop_surat.alamat_kua || ''}, ${kop_surat.kota || ''}, ${kop_surat.provinsi || ''} ${kop_surat.kode_pos || ''}</p>
            <p>Telepon: ${kop_surat.telepon || '-'}, Email: ${kop_surat.email || '-'}</p>
            <hr style="border: 2px solid #000; margin-top: 10px; margin-bottom: 2px;">
            <hr style="border: 1px solid #000; margin-top: 0; margin-bottom: 20px;">
          </div>

          <div class="judul">
            JADUAL NIKAH ${bulanTahun}
          </div>

          <table>
            <thead>
              <tr>
                <th rowspan="2" style="vertical-align: middle; text-align: center;">NO<br>URUT</th>
                <th colspan="6" style="text-align: center;">DATA CALON PENGANTIN</th>
                <th colspan="7" style="text-align: center;">PELAKSANAAN NIKAH</th>
              </tr>
              <tr>
                <th style="text-align: center;">PRIA / BIN</th>
                <th style="text-align: center;">USIA</th>
                <th style="text-align: center;">PENDK</th>
                <th style="text-align: center;">WANITA / BINTI</th>
                <th style="text-align: center;">USIA</th>
                <th style="text-align: center;">PENDK</th>
                <th style="text-align: center;">HARI</th>
                <th style="text-align: center;">TGL</th>
                <th style="text-align: center;">JAM</th>
                <th style="text-align: center;">TEMPAT</th>
                <th style="text-align: center;">WALINIKAH</th>
                <th style="text-align: center;">PENGHULU</th>
                <th style="text-align: center;">KELURAHAN</th>
              </tr>
            </thead>
            <tbody>
              ${rows.length > 0 ? rows : '<tr><td colspan="14" style="text-align: center; padding: 20px;">Tidak ada data pendaftaran nikah pada periode ini.</td></tr>'}
            </tbody>
          </table>

          <div class="ttd">
            <p>${kop_surat.kota || 'Banjarmasin'}, ${formattedDate}</p>
            <p>Kepala KUA,</p>
            <br><br><br><br>
            <p style="font-weight: bold; text-decoration: underline;">(.............................................)</p>
            <p>NIP. .............................................</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generatePengumuman = async () => {
    setLoading(true);
    setError(null);
    setHtml('');

    try {
      // Validasi format tanggal
      if (tanggalAwal && !validateTanggalFormat(tanggalAwal)) {
        throw new Error('Format tanggal awal tidak valid. Gunakan format YYYY-MM-DD');
      }
      if (tanggalAkhir && !validateTanggalFormat(tanggalAkhir)) {
        throw new Error('Format tanggal akhir tidak valid. Gunakan format YYYY-MM-DD');
      }

      // Validasi tanggal awal tidak boleh lebih besar dari tanggal akhir
      if (tanggalAwal && tanggalAkhir && new Date(tanggalAwal) > new Date(tanggalAkhir)) {
        throw new Error('Tanggal awal tidak boleh lebih besar dari tanggal akhir');
      }

      // Prepare request body
      const requestBody: PengumumanListRequestBody = {
        tanggal_awal: tanggalAwal && tanggalAwal.trim() !== '' ? tanggalAwal : undefined,
        tanggal_akhir: tanggalAkhir && tanggalAkhir.trim() !== '' ? tanggalAkhir : undefined,
      };

      // Prepare custom kop surat jika ada
      const customKop: CustomKopSurat | undefined = showCustomKop ? kopSurat : undefined;

      // Coba generate dari backend API dulu
      let htmlContent: string | null = null;
      try {
        htmlContent = role === 'kepala_kua'
          ? await generatePengumumanNikahKepalaKUA(requestBody, customKop)
          : await generatePengumumanNikah(requestBody, customKop);
        
        console.log('📄 HTML Content received:', {
          length: htmlContent?.length || 0,
          preview: htmlContent?.substring(0, 200) || 'empty',
          startsWithHTML: htmlContent?.trim().startsWith('<!') || htmlContent?.trim().startsWith('<html'),
        });
        
        // Parse dan validasi HTML response
        let parsedHTML: string;
        try {
          parsedHTML = parsePengumumanHTML(htmlContent);
        } catch (parseError: any) {
          console.warn('⚠️ HTML parsing failed, using raw content:', parseError.message);
          // Jika parsing gagal, gunakan raw content (mungkin HTML valid tapi tidak dimulai dengan <!)
          parsedHTML = htmlContent || '';
        }
        
        console.log('✅ Setting HTML to state:', {
          length: parsedHTML.length,
          hasContent: parsedHTML.length > 0,
        });
        
        setHtml(parsedHTML);
        
        toast({
          title: 'Berhasil!',
          description: 'Surat pengumuman nikah berhasil di-generate dari server',
          variant: 'default',
        });
      } catch (backendError: any) {
        // Jika backend error atau tidak ada data, gunakan data dari list dan generate di frontend
        console.warn('⚠️ Backend generate failed, using frontend generation:', backendError.message);
        
        // Ambil data dari list yang sudah di-fetch (atau fetch ulang jika belum ada)
        let listDataToUse = listData;
        if (!listDataToUse || listDataToUse.data.registrations.length === 0) {
          // Fetch list data jika belum ada
          listDataToUse = role === 'kepala_kua'
            ? await getPengumumanListKepalaKUA(requestBody)
            : await getPengumumanList(requestBody);
        }
        
        // Pastikan ada data
        if (!listDataToUse || !listDataToUse.data || listDataToUse.data.registrations.length === 0) {
          throw new Error('Tidak ada data pendaftaran untuk periode yang dipilih');
        }
        
        // Generate HTML dari data list menggunakan fungsi yang sudah ada
        // Merge kop surat dengan default values
        const defaultKopSurat = {
          nama_kua: 'KANTOR URUSAN AGAMA',
          alamat_kua: '',
          kota: '',
          provinsi: '',
          kode_pos: '',
          telepon: '',
          email: '',
          website: '',
          logo_url: '',
        };
        
        const kopSuratToUse = {
          ...defaultKopSurat,
          ...listDataToUse.data.kop_surat,
          ...(customKop || {}),
          ...(showCustomKop ? kopSurat : {}),
        };
        
        htmlContent = generateHTMLFromData({
          ...listDataToUse,
          data: {
            ...listDataToUse.data,
            kop_surat: kopSuratToUse,
          },
        });
        
        console.log('📄 Frontend-generated HTML:', {
          length: htmlContent.length,
          preview: htmlContent.substring(0, 200),
        });
        
        setHtml(htmlContent);
        
        toast({
          title: 'Berhasil!',
          description: `Surat pengumuman nikah berhasil di-generate dari ${listDataToUse.data.total} pendaftaran`,
          variant: 'default',
        });
      }
    } catch (err: any) {
      console.error('Error generating pengumuman:', err);
      
      // Use error handler utility
      const errorInfo = handleApiError(err);
      
      setError(errorInfo.message);
      
      toast({
        title: 'Gagal Generate Pengumuman',
        description: errorInfo.message,
        variant: 'destructive',
        duration: 10000,
      });
    } finally {
      setLoading(false);
    }
  };

  const printPengumuman = () => {
    if (!html) return;
    printPengumumanHTML(html);
  };
  
  const downloadHTML = () => {
    if (!html) return;
    const filename = `pengumuman-nikah-${tanggalAwal || 'current'}-${tanggalAkhir || 'current'}.html`;
    downloadPengumumanHTML(html, filename);
    
    toast({
      title: 'Berhasil',
      description: 'File HTML berhasil diunduh',
      variant: 'default',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Surat Pengumuman Nikah
          </CardTitle>
          <CardDescription>
            Generate surat pengumuman nikah untuk periode tertentu dalam format HTML yang siap dicetak
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Form Periode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tanggal_awal" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Tanggal Awal (YYYY-MM-DD)
              </Label>
              <Input
                id="tanggal_awal"
                type="date"
                value={tanggalAwal}
                onChange={(e) => setTanggalAwal(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Default: Senin minggu ini
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggal_akhir" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Tanggal Akhir (YYYY-MM-DD)
              </Label>
              <Input
                id="tanggal_akhir"
                type="date"
                value={tanggalAkhir}
                onChange={(e) => setTanggalAkhir(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Default: Minggu minggu ini
              </p>
            </div>
          </div>

          {/* Custom Kop Surat Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="custom_kop"
              checked={showCustomKop}
              onCheckedChange={(checked) => setShowCustomKop(checked as boolean)}
            />
            <Label htmlFor="custom_kop" className="flex items-center gap-2 cursor-pointer">
              <Settings className="h-4 w-4" />
              Gunakan Kop Surat Custom
            </Label>
          </div>

          {/* Custom Kop Surat Form */}
          {showCustomKop && (
            <Card className="bg-accent/50">
              <CardHeader>
                <CardTitle className="text-lg">Kop Surat Custom</CardTitle>
                <CardDescription>
                  Kustomisasi informasi KUA yang akan ditampilkan di kop surat
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nama_kua">Nama KUA *</Label>
                    <Input
                      id="nama_kua"
                      value={kopSurat.nama_kua || ''}
                      onChange={(e) => setKopSurat({ ...kopSurat, nama_kua: e.target.value })}
                      placeholder="KANTOR URUSAN AGAMA KECAMATAN..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alamat_kua">Alamat KUA *</Label>
                    <Input
                      id="alamat_kua"
                      value={kopSurat.alamat_kua || ''}
                      onChange={(e) => setKopSurat({ ...kopSurat, alamat_kua: e.target.value })}
                      placeholder="Jl. Contoh No. 123"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="kota">Kota *</Label>
                    <Input
                      id="kota"
                      value={kopSurat.kota || ''}
                      onChange={(e) => setKopSurat({ ...kopSurat, kota: e.target.value })}
                      placeholder="Kota Banjarmasin"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="provinsi">Provinsi *</Label>
                    <Input
                      id="provinsi"
                      value={kopSurat.provinsi || ''}
                      onChange={(e) => setKopSurat({ ...kopSurat, provinsi: e.target.value })}
                      placeholder="Kalimantan Selatan"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="kode_pos">Kode Pos</Label>
                    <Input
                      id="kode_pos"
                      value={kopSurat.kode_pos || ''}
                      onChange={(e) => setKopSurat({ ...kopSurat, kode_pos: e.target.value })}
                      placeholder="70123"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telepon">Telepon</Label>
                    <Input
                      id="telepon"
                      value={kopSurat.telepon || ''}
                      onChange={(e) => setKopSurat({ ...kopSurat, telepon: e.target.value })}
                      placeholder="0511-1234567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={kopSurat.email || ''}
                      onChange={(e) => setKopSurat({ ...kopSurat, email: e.target.value })}
                      placeholder="kua@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                      id="website"
                      type="url"
                      value={kopSurat.website || ''}
                      onChange={(e) => setKopSurat({ ...kopSurat, website: e.target.value })}
                      placeholder="https://kua.example.com"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="logo_url">Logo URL (Optional)</Label>
                    <Input
                      id="logo_url"
                      type="url"
                      value={kopSurat.logo_url || ''}
                      onChange={(e) => setKopSurat({ ...kopSurat, logo_url: e.target.value })}
                      placeholder="https://example.com/logo-kua.png"
                    />
                    <p className="text-xs text-muted-foreground">
                      URL logo harus dapat diakses (tidak bisa menggunakan base64 atau file lokal)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={loadList}
              disabled={loadingList || loading}
              variant="outline"
              className="flex-1"
            >
              {loadingList ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <List className="mr-2 h-4 w-4" />
                  Lihat Daftar
                </>
              )}
            </Button>
            <Button
              onClick={generatePengumuman}
              disabled={loading || loadingList}
              className="flex-1"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Pengumuman
                </>
              )}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* List Data */}
          {showList && listData && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Daftar Pendaftaran ({listData.data.total} pendaftaran)
                </CardTitle>
                <CardDescription>
                  Periode: {tanggalAwal && tanggalAkhir 
                    ? `${format(new Date(tanggalAwal), 'dd MMMM yyyy', { locale: IndonesianLocale })} s/d ${format(new Date(tanggalAkhir), 'dd MMMM yyyy', { locale: IndonesianLocale })}`
                    : listData.data.periode || 'Semua periode'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {listData.data.total === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Tidak ada pendaftaran yang disetujui untuk periode ini.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {listData.data.registrations.map((reg) => (
                      <div
                        key={reg.id}
                        className="p-3 bg-white rounded-md border border-blue-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-sm">
                              {reg.calon_suami.nama_lengkap} & {reg.calon_istri.nama_lengkap}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {reg.nomor_pendaftaran}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>
                            <span className="font-medium">Tanggal:</span>{' '}
                            {format(new Date(reg.tanggal_nikah), 'dd MMM yyyy', { locale: IndonesianLocale })}
                          </div>
                          <div>
                            <span className="font-medium">Waktu:</span> {reg.waktu_nikah} WITA
                          </div>
                          <div>
                            <span className="font-medium">Tempat:</span> {reg.tempat_nikah}
                          </div>
                          <div>
                            <span className="font-medium">Wali:</span> {reg.wali_nikah?.nama_dan_bin || 'Data tidak tersedia'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  onClick={() => setShowList(false)}
                  variant="outline"
                  className="w-full mt-4"
                >
                  Tutup
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {html && (
            <div className="flex gap-2">
              <Button onClick={printPengumuman} variant="outline" className="flex-1">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button onClick={downloadHTML} variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download HTML
              </Button>
            </div>
          )}

          {/* Preview */}
          {html && (
            <Card>
              <CardHeader>
                <CardTitle>Preview Surat Pengumuman</CardTitle>
                <CardDescription>
                  Surat pengumuman dalam format HTML (A4 Landscape, 15 kolom). Gunakan tombol Print untuk mencetak atau Download untuk menyimpan.
                  {process.env.NODE_ENV === 'development' && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (HTML length: {html.length} chars)
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {html.trim().length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      HTML content is empty. Please try generating again.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="border rounded-lg overflow-auto bg-white" style={{ maxHeight: '80vh' }}>
                    <iframe
                      srcDoc={html}
                      style={{
                        width: '100%',
                        minHeight: '600px',
                        border: 'none',
                      }}
                      title="Preview Pengumuman Nikah"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

