import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { TeamMember } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/errors';
import { TEAM_MEMBERS } from '@/lib/team';

export async function GET(req: NextRequest) {
  try {
    await getAuthenticatedUser();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const query: any = {};
    if (status) query.status = status;

    const count = await TeamMember.countDocuments();
    if (count === 0) {
      await TeamMember.insertMany(
        TEAM_MEMBERS.map((m) => ({
          name: m.name,
          role: m.role,
          email: m.email,
          status: m.status,
          joinDate: m.joinDate,
        }))
      );
    }

    const members = await TeamMember.find(query).sort({ name: 1 }).lean();
    return successResponse({ members });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return errorResponse('Failed to fetch team members', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!['TeamLead', 'Admin', 'Manager'].includes(currentUser.role)) {
      return errorResponse('Permission denied', 403);
    }

    const body = await req.json();
    const { name, role, email, status, joinDate } = body;

    if (!name || !role || !email) {
      return errorResponse('Name, role and email are required', 400);
    }

    await connectDB();

    const existing = await TeamMember.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return errorResponse('Team member with this email already exists', 409);
    }

    const member = await TeamMember.create({
      name,
      role,
      email,
      status: status || 'Active',
      joinDate: joinDate || '—',
    });

    return successResponse(member, 201);
  } catch (error) {
    console.error('Error creating team member:', error);
    return errorResponse('Failed to create team member', 500);
  }
}
