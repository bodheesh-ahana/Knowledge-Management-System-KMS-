import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { TeamMember, User } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { createUserSchema, updateUserSchema } from '@/lib/validation';
import { errorResponse, successResponse } from '@/lib/errors';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!can.manageTeamAccess(currentUser.role)) {
      return errorResponse('Permission denied', 403);
    }

    const body = await req.json();
    const { teamRole, ...userInput } = body;
    const validatedData = createUserSchema.parse(userInput);
    const email = validatedData.email.toLowerCase().trim();

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse('User with this email already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const user = new User({
      ...validatedData,
      email,
      password: hashedPassword,
    });
    await user.save();

    // A login on its own is invisible everywhere in the app: the team roster
    // drives the Team Access table and the tracker's member picker. So put the
    // new person on the roster too, or link them to an existing entry.
    const member = await TeamMember.findOne({ email });
    if (member) {
      member.userId = user._id;
      if (teamRole) member.role = teamRole;
      await member.save();
    } else {
      await TeamMember.create({
        name: validatedData.name,
        email,
        role: teamRole || 'Software Engineer',
        status: 'Active',
        userId: user._id,
      });
    }

    const userObj = user.toObject();
    delete userObj.password;

    return successResponse(userObj, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(error.issues[0]?.message || 'Validation failed', 400);
    }
    console.error('Error creating user:', error);
    return errorResponse('Failed to create user', 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!can.manageTeamAccess(currentUser.role)) {
      return errorResponse('Permission denied', 403);
    }

    const body = await req.json();
    const { id, teamRole, ...rest } = body;
    if (!id) {
      return errorResponse('User id is required', 400);
    }

    const validatedData = updateUserSchema.parse(rest);

    await connectDB();

    const update: any = { ...validatedData };
    if (update.password) {
      update.password = await bcrypt.hash(update.password, 10);
    }

    const user = await User.findByIdAndUpdate(id, update, { new: true });
    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Keep the roster entry in step with the login it belongs to, and create it
    // when missing so a login that predates the roster can be repaired here.
    const set: any = { name: user.name, userId: user._id };
    const setOnInsert: any = { email: user.email.toLowerCase() };
    if (teamRole) set.role = teamRole;
    else setOnInsert.role = 'Software Engineer';
    if (typeof validatedData.active === 'boolean') {
      set.status = validatedData.active ? 'Active' : 'Inactive';
    } else {
      setOnInsert.status = 'Active';
    }

    await TeamMember.updateOne(
      { email: user.email.toLowerCase() },
      { $set: set, $setOnInsert: setOnInsert },
      { upsert: true }
    );

    const userObj = user.toObject();
    delete userObj.password;

    return successResponse(userObj);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(error.issues[0]?.message || 'Validation failed', 400);
    }
    console.error('Error updating user:', error);
    return errorResponse('Failed to update user', 500);
  }
}
