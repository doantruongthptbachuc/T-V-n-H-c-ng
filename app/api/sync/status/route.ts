import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    success: true,
    version: 0,
    lastSyncedAt: new Date().toISOString(),
    activeConnections: 1,
    source: 'firestore',
  });
}
