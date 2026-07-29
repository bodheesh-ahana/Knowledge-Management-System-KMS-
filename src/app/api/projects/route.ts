import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Project } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { createProjectSchema } from '@/lib/validation';
import { errorResponse, successResponse } from '@/lib/errors';
import { ZodError } from 'zod';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const query: any = {};
    if (status) query.status = status;

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .populate('members', 'name email avatar')
      .populate('owner', 'name email')
      .lean();

    return successResponse({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return errorResponse('Failed to fetch projects', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body = await req.json();
    const validatedData = createProjectSchema.parse(body);

    await connectDB();

    const project = new Project({
      ...validatedData,
      owner: user._id,
      members: validatedData.members || [user._id.toString()],
    });

    await project.save();

    return successResponse(project, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse('Validation failed', 400);
    }
    console.error('Error creating project:', error);
    return errorResponse('Failed to create project', 500);
  }
}
