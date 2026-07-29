import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Notification } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/errors';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    const body = await req.json().catch(() => ({}));

    await connectDB();

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: user._id },
      { read: body.read !== undefined ? body.read : true },
      { new: true }
    );

    if (!notification) {
      return errorResponse('Notification not found', 404);
    }

    return successResponse(notification);
  } catch (error) {
    console.error('Error updating notification:', error);
    return errorResponse('Failed to update notification', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();

    await connectDB();

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: user._id,
    });

    if (!notification) {
      return errorResponse('Notification not found', 404);
    }

    return successResponse({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return errorResponse('Failed to delete notification', 500);
  }
}
