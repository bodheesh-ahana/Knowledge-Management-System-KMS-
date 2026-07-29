const fs = require('fs');
const path = require('path');

const INPUT = path.join(__dirname, 'dashboard_input.html');
const OUTPUT = path.join(__dirname, '..', 'src', 'app', 'dashboard', 'page.tsx');

const raw = fs.readFileSync(INPUT, 'utf8');

const bodyMatch = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (!bodyMatch) {
  throw new Error('Could not find <body> tag in dashboard_input.html');
}

const bodyClassMatch = raw.match(/<body[^>]*class="([^"]*)"/i);
const bodyClass = bodyClassMatch
  ? bodyClassMatch[1]
  : 'bg-background text-on-background font-body-md min-h-screen flex selection:bg-primary-container selection:text-on-primary-container';

let bodyHtml = bodyMatch[1].trim();

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

bodyHtml = bodyHtml.replace(
  /<a([^>]*)href="\#"([^>]*)>([\s\S]*?)<\/a>/gi,
  (match, before, after, inner) => {
    const iconMatch = inner.match(/data-icon="([^"]+)"/);
    if (iconMatch && iconRouteMap[iconMatch[1]]) {
      return `<a${before}href="${iconRouteMap[iconMatch[1]]}"${after}>${inner}</a>`;
    }
    return match;
  }
);

const component = `const DASHBOARD_HTML = ${JSON.stringify(bodyHtml)};

export default function DashboardPage() {
  return (
    <div
      className="${bodyClass}"
      dangerouslySetInnerHTML={{ __html: DASHBOARD_HTML }}
    />
  );
}
`;

fs.writeFileSync(OUTPUT, component, 'utf8');
console.log('✅ Wrote', OUTPUT);
