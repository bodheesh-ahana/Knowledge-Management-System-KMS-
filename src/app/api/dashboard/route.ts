import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { KnowledgeArticle, TrackerEntry, Activity } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/errors';
import { isClosedStatus, normalizeAppName, parentTicketId, taskRefOf } from '@/lib/tickets';

const LEAD = 'Bodheesh V C';

function activityMessage(activity: any) {
  const user = activity.user?.name || 'Someone';
  const details = activity.details || {};

  switch (activity.type) {
    case 'ArticleCreated':
      return `${user} created article "${details.title || 'Untitled'}"`;
    case 'ArticlePublished':
      return `${user} published article "${details.title || 'Untitled'}"`;
    case 'ArticleUpdated':
      return `${user} updated article "${details.title || 'Untitled'}"`;
    case 'ArticleArchived':
      return `${user} archived article "${details.title || 'Untitled'}"`;
    case 'HoursLogged':
      return `${user} logged ${details.hoursWorked || 0}h of work`;
    case 'UserLoggedIn':
      return `${user} logged in`;
    default:
      return `${user} performed ${activity.type}`;
  }
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10);
const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const round2 = (n: number) => Math.round(n * 100) / 100;

export async function GET(_req: NextRequest) {
  try {
    await getAuthenticatedUser();
    await connectDB();

    // The tracker is the live data set (one row per piece of work logged) and
    // the knowledge base is the other. Everything below is derived from those
    // two collections only, so the dashboard always matches what the team
    // actually logged.
    const [entries, articleBuckets, recentArticles, articleTotals, recentActivity] =
      await Promise.all([
        TrackerEntry.find({})
          .select(
            'ticketId taskId title teamMembers role date createdAt hoursWorked workType slaBreach escalationStatus application ticketStatus linkedArticle'
          )
          .sort({ date: -1, createdAt: -1 })
          .lean(),
        // Many imported articles have an unusable createdAt, so the ObjectId
        // timestamp is used as the reliable creation date.
        KnowledgeArticle.aggregate([
          { $addFields: { createdOn: { $toDate: '$_id' } } },
          {
            $group: {
              _id: { $dateToString: { date: '$createdOn', format: '%Y-%m' } },
              articles: { $sum: 1 },
            },
          },
        ]),
        KnowledgeArticle.find({})
          .sort({ _id: -1 })
          .limit(6)
          .select('title application views status ticketId')
          .lean(),
        KnowledgeArticle.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              views: { $sum: '$views' },
              helpful: { $sum: '$helpful' },
              published: { $sum: { $cond: [{ $eq: ['$status', 'Published'] }, 1, 0] } },
              withTicket: {
                $sum: { $cond: [{ $in: ['$ticketId', [null, '']] }, 0, 1] },
              },
            },
          },
        ]),
        Activity.find({}).sort({ createdAt: -1 }).limit(10).populate('user', 'name').lean(),
      ]);

    const rows = entries as any[];

    // --- Ticket-level roll-up (entries are grouped by their parent ticket) ---
    const tickets = new Map<
      string,
      { hours: number; status?: string; linked: boolean; latest: number; app: string }
    >();
    const taskRefs = new Set<string>();
    const members = new Map<
      string,
      { hours: number; entries: number; tickets: Set<string>; ownerTickets: number }
    >();
    const apps = new Map<string, { hours: number; entries: number; tickets: Set<string> }>();
    const workTypes = new Map<string, { hours: number; entries: number }>();
    const perDay = new Map<string, { hours: number; entries: number }>();
    const perMonth = new Map<string, { hours: number; entries: number; tickets: Set<string> }>();

    let hours = 0;
    let slaBreaches = 0;
    let escalations = 0;
    let linkedEntries = 0;
    let minDate = Infinity;
    let maxDate = -Infinity;

    for (const e of rows) {
      const ticketKey = parentTicketId(e.ticketId) || e.ticketId || '—';
      const date = new Date(e.date);
      const time = date.getTime();
      const entryHours = e.hoursWorked || 0;
      const app = normalizeAppName(e.application);

      hours += entryHours;
      if (e.slaBreach === 'Yes') slaBreaches++;
      if (e.escalationStatus === 'Yes') escalations++;
      if (e.linkedArticle) linkedEntries++;
      if (time < minDate) minDate = time;
      if (time > maxDate) maxDate = time;

      const ref = taskRefOf(e);
      if (ref) taskRefs.add(ref);

      const ticket = tickets.get(ticketKey) || {
        hours: 0,
        status: undefined,
        linked: false,
        latest: -Infinity,
        app,
      };
      ticket.hours += entryHours;
      ticket.linked = ticket.linked || Boolean(e.linkedArticle);
      // Entries arrive newest-first, so the first status seen is the current one.
      if (time > ticket.latest) {
        ticket.latest = time;
        if (e.ticketStatus) ticket.status = e.ticketStatus;
        if (app !== 'Unspecified') ticket.app = app;
      }
      tickets.set(ticketKey, ticket);

      for (const name of (e.teamMembers as string[]) || []) {
        if (!name) continue;
        const m = members.get(name) || {
          hours: 0,
          entries: 0,
          tickets: new Set<string>(),
          ownerTickets: 0,
        };
        // Shared work is split evenly so the per-member hours still add up to
        // the team total.
        m.hours += entryHours / (e.teamMembers.length || 1);
        m.entries += 1;
        m.tickets.add(ticketKey);
        if (e.role === 'Owner') m.ownerTickets += 1;
        members.set(name, m);
      }

      const a = apps.get(app) || { hours: 0, entries: 0, tickets: new Set<string>() };
      a.hours += entryHours;
      a.entries += 1;
      a.tickets.add(ticketKey);
      apps.set(app, a);

      const wt = e.workType || 'Other';
      const w = workTypes.get(wt) || { hours: 0, entries: 0 };
      w.hours += entryHours;
      w.entries += 1;
      workTypes.set(wt, w);

      const dk = dayKey(date);
      const d = perDay.get(dk) || { hours: 0, entries: 0 };
      d.hours += entryHours;
      d.entries += 1;
      perDay.set(dk, d);

      const mk = monthKey(date);
      const mo = perMonth.get(mk) || { hours: 0, entries: 0, tickets: new Set<string>() };
      mo.hours += entryHours;
      mo.entries += 1;
      mo.tickets.add(ticketKey);
      perMonth.set(mk, mo);
    }

    const ticketList = Array.from(tickets.entries());
    const activeTickets = ticketList.filter(([, t]) => !isClosedStatus(t.status)).length;
    const closedTickets = ticketList.length - activeTickets;
    const linkedTickets = ticketList.filter(([, t]) => t.linked).length;

    const statusBreakdown = Object.entries(
      ticketList.reduce<Record<string, number>>((acc, [, t]) => {
        const key = t.status || 'Open';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    )
      .map(([status, count]) => ({ status, tickets: count }))
      .sort((a, b) => b.tickets - a.tickets);

    // --- Trends ---
    const now = new Date();
    const dailyTrend: { date: string; label: string; hours: number; entries: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = dayKey(d);
      const bucket = perDay.get(key) || { hours: 0, entries: 0 };
      dailyTrend.push({
        date: key,
        label: d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
        hours: round2(bucket.hours),
        entries: bucket.entries,
      });
    }

    const articleByMonth = new Map<string, number>(
      (articleBuckets as any[]).map((b) => [b._id, b.articles])
    );

    const monthlyTrend: {
      label: string;
      entries: number;
      hours: number;
      tickets: number;
      articles: number;
    }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthKey(d);
      const bucket = perMonth.get(key);
      monthlyTrend.push({
        label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        entries: bucket?.entries || 0,
        hours: round2(bucket?.hours || 0),
        tickets: bucket?.tickets.size || 0,
        articles: articleByMonth.get(key) || 0,
      });
    }

    // --- Applications: tracker effort + knowledge coverage side by side ---
    const articlesByApp = await KnowledgeArticle.aggregate([
      { $group: { _id: '$application', articles: { $sum: 1 } } },
    ]);
    const articleAppCounts = new Map<string, number>();
    for (const a of articlesByApp as any[]) {
      const name = normalizeAppName(a._id);
      articleAppCounts.set(name, (articleAppCounts.get(name) || 0) + a.articles);
    }

    const applications = Array.from(apps.entries())
      .map(([name, a]) => ({
        name,
        hours: round2(a.hours),
        entries: a.entries,
        tickets: a.tickets.size,
        articles: articleAppCounts.get(name) || 0,
      }))
      .sort((a, b) => b.hours - a.hours);

    const teamWorkload = Array.from(members.entries())
      .filter(([name]) => name !== LEAD)
      .map(([name, m]) => ({
        name,
        hours: round2(m.hours),
        entries: m.entries,
        tickets: m.tickets.size,
        ownerTickets: m.ownerTickets,
      }))
      .sort((a, b) => b.hours - a.hours);

    const workTypeBreakdown = Array.from(workTypes.entries())
      .map(([type, w]) => ({ type, hours: round2(w.hours), entries: w.entries }))
      .sort((a, b) => b.hours - a.hours);

    const totals = (articleTotals as any[])[0] || {};
    const activeDays = perDay.size;
    const last7 = dailyTrend.slice(-7);

    const recentEntries = rows.slice(0, 8).map((e) => ({
      _id: e._id.toString(),
      ticketId: parentTicketId(e.ticketId) || e.ticketId,
      taskId: taskRefOf(e) || null,
      title: e.title || '—',
      application: normalizeAppName(e.application),
      members: e.teamMembers || [],
      hours: e.hoursWorked || 0,
      status: e.ticketStatus || 'Open',
      date: e.date,
    }));

    return successResponse({
      window: {
        from: Number.isFinite(minDate) ? new Date(minDate).toISOString() : null,
        to: Number.isFinite(maxDate) ? new Date(maxDate).toISOString() : null,
        activeDays,
      },
      stats: {
        entries: rows.length,
        hours: round2(hours),
        uniqueTickets: ticketList.length,
        activeTickets,
        closedTickets,
        subTasks: taskRefs.size,
        avgHoursPerTicket: ticketList.length ? round2(hours / ticketList.length) : 0,
        avgHoursPerActiveDay: activeDays ? round2(hours / activeDays) : 0,
        hoursLast7Days: round2(last7.reduce((s, d) => s + d.hours, 0)),
        entriesLast7Days: last7.reduce((s, d) => s + d.entries, 0),
        slaBreaches,
        escalations,
        teamMembers: Array.from(members.keys()).filter((n) => n !== LEAD).length,
        linkedEntries,
        linkedTickets,
        kbLinkRate: ticketList.length ? Math.round((linkedTickets / ticketList.length) * 100) : 0,
        totalArticles: totals.total || 0,
        publishedArticles: totals.published || 0,
        articleViews: totals.views || 0,
        articlesFromTickets: totals.withTicket || 0,
      },
      dailyTrend,
      monthlyTrend,
      statusBreakdown,
      applications,
      teamWorkload,
      workTypeBreakdown,
      recentEntries,
      recentArticles: (recentArticles as any[]).map((a) => ({
        _id: a._id.toString(),
        title: a.title,
        application: normalizeAppName(a.application),
        views: a.views || 0,
        status: a.status,
        ticketId: a.ticketId || null,
        // ObjectId timestamp — reliable even where createdAt was imported badly.
        createdAt: new Date(parseInt(a._id.toString().slice(0, 8), 16) * 1000).toISOString(),
      })),
      recentActivity: (recentActivity as any[]).map((a) => ({
        _id: a._id.toString(),
        type: a.type,
        message: activityMessage(a),
        createdAt: a.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('[dashboard:GET] error:', error);
    return errorResponse('Failed to fetch dashboard data', 500);
  }
}
