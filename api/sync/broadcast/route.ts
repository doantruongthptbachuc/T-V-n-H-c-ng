import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  await request.json().catch(() => null);
  return NextResponse.json({
    success: true,
    broadcast: 'firestore-realtime',
    message: 'Realtime được xử lý bởi Firestore listeners.',
  });
}
