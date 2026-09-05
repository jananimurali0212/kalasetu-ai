import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface StorageUploadResult {
  url: string;
  path?: string;
  error?: string;
}

class StorageService {
  private readonly BUCKET_NAME = 'product-images';

  /**
   * Upload an artisan product image to Supabase Storage.
   * If Supabase is not yet configured, returns a client-side data/blob URL as fallback.
   */
  public async uploadProductImage(
    file: File | Blob,
    userId: string,
    originalName: string = 'craft-image.jpg'
  ): Promise<StorageUploadResult> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase is not configured with real credentials. Using local image data.');
      // Return local object URL for preview if File/Blob
      const localUrl = URL.createObjectURL(file);
      return { url: localUrl };
    }

    try {
      const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${userId}/${Date.now()}-${sanitizedName}`;

      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'image/jpeg',
        });

      if (error) {
        console.error('Supabase Storage upload error:', error.message);
        // If upload fails, fallback to local URL so user doesn't lose workflow progress
        return {
          url: URL.createObjectURL(file),
          error: error.message,
        };
      }

      const { data: publicData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(data.path);

      return {
        url: publicData.publicUrl,
        path: data.path,
      };
    } catch (err: any) {
      console.error('Storage upload unexpected failure:', err);
      return {
        url: URL.createObjectURL(file),
        error: err?.message || 'Failed to upload image to Supabase Storage',
      };
    }
  }
}

export const storageService = new StorageService();
