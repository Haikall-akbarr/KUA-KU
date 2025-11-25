'use client';

import React from 'react';

interface PengumumanPreviewProps {
  html: string;
}

/**
 * Komponen untuk preview surat pengumuman nikah
 * Menampilkan HTML yang dihasilkan dari API dengan styling yang sesuai format surat resmi
 */
export function PengumumanPreview({ html }: PengumumanPreviewProps) {
  return (
    <div className="w-full">
      <style jsx global>{`
        /* Styling untuk surat resmi Indonesia */
        .pengumuman-container {
          font-family: 'Times New Roman', Times, serif;
          max-width: 21cm;
          margin: 0 auto;
          padding: 2cm;
          background: white;
          color: #000;
          line-height: 1.6;
        }
        
        /* Kop Surat */
        .kop-surat {
          text-align: center;
          border-bottom: 3px solid #000;
          padding-bottom: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .kop-surat img {
          max-height: 80px;
          margin-bottom: 0.5rem;
        }
        
        .kop-surat h1 {
          font-size: 14pt;
          font-weight: bold;
          margin: 0.5rem 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .kop-surat p {
          font-size: 10pt;
          margin: 0.2rem 0;
        }
        
        /* Nomor Surat */
        .nomor-surat {
          text-align: right;
          margin-bottom: 1rem;
          font-size: 11pt;
        }
        
        /* Perihal */
        .perihal {
          margin-bottom: 1rem;
          font-size: 11pt;
        }
        
        /* Judul */
        .judul {
          text-align: center;
          font-size: 14pt;
          font-weight: bold;
          margin: 1.5rem 0;
          text-transform: uppercase;
          text-decoration: underline;
        }
        
        /* Paragraf */
        .paragraf {
          text-align: justify;
          text-indent: 1.5cm;
          margin-bottom: 1rem;
          font-size: 11pt;
        }
        
        /* Tabel */
        .tabel-pengumuman {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          font-size: 10pt;
        }
        
        .tabel-pengumuman th,
        .tabel-pengumuman td {
          border: 1px solid #000;
          padding: 8px;
          text-align: left;
        }
        
        .tabel-pengumuman th {
          background-color: #f0f0f0;
          font-weight: bold;
          text-align: center;
        }
        
        .tabel-pengumuman td {
          vertical-align: top;
        }
        
        /* Tanda Tangan */
        .ttd-section {
          margin-top: 2rem;
          text-align: right;
        }
        
        .ttd-kota {
          margin-bottom: 3rem;
        }
        
        .ttd-nama {
          margin-top: 4rem;
          text-decoration: underline;
          font-weight: bold;
        }
        
        /* Print Styles */
        @media print {
          .pengumuman-container {
            padding: 1.5cm;
            max-width: 100%;
          }
          
          .no-print {
            display: none;
          }
        }
      `}</style>
      
      <div 
        className="pengumuman-container"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

