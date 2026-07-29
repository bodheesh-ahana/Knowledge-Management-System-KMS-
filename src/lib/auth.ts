import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { User } from '@/models';
import { connectDB } from '@/lib/mongodb';
import { ApiError, ApiErrorCodes } from './errors';

export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new ApiError(
      401,
      'Authentication required',
      ApiErrorCodes.AUTHENTICATION_REQUIRED
    );
  }

  // Ensure the DB connection is established before querying. Without this,
  // Mongoose buffers the query and it times out after 10s if this is the
  // first DB call of the process (e.g. GET /api/tracker calls this before
  // its own connectDB()).
  await connectDB();

  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    throw new ApiError(
      401,
      'User not found',
      ApiErrorCodes.AUTHENTICATION_REQUIRED
    );
  }

  return user;
}

export function checkPermission(userRole: string, requiredRole: string[] | string) {
  const required = typeof requiredRole === 'string' ? [requiredRole] : requiredRole;

  if (!required.includes(userRole)) {
    throw new ApiError(
      403,
      'Permission denied',
      ApiErrorCodes.PERMISSION_DENIED
    );
  }
}
