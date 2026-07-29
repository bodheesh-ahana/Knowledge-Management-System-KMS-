import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import {
  updateProfileSchema,
  updatePreferencesSchema,
  changePasswordSchema,
} from '@/lib/validation';
import { errorResponse, successResponse } from '@/lib/errors';
import { ZodError } from 'zod';

export async function GET(_req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    return successResponse(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return errorResponse('Failed to fetch profile', 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUser();
    const body = await req.json();

    await connectDB();

    // Password change
    if (body.currentPassword && body.newPassword) {
      const validatedData = changePasswordSchema.parse(body);
      const userWithPassword = await User.findById(currentUser._id).select('+password');

      const isCorrect = await bcrypt.compare(
        validatedData.currentPassword,
        userWithPassword.password
      );
      if (!isCorrect) {
        return errorResponse('Current password is incorrect', 400);
      }

      userWithPassword.password = await bcrypt.hash(validatedData.newPassword, 10);
      await userWithPassword.save();

      return successResponse({ message: 'Password updated successfully' });
    }

    // Preferences update
    if (body.preferences) {
      const validatedPrefs = updatePreferencesSchema.parse(body.preferences);
      const user = await User.findByIdAndUpdate(
        currentUser._id,
        { $set: { preferences: { ...currentUser.preferences, ...validatedPrefs } } },
        { new: true }
      );
      return successResponse(user);
    }

    // Profile fields update
    const validatedData = updateProfileSchema.parse(body);
    const user = await User.findByIdAndUpdate(currentUser._id, validatedData, { new: true });

    return successResponse(user);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse('Validation failed', 400);
    }
    console.error('Error updating profile:', error);
    return errorResponse('Failed to update profile', 500);
  }
}
