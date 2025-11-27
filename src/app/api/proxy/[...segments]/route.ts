import { NextResponse } from 'next/server';

// Helper function to ensure URL has protocol
function ensureProtocol(url: string): string {
  if (!url) return 'https://simnikah-api-production-5583.up.railway.app';
  
  // If URL already has protocol, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Add https:// if no protocol
  return `https://${url}`;
}

// Get and normalize TARGET URL
const rawTarget = process.env.NEXT_PUBLIC_API_URL || 'https://simnikah-api-production-5583.up.railway.app';
const TARGET = ensureProtocol(rawTarget || 'https://simnikah-api-production-5583.up.railway.app');

// Log target URL in development (not in production for security)
if (process.env.NODE_ENV !== 'production') {
  console.log('[proxy] Target API URL:', TARGET);
  console.log('[proxy] Raw NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL || 'not set');
} else {
  // In production, just log if TARGET is using default (which means env var is missing)
  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.warn('[proxy] ⚠️ NEXT_PUBLIC_API_URL not set, using default:', TARGET);
  }
}

export async function OPTIONS(request: Request) {
  // Handle CORS preflight requests
  const origin = request.headers.get('origin');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  };
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  return new NextResponse(null, { status: 204, headers });
}

export async function GET(request: Request, context: any) {
  // CRITICAL: Check if this is a static asset request BEFORE processing
  const url = new URL(request.url);
  if (url.pathname.startsWith('/_next/') || url.pathname.includes('_next/')) {
    console.error('[proxy] ⛔ GET request to static asset blocked:', url.pathname);
    return new NextResponse('Static assets should not be proxied', { status: 404 });
  }
  
  const resolvedParams = typeof context.params?.then === 'function' ? await context.params : context.params;
  return proxy(request, resolvedParams?.segments || []);
}

export async function POST(request: Request, context: any) {
  const url = new URL(request.url);
  if (url.pathname.startsWith('/_next/') || url.pathname.includes('_next/')) {
    console.error('[proxy] ⛔ POST request to static asset blocked:', url.pathname);
    return new NextResponse('Static assets should not be proxied', { status: 404 });
  }
  
  const resolvedParams = typeof context.params?.then === 'function' ? await context.params : context.params;
  return proxy(request, resolvedParams?.segments || []);
}

export async function PUT(request: Request, context: any) {
  const url = new URL(request.url);
  if (url.pathname.startsWith('/_next/') || url.pathname.includes('_next/')) {
    console.error('[proxy] ⛔ PUT request to static asset blocked:', url.pathname);
    return new NextResponse('Static assets should not be proxied', { status: 404 });
  }
  
  const resolvedParams = typeof context.params?.then === 'function' ? await context.params : context.params;
  return proxy(request, resolvedParams?.segments || []);
}

export async function DELETE(request: Request, context: any) {
  const url = new URL(request.url);
  if (url.pathname.startsWith('/_next/') || url.pathname.includes('_next/')) {
    console.error('[proxy] ⛔ DELETE request to static asset blocked:', url.pathname);
    return new NextResponse('Static assets should not be proxied', { status: 404 });
  }
  
  const resolvedParams = typeof context.params?.then === 'function' ? await context.params : context.params;
  return proxy(request, resolvedParams?.segments || []);
}

async function proxy(request: Request, segments: string[]) {
  // Get the full incoming URL to check the path FIRST
  const incomingUrlObj = new URL(request.url);
  const fullPath = incomingUrlObj.pathname;
  
  // CRITICAL: Check full path FIRST before processing segments
  // If this is a Next.js internal route or static asset, immediately reject
  if (
    fullPath.startsWith('/_next/') ||
    fullPath.includes('/_next/static/') ||
    fullPath.includes('/_next/chunks/') ||
    fullPath.includes('_next/') ||
    fullPath.endsWith('.js') ||
    fullPath.endsWith('.css') ||
    fullPath.endsWith('.json') ||
    fullPath.endsWith('.map') ||
    fullPath.includes('src_') ||
    fullPath.includes('chunks/')
  ) {
    console.error('[proxy] ⛔ CRITICAL: Blocked static asset request to proxy:', fullPath);
    // Return 404 immediately - this should NEVER reach the proxy
    return new NextResponse('Static assets should not be proxied', { status: 404 });
  }
  
  // Don't proxy requests for static assets or JavaScript bundles
  const urlPath = segments.join('/');
  
  // STRICT: Check if this is a request for Next.js static assets (should not be proxied)
  // Block any request that looks like a static asset - this is critical!
  const isStaticAsset = 
    urlPath.startsWith('_next/') || 
    urlPath.startsWith('static/') ||
    urlPath.includes('_next/static/') ||
    urlPath.includes('_next/chunks/') ||
    urlPath.includes('chunks/') ||
    urlPath.includes('src_') ||
    urlPath.endsWith('.js') ||
    urlPath.endsWith('.css') ||
    urlPath.endsWith('.json') ||
    urlPath.endsWith('.map');
  
  if (isStaticAsset) {
    console.error('[proxy] ⛔ BLOCKED: Attempted to proxy static asset request:', { urlPath, fullPath });
    // Return 404 to let Next.js handle it properly
    return new NextResponse('Static assets should not be proxied', { status: 404 });
  }
  
  // Only proxy API-related paths
  if (!urlPath.startsWith('simnikah/') && !urlPath.startsWith('login') && !urlPath.startsWith('register') && !urlPath.startsWith('profile')) {
    console.warn('[proxy] ⚠️ Non-API path requested:', urlPath);
  }
  
  // Build target URL - ensure TARGET ends without slash and urlPath doesn't start with slash
  const cleanTarget = TARGET.endsWith('/') ? TARGET.slice(0, -1) : TARGET;
  const cleanPath = urlPath.startsWith('/') ? urlPath.slice(1) : urlPath;
  const targetUrl = `${cleanTarget}/${cleanPath}`;
  
  // Validate URL before creating URL object
  let url: URL;
  try {
    url = new URL(targetUrl);
  } catch (urlError: any) {
    console.error('[proxy] ❌ Invalid URL construction:', {
      TARGET,
      cleanTarget,
      urlPath,
      cleanPath,
      targetUrl,
      error: urlError.message,
    });
    return NextResponse.json(
      {
        error: 'Invalid URL',
        message: `Failed to construct target URL: ${urlError.message}`,
        detail: {
          target: TARGET,
          path: urlPath,
          constructed: targetUrl,
        },
      },
      { status: 500 }
    );
  }

  // Preserve original query params
  incomingUrlObj.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers: Record<string, string> = {};
  
  // Forward common headers (Content-Type, Authorization, etc.)
  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    // Skip headers that shouldn't be forwarded to backend
    if (
      lowerKey === 'host' || 
      lowerKey === 'connection' || 
      lowerKey === 'keep-alive' ||
      lowerKey === 'upgrade' ||
      lowerKey === 'transfer-encoding' ||
      lowerKey === 'content-length' // Will be set automatically by fetch
    ) return;
    headers[key] = value;
  });
  
  // Ensure Content-Type is set for POST/PUT requests
  if (request.method !== 'GET' && request.method !== 'HEAD' && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Don't forward Origin/Referer to backend - these are browser-specific
  // Backend should accept requests from any origin when coming from server-side proxy
  // Remove Origin and Referer to avoid CORS issues
  delete headers['Origin'];
  delete headers['Referer'];
  delete headers['origin'];
  delete headers['referer'];
  
  // Add User-Agent to identify this as a server-side proxy request
  if (!headers['User-Agent'] && !headers['user-agent']) {
    headers['User-Agent'] = 'KUA-KU-Proxy/1.0';
  }
  
  // Add X-Forwarded-For if we have the original request info
  const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
  if (clientIP && !headers['X-Forwarded-For']) {
    headers['X-Forwarded-For'] = clientIP;
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    // body will be forwarded below if present
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      const body = await request.arrayBuffer();
      if (body.byteLength > 0) {
        init.body = body;
        console.log('[proxy] Request body size:', body.byteLength, 'bytes');
      } else {
        console.warn('[proxy] Request body is empty for', request.method, 'request');
      }
    } catch (bodyError: any) {
      console.error('[proxy] Error reading request body:', bodyError.message);
      // Continue without body if reading fails
    }
  }

  try {
    // Enhanced logging for debugging
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const userAgent = request.headers.get('user-agent');
    
    console.log('[proxy] ========================================');
    console.log('[proxy] Forwarding request:');
    console.log('[proxy]   Method:', request.method);
    console.log('[proxy]   Target URL:', url.toString());
    console.log('[proxy]   Origin:', origin || 'none');
    console.log('[proxy]   Referer:', referer || 'none');
    console.log('[proxy]   User-Agent:', userAgent?.substring(0, 50) || 'none');
    console.log('[proxy]   Headers:', JSON.stringify(headers, null, 2));
    console.log('[proxy]   Body size:', request.method !== 'GET' && request.method !== 'HEAD' ? 'present' : 'none');
    console.log('[proxy] ========================================');
    
    // Add timeout for fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    let res: Response;
    try {
      res = await fetch(url.toString(), { ...init, signal: controller.signal });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('[proxy] Request timeout');
        return NextResponse.json(
          { 
            error: 'Request Timeout',
            message: 'Server tidak merespons dalam waktu yang ditentukan. Silakan coba lagi.',
            status: 504
          },
          { status: 504 }
        );
      }
      // Network error or connection refused
      console.error('[proxy] Fetch error:', fetchError.message);
      return NextResponse.json(
        { 
          error: 'Bad Gateway',
          message: 'Tidak dapat terhubung ke server API. Server mungkin sedang down atau tidak dapat dijangkau.',
          status: 502,
          detail: fetchError.message
        },
        { status: 502 }
      );
    }
    
    // Log response details
    console.log('[proxy] ========================================');
    console.log('[proxy] Response received:');
    console.log('[proxy]   Status:', res.status, res.statusText);
    console.log('[proxy]   Target URL:', url.toString());
    console.log('[proxy]   Response headers:', Object.fromEntries(res.headers.entries()));
    console.log('[proxy] ========================================');
    
    // Handle 403 Forbidden - usually means API is blocking the request
    if (res.status === 403) {
      console.error('[proxy] ========================================');
      console.error('[proxy] ❌ 403 FORBIDDEN ERROR');
      console.error('[proxy] Target URL:', url.toString());
      console.error('[proxy] Request Origin:', origin || 'none');
      console.error('[proxy] Request Referer:', referer || 'none');
      console.error('[proxy] Request Method:', request.method);
      console.error('[proxy] Request Headers:', JSON.stringify(headers, null, 2));
      console.error('[proxy] Response Headers:', Object.fromEntries(res.headers.entries()));
      
      const errorBody = await res.text().catch(() => '');
      console.error('[proxy] Error Response Body:', errorBody.substring(0, 1000));
      console.error('[proxy] ========================================');
      
      // Check if error body contains CORS-related messages
      const isCorsError = errorBody.toLowerCase().includes('cors') || 
                         errorBody.toLowerCase().includes('origin') ||
                         res.headers.get('access-control-allow-origin') === null;
      
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: isCorsError 
            ? 'Akses ditolak oleh server API karena CORS policy. Backend API perlu dikonfigurasi untuk mengizinkan request dari domain Vercel. Lihat BACKEND_CORS_SETUP.md untuk panduan setup CORS di backend.'
            : 'Akses ditolak oleh server API. Pastikan environment variable NEXT_PUBLIC_API_URL sudah di-set dengan benar di Vercel.',
          status: 403,
          detail: errorBody || 'No error details available',
          isCorsError,
          troubleshooting: {
            step1: 'Pastikan NEXT_PUBLIC_API_URL sudah di-set di Vercel Environment Variables',
            step2: 'Pastikan backend API mengizinkan request dari domain Vercel (CORS)',
            step3: 'Cek BACKEND_CORS_SETUP.md untuk panduan setup CORS',
            step4: 'Cek backend logs untuk melihat request yang diterima'
          }
        },
        { status: 403 }
      );
    }
    
    // Handle 500 Internal Server Error
    if (res.status === 500) {
      console.error('[proxy] ========================================');
      console.error('[proxy] ❌ 500 INTERNAL SERVER ERROR');
      console.error('[proxy] Target URL:', url.toString());
      console.error('[proxy] Request Method:', request.method);
      console.error('[proxy] Request Headers:', JSON.stringify(headers, null, 2));
      console.error('[proxy] Response Headers:', Object.fromEntries(res.headers.entries()));
      
      const errorBody = await res.text().catch(() => '');
      console.error('[proxy] Error Response Body:', errorBody.substring(0, 2000));
      console.error('[proxy] ========================================');
      
      // Try to parse error body as JSON
      let errorData: any = {};
      try {
        if (errorBody) {
          errorData = JSON.parse(errorBody);
        }
      } catch (e) {
        // If not JSON, keep as string
        errorData = { raw: errorBody.substring(0, 500) };
      }
      
      return NextResponse.json(
        { 
          error: 'Internal Server Error',
          message: errorData.message || errorData.error || 'Terjadi kesalahan pada server API. Silakan coba lagi nanti atau hubungi administrator.',
          status: 500,
          detail: errorData.detail || errorData.raw || errorBody.substring(0, 500),
          backendError: errorData
        },
        { status: 500 }
      );
    }
    
    // Handle 502 Bad Gateway from upstream
    if (res.status === 502) {
      console.error('[proxy] Upstream server returned 502 Bad Gateway');
      return NextResponse.json(
        { 
          error: 'Bad Gateway',
          message: 'Server API tidak dapat dijangkau. Server mungkin sedang down atau mengalami masalah.',
          status: 502
        },
        { status: 502 }
      );
    }
    
    // Check if this is an endpoint that expects HTML response (like pengumuman-nikah/generate)
    const isExpectedHTMLEndpoint = urlPath.includes('pengumuman-nikah/generate');
    
    // Check content type before reading body
    const contentType = res.headers.get('content-type') || '';
    
    // If it's an expected HTML endpoint and status is 200, forward HTML response directly
    if (isExpectedHTMLEndpoint && res.status === 200) {
      console.log('[proxy] Forwarding HTML response for endpoint:', urlPath, 'Status:', res.status);
      const respBody = await res.arrayBuffer();
      
      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        // Avoid exposing hop-by-hop headers
        if (['transfer-encoding', 'connection', 'keep-alive', 'content-encoding'].includes(key.toLowerCase())) return;
        responseHeaders[key] = value;
      });
      
      // Ensure Content-Type is set correctly for HTML
      if (!responseHeaders['content-type'] && contentType) {
        responseHeaders['content-type'] = contentType;
      } else if (!responseHeaders['content-type']) {
        responseHeaders['content-type'] = 'text/html; charset=utf-8';
      }
      
      const response = new NextResponse(respBody, {
        status: res.status,
        headers: responseHeaders,
      });
      
      if (process.env.NODE_ENV !== 'production') {
        response.headers.set('x-proxy-upstream-status', String(res.status));
      }
      
      return response;
    }
    
    // For other endpoints, check if response is HTML (error page)
    const respBody = await res.arrayBuffer();
    
    // Check if response body is HTML (even if content-type says JSON)
    // This catches cases where server returns HTML with wrong content-type
    let isHtml = false;
    if (contentType.includes('text/html')) {
      isHtml = true;
    } else {
      // Check actual body content - decode first few bytes to check for HTML
      try {
        const bodyText = new TextDecoder().decode(respBody.slice(0, 100));
        const trimmed = bodyText.trim();
        if (trimmed.startsWith('<') || trimmed.startsWith('<!') || trimmed.startsWith('<?xml')) {
          isHtml = true;
          if (!isExpectedHTMLEndpoint) {
            console.error('[proxy] Response body is HTML despite content-type:', contentType);
          }
        }
      } catch (e) {
        // If decoding fails, assume it's binary and not HTML
      }
    }

    // If response is HTML and it's NOT an expected HTML endpoint, return JSON error instead
    if (isHtml && !isExpectedHTMLEndpoint) {
      console.error('[proxy] API returned HTML instead of JSON. Status:', res.status, 'Content-Type:', contentType);
      return NextResponse.json(
        { 
          error: 'API returned HTML error page',
          message: `Server returned HTML instead of JSON. Status: ${res.status}`,
          status: res.status
        },
        { 
          status: res.status >= 400 ? res.status : 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const responseHeaders: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      // Avoid exposing hop-by-hop headers
      if (['transfer-encoding', 'connection', 'keep-alive', 'content-encoding'].includes(key.toLowerCase())) return;
      responseHeaders[key] = value;
    });

    // Ensure Content-Type is set correctly
    if (!responseHeaders['content-type'] && contentType) {
      responseHeaders['content-type'] = contentType;
    }
    
    // Add CORS headers to allow requests from Vercel domain
    // Reuse origin from earlier in the function
    const requestOrigin = request.headers.get('origin');
    if (requestOrigin) {
      responseHeaders['Access-Control-Allow-Origin'] = requestOrigin;
      responseHeaders['Access-Control-Allow-Credentials'] = 'true';
      responseHeaders['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      responseHeaders['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With';
    }

    const response = new NextResponse(respBody, {
      status: res.status,
      headers: responseHeaders,
    });
    // Expose a small debug header when in development
    if (process.env.NODE_ENV !== 'production') {
      response.headers.set('x-proxy-upstream-status', String(res.status));
    }
    return response;
  } catch (err: any) {
    console.error('[proxy] Error:', err);
    return NextResponse.json({ message: 'Proxy error', detail: err.message }, { status: 502 });
  }
}
