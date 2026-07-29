import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { TrackerEntry, Activity, KnowledgeArticle, Ticket } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { createTrackerEntrySchema } from '@/lib/validation';
import { errorResponse, successResponse } from '@/lib/errors';
import { ZodError } from 'zod';
import { notifyAll } from '@/lib/notifications';

export async function GET(req: NextRequest) {
  try {
    console.log('[tracker:GET] authenticating user...');
    await getAuthenticatedUser();
    console.log('[tracker:GET] authenticated, connecting to DB...');
    await connectDB();
    console.log('[tracker:GET] DB connected, querying entries...');

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const ticketId = searchParams.get('ticketId');
    const teamMember = searchParams.get('teamMember');
    const application = searchParams.get('application');
    const search = searchParams.get('search');
    const mine = searchParams.get('mine');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const query: any = {};

    if (mine === 'true') {
      const user = await getAuthenticatedUser();
      query.user = user._id;
    }

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    } else if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (ticketId) {
      query.ticketId = { $regex: ticketId, $options: 'i' };
    }

    if (teamMember) {
      query.teamMembers = { $regex: teamMember, $options: 'i' };
    }

    if (application) {
      query.application = { $regex: application, $options: 'i' };
    }

    if (search) {
      const regex = { $regex: search, $options: 'i' };
      query.$or = [
        { ticketId: regex },
        { title: regex },
        { workDescription: regex },
        { application: regex },
        { teamMembers: regex },
      ];
    }

    const [entries, total] = await Promise.all([
      TrackerEntry.find(query)
        .sort({ date: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('user', 'name')
        .populate('linkedArticle', 'title status')
        .lean(),
      TrackerEntry.countDocuments(query),
    ]);

    // Auto-match Knowledge Base articles by ticketId for entries that don't
    // already have an explicitly linked article (e.g. the article was
    // created afterward via "Create KB Article" rather than picked from the
    // suggestion dropdown while logging the entry).
    const unmatchedTicketIds = [
      ...new Set(
        entries
          .filter((e: any) => !e.linkedArticle && e.ticketId)
          .map((e: any) => e.ticketId)
      ),
    ];

    if (unmatchedTicketIds.length > 0) {
      const matchedArticles = await KnowledgeArticle.find({
        ticketId: { $in: unmatchedTicketIds },
      })
        .select('title status ticketId')
        .lean();

      const articleByTicketId = new Map(
        matchedArticles.map((a: any) => [a.ticketId, a])
      );

      for (const entry of entries as any[]) {
        if (!entry.linkedArticle && entry.ticketId && articleByTicketId.has(entry.ticketId)) {
          entry.linkedArticle = articleByTicketId.get(entry.ticketId);
        }
      }
    }

    // Match tracker ticket IDs to the internal Ticket collection to show
    // which are still open or already closed/resolved.
    const uniqueTicketNumbers = [
      ...new Set(
        (entries as any[])
          .map((e: any) => e.ticketId?.split('#')[0]?.trim())
          .filter(Boolean)
      ),
    ];
    const matchedTickets = await Ticket.find({
      ticketNumber: { $in: uniqueTicketNumbers },
    })
      .select('_id ticketNumber status')
      .lean();

    const ticketStatusMap: Record<string, { _id: string; status: string }> = {};
    for (const t of matchedTickets as any[]) {
      ticketStatusMap[t.ticketNumber] = { _id: t._id.toString(), status: t.status };
    }

    console.log(`[tracker:GET] found ${entries.length} entries (total: ${total})`);
    return successResponse({ entries, total, page, limit, ticketStatusMap });
  } catch (error: any) {
    console.error('[tracker:GET] Error fetching tracker entries:', error?.name, error?.message);
    console.error(error);
    return errorResponse('Failed to fetch tracker entries', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body = await req.json();
    const validatedData = createTrackerEntrySchema.parse(body);

    await connectDB();

    const entry = new TrackerEntry({
      ...validatedData,
      user: user._id,
    });

    await entry.save();

    await Activity.create({
      user: user._id,
      type: 'HoursLogged',
      resourceType: 'tracker',
      resourceId: entry._id,
      details: { hoursWorked: entry.hoursWorked, date: entry.date },
    });

    await notifyAll({
      type: 'TrackerEntryCreated',
      title: 'Tracker entry logged',
      message: `${entry.ticketId}${entry.title ? ` — ${entry.title}` : ''}${entry.application ? ` · ${entry.application}` : ''}`,
      resourceId: entry._id,
    });

    return successResponse(entry, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse('Validation failed', 400);
    }
    console.error('Error creating tracker entry:', error);
    return errorResponse('Failed to create tracker entry', 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body = await req.json();
    const { ticketId, ticketStatus } = body;

    if (!ticketId || !ticketStatus) {
      return errorResponse('ticketId and ticketStatus are required', 400);
    }

    await connectDB();
    const result = await TrackerEntry.updateMany(
      { ticketId },
      { $set: { ticketStatus } },
    );

    if (result.matchedCount === 0) {
      return errorResponse('No tracker entries found for this ticket', 404);
    }

    return successResponse({ ticketId, ticketStatus });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    return errorResponse('Failed to update ticket status', 500);
  }
}
