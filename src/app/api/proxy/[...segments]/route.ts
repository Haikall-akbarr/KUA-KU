import { NextResponse } from 'next/server';

const TARGET = process.env.NEXT_PUBLIC_API_URL || 'https://simnikah-api-production-5583.up.railway.app';

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
  
  const url = new URL(`${TARGET}/${urlPath}`);

  // Preserve original query params
  incomingUrlObj.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers: Record<string, string> = {};
  // Forward common headers (Content-Type, Authorization)
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'host') return;
    headers[key] = value;
  });

  const init: RequestInit = {
    method: request.method,
    headers,
    // body will be forwarded below if present
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const body = await request.arrayBuffer();
    init.body = body;
  }

  try {
    console.log('[proxy] forwarding', request.method, url.toString());
    
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
    
    console.log('[proxy] upstream status', res.status, res.statusText);
    
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
