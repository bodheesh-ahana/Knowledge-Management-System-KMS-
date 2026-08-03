import '../setup/mongodb';

jest.mock('@/lib/mongodb', () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}));

import { GET, POST } from '../../app/api/learning/lessons/route';
import LearningLesson from '../../models/LearningLesson';
import LearningModule from '../../models/LearningModule';
import LearningApplication from '../../models/LearningApplication';
import '../../models/KnowledgeArticle';
import { NextRequest } from 'next/server';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn().mockResolvedValue({ user: { id: '123' } }),
}));

jest.mock('next/server', () => ({
  NextRequest: class {
    nextUrl: { searchParams: URLSearchParams };
    _body: any;
    _url: string;
    constructor(input: Request | string, init?: any) {
      this._url = input.toString();
      this.nextUrl = { searchParams: new URL(this._url).searchParams };
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

describe('Learning Lessons API', () => {
  let application: any;
  let module: any;

  beforeEach(async () => {
    application = await LearningApplication.create({
      name: 'Test Application',
      description: 'Test Description',
      icon: 'school',
      color: '#000000',
      order: 1,
      isActive: true,
    });

    module = await LearningModule.create({
      applicationId: application._id,
      name: 'Test Module',
      description: 'Test Module Description',
      order: 1,
      isActive: true,
    });
  });

  describe('GET /api/learning/lessons', () => {
    it('should return lessons for a module', async () => {
      await LearningLesson.create([
        {
          moduleId: module._id,
          title: 'Lesson 1',
          objective: 'Objective 1',
          businessPurpose: 'Business Purpose 1',
          content: 'Content 1',
          order: 1,
          isActive: true,
        },
        {
          moduleId: module._id,
          title: 'Lesson 2',
          objective: 'Objective 2',
          businessPurpose: 'Business Purpose 2',
          content: 'Content 2',
          order: 2,
          isActive: true,
        },
      ]);

      const request = new NextRequest(`http://localhost/api/learning/lessons?moduleId=${module._id}`) as any;
      const response: any = await GET(request);

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveLength(2);
      expect(response.data.data[0].title).toBe('Lesson 1');
    });

    it('should return lesson by ID', async () => {
      const lesson = await LearningLesson.create({
        moduleId: module._id,
        title: 'Test Lesson',
        objective: 'Test Objective',
        businessPurpose: 'Test Business Purpose',
        content: 'Test Content',
        order: 1,
        isActive: true,
      });

      const request = new NextRequest(`http://localhost/api/learning/lessons?lessonId=${lesson._id}`) as any;
      const response: any = await GET(request);

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveLength(1);
      expect(response.data.data[0].title).toBe('Test Lesson');
    });

    it('should return only active lessons', async () => {
      await LearningLesson.create([
        {
          moduleId: module._id,
          title: 'Active Lesson',
          objective: 'Objective',
          businessPurpose: 'BP Active',
          content: 'Content',
          order: 1,
          isActive: true,
        },
        {
          moduleId: module._id,
          title: 'Inactive Lesson',
          objective: 'Objective',
          businessPurpose: 'BP Inactive',
          content: 'Content',
          order: 2,
          isActive: false,
        },
      ]);

      const request = new NextRequest(`http://localhost/api/learning/lessons?moduleId=${module._id}`) as any;
      const response: any = await GET(request);

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveLength(1);
      expect(response.data.data[0].title).toBe('Active Lesson');
    });

    it('should sort lessons by order', async () => {
      await LearningLesson.create([
        {
          moduleId: module._id,
          title: 'Lesson 2',
          objective: 'Objective',
          businessPurpose: 'BP 2',
          content: 'Content',
          order: 2,
          isActive: true,
        },
        {
          moduleId: module._id,
          title: 'Lesson 1',
          objective: 'Objective',
          businessPurpose: 'BP 1',
          content: 'Content',
          order: 1,
          isActive: true,
        },
      ]);

      const request = new NextRequest(`http://localhost/api/learning/lessons?moduleId=${module._id}`) as any;
      const response: any = await GET(request);

      expect(response.data.data[0].title).toBe('Lesson 1');
      expect(response.data.data[1].title).toBe('Lesson 2');
    });
  });

  describe('POST /api/learning/lessons', () => {
    it('should create a new lesson', async () => {
      const lessonData = {
        moduleId: module._id.toString(),
        title: 'New Lesson',
        objective: 'New Objective',
        businessPurpose: 'New BP',
        content: 'New Content',
        estimatedDuration: 45,
        order: 1,
      };

      const request = new NextRequest('http://localhost/api/learning/lessons', {
        method: 'POST',
        body: JSON.stringify(lessonData),
      } as any) as any;

      const response: any = await POST(request);

      expect(response.status).toBe(201);
      expect(response.data.data.title).toBe('New Lesson');
      expect(response.data.data.estimatedDuration).toBe(45);
    });

    it('should return error when required fields are missing', async () => {
      const request = new NextRequest('http://localhost/api/learning/lessons', {
        method: 'POST',
        body: JSON.stringify({ moduleId: module._id.toString() }),
      } as any) as any;

      const response: any = await POST(request);

      expect(response.status).toBe(400);
      expect(response.data.error).toContain('required');
    });

    it('should set default values', async () => {
      const lessonData = {
        moduleId: module._id.toString(),
        title: 'New Lesson',
        objective: 'New Objective',
        businessPurpose: 'New BP',
        content: 'New Content',
      };

      const request = new NextRequest('http://localhost/api/learning/lessons', {
        method: 'POST',
        body: JSON.stringify(lessonData),
      } as any) as any;

      const response: any = await POST(request);

      expect(response.status).toBe(201);
      expect(response.data.data.order).toBe(0);
      expect(response.data.data.estimatedDuration).toBe(30);
      expect(response.data.data.concepts).toEqual([]);
    });

    it('should reject unauthorized requests', async () => {
      const getServerSessionMock = require('next-auth').getServerSession;
      getServerSessionMock.mockResolvedValueOnce(null);

      const request = new NextRequest('http://localhost/api/learning/lessons', {
        method: 'POST',
        body: JSON.stringify({
          moduleId: module._id.toString(),
          title: 'New Lesson',
          objective: 'New Objective',
          businessPurpose: 'New BP',
          content: 'New Content',
        }),
      } as any) as any;

      const response: any = await POST(request);

      expect(response.status).toBe(401);
      expect(response.data.error).toBe('Unauthorized');
    });
  });
});
