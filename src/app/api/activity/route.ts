import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Activity } from '@/models';
import { errorResponse, successResponse } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const activities = await Activity.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name email avatar')
      .lean();

    return successResponse({ activities });
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    return errorResponse('Failed to fetch activity feed', 500);
  }
}
