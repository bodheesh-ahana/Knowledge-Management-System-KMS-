import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { KnowledgeArticle, Activity, TrackerEntry } from '@/models';
import { createArticleSchema } from '@/lib/validation';
import { getAuthenticatedUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/errors';
import { ZodError } from 'zod';
import { notifyAll } from '@/lib/notifications';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const search = searchParams.get('search')?.trim();
    const application = searchParams.get('application')?.trim();
    const status = searchParams.get('status')?.trim();
    const tag = searchParams.get('tag')?.trim();

    const filter: Record<string, any> = {};

    if (status) {
      filter.status = status;
    }

    if (application) {
      filter.application = application;
    }

    if (tag) {
      filter.tags = tag;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { title: regex },
        { description: regex },
        { symptoms: regex },
        { rootCause: regex },
        { resolution: regex },
        { application: regex },
        { tags: regex },
        { ticketId: regex },
      ];
    }

    const [articles, total] = await Promise.all([
      KnowledgeArticle.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('owner', 'name email')
        .lean(),
      KnowledgeArticle.countDocuments(filter),
    ]);

    // Also surface matching Tracker entries so past ticket work is
    // discoverable from Knowledge Base search even before a formal
    // article has been written for it.
    let relatedTracker: any[] = [];
    if (search) {
      const regex = new RegExp(search, 'i');
      relatedTracker = await TrackerEntry.find({
        $or: [
          { ticketId: regex },
          { workDescription: regex },
          { application: regex },
          { teamMembers: regex },
        ],
      })
        .sort({ date: -1 })
        .limit(10)
        .lean();
    }

    return successResponse({
      articles,
      relatedTracker,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return errorResponse('Failed to fetch articles', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    const body = await req.json();
    const validatedData = createArticleSchema.parse(body);

    await connectDB();

    const article = new KnowledgeArticle({
      ...validatedData,
      owner: user._id,
      contributors: [user._id],
      status: validatedData.status || 'Draft',
    });

    await article.save();

    await Activity.create({
      user: user._id,
      type: 'ArticleCreated',
      resourceType: 'article',
      resourceId: article._id,
      details: { title: article.title },
    });

    await notifyAll({
      type: article.status === 'Published' ? 'ArticleCreated' : 'ArticleReviewNeeded',
      title: article.status === 'Published' ? 'New article published' : 'Article review needed',
      message: `${article.title}${article.application ? ` · ${article.application}` : ''}`,
      resourceId: article._id,
    });

    return successResponse(article, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse('Validation failed', 400);
    }
    console.error('Error creating article:', error);
    return errorResponse('Failed to create article', 500);
  }
}
