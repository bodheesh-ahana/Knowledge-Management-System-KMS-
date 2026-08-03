import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer | null = null;

beforeAll(async () => {
  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create();
  }

  if (mongoose.connection.readyState === 0) {
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  } else if (mongoose.connection.readyState === 1) {
    const mongoUri = mongoServer.getUri();
    if (mongoose.connection.host !== new URL(mongoUri).host) {
      await mongoose.disconnect();
      await mongoose.connect(mongoUri);
    }
  }
}, 10000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
}, 10000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
