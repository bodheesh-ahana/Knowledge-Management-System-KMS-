import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import LearningApplication from '@/models/LearningApplication';
import { connectDB } from '@/lib/mongodb';

// GET all learning applications
export async function GET() {
  try {
    await connectDB();
    
    const applications = await LearningApplication.find({ isActive: true })
      .sort({ order: 1, name: 1 });
    
    return NextResponse.json({ data: applications });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch learning applications' },
      { status: 500 }
    );
  }
}

// POST create new learning application
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const body = await req.json();
    const { name, description, icon, color, order } = body;
    
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }
    
    const application = await LearningApplication.create({
      name,
      description,
      icon,
      color: color || '#3b82f6',
      order: order || 0,
    });
    
    return NextResponse.json({ data: application }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create learning application' },
      { status: 500 }
    );
  }
}
