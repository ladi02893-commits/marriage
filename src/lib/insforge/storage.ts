import { insforge } from './client';
import { insforgeAdmin } from './server';

export const BUCKETS = {
  PROFILE_PHOTOS: 'profile-photos',
  VERIFICATION_DOCS: 'verification-documents',
  UPLOADS: 'uploads',
  PAYMENT_PROOFS: 'payment-proofs',
} as const;

export async function uploadProfilePhoto(
  file: File | Blob,
  userId: string,
  fileName?: string
): Promise<{ url: string | null; key: string | null; error: string | null }> {
  try {
    const ext = fileName?.split('.').pop() || (file instanceof File ? file.name.split('.').pop() : 'jpg');
    const key = `${userId}/${Date.now()}.${ext}`;

    const { data, error } = await insforge.storage
      .from(BUCKETS.PROFILE_PHOTOS)
      .upload(key, file);

    if (error) {
      return { url: null, key: null, error: error.message };
    }

    return { url: data?.url || null, key: data?.key || null, error: null };
  } catch (err: any) {
    return { url: null, key: null, error: err.message || 'Upload failed' };
  }
}

export async function uploadVerificationDocument(
  file: File | Blob,
  userId: string,
  docType: string,
  originalName?: string
): Promise<{ url: string | null; key: string | null; error: string | null }> {
  try {
    const ext = originalName?.split('.').pop() || (file instanceof File ? file.name.split('.').pop() : 'jpg');
    const key = `${userId}/${docType}_${Date.now()}.${ext}`;

    const { data, error } = await insforge.storage
      .from(BUCKETS.VERIFICATION_DOCS)
      .upload(key, file);

    if (error) {
      return { url: null, key: null, error: error.message };
    }

    return { url: data?.url || null, key: data?.key || null, error: null };
  } catch (err: any) {
    return { url: null, key: null, error: err.message || 'Verification upload failed' };
  }
}

export async function uploadServerFile(
  file: File | Blob | ArrayBuffer,
  bucket: string,
  key: string
): Promise<{ url: string | null; key: string | null; error: string | null }> {
  try {
    const blob = file instanceof Blob ? file : new Blob([file]);
    const { data, error } = await insforgeAdmin.storage
      .from(bucket)
      .upload(key, blob);

    if (error) {
      return { url: null, key: null, error: error.message };
    }

    return { url: data?.url || null, key: data?.key || null, error: null };
  } catch (err: any) {
    return { url: null, key: null, error: err.message || 'Server upload failed' };
  }
}
