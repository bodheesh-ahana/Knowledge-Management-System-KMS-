import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DocumentRecord } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/errors';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const document = await DocumentRecord.findById(id)
      .populate('uploadedBy', 'name email')
      .lean();

    if (!document) {
      return errorResponse('Document not found', 404);
    }

    return successResponse(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    return errorResponse('Failed to fetch document', 500);
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

    await connectDB();

    const document = await DocumentRecord.findByIdAndUpdate(id, body, { new: true });
    if (!document) {
      return errorResponse('Document not found', 404);
    }

    return successResponse(document);
  } catch (error) {
    console.error('Error updating document:', error);
    return errorResponse('Failed to update document', 500);
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

    const document = await DocumentRecord.findById(id);
    if (!document) {
      return errorResponse('Document not found', 404);
    }

    if (
      document.uploadedBy.toString() !== user._id.toString() &&
      !['Admin', 'Manager'].includes(user.role)
    ) {
      return errorResponse('Permission denied', 403);
    }

    await DocumentRecord.deleteOne({ _id: id });

    return successResponse({ message: 'Document deleted' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return errorResponse('Failed to delete document', 500);
  }
}
