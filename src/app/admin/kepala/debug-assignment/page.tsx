'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Copy, RefreshCw, Trash2, Eye } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function DebugAssignmentPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [penghulus, setPenghulus] = useState<any[]>([]);
  const [penguluProfile, setPenguluProfile] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const regs = JSON.parse(localStorage.getItem('marriageRegistrations') || '[]');
      const pengs = JSON.parse(localStorage.getItem('penghulus') || '[]');
      const profile = localStorage.getItem('penghulu_profile') ? 
        JSON.parse(localStorage.getItem('penghulu_profile') || '{}') : null;
      
      setRegistrations(regs);
      setPenghulus(pengs);
      setPenguluProfile(profile);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearLocalStorage = () => {
    if (window.confirm('Hapus semua data dari localStorage?')) {
      localStorage.clear();
      alert('✅ LocalStorage telah dihapus');
      loadData();
    }
  };

  const getRegistrationsForPenghulu = (penghuluId: string) => {
    return registrations.filter(reg => reg.penghuluId === penghuluId || reg.penghuluId === penghuluId.toString());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">🔍 Debug: Assign Penghulu Feature</h1>
        <p className="text-muted-foreground">
          Lihat status assignment dan debug info untuk memastikan feature berfungsi dengan baik.
        </p>
      </div>

      <Alert>
        <Eye className="h-4 w-4" />
        <AlertTitle>Developer Tools</AlertTitle>
        <AlertDescription>
          Halaman ini hanya untuk debugging. Gunakan browser console (F12) untuk melihat detailed logs.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="registrations">Registrasi</TabsTrigger>
          <TabsTrigger value="penghulus">Penghulu</TabsTrigger>
          <TabsTrigger value="mappings">Mapping</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Registrasi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{registrations.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Penghulu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{penghulus.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Registered Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {registrations.filter(r => r.penghuluId).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Penghulu Profile */}
          {penguluProfile && (
            <Card>
              <CardHeader>
                <CardTitle>👤 Current Penghulu Profile (dari localStorage)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">ID</p>
                    <p className="font-mono font-semibold break-all">{penguluProfile.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Nama</p>
                    <p className="font-semibold">{penguluProfile.nama_lengkap}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">NIP</p>
                    <p className="font-mono">{penguluProfile.nip}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge>{penguluProfile.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button onClick={loadData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
            <Button onClick={handleClearLocalStorage} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear LocalStorage
            </Button>
          </div>
        </TabsContent>

        {/* Registrations Tab */}
        <TabsContent value="registrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📋 Semua Registrasi</CardTitle>
              <CardDescription>
                Lihat semua pendaftaran dengan status penghuluId mereka
              </CardDescription>
            </CardHeader>
            <CardContent>
              {registrations.length === 0 ? (
                <p className="text-muted-foreground">Tidak ada data</p>
              ) : (
                <div className="space-y-3">
                  {registrations.map((reg) => (
                    <div key={reg.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{reg.groomName} & {reg.brideName}</p>
                          <p className="text-sm text-muted-foreground">ID: {reg.id}</p>
                        </div>
                        <Badge variant={reg.penghuluId ? "default" : "outline"}>
                          {reg.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Tanggal Nikah</p>
                          <p>{reg.weddingDate}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Penghulu ID</p>
                          <p className="font-mono">{reg.penghuluId || '(not assigned)'}</p>
                        </div>
                      </div>
                      {reg.penghuluId && (
                        <div className="text-xs">
                          <p className="text-muted-foreground">Penghulu</p>
                          <p>{reg.penghulu}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Penghulus Tab */}
        <TabsContent value="penghulus" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>👨‍🏫 Daftar Penghulu</CardTitle>
              <CardDescription>
                Semua penghulu yang tersedia untuk assignment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {penghulus.length === 0 ? (
                <p className="text-muted-foreground">Tidak ada penghulu</p>
              ) : (
                <div className="space-y-3">
                  {penghulus.map((penghulu) => (
                    <div key={penghulu.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{penghulu.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: 
                            <span className="font-mono ml-1 break-all">{penghulu.id}</span>
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(penghulu.id)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Assigned: {getRegistrationsForPenghulu(penghulu.id).length} registrasi
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mappings Tab */}
        <TabsContent value="mappings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🔗 Penghulu ↔ Registrasi Mapping</CardTitle>
              <CardDescription>
                Lihat mapping antara penghulu dan registrasi yang ditugaskan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {penghulus.length === 0 ? (
                <p className="text-muted-foreground">Tidak ada penghulu</p>
              ) : (
                penghulus.map((penghulu) => {
                  const assigned = getRegistrationsForPenghulu(penghulu.id);
                  return (
                    <div key={penghulu.id} className="border rounded-lg p-3">
                      <h4 className="font-semibold mb-2">
                        {penghulu.name}
                        <Badge className="ml-2">{assigned.length}</Badge>
                      </h4>
                      {assigned.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Belum ada assignment</p>
                      ) : (
                        <div className="space-y-2">
                          {assigned.map((reg) => (
                            <div key={reg.id} className="bg-accent/50 p-2 rounded text-sm">
                              <p className="font-medium">{reg.groomName} & {reg.brideName}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(reg.weddingDate).toLocaleDateString('id-ID')}
                              </p>
                              <Badge variant="outline" className="mt-1">{reg.status}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* JSON Viewer */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Raw JSON Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">localStorage Keys:</h4>
                <Textarea
                  readOnly
                  value={JSON.stringify(
                    {
                      marriageRegistrations: registrations.length,
                      penghulus: penghulus.length,
                      penghulu_profile: penguluProfile ? 'Set' : 'Not set',
                      penghulu_notifications: localStorage.getItem('penghulu_notifications') ? 'Exists' : 'Not set',
                    },
                    null,
                    2
                  )}
                  className="font-mono text-xs"
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Alert className="bg-blue-50 border-blue-200">
        <Eye className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900">Console Debugging</AlertTitle>
        <AlertDescription className="text-blue-700 text-sm">
          Tekan F12, buka tab Console, dan jalankan command ini untuk debug lebih detail:
          <code className="block bg-white p-2 rounded mt-2 font-mono text-xs">
            {`const regs = JSON.parse(localStorage.getItem('marriageRegistrations') || '[]');
const penghulu = JSON.parse(localStorage.getItem('penghulu_profile') || '{}');
console.log('Current Penghulu ID:', penghulu.id);
console.log('Assigned to this penghulu:', regs.filter(r => r.penghuluId === penghulu.id));`}
          </code>
        </AlertDescription>
      </Alert>
    </div>
  );
}
