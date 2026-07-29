import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DOCS_DIR = path.join(process.cwd(), 'public', 'official_documents');

// Applications we officially support. Any file whose name doesn't match one
// of these is tagged "General".
const SUPPORTED_APPLICATIONS = [
  'Drake',
  'Lacerte',
  'QuickBooks',
  'Ultratax',
  'Transaction Pro',
  'CCH Axcess',
];

function classifyApplications(filename: string): string[] {
  const lower = filename.toLowerCase();
  const matches: string[] = [];

  if (lower.includes('drake')) matches.push('Drake');
  if (lower.includes('lacerte')) matches.push('Lacerte');
  if (lower.includes('quickbooks') || /\bqb\b/.test(lower)) matches.push('QuickBooks');
  if (lower.includes('ultratax')) matches.push('Ultratax');
  if (lower.includes('transaction pro')) matches.push('Transaction Pro');
  if (lower.includes('cch axcess') || lower.includes('axcess')) matches.push('CCH Axcess');

  return matches.length > 0 ? matches : ['General'];
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function GET() {
  try {
    const filenames = await fs.readdir(DOCS_DIR);

    const documents = await Promise.all(
      filenames.map(async (filename) => {
        const filePath = path.join(DOCS_DIR, filename);
        const stat = await fs.stat(filePath);
        const ext = path.extname(filename).replace('.', '').toUpperCase();

        return {
          name: path.basename(filename, path.extname(filename)),
          filename,
          extension: ext,
          size: formatSize(stat.size),
          modifiedAt: stat.mtime,
          applications: classifyApplications(filename),
          url: `/official_documents/${encodeURIComponent(filename)}`,
        };
      })
    );

    documents.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      success: true,
      data: { documents, supportedApplications: SUPPORTED_APPLICATIONS },
    });
  } catch (error) {
    console.error('Error reading official documents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read official documents' },
      { status: 500 }
    );
  }
}
