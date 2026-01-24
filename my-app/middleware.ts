import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Allowed origins - add your Expo app URLs here
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:8081', // Expo default
  'http://localhost:19000', // Expo web
  'http://localhost:19006', // Expo web alternative
  'exp://localhost:8081', // Expo Go
  'exp://10.0.8.36:8081', // Expo Go with IP
  'http://10.0.8.36:3000', // Your current Expo API URL
  'http://10.0.8.36:8081', // Expo dev server
  // Add production URLs when ready
  // 'https://your-production-domain.com',
];

// Helper function to get allowed origin
function getAllowedOrigin(origin: string | null): string | null {
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

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const isMobileRequest = request.headers.get('x-client-type') === 'mobile';
  const allowedOrigin = getAllowedOrigin(origin);
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    
    // For mobile apps, origin might be null, so allow it
    if (allowedOrigin || isMobileRequest || !origin) {
      response.headers.set(
        'Access-Control-Allow-Origin', 
        allowedOrigin || '*'
      );
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Type');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
    }
    
    return response;
  }
  
  // For actual requests, add CORS headers
  const response = NextResponse.next();
  
  // For mobile apps, origin might be null, so allow it
  if (allowedOrigin || isMobileRequest || !origin) {
    response.headers.set(
      'Access-Control-Allow-Origin', 
      allowedOrigin || '*'
    );
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Type');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  return response;
}

// Apply middleware only to API routes
export const config = {
  matcher: '/api/:path*',
};
