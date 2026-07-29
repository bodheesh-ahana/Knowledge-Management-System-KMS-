import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import {
  Ticket,
  KnowledgeArticle,
  Application,
  TrackerEntry,
  Activity,
} from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/errors';

function last6Months() {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: d.toLocaleString('default', { month: 'short' }),
      start: new Date(d.getFullYear(), d.getMonth(), 1),
      end: new Date(d.getFullYear(), d.getMonth() + 1, 1),
    });
  }
  return months;
}

function activityMessage(activity: any) {
  const user = activity.user?.name || 'Someone';
  const type = activity.type;
  const details = activity.details || {};

  switch (type) {
    case 'ArticleCreated':
      return `${user} created article "${details.title || 'Untitled'}"`;
    case 'ArticlePublished':
      return `${user} published article "${details.title || 'Untitled'}"`;
    case 'ArticleUpdated':
      return `${user} updated article "${details.title || 'Untitled'}"`;
    case 'ArticleArchived':
      return `${user} archived article "${details.title || 'Untitled'}"`;
    case 'TicketCreated':
      return `${user} created ticket ${details.ticketNumber || ''} "${details.title || ''}"`;
    case 'TicketResolved':
      return `${user} resolved ticket ${details.ticketNumber || ''} "${details.title || ''}"`;
    case 'HoursLogged':
      return `${user} logged ${details.hoursWorked || 0}h of work`;
    case 'UserLoggedIn':
      return `${user} logged in`;
    default:
      return `${user} performed ${type}`;
  }
}

export async function GET(_req: NextRequest) {
  try {
    await getAuthenticatedUser();
    await connectDB();

    const now = new Date();
    const months = last6Months();

    const [
      openTickets,
      totalArticles,
      pendingReviews,
      appsSupported,
      kbReuse,
      totalTracker,
      resolvedAvg,
    ] = await Promise.all([
      Ticket.countDocuments({ status: 'Open' }),
      KnowledgeArticle.countDocuments({}),
      KnowledgeArticle.countDocuments({ status: 'UnderReview' }),
      Application.countDocuments({}),
      TrackerEntry.countDocuments({ linkedArticle: { $ne: null } }),
      TrackerEntry.countDocuments({}),
      Ticket.aggregate([
        {
          $match: {
            status: { $in: ['Resolved', 'Closed'] },
            resolvedAt: { $exists: true, $ne: null },
          },
        },
        {
          $project: {
            hours: {
              $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 3600000],
            },
          },
        },
        { $group: { _id: null, avg: { $avg: '$hours' } } },
      ]),
    ]);

    const avgResTime = resolvedAvg[0]?.avg ?? 0;
    const kbReuseRate = totalTracker ? Math.round((kbReuse / totalTracker) * 100) : 0;

    const monthlyTrend = await Promise.all(
      months.map(async (m) => {
        const [tickets, articles, trackerHours] = await Promise.all([
          Ticket.countDocuments({ createdAt: { $gte: m.start, $lt: m.end } }),
          KnowledgeArticle.countDocuments({ createdAt: { $gte: m.start, $lt: m.end } }),
          TrackerEntry.aggregate([
            { $match: { createdAt: { $gte: m.start, $lt: m.end } } },
            { $group: { _id: null, hours: { $sum: '$hoursWorked' } } },
          ]),
        ]);
        return {
          label: m.label,
          tickets,
          articles,
          hours: trackerHours[0]?.hours || 0,
        };
      })
    );

    const applications = await Application.find({}).sort({ name: 1 }).lean();

    const topApplications = await Promise.all(
      applications.map(async (app: any) => {
        const [ticketCount, articleCount] = await Promise.all([
          Ticket.countDocuments({ application: app.name }),
          KnowledgeArticle.countDocuments({ application: app.name }),
        ]);
        return {
          _id: app._id.toString(),
          name: app.name,
          icon: app.icon || 'apps',
          color: app.color,
          ticketCount,
          articleCount,
          total: ticketCount + articleCount,
        };
      })
    );

    topApplications.sort((a, b) => b.total - a.total);

    const [recentActivity, criticalOpenTickets, recentArticles] = await Promise.all([
      Activity.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'name')
        .lean(),
      Ticket.find({ status: 'Open', severity: 'Critical' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('assignee', 'name email')
        .lean(),
      KnowledgeArticle.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title application views createdAt')
        .lean(),
    ]);

    const activityItems = recentActivity.map((a: any) => ({
      _id: a._id.toString(),
      type: a.type,
      message: activityMessage(a),
      createdAt: a.createdAt,
    }));

    return successResponse({
      stats: {
        openTickets,
        totalArticles,
        pendingReviews,
        appsSupported,
        avgResTime: Number(avgResTime.toFixed(1)),
        kbReuseRate,
      },
      topApplications: topApplications.slice(0, 5),
      recentActivity: activityItems,
      criticalOpenTickets,
      recentArticles,
      monthlyTrend,
    });
  } catch (error: any) {
    console.error('[dashboard:GET] error:', error);
    return errorResponse('Failed to fetch dashboard data', 500);
  }
}
