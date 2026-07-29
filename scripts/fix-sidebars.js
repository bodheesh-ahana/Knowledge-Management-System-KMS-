const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, '..', 'src', 'app');

const iconRouteMap = {
  dashboard: '/dashboard',
  auto_stories: '/knowledge',
  confirmation_number: '/tickets',
  apps: '/applications',
  track_changes: '/tracker',
  analytics: '/analytics',
  description: '/documents',
  widgets: '/applications',
  star: '/knowledge?filter=favorites',
  drafts: '/knowledge?filter=drafts',
  notifications: '/notifications',
  group: '/users',
  settings: '/settings',
};

const labelRouteMap = {
  dashboard: '/dashboard',
  'knowledge base': '/knowledge',
  knowledge: '/knowledge',
  tickets: '/tickets',
  applications: '/applications',
  'internal tracker': '/tracker',
  tracker: '/tracker',
  analytics: '/analytics',
  documents: '/documents',
  notifications: '/notifications',
  users: '/users',
  settings: '/settings',
  'favourite articles': '/knowledge?filter=favorites',
  favourites: '/knowledge?filter=favorites',
  favorites: '/knowledge?filter=favorites',
  drafts: '/knowledge?filter=drafts',
};

function findRouteForLink(matchHtml) {
  // Prefer data-icon attribute on any element inside the <a>
  const dataIcon = matchHtml.match(/data-icon="([^"]+)"/);
  if (dataIcon && iconRouteMap[dataIcon[1]]) {
    return iconRouteMap[dataIcon[1]];
  }

  // Fallback: clean inner text and map by label
  const text = matchHtml
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  for (const [label, route] of Object.entries(labelRouteMap)) {
    if (text.includes(label)) return route;
  }

  return null;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Match __html: "..." inside dangerouslySetInnerHTML={{ __html: "..." }}
  const htmlLiteralMatch = content.match(
    /dangerouslySetInnerHTML=\{\{\s*__html:\s*("(?:\\.|[^"\\])*")\s*\}\}/s
  );

  if (!htmlLiteralMatch) return false;

  const originalStringLiteral = htmlLiteralMatch[1];
  let html;
  try {
    html = JSON.parse(originalStringLiteral);
  } catch (err) {
    console.error('Failed to parse HTML string in', filePath, err.message);
    return false;
  }

  let changed = false;
  html = html.replace(
    /<a\b([^>]*)href="\#"([^>]*)>([\s\S]*?)<\/a>/gi,
    (match, before, after, inner) => {
      const route = findRouteForLink(match);
      if (!route) return match;
      changed = true;
      return match.replace('href="#"', `href="${route}"`);
    }
  );

  if (!changed) return false;

  const newStringLiteral = JSON.stringify(html);
  const newContent = content.replace(
    `__html: ${originalStringLiteral}`,
    `__html: ${newStringLiteral}`
  );

  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('Updated', filePath);
  return true;
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip auth and command-palette protected directories
      if (
        entry.name === 'auth' ||
        entry.name === 'command-palette'
      )
        continue;
      walk(fullPath);
    } else if (entry.name === 'page.tsx') {
      processFile(fullPath);
    }
  }
}

walk(APP_DIR);
