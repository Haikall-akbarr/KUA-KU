'use client';

import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, addDays } from 'date-fns';
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

  // Generate HTML content from data
  const generateHTMLFromData = (data: PengumumanListResponse) => {
    const { registrations, kop_surat, periode } = data.data;
    const today = new Date();
    const formattedDate = format(today, 'dd MMMM yyyy', { locale: IndonesianLocale });

    const rows = registrations.map((reg, index) => `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td>
          <strong>${reg.calon_suami.nama_lengkap}</strong><br>
          <small>Bin ...</small>
        </td>
        <td>
          <strong>${reg.calon_istri.nama_lengkap}</strong><br>
          <small>Binti ...</small>
        </td>
        <td>
          ${format(new Date(reg.tanggal_nikah), 'EEEE, dd MMMM yyyy', { locale: IndonesianLocale })}<br>
          ${reg.waktu_nikah} WITA
        </td>
        <td>${reg.tempat_nikah}</td>
      </tr>
    `).join('');

    return `
      <div class="page-content">
        <div class="kop-surat">
          ${kop_surat.logo_url ? `<img src="${kop_surat.logo_url}" alt="Logo" style="height: 80px; width: auto; margin-bottom: 10px;">` : ''}
          <h3 style="margin: 0; font-size: 14pt; font-weight: bold;">KEMENTERIAN AGAMA REPUBLIK INDONESIA</h3>
          <h3 style="margin: 0; font-size: 14pt; font-weight: bold;">KANTOR KEMENTERIAN AGAMA ${kop_surat.kota?.toUpperCase() || '...' }</h3>
          <h2 style="margin: 5px 0; font-size: 16pt; font-weight: bold;">${kop_surat.nama_kua?.toUpperCase() || 'KANTOR URUSAN AGAMA'}</h2>
          <p style="margin: 0; font-size: 11pt;">${kop_surat.alamat_kua || ''}, ${kop_surat.kota || ''}, ${kop_surat.provinsi || ''} ${kop_surat.kode_pos || ''}</p>
          <p style="margin: 0; font-size: 11pt;">Telepon: ${kop_surat.telepon || '-'}, Email: ${kop_surat.email || '-'}</p>
          <hr style="border: 2px solid #000; margin-top: 10px; margin-bottom: 2px;">
          <hr style="border: 1px solid #000; margin-top: 0; margin-bottom: 20px;">
        </div>

        <div class="nomor-surat">
           <p><strong>PENGUMUMAN NIKAH</strong></p>
           <p>Nomor: B-..../Kua...../Pw.01/..../${new Date().getFullYear()}</p>
        </div>

        <div class="isi-surat">
          <p>Berdasarkan Peraturan Menteri Agama Nomor 20 Tahun 2019 tentang Pencatatan Pernikahan, Kepala KUA Kecamatan ${kop_surat.nama_kua?.replace('KANTOR URUSAN AGAMA ', '') || '...'} mengumumkan Kehendak Nikah calon pengantin sebagai berikut:</p>

          <p>Periode: <strong>${periode}</strong></p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr>
                <th style="border: 1px solid #000; padding: 8px; background-color: #f0f0f0;">No</th>
                <th style="border: 1px solid #000; padding: 8px; background-color: #f0f0f0;">Calon Suami</th>
                <th style="border: 1px solid #000; padding: 8px; background-color: #f0f0f0;">Calon Istri</th>
                <th style="border: 1px solid #000; padding: 8px; background-color: #f0f0f0;">Tanggal / Waktu</th>
                <th style="border: 1px solid #000; padding: 8px; background-color: #f0f0f0;">Tempat Nikah</th>
              </tr>
            </thead>
            <tbody>
              ${rows.length > 0 ? rows : '<tr><td colspan="5" style="text-align: center; padding: 20px; border: 1px solid #000;">Tidak ada data pendaftaran nikah pada periode ini.</td></tr>'}
            </tbody>
          </table>

          <p>Demikian pengumuman ini disampaikan untuk diketahui masyarakat luas. Bagi masyarakat yang mengetahui adanya halangan pernikahan bagi calon pengantin tersebut di atas, agar segera memberitahukan kepada Kepala KUA Kecamatan setempat selambat-lambatnya sebelum pelaksanaan pernikahan.</p>
        </div>

        <div class="ttd" style="margin-top: 50px; text-align: right; float: right; width: 40%;">
          <p>${kop_surat.kota || 'Banjarmasin'}, ${formattedDate}</p>
          <p>Kepala KUA,</p>
          <br><br><br><br>
          <p style="font-weight: bold; text-decoration: underline;">(.............................................)</p>
          <p>NIP. .............................................</p>
        </div>
      </div>
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

      // Generate HTML langsung dari API backend
      // Sesuai dokumentasi: API mengembalikan HTML string
      const htmlContent = role === 'kepala_kua'
        ? await generatePengumumanNikahKepalaKUA(requestBody, customKop)
        : await generatePengumumanNikah(requestBody, customKop);

      // Parse dan validasi HTML response
      const parsedHTML = parsePengumumanHTML(htmlContent);
      
      setHtml(parsedHTML);
      
      toast({
        title: 'Berhasil!',
        description: 'Surat pengumuman nikah berhasil di-generate dari server',
        variant: 'default',
      });
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
                            <span className="font-medium">Wali:</span> {reg.wali_nikah.nama_dan_bin}
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
                  Surat pengumuman dalam format HTML. Gunakan tombol Print untuk mencetak atau Download untuk menyimpan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-auto bg-white">
                  <div 
                    className="p-4"
                    style={{
                      fontFamily: "'Times New Roman', Times, serif",
                      maxWidth: '21cm',
                      margin: '0 auto',
                      background: 'white',
                    }}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

