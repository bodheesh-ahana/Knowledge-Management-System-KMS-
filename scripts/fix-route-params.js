const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'src', 'app', 'api');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(p, files);
    } else if (entry.name === 'route.ts' && /[\[\]]/.test(p)) {
      files.push(p);
    }
  }
  return files;
}

const files = walk(ROOT);

for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  const hasOld = content.includes('params: { id: string }');
  const hasNew = content.includes('params: Promise<{ id: string }>');
  if (!hasOld && !hasNew) continue;

  if (hasOld) {
    content = content.replace(
      /params: \{ id: string \}/g,
      'params: Promise<{ id: string }>'
    );
    content = content.replace(/params\.id/g, 'id');
  }

  if (!content.includes('const { id } = await params;')) {
    content = content.replace(/try \{\r?\n/g, 'try {\n    const { id } = await params;\n');
  }

  fs.writeFileSync(f, content, 'utf8');
  console.log('Updated', f);
}
