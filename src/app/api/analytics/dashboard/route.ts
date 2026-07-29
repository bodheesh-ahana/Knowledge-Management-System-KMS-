import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { KnowledgeArticle, Ticket, Activity } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/errors';

export async function GET(_req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    await connectDB();

    const [
      articlesCreated,
      ticketsResolved,
      totalTickets,
      openTickets,
      viewsAgg,
      recentActivity,
      totalArticles,
      pendingReview,
    ] = await Promise.all([
      KnowledgeArticle.countDocuments({ owner: user._id }),
      Ticket.countDocuments({ assignee: user._id, status: 'Resolved' }),
      Ticket.countDocuments({}),
      Ticket.countDocuments({ status: 'Open' }),
      KnowledgeArticle.aggregate([
        { $match: { owner: user._id } },
        { $group: { _id: null, totalViews: { $sum: '$views' } } },
      ]),
      Activity.find({}).sort({ createdAt: -1 }).limit(10).populate('user', 'name').lean(),
      KnowledgeArticle.countDocuments({ status: 'Published' }),
      KnowledgeArticle.countDocuments({ status: 'UnderReview' }),
    ]);

    return successResponse({
      articlesCreated,
      ticketsResolved,
      totalTickets,
      openTickets,
      totalViews: viewsAgg[0]?.totalViews || 0,
      totalArticles,
      pendingReview,
      recentActivity,
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    return errorResponse('Failed to fetch analytics', 500);
  }
}
