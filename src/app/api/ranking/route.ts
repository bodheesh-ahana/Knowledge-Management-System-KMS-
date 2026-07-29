import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { TrackerEntry } from '@/models';
import { getAuthenticatedUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/errors';

const TEAM_LEAD = 'Bodheesh V C';

interface MemberStats {
  name: string;
  hours: number;
  entries: number;
  ticketsHandled: number;
  ownerTickets: number;
  resolvedTickets: number;
  articlesCreated: number;
}

// In application support, resolving quickly is better: resolved tickets and
// KB articles earn big points, while more hours reduce the score slightly.
function calculateScore(s: MemberStats) {
  return Math.round(
    s.resolvedTickets * 12 +
      s.articlesCreated * 20 +
      s.ownerTickets * 5 +
      s.ticketsHandled * 2 +
      s.entries * 1.5 -
      s.hours * 0.5
  );
}

function buildRanking(entries: any[]) {
  const map = new Map<string, MemberStats>();

  for (const e of entries) {
    const members = Array.isArray(e.teamMembers) ? e.teamMembers : [];
    const share = members.length ? e.hoursWorked / members.length : e.hoursWorked;

    for (const member of members) {
      if (!member || member === TEAM_LEAD) continue;
      const existing = map.get(member) || {
        name: member,
        hours: 0,
        entries: 0,
        ticketsHandled: 0,
        ownerTickets: 0,
        resolvedTickets: 0,
        articlesCreated: 0,
      };
      existing.hours += share;
      existing.entries += 1;
      existing.ticketsHandled += 1;
      if (e.role === 'Owner') existing.ownerTickets += 1;
      existing.resolvedTickets += e.ticketsResolved || 0;
      existing.articlesCreated += e.articlesCreated || 0;
      map.set(member, existing);
    }
  }

  return Array.from(map.values())
    .map((s) => ({
      ...s,
      hours: Math.round(s.hours * 100) / 100,
      score: calculateScore(s),
    }))
    .sort((a, b) => b.score - a.score);
}

export async function GET(_req: NextRequest) {
  try {
    await getAuthenticatedUser();
    await connectDB();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [allTimeEntries, monthEntries] = await Promise.all([
      TrackerEntry.find().sort({ date: -1 }).limit(1000).lean(),
      TrackerEntry.find({ date: { $gte: startOfMonth } })
        .sort({ date: -1 })
        .limit(1000)
        .lean(),
    ]);

    const allTime = buildRanking(allTimeEntries as any[]);
    const monthly = buildRanking(monthEntries as any[]).map((s, idx) => ({
      rank: idx + 1,
      ...s,
    }));

    return successResponse({
      allTime: allTime.map((s, idx) => ({ rank: idx + 1, ...s })),
      monthly,
      lastUpdated: now.toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching ranking:', error);
    return errorResponse('Failed to fetch ranking', 500);
  }
}
