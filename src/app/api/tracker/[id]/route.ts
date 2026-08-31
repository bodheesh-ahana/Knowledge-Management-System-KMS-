import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { TrackerEntry } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/errors';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const entry = await TrackerEntry.findById(id).lean();

    if (!entry) {
      return errorResponse('Entry not found', 404);
    }

    return successResponse(entry);
  } catch (error) {
    console.error('Error fetching tracker entry:', error);
    return errorResponse('Failed to fetch tracker entry', 500);
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

    const entry = await TrackerEntry.findById(id);
    if (!entry) {
      return errorResponse('Entry not found', 404);
    }

    const isOwner = entry.user.toString() === user._id.toString();
    const isAdmin = user.role === 'Admin' || user.role === 'TeamLead';
    if (!isOwner && !isAdmin) {
      return errorResponse('Permission denied', 403);
    }

    // A Task No. only ever exists as a sub-task of a parent ticket, so reject
    // an update that would leave a task without its ticket and clear the task
    // number whenever the entry is no longer flagged as a task.
    const nextTicketId = (body.ticketId ?? entry.ticketId ?? '').trim();
    const nextIsTask = body.isTask ?? entry.isTask;
    const nextTaskId = (body.taskId ?? entry.taskId ?? '').trim();

    if (nextTaskId && !nextTicketId) {
      return errorResponse('Ticket ID is required when a Task ID is provided', 400);
    }
    if (nextIsTask && !nextTaskId) {
      return errorResponse('Task ID is required when the entry is marked as a task', 400);
    }

    Object.assign(entry, body, {
      isTask: nextIsTask,
      taskId: nextIsTask ? nextTaskId : undefined,
    });
    await entry.save();

    return successResponse(entry);
  } catch (error) {
    console.error('Error updating tracker entry:', error);
    return errorResponse('Failed to update tracker entry', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();

    await connectDB();

    const entry = await TrackerEntry.findById(id);
    if (!entry) {
      return errorResponse('Entry not found', 404);
    }

    if (user.role !== 'Admin' && user.role !== 'TeamLead') {
      return errorResponse('Permission denied', 403);
    }

    await TrackerEntry.deleteOne({ _id: id });

    return successResponse({ message: 'Entry deleted' });
  } catch (error) {
    console.error('Error deleting tracker entry:', error);
    return errorResponse('Failed to delete tracker entry', 500);
  }
}
