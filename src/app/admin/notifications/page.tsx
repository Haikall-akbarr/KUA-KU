'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  getUserNotifications, 
  markNotificationRead, 
  markAllNotificationsRead,
  deleteNotification,
  getNotificationStats,
  NotificationListParams 
} from '@/lib/simnikah-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  CheckCircle2, 
  Trash2,
  Loader2,
  Filter,
  Send,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { id as IndonesianLocale } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { SendNotificationToRoleDialog } from '@/components/admin/SendNotificationToRoleDialog';

export default function NotificationsPage() {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'Belum Dibaca' | 'Sudah Dibaca'>('all');
  const [filterTipe, setFilterTipe] = useState<'all' | 'Info' | 'Success' | 'Warning' | 'Error'>('all');
  const [markingAsRead, setMarkingAsRead] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, filterStatus, filterTipe]);

  const loadData = async () => {
    if (!user?.user_id) return;

    try {
      setLoading(true);
      
      const params: NotificationListParams = {};
      if (filterStatus !== 'all') {
        params.status = filterStatus as 'Belum Dibaca' | 'Sudah Dibaca';
      }
      if (filterTipe !== 'all') {
        params.tipe = filterTipe;
      }

      const [notificationsResponse, statsResponse] = await Promise.all([
        getUserNotifications(user.user_id, params),
        getNotificationStats(user.user_id).catch(() => null)
      ]);

      if (notificationsResponse?.success && Array.isArray(notificationsResponse.data)) {
        setNotifications(notificationsResponse.data);
      } else if (Array.isArray(notificationsResponse?.data)) {
        setNotifications(notificationsResponse.data);
      } else {
        setNotifications([]);
      }

      if (statsResponse?.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error: any) {
      console.error('Error loading notifications:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat notifikasi',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    setMarkingAsRead(notificationId);
    try {
      await markNotificationRead(notificationId, { status_baca: 'Sudah Dibaca' });
      toast({
        title: 'Berhasil',
        description: 'Notifikasi ditandai sudah dibaca',
      });
      loadData();
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Gagal menandai notifikasi',
        variant: 'destructive',
      });
    } finally {
      setMarkingAsRead(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.user_id) return;

    try {
      await markAllNotificationsRead(user.user_id);
      toast({
        title: 'Berhasil',
        description: 'Semua notifikasi ditandai sudah dibaca',
      });
      loadData();
    } catch (error: any) {
      console.error('Error marking all as read:', error);
      toast({
        title: 'Error',
        description: 'Gagal menandai semua notifikasi',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (notificationId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus notifikasi ini?')) {
      return;
    }

    setDeletingId(notificationId);
    try {
      await deleteNotification(notificationId);
      toast({
        title: 'Berhasil',
        description: 'Notifikasi berhasil dihapus',
      });
      loadData();
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus notifikasi',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getTipeColor = (tipe: string) => {
    switch (tipe) {
      case 'Success':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Error':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Info':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const unreadCount = notifications.filter(n => n.status_baca === 'Belum Dibaca').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border border-primary/20 shadow-sm">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Notifikasi
              </h1>
              <p className="text-muted-foreground mt-2 text-base">
                Kelola dan lihat semua notifikasi Anda
              </p>
            </div>
            <div className="flex gap-2">
              {(userRole === 'staff' || userRole === 'kepala_kua') && (
                <Button onClick={() => setIsSendDialogOpen(true)} variant="outline" className="gap-2">
                  <Send className="h-4 w-4" />
                  Kirim Notifikasi
                </Button>
              )}
              {unreadCount > 0 && (
                <Button onClick={handleMarkAllAsRead} variant="default" className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Tandai Semua Dibaca
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total || 0}</div>
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.by_tipe?.Info || 0}</div>
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
                <label className="text-sm font-medium">Tipe</label>
                <Select value={filterTipe} onValueChange={(value: any) => setFilterTipe(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="Info">Info</SelectItem>
                    <SelectItem value="Success">Success</SelectItem>
                    <SelectItem value="Warning">Warning</SelectItem>
                    <SelectItem value="Error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Notifikasi</CardTitle>
            <CardDescription>
              {notifications.length} notifikasi ditemukan
              {unreadCount > 0 && ` • ${unreadCount} belum dibaca`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Memuat notifikasi...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Tidak ada notifikasi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`hover:shadow-md transition-shadow ${
                      notification.status_baca === 'Belum Dibaca' ? 'border-l-4 border-l-orange-500 bg-orange-50/30' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getTipeColor(notification.tipe)}>
                              {notification.tipe}
                            </Badge>
                            {notification.status_baca === 'Belum Dibaca' && (
                              <Badge variant="destructive">Belum Dibaca</Badge>
                            )}
                          </div>
                          
                          <div>
                            <h3 className="font-semibold">{notification.judul}</h3>
                            <p className="text-muted-foreground text-sm mt-1">{notification.pesan}</p>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              {format(new Date(notification.created_at), 'dd MMMM yyyy HH:mm', { locale: IndonesianLocale })}
                            </span>
                            {notification.tautan && (
                              <>
                                <span>•</span>
                                <a 
                                  href={notification.tautan} 
                                  className="text-primary hover:underline"
                                >
                                  Lihat Detail
                                </a>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {notification.status_baca === 'Belum Dibaca' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              disabled={markingAsRead === notification.id}
                            >
                              {markingAsRead === notification.id ? (
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(notification.id)}
                            disabled={deletingId === notification.id}
                            className="text-red-600 hover:text-red-700"
                          >
                            {deletingId === notification.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Menghapus...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Hapus
                              </>
                            )}
                          </Button>
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

      {/* Send Notification Dialog */}
      {(userRole === 'staff' || userRole === 'kepala_kua') && (
        <SendNotificationToRoleDialog
          open={isSendDialogOpen}
          onOpenChange={setIsSendDialogOpen}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}

