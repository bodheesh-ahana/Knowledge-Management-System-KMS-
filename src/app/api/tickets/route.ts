import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Ticket, Activity, Notification } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { createTicketSchema } from '@/lib/validation';
import { errorResponse, successResponse } from '@/lib/errors';
import { ZodError } from 'zod';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      Ticket.find({})
        .skip(skip)
        .limit(limit)
        .populate('assignee', 'name email')
        .lean(),
      Ticket.countDocuments({}),
    ]);

    return successResponse({
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return errorResponse('Failed to fetch tickets', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body = await req.json();
    const validatedData = createTicketSchema.parse(body);

    await connectDB();

    const ticket = new Ticket({
      ...validatedData,
      ticketNumber: `TKT-${Date.now()}`,
      reporter: user._id,
      status: 'Open',
    });

    await ticket.save();

    await Activity.create({
      user: user._id,
      type: 'TicketCreated',
      resourceType: 'ticket',
      resourceId: ticket._id,
      details: { title: ticket.title, ticketNumber: ticket.ticketNumber },
    });

    if (ticket.assignee) {
      await Notification.create({
        user: ticket.assignee,
        type: 'TicketAssigned',
        title: 'New ticket assigned',
        message: `You have been assigned ticket ${ticket.ticketNumber}: ${ticket.title}`,
        resourceId: ticket._id,
      });
    }

    return successResponse(ticket, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse('Validation failed', 400);
    }
    console.error('Error creating ticket:', error);
    return errorResponse('Failed to create ticket', 500);
  }
}
