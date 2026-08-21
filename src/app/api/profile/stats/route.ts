import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { KnowledgeArticle, Ticket, TrackerEntry, User, TeamMember } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { isLeadRole } from '@/lib/permissions';
import { errorResponse, successResponse } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUser();
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const requestedUserId = searchParams.get('userId');
    const requestedMemberId = searchParams.get('memberId');

    // Resolve target user; leads may view other team members
    let targetUser: any = currentUser;
    let unresolvedMember: any = null;

    if ((requestedUserId || requestedMemberId) && isLeadRole(currentUser.role)) {
      if (requestedUserId) {
        const found = await User.findById(requestedUserId).select('name email role').lean();
        if (found) targetUser = found;
      } else if (requestedMemberId) {
        const member = await TeamMember.findById(requestedMemberId).lean();
        if (member) {
          const linkedUser = member.userId
            ? await User.findById(member.userId).select('name email role').lean()
            : await User.findOne({ email: member.email.toLowerCase().trim() }).select('name email role').lean();
          if (linkedUser) {
            targetUser = linkedUser;
          } else {
            unresolvedMember = member;
          }
        }
      }
    }

    if (unresolvedMember) {
      return successResponse({
        knowledgeArticles: { total: 0, recent: [] },
        tickets: { resolved: 0, recent: [] },
        tracker: { totalEntries: 0, totalHours: 0, recent: [] },
        streak: { current: 0, longest: 0 },
        activity: [],
        user: { name: unresolvedMember.name, email: unresolvedMember.email, role: unresolvedMember.role },
      });
    }

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
      KnowledgeArticle.countDocuments({ owner: targetUser._id }),
      
      // Count tickets resolved by user
      Ticket.countDocuments({ assignedTo: targetUser._id, status: 'Resolved' }),
      
      // Count tracker entries by user
      TrackerEntry.countDocuments({ user: targetUser._id }),
      
      // Recent knowledge articles
      KnowledgeArticle.find({ owner: targetUser._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title status createdAt')
        .lean(),
      
      // Recent tickets
      Ticket.find({ assignedTo: targetUser._id })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('title status priority updatedAt')
        .lean(),
      
      // Recent tracker entries
      TrackerEntry.find({ user: targetUser._id })
        .sort({ date: -1 })
        .limit(5)
        .select('application date hoursWorked workDescription')
        .lean(),
      
      // Total tickets resolved from tracker entries
      TrackerEntry.aggregate([
        { $match: { user: targetUser._id } },
        { $group: { _id: null, totalResolved: { $sum: '$ticketsResolved' } } },
      ]),
      
      // Total articles created from tracker entries
      TrackerEntry.aggregate([
        { $match: { user: targetUser._id } },
        { $group: { _id: null, totalArticles: { $sum: '$articlesCreated' } } },
      ]),
    ]);

    const resolvedTickets = ticketsResolvedCount + (totalResolvedFromTracker[0]?.totalResolved || 0);
    const totalArticles = knowledgeArticlesCount + (totalArticlesFromTracker[0]?.totalArticles || 0);

    // Calculate total hours logged from tracker entries
    const totalHoursResult = await TrackerEntry.aggregate([
      { $match: { user: targetUser._id } },
      { $group: { _id: null, totalHours: { $sum: '$hoursWorked' } } },
    ]);
    const totalHoursLogged = totalHoursResult[0]?.totalHours || 0;

    // Calculate activity map (last 12 months) from tracker entries and new articles
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const trackerActivity = await TrackerEntry.aggregate([
      {
        $match: {
          user: targetUser._id,
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
    ]);

    const articleActivity = await KnowledgeArticle.aggregate([
      {
        $match: {
          owner: targetUser._id,
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
          hours: { $sum: 0 },
        },
      },
    ]);

    const activityByDate = new Map<string, { count: number; hours: number }>();
    for (const a of trackerActivity) {
      activityByDate.set(a._id, { count: a.count, hours: a.hours });
    }
    for (const a of articleActivity) {
      const existing = activityByDate.get(a._id) || { count: 0, hours: 0 };
      existing.count += a.count;
      activityByDate.set(a._id, existing);
    }

    const activityData = Array.from(activityByDate.entries())
      .map(([date, v]) => ({ _id: date, count: v.count, hours: v.hours }))
      .sort((a, b) => a._id.localeCompare(b._id));

    // Calculate streaks from merged activity
    const activeDates = new Set(activityData.map((a) => a._id));
    const today = new Date();
    let currentStreak = 0;
    let checkDate = new Date(today);
    while (activeDates.has(checkDate.toISOString().split('T')[0])) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    let longestStreak = 0;
    let currentRun = 0;
    let previous: string | null = null;
    for (const a of activityData) {
      if (previous) {
        const prevDate = new Date(previous);
        const currDate = new Date(a._id);
        const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        currentRun = diffDays === 1 ? currentRun + 1 : 1;
      } else {
        currentRun = 1;
      }
      if (currentRun > longestStreak) longestStreak = currentRun;
      previous = a._id;
    }

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
      streak: {
        current: currentStreak,
        longest: longestStreak,
      },
      activity: activityData,
      user: {
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      },
    };

    return successResponse(stats);
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    return errorResponse('Failed to fetch profile statistics', 500);
  }
}
