import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DocumentRecord } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { createDocumentSchema } from '@/lib/validation';
import { errorResponse, successResponse } from '@/lib/errors';
import { ZodError } from 'zod';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const docType = searchParams.get('type');

    const query: any = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (docType) query.docType = docType;

    const documents = await DocumentRecord.find(query)
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name email')
      .lean();

    return successResponse({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return errorResponse('Failed to fetch documents', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body = await req.json();
    const validatedData = createDocumentSchema.parse(body);

    await connectDB();

    const document = new DocumentRecord({
      ...validatedData,
      uploadedBy: user._id,
    });

    await document.save();

    return successResponse(document, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse('Validation failed', 400);
    }
    console.error('Error creating document:', error);
    return errorResponse('Failed to create document', 500);
  }
}
