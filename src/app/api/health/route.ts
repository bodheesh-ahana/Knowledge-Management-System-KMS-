// Health check endpoint
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ status: 'ok', message: 'Server is running' });
  } catch {
    return NextResponse.json({ status: 'error', message: 'Database connection failed' }, { status: 500 });
  }
}
