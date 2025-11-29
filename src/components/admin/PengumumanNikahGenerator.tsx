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
  type PengumumanParams,
  type PengumumanListResponse
} from '@/lib/simnikah-api';
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

      const params: PengumumanParams = {
        tanggal_awal: formattedTanggalAwal,
        tanggal_akhir: formattedTanggalAkhir,
      };

      // console.log('📤 Loading pengumuman list with params:', params);
      console.log('📅 Tanggal yang dipilih:', {
        tanggalAwal: formattedTanggalAwal,
        tanggalAkhir: formattedTanggalAkhir,
      });

      const data = role === 'kepala_kua'
        ? await getPengumumanListKepalaKUA(params)
        : await getPengumumanList(params);
      
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

  const generatePengumuman = async () => {
    setLoading(true);
    setError(null);
    setHtml('');

    try {
      const params: PengumumanParams = {
        tanggal_awal: tanggalAwal || undefined,
        tanggal_akhir: tanggalAkhir || undefined,
      };

      const customKop = showCustomKop ? kopSurat : undefined;
      
      // Gunakan fungsi API sesuai role
      const htmlContent = role === 'kepala_kua'
        ? await generatePengumumanNikahKepalaKUA(params, customKop)
        : await generatePengumumanNikah(params, customKop);
      
      setHtml(htmlContent);
      
      toast({
        title: 'Berhasil!',
        description: 'Surat pengumuman nikah berhasil di-generate',
        variant: 'default',
      });
    } catch (err: any) {
      console.error('Error generating pengumuman:', err);
      console.error('Error response:', err.response);
      
      let errorMessage = 'Terjadi kesalahan saat generate pengumuman';
      let errorTitle = 'Gagal';
      
      if (err.response) {
        const status = err.response.status;
        const errorData = err.response.data;
        
        // Handle specific HTTP status codes
        if (status === 502) {
          errorTitle = 'Server Tidak Dapat Dijangkau';
          errorMessage = 'Server API tidak dapat dijangkau. Server mungkin sedang down atau mengalami masalah. Silakan coba lagi nanti atau hubungi administrator.';
        } else if (status === 500) {
          errorTitle = 'Kesalahan Server';
          errorMessage = 'Terjadi kesalahan pada server. Silakan coba lagi nanti atau hubungi administrator.';
        } else if (status === 401) {
          errorTitle = 'Sesi Berakhir';
          errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
        } else if (status === 403) {
          errorTitle = 'Akses Ditolak';
          errorMessage = 'Anda tidak memiliki izin untuk mengakses fitur ini.';
        } else if (status === 404) {
          errorTitle = 'Endpoint Tidak Ditemukan';
          errorMessage = 'Endpoint tidak ditemukan. Pastikan API backend sudah ter-update dengan endpoint pengumuman nikah.';
        } else {
          // Check if response is HTML (error page from server)
          if (errorData && typeof errorData === 'string' && errorData.includes('<html')) {
            errorMessage = 'Server mengembalikan halaman error. Silakan coba lagi atau hubungi administrator.';
          } else if (errorData?.error) {
            errorMessage = errorData.error;
          } else if (errorData?.message) {
            errorMessage = errorData.message;
          } else {
            errorMessage = `Error ${status}: ${err.response.statusText || 'Request failed'}`;
          }
        }
      } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        errorTitle = 'Koneksi Gagal';
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
        duration: 15000, // Show for 15 seconds
      });
    } finally {
      setLoading(false);
    }
  };

  const printPengumuman = () => {
    if (!html) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: 'Error',
        description: 'Tidak dapat membuka window baru. Pastikan popup tidak diblokir.',
        variant: 'destructive',
      });
      return;
    }

    // Tambahkan CSS untuk format surat resmi
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Surat Pengumuman Nikah</title>
          <style>
            @page {
              size: A4;
              margin: 2cm 2.5cm;
            }
            
            body {
              font-family: 'Times New Roman', Times, serif;
              font-size: 12pt;
              line-height: 1.6;
              color: #000;
              background: white;
            }
            
            /* Kop Surat */
            .kop-surat, table:first-child, div:first-child {
              text-align: center;
              margin-bottom: 1.5rem;
            }
            
            /* Nomor Surat */
            .nomor-surat, p:has(strong:contains("Nomor")) {
              text-align: right;
              margin-bottom: 1rem;
            }
            
            /* Judul */
            h1, h2, .judul {
              text-align: center;
              font-weight: bold;
              text-transform: uppercase;
              margin: 1.5rem 0;
            }
            
            /* Paragraf */
            p {
              text-align: justify;
              text-indent: 1.5cm;
              margin-bottom: 1rem;
            }
            
            /* Tabel */
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 1.5rem 0;
              font-size: 11pt;
            }
            
            table th,
            table td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }
            
            table th {
              background-color: #f0f0f0;
              font-weight: bold;
              text-align: center;
            }
            
            /* Tanda Tangan */
            .ttd, .tanda-tangan {
              margin-top: 2rem;
              text-align: right;
            }
            
            /* Print specific */
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              
              @page {
                margin: 2cm 2.5cm;
              }
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    // Tunggu sebentar untuk memastikan CSS ter-load
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const downloadHTML = () => {
    if (!html) return;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pengumuman-nikah-${tanggalAwal || 'current'}-${tanggalAkhir || 'current'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

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

