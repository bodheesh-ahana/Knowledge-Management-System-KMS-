import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { EJSON } from 'bson';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ATLAS_URI = process.argv[2] || process.env.ATLAS_URI || process.env.MONGODB_URI;
const DROP = process.argv.includes('--drop');

if (!ATLAS_URI) {
  console.error('❌ Provide the Atlas URI as the first argument or set ATLAS_URI / MONGODB_URI.');
  process.exit(1);
}

const DUMP_DIR = path.resolve(__dirname, '..', 'dump', 'kms-dev');
const files = (await fs.readdir(DUMP_DIR)).filter((f) => f.endsWith('.json'));

await mongoose.connect(ATLAS_URI);
const db = mongoose.connection.db;

for (const file of files) {
  const name = path.basename(file, '.json');
  const raw = await fs.readFile(path.join(DUMP_DIR, file), 'utf-8');
  const docs = EJSON.parse(raw, { relaxed: false });

  if (!docs.length) {
    console.log(`⏭️  ${name}: no documents to restore`);
    continue;
  }

  if (DROP) {
    await db.collection(name).deleteMany({});
    console.log(`🗑️  ${name}: cleared existing data`);
  }

  try {
    const result = await db.collection(name).insertMany(docs, { ordered: false });
    console.log(`✅ ${name}: restored ${result.insertedCount} documents`);
  } catch (err) {
    if (err.writeErrors?.length) {
      const inserted = err.result?.nInserted || 0;
      console.log(`⚠️  ${name}: inserted ${inserted}, skipped ${err.writeErrors.length} duplicates`);
    } else {
      console.error(`❌ ${name}:`, err.message);
    }
  }
}

await mongoose.disconnect();
console.log('\nRestore complete.');
