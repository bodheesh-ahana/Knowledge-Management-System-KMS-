import { connectDB } from '@/lib/mongodb';
import { Ticket } from '@/models';

export class TicketService {
  static async getTickets(filters?: any, page = 1, limit = 20) {
    await connectDB();

    const skip = (page - 1) * limit;
    const query = filters || {};

    const [tickets, total] = await Promise.all([
      Ticket.find(query).skip(skip).limit(limit).populate('assignee', 'name email').lean(),
      Ticket.countDocuments(query),
    ]);

    return {
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getTicketById(id: string) {
    await connectDB();

    return Ticket.findById(id)
      .populate('assignee', 'name email')
      .populate('reporter', 'name email')
      .populate('linkedKnowledgeArticles', 'title');
  }

  static async updateTicketStatus(id: string, status: string) {
    await connectDB();

    const updates: any = { status };
    if (status === 'Resolved') {
      updates.resolvedAt = new Date();
    }

    return Ticket.findByIdAndUpdate(id, updates, { new: true });
  }

  static async linkKnowledgeArticle(ticketId: string, articleId: string) {
    await connectDB();

    return Ticket.findByIdAndUpdate(
      ticketId,
      { $addToSet: { linkedKnowledgeArticles: articleId } },
      { new: true }
    );
  }
}
