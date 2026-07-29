import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Project } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { updateProjectSchema } from '@/lib/validation';
import { errorResponse, successResponse } from '@/lib/errors';
import { ZodError } from 'zod';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const project = await Project.findById(id)
      .populate('members', 'name email avatar')
      .populate('owner', 'name email');

    if (!project) {
      return errorResponse('Project not found', 404);
    }

    return successResponse(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return errorResponse('Failed to fetch project', 500);
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
    const validatedData = updateProjectSchema.parse(body);

    await connectDB();

    const project = await Project.findByIdAndUpdate(id, validatedData, {
      new: true,
    })
      .populate('members', 'name email avatar')
      .populate('owner', 'name email');

    if (!project) {
      return errorResponse('Project not found', 404);
    }

    return successResponse(project);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse('Validation failed', 400);
    }
    console.error('Error updating project:', error);
    return errorResponse('Failed to update project', 500);
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

    const project = await Project.findById(id);
    if (!project) {
      return errorResponse('Project not found', 404);
    }

    if (project.owner.toString() !== user._id.toString() && !['Admin', 'Manager'].includes(user.role)) {
      return errorResponse('Permission denied', 403);
    }

    await Project.deleteOne({ _id: id });

    return successResponse({ message: 'Project deleted' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return errorResponse('Failed to delete project', 500);
  }
}
