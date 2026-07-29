import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Comment } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/errors';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();

    await connectDB();

    const comment = await Comment.findById(id);
    if (!comment) {
      return errorResponse('Comment not found', 404);
    }

    if (comment.author.toString() !== user._id.toString() && !['Admin', 'Manager'].includes(user.role)) {
      return errorResponse('Permission denied', 403);
    }

    await Comment.deleteOne({ _id: id });

    return successResponse({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return errorResponse('Failed to delete comment', 500);
  }
}
