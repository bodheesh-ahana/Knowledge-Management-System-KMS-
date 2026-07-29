import { useState } from 'react';

interface UploadProgress {
  isLoading: boolean;
  progress: number;
  error: string | null;
}

interface FileUploadResult {
  success: boolean;
  filename?: string;
  url?: string;
  size?: number;
  error?: string;
}

/**
 * Hook for uploading files
 * 
 * Usage:
 * const { upload, isLoading, error } = useFileUpload();
 * 
 * const handleUpload = async (file: File) => {
 *   const result = await upload(file);
 *   if (result.success) {
 *     console.log('Uploaded to:', result.url);
 *   }
 * };
 */
export function useFileUpload() {
  const [state, setState] = useState<UploadProgress>({
    isLoading: false,
    progress: 0,
    error: null,
  });

  const upload = async (file: File): Promise<FileUploadResult> => {
    setState({ isLoading: true, progress: 0, error: null });

    try {
      // Validate file
      if (!file) {
        throw new Error('No file selected');
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Upload
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const result: FileUploadResult = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      setState({ isLoading: false, progress: 100, error: null });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setState({ isLoading: false, progress: 0, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  return {
    upload,
    isLoading: state.isLoading,
    progress: state.progress,
    error: state.error,
  };
}

/**
 * Hook for multiple file uploads
 * 
 * Usage:
 * const { uploadMultiple, isLoading } = useMultipleFileUpload();
 * 
 * const results = await uploadMultiple([file1, file2, file3]);
 */
export function useMultipleFileUpload() {
  const { upload, isLoading, error } = useFileUpload();

  const uploadMultiple = async (
    files: File[]
  ): Promise<FileUploadResult[]> => {
    const results: FileUploadResult[] = [];

    for (const file of files) {
      const result = await upload(file);
      results.push(result);
    }

    return results;
  };

  return {
    uploadMultiple,
    isLoading,
    error,
  };
}
