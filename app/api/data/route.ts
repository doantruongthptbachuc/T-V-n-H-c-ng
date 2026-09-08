import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  // Firestore is the durable data store. This endpoint exists for backward
  // compatibility with the old client sync layer.
  return NextResponse.json({
    success: true,
    data: {},
    source: 'firestore',
    version: 0,
  });
}

export async function POST() {
  return NextResponse.json({
    success: true,
    stored: false,
    message: 'Dữ liệu được lưu trực tiếp vào Firestore.',
  });
}
