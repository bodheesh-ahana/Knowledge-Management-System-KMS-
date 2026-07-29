import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Application, KnowledgeArticle, Ticket } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApplicationSchema } from '@/lib/validation';
import { errorResponse, successResponse } from '@/lib/errors';
import { ZodError } from 'zod';

export async function GET(_req: NextRequest) {
  try {
    await connectDB();

    const applications = await Application.find({}).sort({ name: 1 }).lean();

    // Enrich with counts (users = tickets+articles referencing the app as a proxy for activity)
    const enriched = await Promise.all(
      applications.map(async (app: any) => {
        const [articleCount, ticketCount] = await Promise.all([
          KnowledgeArticle.countDocuments({ application: app.name }),
          Ticket.countDocuments({ application: app.name }),
        ]);
        return {
          ...app,
          articleCount,
          ticketCount,
        };
      })
    );

    return successResponse({ applications: enriched });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return errorResponse('Failed to fetch applications', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await getAuthenticatedUser();
    const body = await req.json();
    const validatedData = createApplicationSchema.parse(body);

    await connectDB();

    const application = new Application(validatedData);
    await application.save();

    return successResponse(application, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse('Validation failed', 400);
    }
    console.error('Error creating application:', error);
    return errorResponse('Failed to create application', 500);
  }
}
