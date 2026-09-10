import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ collection: string }> }
) {
  const { collection } = await params;
  return NextResponse.json({
    success: true,
    collection,
    items: [],
    source: 'firestore',
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ collection: string }> }
) {
  const { collection } = await params;
  // The existing frontend also writes the same payload directly to Firestore.
  // We intentionally do not write files on Vercel because the filesystem is
  // ephemeral in serverless functions.
  await request.json().catch(() => null);
  return NextResponse.json({
    success: true,
    collection,
    stored: false,
    source: 'firestore',
  });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
