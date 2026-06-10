import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Email confirmation is no longer required.' },
    { status: 410 },
  );
}

