import { Notification, User } from '@/models';
import { INotification } from '@/types';

type NotificationInput = Pick<INotification, 'type' | 'title' | 'message' | 'resourceId'>;

/**
 * Notify every user about an application event.
 * This is intentionally broad so the team lead sees every activity.
 */
export async function notifyAll(input: NotificationInput) {
  try {
    const users = await User.find({}, '_id').lean();
    const docs = users.map((u: any) => ({
      user: u._id,
      type: input.type,
      title: input.title,
      message: input.message,
      resourceId: input.resourceId,
    }));
    if (docs.length) {
      await Notification.insertMany(docs);
    }
  } catch (err) {
    console.error('Failed to broadcast notification:', err);
  }
}
