import { NextRequest, NextResponse } from 'next/server';
import { saveImageFile } from '@/lib/storage/fileHandler';

/**
 * POST /api/upload/image
 * Upload an image file
 *
 * Request:
 *   - multipart/form-data with 'file' field
 *
 * Response:
 *   - { success: true, filename: string, url: string, size: number }
 *   - { success: false, error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type;

    // Save file
    const result = await saveImageFile(buffer, file.name, mimeType);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload/image?filename=...
 * Get image file info
 */
export async function GET(request: NextRequest) {
  try {
    const filename = request.nextUrl.searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'No filename provided' },
        { status: 400 }
      );
    }

    // Validate filename (prevent directory traversal)
    if (filename.includes('..') || filename.includes('/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid filename' },
        { status: 400 }
      );
    }

    const url = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      filename,
      url,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Request failed' },
      { status: 500 }
    );
  }
}
