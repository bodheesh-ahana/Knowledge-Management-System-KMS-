import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { createUserSchema, updateUserSchema } from '@/lib/validation';
import { errorResponse, successResponse } from '@/lib/errors';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!['TeamLead', 'Admin', 'Manager'].includes(currentUser.role)) {
      return errorResponse('Permission denied', 403);
    }

    const body = await req.json();
    const validatedData = createUserSchema.parse(body);

    await connectDB();

    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return errorResponse('User with this email already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const user = new User({
      ...validatedData,
      password: hashedPassword,
    });
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    return successResponse(userObj, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse('Validation failed', 400);
    }
    console.error('Error creating user:', error);
    return errorResponse('Failed to create user', 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!['TeamLead', 'Admin', 'Manager'].includes(currentUser.role)) {
      return errorResponse('Permission denied', 403);
    }

    const body = await req.json();
    const { id, ...rest } = body;
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

    const userObj = user.toObject();
    delete userObj.password;

    return successResponse(userObj);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse('Validation failed', 400);
    }
    console.error('Error updating user:', error);
    return errorResponse('Failed to update user', 500);
  }
}
