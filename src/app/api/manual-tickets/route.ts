import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ManualTicket } from '@/models';
import { errorResponse, successResponse } from '@/lib/errors';

const SORTABLE_FIELDS = new Set([
  'ticketId',
  'month',
  'resolvedByOurTeam',
  'reassignedToOtherTeams',
  'escalatedToOEM',
  'slaBreach',
  'createdDate',
  'resolvedDate',
  'averageResolutionTime',
]);

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search')?.trim() || '';
    const month = searchParams.get('month') || '';
    const sortByParam = searchParams.get('sortBy') || 'createdDate';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '20'));
    const skip = (page - 1) * limit;

    const sortBy = SORTABLE_FIELDS.has(sortByParam) ? sortByParam : 'createdDate';

    const filter: any = {};

    if (month && month !== 'All') {
      filter.month = month;
    }

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { ticketId: regex },
        { reason: regex },
      ];
    }

    const [tickets, total, months] = await Promise.all([
      ManualTicket.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      ManualTicket.countDocuments(filter),
      ManualTicket.distinct('month'),
    ]);

    return successResponse({
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
      filters: {
        months: months.filter(Boolean).sort(),
      },
    });
  } catch (error) {
    console.error('Error fetching manual tickets:', error);
    return errorResponse('Failed to fetch manual tickets', 500);
  }
}
