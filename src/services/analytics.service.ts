import { connectDB } from '@/lib/mongodb';
import { KnowledgeArticle, Ticket, Activity } from '@/models';

export class AnalyticsService {
  static async getDashboardStats(userId: string) {
    await connectDB();

    const [articlesCreated, ticketsResolved, articleViews] = await Promise.all([
      KnowledgeArticle.countDocuments({ owner: userId, status: 'Published' }),
      Ticket.countDocuments({ assignee: userId, status: 'Resolved' }),
      KnowledgeArticle.aggregate([
        { $match: { owner: userId } },
        { $group: { _id: null, totalViews: { $sum: '$views' } } },
      ]),
    ]);

    return {
      articlesCreated,
      ticketsResolved,
      articleViews: articleViews[0]?.totalViews || 0,
    };
  }

  static async getUserActivity(userId: string, limit = 10) {
    await connectDB();

    return Activity.find({ user: userId }).sort({ createdAt: -1 }).limit(limit).lean();
  }

  static async getTeamStats(_teamLeadId: string) {
    await connectDB();

    // Get team members (assigned to team lead)
    const articles = await KnowledgeArticle.aggregate([
      { $match: { status: 'Published' } },
      { $group: { _id: '$owner', count: { $sum: 1 } } },
    ]);

    const tickets = await Ticket.aggregate([
      { $match: { status: 'Resolved' } },
      {
        $group: {
          _id: '$assignee',
          count: { $sum: 1 },
          avgTimeLogged: { $avg: '$workTimeLogged' },
        },
      },
    ]);

    return { articles, tickets };
  }
}
