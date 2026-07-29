import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { TrackerEntry, Activity } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { createTrackerEntrySchema } from '@/lib/validation';
import { errorResponse, successResponse } from '@/lib/errors';
import { ZodError } from 'zod';

export async function GET(req: NextRequest) {
  try {
    await getAuthenticatedUser();
    await connectDB();

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
        .lean(),
      TrackerEntry.countDocuments(query),
    ]);

    return successResponse({ entries, total, page, limit });
  } catch (error) {
    console.error('Error fetching tracker entries:', error);
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

    return successResponse(entry, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse('Validation failed', 400);
    }
    console.error('Error creating tracker entry:', error);
    return errorResponse('Failed to create tracker entry', 500);
  }
}
