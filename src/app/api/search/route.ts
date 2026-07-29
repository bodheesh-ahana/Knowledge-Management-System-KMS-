import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { KnowledgeArticle, Ticket, Application, User } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { SearchHistory } from '@/models';
import { errorResponse, successResponse } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();
    const type = searchParams.get('type') || 'all';

    if (!q) {
      return successResponse({ results: [], total: 0 });
    }

    const regex = { $regex: q, $options: 'i' };
    const results: any[] = [];

    if (type === 'all' || type === 'articles') {
      const articles = await KnowledgeArticle.find({
        $or: [{ title: regex }, { symptoms: regex }, { tags: regex }],
      })
        .limit(10)
        .populate('owner', 'name')
        .lean();
      results.push(
        ...articles.map((a: any) => ({
          id: a._id,
          type: 'article',
          title: a.title,
          description: a.description || a.symptoms,
          url: `/knowledge/${a._id}`,
          meta: a.owner?.name,
        }))
      );
    }

    if (type === 'all' || type === 'tickets') {
      const tickets = await Ticket.find({
        $or: [{ title: regex }, { ticketNumber: regex }, { description: regex }],
      })
        .limit(10)
        .lean();
      results.push(
        ...tickets.map((t: any) => ({
          id: t._id,
          type: 'ticket',
          title: `${t.ticketNumber}: ${t.title}`,
          description: t.description,
          url: `/tickets/${t._id}`,
          meta: t.status,
        }))
      );
    }

    if (type === 'all' || type === 'applications') {
      const applications = await Application.find({
        $or: [{ name: regex }, { description: regex }],
      })
        .limit(10)
        .lean();
      results.push(
        ...applications.map((a: any) => ({
          id: a._id,
          type: 'application',
          title: a.name,
          description: a.description,
          url: `/applications/${a._id}`,
          meta: 'Application',
        }))
      );
    }

    if (type === 'all' || type === 'users') {
      const users = await User.find({
        $or: [{ name: regex }, { email: regex }],
      })
        .limit(10)
        .lean();
      results.push(
        ...users.map((u: any) => ({
          id: u._id,
          type: 'user',
          title: u.name,
          description: u.email,
          url: `/users`,
          meta: u.role,
        }))
      );
    }

    // Best-effort search history logging (non-blocking, ignore auth errors)
    try {
      const user = await getAuthenticatedUser();
      await SearchHistory.create({ user: user._id, query: q, resultCount: results.length });
    } catch {
      // Not authenticated or logging failed - ignore
    }

    return successResponse({ results, total: results.length });
  } catch (error) {
    console.error('Error performing search:', error);
    return errorResponse('Search failed', 500);
  }
}
