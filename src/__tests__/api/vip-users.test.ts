import '../setup/mongodb';

jest.mock('@/lib/mongodb', () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}));

import { GET, POST } from '../../app/api/vip-users/route';
import { VIPUser } from '../../models';
import { NextRequest } from 'next/server';

// Mock next/server
jest.mock('next/server', () => ({
  NextRequest: class {
    nextUrl: { searchParams: URLSearchParams };
    _body: any;
    constructor(input: Request | string, init?: any) {
      this.nextUrl = { searchParams: new URL(input.toString()).searchParams };
      this._body = init?.body ? JSON.parse(init.body) : {};
    }
    async json() {
      return this._body;
    }
  },
  NextResponse: {
    json: (data: any, init?: any) => ({
      status: init?.status || 200,
      data,
    }),
  },
}));

describe('VIP Users API', () => {
  beforeEach(async () => {
    await VIPUser.deleteMany({});
  });

  describe('GET /api/vip-users', () => {
    it('should return all active VIP users', async () => {
      await VIPUser.create([
        { name: 'User 1', company: 'Numera VIP Client', priority: 'P1', notes: 'Test' },
        { name: 'User 2', company: 'Numera VIP Client', priority: 'P2', notes: 'Test' },
      ]);

      const request = new NextRequest('http://localhost/api/vip-users') as any;
      const response: any = await GET(request);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveLength(2);
    });

    it('should filter users by search query', async () => {
      await VIPUser.create([
        { name: 'John Smith', company: 'Numera VIP Client', priority: 'P1', notes: 'Test' },
        { name: 'Jane Doe', company: 'Numera VIP Client', priority: 'P2', notes: 'Test' },
      ]);

      const request = new NextRequest('http://localhost/api/vip-users?search=John') as any;
      const response: any = await GET(request);

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveLength(1);
      expect(response.data.data[0].name).toBe('John Smith');
    });

    it('should return only active users', async () => {
      await VIPUser.create([
        { name: 'Active User', company: 'Numera VIP Client', priority: 'P1', notes: 'Test', isActive: true },
        { name: 'Inactive User', company: 'Numera VIP Client', priority: 'P2', notes: 'Test', isActive: false },
      ]);

      const request = new NextRequest('http://localhost/api/vip-users') as any;
      const response: any = await GET(request);

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveLength(1);
      expect(response.data.data[0].name).toBe('Active User');
    });
  });

  describe('POST /api/vip-users', () => {
    it('should create a new VIP user', async () => {
      const userData = {
        name: 'New User',
        company: 'Numera VIP Client',
        priority: 'P1',
        notes: 'Test notes',
      };

      const request = new NextRequest('http://localhost/api/vip-users', {
        method: 'POST',
        body: JSON.stringify(userData),
      } as any) as any;

      const response: any = await POST(request);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.name).toBe('New User');
    });

    it('should return error when name is missing', async () => {
      const request = new NextRequest('http://localhost/api/vip-users', {
        method: 'POST',
        body: JSON.stringify({ company: 'Test' }),
      } as any) as any;

      const response: any = await POST(request);

      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
      expect(response.data.error).toBe('Name is required');
    });

    it('should set default priority to P1', async () => {
      const userData = {
        name: 'New User',
        notes: 'Test notes',
      };

      const request = new NextRequest('http://localhost/api/vip-users', {
        method: 'POST',
        body: JSON.stringify(userData),
      } as any) as any;

      const response: any = await POST(request);

      expect(response.status).toBe(200);
      expect(response.data.data.priority).toBe('P1');
      expect(response.data.data.company).toBe('Numera VIP Client');
    });
  });
});
