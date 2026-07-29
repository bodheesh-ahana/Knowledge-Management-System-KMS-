import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Application, KnowledgeArticle, Ticket } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { updateApplicationSchema } from '@/lib/validation';
import { errorResponse, successResponse } from '@/lib/errors';
import { ZodError } from 'zod';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const application = await Application.findById(id).lean();
    if (!application) {
      return errorResponse('Application not found', 404);
    }

    const appName = (application as any).name;

    const [
      articles,
      tickets,
      totalArticles,
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      publishedArticles,
      draftArticles,
    ] = await Promise.all([
      KnowledgeArticle.find({ application: appName })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title status views createdAt')
        .lean(),
      Ticket.find({ application: appName })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('assignee', 'name email')
        .lean(),
      KnowledgeArticle.countDocuments({ application: appName }),
      Ticket.countDocuments({ application: appName }),
      Ticket.countDocuments({ application: appName, status: 'Open' }),
      Ticket.countDocuments({ application: appName, status: 'In Progress' }),
      Ticket.countDocuments({ application: appName, status: 'Resolved' }),
      Ticket.countDocuments({ application: appName, status: 'Closed' }),
      KnowledgeArticle.countDocuments({ application: appName, status: 'Published' }),
      KnowledgeArticle.countDocuments({ application: appName, status: 'Draft' }),
    ]);

    return successResponse({
      ...(application as any),
      articles,
      tickets,
      stats: {
        totalArticles,
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        publishedArticles,
        draftArticles,
      },
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    return errorResponse('Failed to fetch application', 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await getAuthenticatedUser();
    const body = await req.json();
    const validatedData = updateApplicationSchema.parse(body);

    await connectDB();

    const application = await Application.findByIdAndUpdate(id, validatedData, {
      new: true,
    });

    if (!application) {
      return errorResponse('Application not found', 404);
    }

    return successResponse(application);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse('Validation failed', 400);
    }
    console.error('Error updating application:', error);
    return errorResponse('Failed to update application', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    if (!['Admin', 'Manager'].includes(user.role)) {
      return errorResponse('Permission denied', 403);
    }

    await connectDB();

    const application = await Application.findByIdAndDelete(id);
    if (!application) {
      return errorResponse('Application not found', 404);
    }

    return successResponse({ message: 'Application deleted' });
  } catch (error) {
    console.error('Error deleting application:', error);
    return errorResponse('Failed to delete application', 500);
  }
}
