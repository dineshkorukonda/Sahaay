import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * CORS helper utility for API routes
 * Use this in API routes if you need custom CORS handling
 */

// Allowed origins - should match middleware.ts
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:8081', // Expo default
  'http://localhost:19000', // Expo web
  'http://localhost:19006', // Expo web alternative
  'exp://localhost:8081', // Expo Go
  'exp://10.0.8.36:8081', // Expo Go with IP
  'http://10.0.8.36:3000', // Your current Expo API URL
  'http://10.0.8.36:8081', // Expo dev server
];

/**
 * Get allowed origin from request
 */
export function getAllowedOrigin(origin: string | null): string | null {
  if (!origin) return null;
  
  // Check if origin is in allowed list
  if (ALLOWED_ORIGINS.includes(origin)) {
    return origin;
  }
  
  // Allow localhost with any port for development
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
    return origin;
  }
  
  // Allow local network IPs for development (10.x.x.x, 192.168.x.x, 172.16-31.x.x)
  const localNetworkRegex = /^https?:\/\/(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/;
  if (localNetworkRegex.test(origin)) {
    return origin;
  }
  
  return null;
}

/**
 * Add CORS headers to a NextResponse
 */
export function addCorsHeaders(
  response: NextResponse,
  request: NextRequest | Request
): NextResponse {
  const origin = request.headers.get('origin');
  const allowedOrigin = getAllowedOrigin(origin);
  
  if (allowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Type');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  return response;
}

/**
 * Handle preflight OPTIONS request
 */
export function handlePreflight(request: NextRequest | Request): NextResponse | null {
  if (request.method !== 'OPTIONS') {
    return null;
  }
  
  const origin = request.headers.get('origin');
  const allowedOrigin = getAllowedOrigin(origin);
  
  if (!allowedOrigin) {
    return new NextResponse(null, { status: 403 });
  }
  
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Type');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  
  return response;
}
