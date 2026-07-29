import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { createUserSchema } from '@/lib/validation';
import { errorResponse, successResponse } from '@/lib/errors';
import { ZodError } from 'zod';

export async function GET(req: NextRequest) {
  try {
    await getAuthenticatedUser();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;
    if (status) query.active = status === 'active';

    const users = await User.find(query).sort({ createdAt: -1 }).lean();

    return successResponse({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return errorResponse('Failed to fetch users', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!['Admin', 'Manager'].includes(currentUser.role)) {
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
