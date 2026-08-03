import { NextRequest, NextResponse } from 'next/server';
import { VIPUser } from '@/models';
import { connectDB } from '@/lib/mongodb';

// GET /api/vip-users - Get all VIP users with optional search
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');

    let query: any = { isActive: true };

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    const vipUsers = await VIPUser.find(query).sort({ name: 1 });

    return NextResponse.json({
      success: true,
      data: vipUsers,
    });
  } catch (error) {
    console.error('Error fetching VIP users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch VIP users' },
      { status: 500 }
    );
  }
}

// POST /api/vip-users - Create a new VIP user
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, company, priority, notes } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const vipUser = await VIPUser.create({
      name,
      company: company || 'Numera VIP Client',
      priority: priority || 'P1',
      notes,
    });

    return NextResponse.json({
      success: true,
      data: vipUser,
    });
  } catch (error) {
    console.error('Error creating VIP user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create VIP user' },
      { status: 500 }
    );
  }
}
