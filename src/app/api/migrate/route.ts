import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json(
    { error: 'HTTP database diagnostics are disabled. Use the reviewed owner CLI workflow.' },
    { status: 410, headers: { 'Cache-Control': 'no-store' } },
  );
}
