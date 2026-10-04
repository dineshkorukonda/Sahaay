import { NextResponse } from 'next/server';

export async function GET() {
  const rateLimitHeaderEnabled = process.env.ENABLE_RATE_LIMIT_HEADER === 'true';
  const headers: Record<string, string> = {};

  if (rateLimitHeaderEnabled) {
    headers['X-RateLimit-Limit'] = process.env.RATE_LIMIT_MAX_REQUESTS || '120';
    headers['X-RateLimit-Remaining'] = '119';
    headers['X-RateLimit-Reset'] = '60';
  }

  return NextResponse.json(
    {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'sahaay',
      version: '1.0.0',
    },
    {
      status: 200,
      headers,
    }
  );
}
