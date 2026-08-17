import { createClient } from './client';

export const BUCKETS = {
  PROFILE_PHOTOS: 'profile-photos', // Public bucket for candidate photos
  VERIFICATION_DOCS: 'verification-documents', // Private bucket for Passports / IDs
} as const;

export async function uploadProfilePhoto(
  file: File,
  userId: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(BUCKETS.PROFILE_PHOTOS)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      return { url: null, error: error.message };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKETS.PROFILE_PHOTOS).getPublicUrl(data.path);

    return { url: publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || 'Upload failed' };
  }
}

export async function uploadVerificationDocument(
  file: File,
  userId: string,
  docType: string
): Promise<{ path: string | null; error: string | null }> {
  try {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${docType}_${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(BUCKETS.VERIFICATION_DOCS)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return { path: null, error: error.message };
    }

    return { path: data.path, error: null };
  } catch (err: any) {
    return { path: null, error: err.message || 'Verification upload failed' };
  }
}
