import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    version: 'v4-fixed-2026-04-03',
    youtubeLibrary: 'REMOVED',
    method: 'YouTube Data API v3 only',
    status: 'OK'
  });
}
