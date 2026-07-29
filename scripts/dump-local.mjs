import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { EJSON } from 'bson';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.argv[2] || 'mongodb://localhost:27017/kms-dev';
const DB_NAME = new URL(MONGO_URI.replace('mongodb://', 'http://')).pathname.replace('/', '') || 'kms-dev';
const OUT_DIR = path.resolve(__dirname, '..', 'dump', DB_NAME);

await fs.mkdir(OUT_DIR, { recursive: true });

await mongoose.connect(MONGO_URI);
const db = mongoose.connection.db;

const collections = await db.listCollections().toArray();

for (const col of collections) {
  const name = col.name;
  const docs = await db.collection(name).find({}).toArray();
  const file = path.join(OUT_DIR, `${name}.json`);
  await fs.writeFile(file, EJSON.stringify(docs, { relaxed: false }, 2));
  console.log(`✅ ${name}: ${docs.length} documents`);
}

await mongoose.disconnect();
console.log(`\nDump complete: ${OUT_DIR}`);
