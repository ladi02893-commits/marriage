import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { rejectCrossSiteMutation, requireUser } from '@/lib/api-auth';
import { insforgeAdmin } from '@/lib/insforge/server';

const PURPOSES = {
  avatars: { bucket: 'profile-photos', maxBytes: 5 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/webp'] },
  'profile-photos': { bucket: 'profile-photos', maxBytes: 5 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/webp'] },
  'payment-proofs': { bucket: 'payment-evidence', maxBytes: 8 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/webp'] },
  verifications: { bucket: 'verification-documents', maxBytes: 8 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] },
  'verification-documents': { bucket: 'verification-documents', maxBytes: 8 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] },
} as const;

function extensionFor(type: string): string {
  return { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' }[type] ?? 'bin';
}

function signatureMatches(type: string, bytes: Uint8Array): boolean {
  if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === 'image/png') return bytes.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10';
  if (type === 'image/webp') return new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP';
  if (type === 'application/pdf') return new TextDecoder().decode(bytes.slice(0, 5)) === '%PDF-';
  return false;
}

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const auth = await requireUser();
  if (auth.response) return auth.response;
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const purpose = String(formData.get('purpose') ?? formData.get('bucket') ?? '');
    const policy = PURPOSES[purpose as keyof typeof PURPOSES];
    if (!(file instanceof File) || !policy) {
      return NextResponse.json({ success: false, error: 'A valid file purpose is required.' }, { status: 400 });
    }
    if (file.size <= 0 || file.size > policy.maxBytes || !(policy.types as readonly string[]).includes(file.type)) {
      return NextResponse.json({ success: false, error: 'File type or size is not allowed.' }, { status: 400 });
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!signatureMatches(file.type, bytes)) {
      return NextResponse.json({ success: false, error: 'File content does not match its declared type.' }, { status: 400 });
    }
    const key = `${auth.user.id}/${purpose}/${randomUUID()}.${extensionFor(file.type)}`;
    const uploadFile = new File([bytes], `${randomUUID()}.${extensionFor(file.type)}`, { type: file.type });
    const { data, error } = await insforgeAdmin.storage.from(policy.bucket).upload(key, uploadFile);
    if (error) throw error;
    return NextResponse.json({ success: true, url: data?.url, key: data?.key ?? key, path: data?.key ?? key });
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json({ success: false, error: 'File could not be uploaded.' }, { status: 500 });
  }
}
