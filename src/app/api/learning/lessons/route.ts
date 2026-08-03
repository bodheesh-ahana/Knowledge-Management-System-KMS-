import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import LearningLesson from '@/models/LearningLesson';
import { connectDB } from '@/lib/mongodb';

// GET all lessons for a module or specific lesson by ID
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = req.nextUrl.searchParams;
    const moduleId = searchParams.get('moduleId');
    const lessonId = searchParams.get('lessonId');
    
    const query: any = { isActive: true };
    if (moduleId) {
      query.moduleId = moduleId;
    }
    if (lessonId) {
      query._id = lessonId;
    }
    
    const lessons = await LearningLesson.find(query)
      .populate('moduleId', 'name')
      .populate('relatedKBIds', 'title status')
      .sort({ order: 1, title: 1 });
    
    return NextResponse.json({ data: lessons });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch learning lessons' },
      { status: 500 }
    );
  }
}

// POST create new learning lesson
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const body = await req.json();
    const {
      moduleId,
      title,
      objective,
      businessPurpose,
      concepts,
      content,
      importantNotes,
      commonMistakes,
      relatedKBIds,
      practicalExercise,
      quiz,
      order,
      estimatedDuration,
    } = body;
    
    if (!moduleId || !title || !objective || !content) {
      return NextResponse.json(
        { error: 'Module ID, title, objective, and content are required' },
        { status: 400 }
      );
    }
    
    const lesson = await LearningLesson.create({
      moduleId,
      title,
      objective,
      businessPurpose: businessPurpose || '',
      concepts: concepts || [],
      content,
      importantNotes: importantNotes || [],
      commonMistakes: commonMistakes || [],
      relatedKBIds: relatedKBIds || [],
      practicalExercise,
      quiz,
      order: order || 0,
      estimatedDuration: estimatedDuration || 30,
    });
    
    return NextResponse.json({ data: lesson }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create learning lesson' },
      { status: 500 }
    );
  }
}
