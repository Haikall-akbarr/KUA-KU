'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Star, Mail, Phone, MapPin, Edit2, Save, X, AlertCircle, Clock } from 'lucide-react';

interface PenguluProfile {
  id: number;
  nama_lengkap: string;
  nip: string;
  status: string;
  jumlah_nikah: number;
  rating: number;
  email: string;
  no_hp: string;
  alamat?: string;
}

export default function ProfilPage() {
  const [profile, setProfile] = useState<PenguluProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editData, setEditData] = useState({
    email: '',
    no_hp: '',
    alamat: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Try to load from localStorage first
        const stored = localStorage.getItem('penghulu_profile');
        if (stored) {
          const data = JSON.parse(stored);
          setProfile(data);
          setEditData({
            email: data.email,
            no_hp: data.no_hp,
            alamat: data.alamat || '',
          });
        } else {
          // Try from API
          const token = localStorage.getItem('token');
          const user = JSON.parse(localStorage.getItem('user') || '{}');

          if (token) {
            try {
              const response = await fetch(
                'https://simnikah-api-production.up.railway.app/simnikah/penghulu',
                {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              if (response.ok) {
                const data = await response.json();
                const penguluData = data.data[0] || {
                  id: 1,
                  nama_lengkap: user.nama || 'Ustadz Ahmad Ridho',
                  nip: '198505052010121001',
                  status: 'Aktif',
                  jumlah_nikah: 15,
                  rating: 4.8,
                  email: user.email || 'ahmad.ridho@kua.go.id',
                  no_hp: '081234567891',
                  alamat: 'Jl. Ahmad Yani No. 25, Banjarmasin',
                };
                setProfile(penguluData);
                setEditData({
                  email: penguluData.email,
                  no_hp: penguluData.no_hp,
                  alamat: penguluData.alamat || '',
                });
                localStorage.setItem('penghulu_profile', JSON.stringify(penguluData));
              }
            } catch (apiErr) {
              console.error('API error:', apiErr);
              // Use fallback
              const fallbackData: PenguluProfile = {
                id: 1,
                nama_lengkap: user.nama || 'Ustadz Ahmad Ridho',
                nip: '198505052010121001',
                status: 'Aktif',
                jumlah_nikah: 15,
                rating: 4.8,
                email: user.email || 'ahmad.ridho@kua.go.id',
                no_hp: '081234567891',
                alamat: 'Jl. Ahmad Yani No. 25, Banjarmasin',
              };
              setProfile(fallbackData);
              setEditData({
                email: fallbackData.email,
                no_hp: fallbackData.no_hp,
                alamat: fallbackData.alamat || '',
              });
            }
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Gagal memuat profil. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleEdit = () => {
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditing(false);
    if (profile) {
      setEditData({
        email: profile.email,
        no_hp: profile.no_hp,
        alamat: profile.alamat || '',
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updatedProfile = {
        ...profile,
        email: editData.email,
        no_hp: editData.no_hp,
        alamat: editData.alamat,
      } as PenguluProfile;

      // Save to localStorage
      localStorage.setItem('penghulu_profile', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);

      // Try to sync with API
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await fetch(
            `https://simnikah-api-production.up.railway.app/simnikah/penghulu/${profile?.id}`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(editData),
            }
          );
        } catch (apiErr) {
          console.warn('Failed to sync with API, but local save succeeded:', apiErr);
        }
      }

      setSuccess('Profil berhasil diperbarui');
      setEditing(false);
    } catch (err) {
      setError('Gagal menyimpan profil. Silakan coba lagi.');
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profil Penghulu</h1>
          <p className="text-gray-600 mt-2">Kelola informasi profil Anda</p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="border-red-500 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-900">Error</AlertTitle>
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 bg-green-50">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">Berhasil</AlertTitle>
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {profile && (
          <>
            {/* Profile Header Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                      {profile.nama_lengkap.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{profile.nama_lengkap}</CardTitle>
                      <CardDescription className="mt-1">NIP: {profile.nip}</CardDescription>
                      <Badge className="mt-3 bg-green-100 text-green-800">
                        {profile.status}
                      </Badge>
                    </div>
                  </div>
                  {!editing && (
                    <Button onClick={handleEdit} variant="outline" size="sm">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Pernikahan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {profile.jumlah_nikah}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Pernikahan yang telah disahkan</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-3xl font-bold text-yellow-600">
                      {profile.rating}
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(profile.rating)
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Informasi Kontak</CardTitle>
                  {editing && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Batal
                      </Button>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Menyimpan...' : 'Simpan'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </label>
                  {editing ? (
                    <Input
                      type="email"
                      value={editData.email}
                      onChange={(e) =>
                        setEditData({ ...editData, email: e.target.value })
                      }
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg font-medium">{editData.email}</p>
                  )}
                </div>

                {/* Nomor HP */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <Phone className="h-4 w-4" />
                    Nomor HP
                  </label>
                  {editing ? (
                    <Input
                      type="tel"
                      value={editData.no_hp}
                      onChange={(e) =>
                        setEditData({ ...editData, no_hp: e.target.value })
                      }
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg font-medium">{editData.no_hp}</p>
                  )}
                </div>

                {/* Alamat */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <MapPin className="h-4 w-4" />
                    Alamat
                  </label>
                  {editing ? (
                    <textarea
                      value={editData.alamat}
                      onChange={(e) =>
                        setEditData({ ...editData, alamat: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  ) : (
                    <p className="text-lg font-medium">
                      {editData.alamat || 'Tidak ada data'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Tambahan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Tanggal Terdaftar</p>
                    <p className="font-medium mt-1">
                      {new Date().toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Terakhir Diperbarui</p>
                    <p className="font-medium mt-1">
                      {new Date().toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
  );
}