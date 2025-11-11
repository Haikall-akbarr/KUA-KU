// src/components/admin/StaffVerificationExample.tsx
// File ini adalah contoh implementasi di halaman admin

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { getNotificationStats, getVerificationData } from '@/lib/staff-verification-service';

/**
 * Example Component - Showing how to use staff verification service
 */
export function StaffVerificationExample() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // Get current user ID
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userIdValue = user.user_id || 'unknown';
    setUserId(userIdValue);

    // Load notifications
    const notifs = JSON.parse(
      localStorage.getItem(`notifications_${userIdValue}`) || '[]'
    );
    setNotifications(notifs);
  }, []);

  // Example: Get notification stats
  const stats = getNotificationStats(userId);

  // Example: Get verification data for registration ID 1
  const verificationData = getVerificationData('1');

  return (
    <div className="space-y-6">
      {/* Notification Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Stats</CardTitle>
          <CardDescription>Statistik notifikasi untuk user</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.unread}</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-gray-600">Read</p>
              <p className="text-2xl font-bold text-green-600">{stats.read}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>Notifikasi terbaru dari staff</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada notifikasi</p>
            ) : (
              notifications.slice(0, 5).map((notif) => (
                <div key={notif.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{notif.judul}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notif.pesan}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.created_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <Badge variant={notif.status_baca === 'Belum Dibaca' ? 'secondary' : 'outline'}>
                      {notif.status_baca}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Verification Status Example */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Status Example</CardTitle>
          <CardDescription>Contoh status verifikasi untuk registrasi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.keys(verificationData).length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Belum ada verifikasi</AlertTitle>
              <AlertDescription>
                Belum ada data verifikasi untuk registrasi ini
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {/* Formulir Online Status */}
              {verificationData.formulir_online && (
                <div className="border p-4 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Verifikasi Formulir Online</h4>
                    {verificationData.formulir_online.approved ? (
                      <Badge className="bg-green-100 text-green-800">Approved</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Verified By: {verificationData.formulir_online.verified_by}
                  </p>
                  <p className="text-sm text-gray-600">
                    Verified At: {new Date(verificationData.formulir_online.verified_at).toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Catatan: {verificationData.formulir_online.catatan}
                  </p>
                </div>
              )}

              {/* Berkas Fisik Status */}
              {verificationData.berkas_fisik && (
                <div className="border p-4 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Verifikasi Berkas Fisik</h4>
                    {verificationData.berkas_fisik.approved ? (
                      <Badge className="bg-green-100 text-green-800">Approved</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Verified By: {verificationData.berkas_fisik.verified_by}
                  </p>
                  <p className="text-sm text-gray-600">
                    Verified At: {new Date(verificationData.berkas_fisik.verified_at).toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Catatan: {verificationData.berkas_fisik.catatan}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How to Use Guide */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use - Code Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded font-mono text-sm space-y-2">
            <p className="text-gray-600">// 1. Import service</p>
            <p>import {'{'}</p>
            <p className="ml-4">handleFormulirVerification,</p>
            <p className="ml-4">handleBerkasVerification,</p>
            <p className="ml-4">getNotificationStats</p>
            <p>{'}'} from '@/lib/staff-verification-service';</p>
          </div>

          <div className="bg-gray-50 p-4 rounded font-mono text-sm space-y-2">
            <p className="text-gray-600">// 2. Handle formulir verification</p>
            <p>await handleFormulirVerification(</p>
            <p className="ml-4">registrationId,      // '1'</p>
            <p className="ml-4">userId,              // 'USR123'</p>
            <p className="ml-4">groomName,           // 'Ahmad'</p>
            <p className="ml-4">brideName,           // 'Siti'</p>
            <p className="ml-4">true,                // approved</p>
            <p className="ml-4">'Formulir lengkap'   // catatan</p>
            <p>{');'}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded font-mono text-sm space-y-2">
            <p className="text-gray-600">// 3. Get notification stats</p>
            <p>const stats = getNotificationStats(userId);</p>
            <p>console.log(stats.unread); // 3</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Cara menggunakan di page:
 * 
 * import { StaffVerificationExample } from '@/components/admin/StaffVerificationExample';
 * 
 * export default function Page() {
 *   return (
 *     <div>
 *       <StaffVerificationExample />
 *     </div>
 *   );
 * }
 */