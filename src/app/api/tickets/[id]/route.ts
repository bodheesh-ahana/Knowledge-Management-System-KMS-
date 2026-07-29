import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Ticket, Activity } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/errors';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const ticket = await Ticket.findById(id)
      .populate('assignee', 'name email')
      .populate('reporter', 'name email')
      .populate('linkedKnowledgeArticles', 'title');

    if (!ticket) {
      return errorResponse('Ticket not found', 404);
    }

    return successResponse(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return errorResponse('Failed to fetch ticket', 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    const body = await req.json();

    await connectDB();

    const ticket = await Ticket.findByIdAndUpdate(id, body, { new: true });

    if (!ticket) {
      return errorResponse('Ticket not found', 404);
    }

    if (body.status === 'Resolved' || body.status === 'Closed') {
      await Activity.create({
        user: user._id,
        type: 'TicketResolved',
        resourceType: 'ticket',
        resourceId: ticket._id,
        details: { title: ticket.title, ticketNumber: ticket.ticketNumber },
      });
    }

    return successResponse(ticket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return errorResponse('Failed to update ticket', 500);
  }
}
