const fs = require('fs');
const path = require('path');

const SOURCE_ROOT = 'C:\\Bodheesh vc\\KMS\\stitch_knowledge_support_hub';
const TARGET_ROOT = path.join('C:\\Bodheesh vc\\KMS\\kms-app', 'src', 'app');

const ROUTE_MAP = {
  login: 'auth/login',
  quick_ticket_entry: 'tickets/create',
  global_search_command_palette: 'command-palette',
  dashboard: 'dashboard',
  daily_work_entry: 'daily-work-entry',
  create_knowledge_article: 'knowledge/create',
  knowledge_base_list: 'knowledge',
  knowledge_article_details: 'knowledge/[id]',
  ticket_details: 'tickets/[id]',
  ticket_repository: 'tickets',
  applications_list: 'applications',
  application_details: 'applications/[id]',
  internal_tracker_dashboard: 'tracker',
  settings: 'settings',
  user_profile: 'profile',
};

const PROTECTED = ['auth/login', 'tickets/create', 'command-palette'];
const LIGHT_SUFFIX = '_light_mode';
const DARK_SUFFIX = '_dark_mode';

function kebabCase(str) {
  return str.replace(/_/g, '-');
}

function toPascalCase(str) {
  return str
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

function generatePage(componentName, containerClass, html) {
  const htmlString = JSON.stringify(html);
  const classAttr = containerClass ? ` className="${containerClass}"` : '';
  return `'use client';\n\nexport default function ${componentName}() {\n  return (\n    <div${classAttr}\n      dangerouslySetInnerHTML={{ __html: ${htmlString} }}\n    />\n  );\n}\n`;
}

function main() {
  if (!fs.existsSync(SOURCE_ROOT)) {
    console.error('Source directory not found:', SOURCE_ROOT);
    process.exit(1);
  }

  const entries = fs.readdirSync(SOURCE_ROOT, { withFileTypes: true });
  const groups = {};

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const codeHtmlPath = path.join(SOURCE_ROOT, entry.name, 'code.html');
    if (!fs.existsSync(codeHtmlPath)) continue;

    let base = entry.name;
    let variant = 'default';
    if (base.endsWith(LIGHT_SUFFIX)) {
      base = base.slice(0, -LIGHT_SUFFIX.length);
      variant = 'light';
    } else if (base.endsWith(DARK_SUFFIX)) {
      base = base.slice(0, -DARK_SUFFIX.length);
      variant = 'dark';
    }

    groups[base] = groups[base] || {};
    groups[base][variant] = codeHtmlPath;
  }

  for (const [base, variants] of Object.entries(groups)) {
    const sourcePath = variants.light || variants.default || variants.dark;
    const hasLight = !!variants.light;
    const isDark = !hasLight;
    const route = ROUTE_MAP[base] || kebabCase(base);

    if (PROTECTED.includes(route)) {
      console.log(`Skipping protected route: ${route}`);
      continue;
    }

    const targetDir = path.join(TARGET_ROOT, ...route.split('/'));
    const targetFile = path.join(targetDir, 'page.tsx');

    const html = fs.readFileSync(sourcePath, 'utf8');
    const bodyMatch = html.match(/<body([^>]*)>([\s\S]*?)<\/body>/i);
    if (!bodyMatch) {
      console.warn(`No <body> found in ${sourcePath}`);
      continue;
    }

    const bodyAttrs = bodyMatch[1] || '';
    const bodyContent = bodyMatch[2].trim();
    const classMatch = bodyAttrs.match(/class=["']([^"']+)["']/i);
    let containerClass = classMatch ? classMatch[1] : '';
    if (isDark && !containerClass.includes('dark')) {
      containerClass += ' dark';
    }

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    if (fs.existsSync(targetFile)) {
      const backup = targetFile + '.bak';
      fs.copyFileSync(targetFile, backup);
      console.log(`Backed up ${targetFile} -> ${backup}`);
    }

    const componentName = toPascalCase(base) + 'Page';
    const pageContent = generatePage(componentName, containerClass, bodyContent);
    fs.writeFileSync(targetFile, pageContent, 'utf8');
    console.log(`Generated ${targetFile} from ${sourcePath}`);
  }
}

main();
