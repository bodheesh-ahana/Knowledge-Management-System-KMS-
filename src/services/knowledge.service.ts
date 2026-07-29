import { connectDB } from '@/lib/mongodb';
import { KnowledgeArticle } from '@/models';

export class KnowledgeService {
  static async searchArticles(query: string, limit = 20) {
    await connectDB();

    return KnowledgeArticle.find(
      { $text: { $search: query }, status: 'Published' },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .lean();
  }

  static async getArticleById(id: string) {
    await connectDB();

    const article = await KnowledgeArticle.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('owner', 'name email')
      .populate('contributors', 'name email');

    return article;
  }

  static async getArticlesByApplication(application: string) {
    await connectDB();

    return KnowledgeArticle.find({ application, status: 'Published' })
      .sort({ createdAt: -1 })
      .lean();
  }

  static async getPendingReview() {
    await connectDB();

    return KnowledgeArticle.find({ status: 'UnderReview' })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .lean();
  }
}
