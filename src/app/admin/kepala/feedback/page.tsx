'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { isKepalaKUA } from '@/lib/role-guards';
import { 
  getFeedbackList, 
  markFeedbackAsRead, 
  getFeedbackStats,
  FeedbackListParams 
} from '@/lib/simnikah-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageSquare, 
  Star, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Loader2,
  Eye,
  BarChart3,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { id as IndonesianLocale } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export default function FeedbackManagementPage() {
  const { userRole, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'Belum Dibaca' | 'Sudah Dibaca'>('all');
  const [filterJenis, setFilterJenis] = useState<'all' | 'Rating' | 'Saran' | 'Kritik' | 'Laporan'>('all');
  const [markingAsRead, setMarkingAsRead] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isKepalaKUA(userRole)) {
      router.push('/admin');
      return;
    }

    loadData();
  }, [userRole, authLoading, router, filterStatus, filterJenis]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load feedback list
      const params: FeedbackListParams = {};
      if (filterStatus !== 'all') {
        params.status_baca = filterStatus as 'Belum Dibaca' | 'Sudah Dibaca';
      }
      if (filterJenis !== 'all') {
        params.jenis_feedback = filterJenis;
      }

      const [feedbackResponse, statsResponse] = await Promise.all([
        getFeedbackList(params),
        getFeedbackStats()
      ]);

      if (feedbackResponse?.success && Array.isArray(feedbackResponse.data)) {
        setFeedbacks(feedbackResponse.data);
      } else if (Array.isArray(feedbackResponse?.data)) {
        setFeedbacks(feedbackResponse.data);
      } else {
        setFeedbacks([]);
      }

      if (statsResponse?.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error: any) {
      console.error('Error loading feedback:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data feedback',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (feedbackId: number) => {
    setMarkingAsRead(feedbackId);
    try {
      await markFeedbackAsRead(feedbackId);
      toast({
        title: 'Berhasil',
        description: 'Feedback ditandai sudah dibaca',
      });
      loadData();
    } catch (error: any) {
      console.error('Error marking feedback as read:', error);
      toast({
        title: 'Error',
        description: 'Gagal menandai feedback',
        variant: 'destructive',
      });
    } finally {
      setMarkingAsRead(null);
    }
  };

  const getJenisIcon = (jenis: string) => {
    switch (jenis) {
      case 'Rating':
        return <Star className="h-4 w-4" />;
      case 'Saran':
        return <MessageSquare className="h-4 w-4" />;
      case 'Kritik':
        return <AlertTriangle className="h-4 w-4" />;
      case 'Laporan':
        return <FileText className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getJenisColor = (jenis: string) => {
    switch (jenis) {
      case 'Rating':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Saran':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Kritik':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Laporan':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border border-primary/20 shadow-sm">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
          <div className="relative">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Manajemen Feedback
            </h1>
            <p className="text-muted-foreground mt-2 text-base">
              Kelola feedback, saran, dan kritik dari pengguna
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total_feedback || 0}</div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Belum Dibaca</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{stats.belum_dibaca || 0}</div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Sudah Dibaca</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.sudah_dibaca || 0}</div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Rating Rata-rata</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {stats.rating_average ? stats.rating_average.toFixed(1) : '-'}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status Baca</label>
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="Belum Dibaca">Belum Dibaca</SelectItem>
                    <SelectItem value="Sudah Dibaca">Sudah Dibaca</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Jenis Feedback</label>
                <Select value={filterJenis} onValueChange={(value: any) => setFilterJenis(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="Rating">Rating</SelectItem>
                    <SelectItem value="Saran">Saran</SelectItem>
                    <SelectItem value="Kritik">Kritik</SelectItem>
                    <SelectItem value="Laporan">Laporan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Feedback</CardTitle>
            <CardDescription>
              {feedbacks.length} feedback ditemukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {feedbacks.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Tidak ada feedback</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((feedback) => (
                  <Card 
                    key={feedback.id} 
                    className={`hover:shadow-md transition-shadow ${
                      feedback.status_baca === 'Belum Dibaca' ? 'border-l-4 border-l-orange-500' : ''
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <Badge className={getJenisColor(feedback.jenis_feedback)}>
                              <span className="flex items-center gap-1">
                                {getJenisIcon(feedback.jenis_feedback)}
                                {feedback.jenis_feedback}
                              </span>
                            </Badge>
                            {feedback.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{feedback.rating}</span>
                              </div>
                            )}
                            <Badge variant={feedback.status_baca === 'Belum Dibaca' ? 'destructive' : 'secondary'}>
                              {feedback.status_baca}
                            </Badge>
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-lg">{feedback.judul}</h3>
                            <p className="text-muted-foreground mt-1">{feedback.pesan}</p>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              Pendaftaran ID: {feedback.pendaftaran_id}
                            </span>
                            <span>•</span>
                            <span>
                              {format(new Date(feedback.created_at), 'dd MMMM yyyy HH:mm', { locale: IndonesianLocale })}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {feedback.status_baca === 'Belum Dibaca' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsRead(feedback.id)}
                              disabled={markingAsRead === feedback.id}
                            >
                              {markingAsRead === feedback.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Memproses...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Tandai Dibaca
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

