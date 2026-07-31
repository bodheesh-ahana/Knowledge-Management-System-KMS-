import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { TicketLog } from '@/models';
import { errorResponse, successResponse } from '@/lib/errors';

const SORTABLE_FIELDS = new Set([
  'createdTime',
  'resolvedTime',
  'respondedDate',
  'status',
  'requestType',
  'technician',
  'subject',
  'requester',
]);

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status') || '';
    const requestType = searchParams.get('requestType') || '';
    const category = searchParams.get('category') || '';
    const technician = searchParams.get('technician') || '';
    const month = searchParams.get('month') || '';
    const sortByParam = searchParams.get('sortBy') || 'createdTime';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '20'));
    const skip = (page - 1) * limit;

    const sortBy = SORTABLE_FIELDS.has(sortByParam) ? sortByParam : 'createdTime';
    const april2026 = new Date('2026-04-01');

    const filter: any = {};
    filter.createdTime = { $gte: april2026 };

    if (status && status !== 'All') filter.status = status;
    if (requestType && requestType !== 'All') filter.requestType = requestType;
    if (category && category !== 'All') filter.category = category;
    if (technician && technician !== 'All') filter.technician = technician;

    if (month && month !== 'All') {
      const [year, monthNum] = month.split('-').map(Number);
      if (!isNaN(year) && !isNaN(monthNum)) {
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);
        filter.createdTime = { $gte: startDate, $lte: endDate };
      }
    }

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { subject: regex },
        { requester: regex },
        { technician: regex },
        { requestId: regex },
      ];
    }

    // Category breakdown ignores the category filter itself so all facet
    // counts remain visible regardless of which category is selected.
    const { category: _omitCategory, ...summaryFilter } = filter;

    const [
      tickets,
      total,
      statuses,
      requestTypes,
      categories,
      technicians,
      categoryCounts,
      grandTotal,
      months,
    ] = await Promise.all([
      TicketLog.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      TicketLog.countDocuments(filter),
      TicketLog.distinct('status'),
      TicketLog.distinct('requestType'),
      TicketLog.distinct('category'),
      TicketLog.distinct('technician'),
      TicketLog.aggregate([
        { $match: summaryFilter },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      TicketLog.countDocuments({ createdTime: { $gte: april2026 } }),
      TicketLog.aggregate([
        { $match: { createdTime: { $gte: april2026 } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdTime' },
              month: { $month: '$createdTime' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
      ]),
    ]);

    const monthlySum = months.reduce((sum: number, m: any) => sum + m.count, 0);

    return successResponse({
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
      filters: {
        statuses: statuses.filter(Boolean).sort(),
        requestTypes: requestTypes.filter(Boolean).sort(),
        categories: categories.filter(Boolean).sort(),
        technicians: technicians.filter(Boolean).sort(),
        months: months.map((m: any) => ({
          value: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
          label: new Date(m._id.year, m._id.month - 1, 1).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          }),
          count: m.count,
        })),
      },
      summary: {
        grandTotal,
        monthlySum,
        byCategory: categoryCounts.map((c: any) => ({
          category: c._id || 'Other',
          count: c.count,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching ticket log:', error);
    return errorResponse('Failed to fetch ticket log', 500);
  }
}
