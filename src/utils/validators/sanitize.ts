/**
 * Validasi Input Sanitization (Security)
 * Sesuai dokumentasi backend - Section Validasi Tampilan Frontend
 */

/**
 * Sanitize string input
 */
export const sanitizeString = (input: any): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
};

/**
 * Sanitize email
 */
export const sanitizeEmail = (email: any): string => {
  if (typeof email !== 'string') return '';
  
  return email.trim().toLowerCase().substring(0, 100);
};

/**
 * Sanitize number
 */
export const sanitizeNumber = (input: any): number | null => {
  if (typeof input === 'number') return input;
  if (typeof input !== 'string') return null;
  
  const cleaned = input.replace(/[^0-9]/g, '');
  return cleaned === '' ? null : parseInt(cleaned, 10);
};

/**
 * XSS Protection untuk display
 */
export const escapeHtml = (text: any): string => {
  if (typeof text !== 'string') return '';
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m] || m);
};

