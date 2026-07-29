import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { KnowledgeArticle } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/errors';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const article = await KnowledgeArticle.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('owner', 'name email')
      .populate('contributors', 'name email');

    if (!article) {
      return errorResponse('Article not found', 404);
    }

    return successResponse(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    return errorResponse('Failed to fetch article', 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    const body = await req.json();

    await connectDB();

    const article = await KnowledgeArticle.findById(id);
    if (!article) {
      return errorResponse('Article not found', 404);
    }

    if (article.owner.toString() !== user._id.toString()) {
      return errorResponse('Permission denied', 403);
    }

    Object.assign(article, body);
    await article.save();

    return successResponse(article);
  } catch (error) {
    console.error('Error updating article:', error);
    return errorResponse('Failed to update article', 500);
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

    const article = await KnowledgeArticle.findById(id);
    if (!article) {
      return errorResponse('Article not found', 404);
    }

    if (article.owner.toString() !== user._id.toString()) {
      return errorResponse('Permission denied', 403);
    }

    await KnowledgeArticle.deleteOne({ _id: id });

    return successResponse({ message: 'Article deleted' });
  } catch (error) {
    console.error('Error deleting article:', error);
    return errorResponse('Failed to delete article', 500);
  }
}
