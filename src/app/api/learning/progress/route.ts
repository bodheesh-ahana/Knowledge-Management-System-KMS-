import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import LearningProgress from '@/models/LearningProgress';
import { connectDB } from '@/lib/mongodb';

// GET progress for a user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const searchParams = req.nextUrl.searchParams;
    const applicationId = searchParams.get('applicationId');
    const moduleId = searchParams.get('moduleId');
    const lessonId = searchParams.get('lessonId');
    
    const query: any = { userId: session.user.email };
    if (applicationId) query.applicationId = applicationId;
    if (moduleId) query.moduleId = moduleId;
    if (lessonId) query.lessonId = lessonId;
    
    const progress = await LearningProgress.find(query)
      .populate('applicationId', 'name')
      .populate('moduleId', 'name')
      .populate('lessonId', 'title')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ data: progress });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch learning progress' },
      { status: 500 }
    );
  }
}

// POST create or update progress
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const body = await req.json();
    const {
      applicationId,
      moduleId,
      lessonId,
      status,
      quizScore,
      exerciseSubmitted,
      exerciseScreenshot,
      notes,
      timeSpent,
    } = body;
    
    if (!applicationId || !moduleId || !lessonId) {
      return NextResponse.json(
        { error: 'Application ID, module ID, and lesson ID are required' },
        { status: 400 }
      );
    }
    
    // Check if progress already exists
    const existingProgress = await LearningProgress.findOne({
      userId: session.user.email,
      lessonId,
    });
    
    let progress;
    
    if (existingProgress) {
      // Update existing progress
      progress = await LearningProgress.findByIdAndUpdate(
        existingProgress._id,
        {
          status: status || existingProgress.status,
          quizScore: quizScore !== undefined ? quizScore : existingProgress.quizScore,
          exerciseSubmitted: exerciseSubmitted !== undefined ? exerciseSubmitted : existingProgress.exerciseSubmitted,
          exerciseScreenshot: exerciseScreenshot || existingProgress.exerciseScreenshot,
          notes: notes !== undefined ? notes : existingProgress.notes,
          timeSpent: timeSpent !== undefined ? timeSpent : existingProgress.timeSpent,
          completedAt: status === 'completed' ? new Date() : existingProgress.completedAt,
        },
        { new: true }
      );
    } else {
      // Create new progress
      progress = await LearningProgress.create({
        userId: session.user.email,
        applicationId,
        moduleId,
        lessonId,
        status: status || 'in_progress',
        quizScore,
        exerciseSubmitted,
        exerciseScreenshot,
        notes,
        timeSpent: timeSpent || 0,
        completedAt: status === 'completed' ? new Date() : undefined,
      });
    }
    
    return NextResponse.json({ data: progress });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update learning progress' },
      { status: 500 }
    );
  }
}
