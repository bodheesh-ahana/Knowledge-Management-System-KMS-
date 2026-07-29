import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Local file storage handler for images and documents
 * Stores files in public/uploads folder
 * Later can be migrated to Cloudinary or S3
 */

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface FileUploadResult {
  success: boolean;
  filename?: string;
  url?: string;
  error?: string;
  size?: number;
}

/**
 * Generate unique filename
 */
export function generateFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `${timestamp}-${random}${ext}`;
}

/**
 * Save image file locally
 * @param buffer - File buffer
 * @param originalFilename - Original filename
 * @param mimeType - MIME type
 * @returns Upload result with filename and URL
 */
export async function saveImageFile(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<FileUploadResult> {
  try {
    // Validate image type
    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      return {
        success: false,
        error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
      };
    }

    // Validate file size
    if (buffer.length > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    // Generate filename
    const filename = generateFilename(originalFilename);
    const filepath = path.join(UPLOAD_DIR, filename);

    // Ensure upload directory exists
    try {
      await fs.access(UPLOAD_DIR);
    } catch {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Write file
    await fs.writeFile(filepath, buffer);

    // Return result with public URL
    const url = `/uploads/${filename}`;

    return {
      success: true,
      filename,
      url,
      size: buffer.length,
    };
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: 'Failed to upload file',
    };
  }
}

/**
 * Delete image file
 */
export async function deleteImageFile(filename: string): Promise<boolean> {
  try {
    const filepath = path.join(UPLOAD_DIR, filename);
    await fs.unlink(filepath);
    return true;
  } catch (error) {
    console.error('File deletion error:', error);
    return false;
  }
}

/**
 * Get file size
 */
export async function getFileSize(filename: string): Promise<number | null> {
  try {
    const filepath = path.join(UPLOAD_DIR, filename);
    const stats = await fs.stat(filepath);
    return stats.size;
  } catch {
    return null;
  }
}

/**
 * List all uploaded files (for cleanup or management)
 */
export async function listUploadedFiles(): Promise<string[]> {
  try {
    const files = await fs.readdir(UPLOAD_DIR);
    return files;
  } catch {
    return [];
  }
}

/**
 * Clean up old files (older than specified days)
 */
export async function cleanupOldFiles(olderThanDays: number = 30): Promise<number> {
  try {
    const files = await fs.readdir(UPLOAD_DIR);
    const now = Date.now();
    const maxAge = olderThanDays * 24 * 60 * 60 * 1000;
    let deletedCount = 0;

    for (const file of files) {
      const filepath = path.join(UPLOAD_DIR, file);
      const stats = await fs.stat(filepath);
      if (now - stats.mtimeMs > maxAge) {
        await fs.unlink(filepath);
        deletedCount++;
      }
    }

    return deletedCount;
  } catch (error) {
    console.error('Cleanup error:', error);
    return 0;
  }
}
