import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Comment } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { createCommentSchema } from '@/lib/validation';
import { errorResponse, successResponse } from '@/lib/errors';
import { ZodError } from 'zod';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const resourceType = searchParams.get('resourceType');
    const resourceId = searchParams.get('resourceId');

    if (!resourceType || !resourceId) {
      return errorResponse('resourceType and resourceId are required', 400);
    }

    const comments = await Comment.find({ resourceType, resourceId })
      .sort({ createdAt: -1 })
      .populate('author', 'name email avatar')
      .lean();

    return successResponse({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return errorResponse('Failed to fetch comments', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body = await req.json();
    const validatedData = createCommentSchema.parse(body);

    await connectDB();

    const comment = new Comment({
      ...validatedData,
      author: user._id,
    });

    await comment.save();
    await comment.populate('author', 'name email avatar');

    return successResponse(comment, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse('Validation failed', 400);
    }
    console.error('Error creating comment:', error);
    return errorResponse('Failed to create comment', 500);
  }
}
