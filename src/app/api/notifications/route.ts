import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Notification } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unread') === 'true';

    const query: any = { user: user._id };
    if (unreadOnly) query.read = false;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).limit(50).lean(),
      Notification.countDocuments({ user: user._id, read: false }),
    ]);

    return successResponse({ notifications, unreadCount });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return errorResponse('Failed to fetch notifications', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await getAuthenticatedUser();
    const body = await req.json();

    await connectDB();

    const notification = new Notification(body);
    await notification.save();

    return successResponse(notification, 201);
  } catch (error) {
    console.error('Error creating notification:', error);
    return errorResponse('Failed to create notification', 500);
  }
}

export async function PUT(_req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    await connectDB();

    // Mark all as read
    await Notification.updateMany({ user: user._id, read: false }, { read: true });

    return successResponse({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return errorResponse('Failed to update notifications', 500);
  }
}
