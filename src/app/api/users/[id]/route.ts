import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { updateUserSchema } from '@/lib/validation';
import { errorResponse, successResponse } from '@/lib/errors';
import { ZodError } from 'zod';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await getAuthenticatedUser();
    await connectDB();

    const user = await User.findById(id).lean();
    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return errorResponse('Failed to fetch user', 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getAuthenticatedUser();
    const body = await req.json();
    const validatedData = updateUserSchema.parse(body);

    // Only Admin/Manager can change role/active status; users may edit their own profile fields
    if ((validatedData.role || validatedData.active !== undefined) &&
        !['Admin', 'Manager'].includes(currentUser.role)) {
      return errorResponse('Permission denied', 403);
    }

    await connectDB();

    const user = await User.findByIdAndUpdate(id, validatedData, { new: true });
    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse(user);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse('Validation failed', 400);
    }
    console.error('Error updating user:', error);
    return errorResponse('Failed to update user', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getAuthenticatedUser();
    if (!['Admin', 'Manager'].includes(currentUser.role)) {
      return errorResponse('Permission denied', 403);
    }

    await connectDB();

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse({ message: 'User deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return errorResponse('Failed to delete user', 500);
  }
}
