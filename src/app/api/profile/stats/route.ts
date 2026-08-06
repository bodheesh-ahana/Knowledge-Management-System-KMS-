import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { KnowledgeArticle, Ticket, TrackerEntry } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/errors';

export async function GET(_req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    await connectDB();

    // Fetch statistics in parallel
    const [
      knowledgeArticlesCount,
      ticketsResolvedCount,
      trackerEntriesCount,
      recentKnowledgeArticles,
      recentTickets,
      recentTrackerEntries,
      totalResolvedFromTracker,
      totalArticlesFromTracker,
    ] = await Promise.all([
      // Count knowledge articles created by user
      KnowledgeArticle.countDocuments({ owner: user._id }),
      
      // Count tickets resolved by user
      Ticket.countDocuments({ assignedTo: user._id, status: 'Resolved' }),
      
      // Count tracker entries by user
      TrackerEntry.countDocuments({ user: user._id }),
      
      // Recent knowledge articles
      KnowledgeArticle.find({ owner: user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title status createdAt')
        .lean(),
      
      // Recent tickets
      Ticket.find({ assignedTo: user._id })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('title status priority updatedAt')
        .lean(),
      
      // Recent tracker entries
      TrackerEntry.find({ user: user._id })
        .sort({ date: -1 })
        .limit(5)
        .select('application date hoursWorked workDescription')
        .lean(),
      
      // Total tickets resolved from tracker entries
      TrackerEntry.aggregate([
        { $match: { user: user._id } },
        { $group: { _id: null, totalResolved: { $sum: '$ticketsResolved' } } },
      ]),
      
      // Total articles created from tracker entries
      TrackerEntry.aggregate([
        { $match: { user: user._id } },
        { $group: { _id: null, totalArticles: { $sum: '$articlesCreated' } } },
      ]),
    ]);

    const resolvedTickets = ticketsResolvedCount + (totalResolvedFromTracker[0]?.totalResolved || 0);
    const totalArticles = knowledgeArticlesCount + (totalArticlesFromTracker[0]?.totalArticles || 0);

    // Calculate total hours logged from tracker entries
    const totalHoursResult = await TrackerEntry.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: null, totalHours: { $sum: '$hoursWorked' } } },
    ]);
    const totalHoursLogged = totalHoursResult[0]?.totalHours || 0;

    // Calculate activity map (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const activityData = await TrackerEntry.aggregate([
      {
        $match: {
          user: user._id,
          date: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' },
          },
          count: { $sum: 1 },
          hours: { $sum: '$hoursWorked' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const stats = {
      knowledgeArticles: {
        total: totalArticles,
        recent: recentKnowledgeArticles,
      },
      tickets: {
        resolved: resolvedTickets,
        recent: recentTickets,
      },
      tracker: {
        totalEntries: trackerEntriesCount,
        totalHours: Math.round(totalHoursLogged * 10) / 10,
        recent: recentTrackerEntries,
      },
      activity: activityData,
    };

    return successResponse(stats);
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    return errorResponse('Failed to fetch profile statistics', 500);
  }
}
