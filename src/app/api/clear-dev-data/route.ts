import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getAuthenticatedUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/errors';
import {
  Activity,
  AuditLog,
  Comment,
  KnowledgeArticle,
  Notification,
  Project,
  SearchHistory,
  Ticket,
  TrackerEntry,
} from '@/models';

const KEEP = new Set(['users', 'teammembers', 'applications', 'documentrecords']);

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!['TeamLead', 'Admin', 'Manager'].includes(currentUser.role)) {
      return errorResponse('Permission denied', 403);
    }

    const { searchParams } = new URL(req.url);
    if (searchParams.get('confirm') !== 'yes') {
      return errorResponse(
        'Add ?confirm=yes to the URL to confirm you want to clear all development data.',
        400
      );
    }

    await connectDB();

    const results = await Promise.all([
      TrackerEntry.deleteMany({}),
      KnowledgeArticle.deleteMany({}),
      Ticket.deleteMany({}),
      Comment.deleteMany({}),
      Activity.deleteMany({}),
      SearchHistory.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
      Project.deleteMany({}),
    ]);

    const cleared = Object.fromEntries(
      [
        'TrackerEntry',
        'KnowledgeArticle',
        'Ticket',
        'Comment',
        'Activity',
        'SearchHistory',
        'Notification',
        'AuditLog',
        'Project',
      ].map((name, i) => [name, results[i].deletedCount])
    );

    return successResponse({
      message: 'Development data cleared. Kept: users, team, documents, applications.',
      cleared,
      kept: Array.from(KEEP),
    });
  } catch (error) {
    console.error('Error clearing development data:', error);
    return errorResponse('Failed to clear development data', 500);
  }
}
