import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { TrackerEntry, Ticket, KnowledgeArticle } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/errors';

function toISODate(d: Date) {
  const date = new Date(d);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function fillDailyTrend(rows: { _id: string; hours: number }[], days = 7) {
  const map = new Map(rows.map((r) => [r._id, r.hours]));
  const trend = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = toISODate(d);
    trend.push({ date: key, hours: map.get(key) || 0 });
  }
  return trend;
}

function fillMonthlyTrend(rows: { _id: string; count: number }[], months = 6) {
  const map = new Map(rows.map((r) => [r._id, r.count]));
  const trend = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    trend.push({ month: key, count: map.get(key) || 0 });
  }
  return trend;
}

const TEAM_LEAD = 'Bodheesh V C';

export async function GET(_req: NextRequest) {
  try {
    await getAuthenticatedUser();
    await connectDB();

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      totalTickets,
      totalArticles,
      totalTrackerEntries,
      openTickets,
      resolvedTickets,
      inProgressTickets,
      slaBreaches,
      escalations,
      totalHoursAgg,
      ticketsByApplication,
      hoursByApplication,
      dailyHoursAgg,
      monthlyTicketsAgg,
      statusCounts,
      trackerEntries,
    ] = await Promise.all([
      Ticket.countDocuments(),
      KnowledgeArticle.countDocuments(),
      TrackerEntry.countDocuments(),
      Ticket.countDocuments({ status: 'Open' }),
      Ticket.countDocuments({ status: 'Resolved' }),
      Ticket.countDocuments({ status: 'In Progress' }),
      TrackerEntry.countDocuments({ slaBreach: 'Yes' }),
      TrackerEntry.countDocuments({ escalationStatus: 'Yes' }),
      TrackerEntry.aggregate([{ $group: { _id: null, total: { $sum: '$hoursWorked' } } }]),
      Ticket.aggregate([
        { $group: { _id: { $ifNull: ['$application', 'Unspecified'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      TrackerEntry.aggregate([
        { $group: { _id: { $ifNull: ['$application', 'Unspecified'] }, hours: { $sum: '$hoursWorked' } } },
        { $sort: { hours: -1 } },
      ]),
      TrackerEntry.aggregate([
        { $match: { date: { $gte: sevenDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, hours: { $sum: '$hoursWorked' } } },
        { $sort: { _id: 1 } },
      ]),
      Ticket.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Ticket.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      TrackerEntry.find().sort({ date: -1 }).limit(500).lean(),
    ]);

    // Engineer efficiency from tracker entries.
    const engineerMap = new Map<
      string,
      { name: string; hours: number; entries: number; tickets: Set<string>; ownerTickets: number; articlesCreated: number }
    >();

    for (const e of trackerEntries as any[]) {
      const members = Array.isArray(e.teamMembers) ? e.teamMembers : [];
      const share = members.length ? e.hoursWorked / members.length : e.hoursWorked;

      for (const member of members) {
        if (!member || member === TEAM_LEAD) continue;
        const existing = engineerMap.get(member) || {
          name: member,
          hours: 0,
          entries: 0,
          tickets: new Set<string>(),
          ownerTickets: 0,
          articlesCreated: 0,
        };
        existing.hours += share;
        existing.entries += 1;
        existing.tickets.add(e.ticketId);
        if (e.role === 'Owner') existing.ownerTickets += 1;
        existing.articlesCreated += e.articlesCreated || 0;
        engineerMap.set(member, existing);
      }
    }

    const engineerEfficiency = Array.from(engineerMap.values())
      .map((e) => ({
        name: e.name,
        hours: Math.round(e.hours * 100) / 100,
        entries: e.entries,
        ticketsHandled: e.tickets.size,
        ownerTickets: e.ownerTickets,
        articlesCreated: e.articlesCreated,
      }))
      .sort((a, b) => b.hours - a.hours);

    return successResponse({
      summary: {
        totalTickets,
        totalArticles,
        totalTrackerEntries,
        openTickets,
        resolvedTickets,
        inProgressTickets,
        slaBreaches,
        escalations,
        totalHours: totalHoursAgg[0]?.total || 0,
      },
      ticketsByApplication,
      hoursByApplication,
      dailyHoursTrend: fillDailyTrend(dailyHoursAgg as any[]),
      monthlyTicketsTrend: fillMonthlyTrend(monthlyTicketsAgg as any[]),
      statusCounts,
      engineerEfficiency,
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return errorResponse('Failed to fetch analytics', 500);
  }
}
