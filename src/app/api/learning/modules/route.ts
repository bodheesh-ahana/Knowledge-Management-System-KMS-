import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import LearningModule from '@/models/LearningModule';
import { connectDB } from '@/lib/mongodb';

// GET all modules for an application
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = req.nextUrl.searchParams;
    const applicationId = searchParams.get('applicationId');
    
    const query: any = { isActive: true };
    if (applicationId) {
      query.applicationId = applicationId;
    }
    
    const modules = await LearningModule.find(query)
      .populate('applicationId', 'name color')
      .sort({ order: 1, name: 1 });
    
    return NextResponse.json({ data: modules });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch learning modules' },
      { status: 500 }
    );
  }
}

// POST create new learning module
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const body = await req.json();
    const { applicationId, name, description, order } = body;
    
    if (!applicationId || !name || !description) {
      return NextResponse.json(
        { error: 'Application ID, name, and description are required' },
        { status: 400 }
      );
    }
    
    const module = await LearningModule.create({
      applicationId,
      name,
      description,
      order: order || 0,
    });
    
    return NextResponse.json({ data: module }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create learning module' },
      { status: 500 }
    );
  }
}
