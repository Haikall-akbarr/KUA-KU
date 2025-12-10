/**
 * Helper Functions untuk Parsing dan Handling HTML Response Pengumuman Nikah
 * Sesuai dokumentasi: Parsing API Surat Pengumuman Nikah
 */

/**
 * Parse HTML response dan validasi
 */
export const parsePengumumanHTML = (html: string): string => {
  if (!html || typeof html !== 'string') {
    throw new Error('Invalid HTML response: response is not a string');
  }

  // Check if response is HTML
  const trimmed = html.trim();
  if (!trimmed.startsWith('<!') && !trimmed.startsWith('<html')) {
    // Might be error message or JSON error
    if (trimmed.startsWith('{')) {
      try {
        const errorData = JSON.parse(trimmed);
        throw new Error(errorData.error || errorData.message || 'Error generating pengumuman');
      } catch {
        throw new Error('Invalid response format: expected HTML but got JSON or other format');
      }
    }
    throw new Error('Invalid HTML response: response does not start with HTML tag');
  }

  return html;
};

/**
 * Open HTML in new window for printing
 */
export const printPengumumanHTML = (html: string): void => {
  if (!html) {
    console.error('No HTML content to print');
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Popup blocked. Please allow popups for this site to print.');
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();
  
  // Wait for content to load before printing
  printWindow.onload = () => {
    printWindow.print();
  };
};

/**
 * Download HTML as file
 */
export const downloadPengumumanHTML = (
  html: string,
  filename?: string
): void => {
  if (!html) {
    console.error('No HTML content to download');
    return;
  }

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `pengumuman-nikah-${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Display HTML in iframe
 */
export const displayPengumumanInIframe = (
  html: string,
  iframeId: string = 'pengumuman-iframe'
): void => {
  if (!html) {
    console.error('No HTML content to display');
    return;
  }

  let iframe = document.getElementById(iframeId) as HTMLIFrameElement;
  
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = iframeId;
    iframe.style.width = '100%';
    iframe.style.height = '800px';
    iframe.style.border = '1px solid #ccc';
    iframe.title = 'Pengumuman Nikah Preview';
    document.body.appendChild(iframe);
  }

  iframe.srcdoc = html;
};

/**
 * Convert HTML to PDF (client-side using html2canvas and jspdf)
 * Note: Uses html2canvas and jspdf which are already installed
 */
export const convertHTMLToPDF = async (
  html: string,
  filename: string = 'pengumuman-nikah.pdf'
): Promise<void> => {
  try {
    // Dynamic import untuk html2canvas dan jspdf
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');
    
    // Create temporary element
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '210mm'; // A4 width
    tempDiv.style.padding = '20mm';
    tempDiv.style.fontFamily = "'Times New Roman', Times, serif";
    tempDiv.style.fontSize = '12pt';
    tempDiv.style.background = 'white';
    document.body.appendChild(tempDiv);

    // Convert to canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save PDF
    pdf.save(filename);

    // Cleanup
    document.body.removeChild(tempDiv);
  } catch (error) {
    console.error('Error converting to PDF:', error);
    throw new Error('Failed to convert HTML to PDF. Make sure html2canvas and jspdf are installed.');
  }
};

/**
 * Validate tanggal format (YYYY-MM-DD)
 */
export const validateTanggalFormat = (tanggal: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(tanggal)) {
    return false;
  }

  const date = new Date(tanggal);
  return !isNaN(date.getTime());
};

/**
 * Get default date range (current week: Monday to Sunday)
 */
export const getDefaultDateRange = (): { tanggal_awal: string; tanggal_akhir: string } => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(today.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    tanggal_awal: formatDate(monday),
    tanggal_akhir: formatDate(sunday),
  };
};

