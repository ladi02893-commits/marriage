import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_ROLES, rejectCrossSiteMutation, requireAdmin, requireUser } from '@/lib/api-auth';
import { insforgeAdmin } from '@/lib/insforge/server';

function mapVerification(item: Record<string, any>) {
  return {
    ...item,
    userId: item.user_id,
    documentType: item.document_type,
    documentFrontUrl: item.document_front_url,
    documentBackUrl: item.document_back_url,
    selfieUrl: item.selfie_url,
    reviewerNotes: item.reviewer_notes,
    submittedAt: item.submitted_at,
    reviewedAt: item.reviewed_at,
  };
}

async function withSignedDocuments(item: Record<string, any>) {
  const result = { ...item };
  const fields = [
    ['document_front_key', 'document_front_url'],
    ['document_back_key', 'document_back_url'],
    ['selfie_key', 'selfie_url'],
  ] as const;
  await Promise.all(fields.map(async ([keyField, urlField]) => {
    if (!item[keyField]) return;
    const { data, error } = await insforgeAdmin.storage
      .from('verification-documents')
      .createSignedUrl(item[keyField], 15 * 60);
    if (error) throw error;
    result[urlField] = data?.signedUrl ?? null;
  }));
  return mapVerification(result);
}

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  try {
    let query = insforgeAdmin.database.from('verification_requests').select('*,user:users(id,name,email,avatar_url,role)');
    if (!ADMIN_ROLES.has(auth.user.role)) query = query.eq('user_id', auth.user.id);
    const { data, error } = await query.order('submitted_at', { ascending: false });
    if (error) throw error;
    const requests = await Promise.all((data ?? []).map(withSignedDocuments));
    return NextResponse.json({ success: true, data: requests, total: requests.length });
  } catch (error) {
    console.error('Verification fetch failed:', error);
    return NextResponse.json({ success: false, error: 'Verification requests could not be loaded.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const auth = await requireUser();
  if (auth.response) return auth.response;
  try {
    const body = await request.json();
    const documentType = typeof body.documentType === 'string' ? body.documentType.toUpperCase() : '';
    const documentFrontUrl = typeof body.documentFrontUrl === 'string' ? body.documentFrontUrl.trim() : '';
    const selfieUrl = typeof body.selfieUrl === 'string' ? body.selfieUrl.trim() : '';
    const documentFrontKey = typeof body.documentFrontKey === 'string' ? body.documentFrontKey.trim() : '';
    const selfieKey = typeof body.selfieKey === 'string' ? body.selfieKey.trim() : '';
    if (!['NATIONAL_ID', 'PASSPORT', 'DRIVING_LICENSE'].includes(documentType) || !documentFrontUrl || !selfieUrl || !documentFrontKey || !selfieKey) {
      return NextResponse.json({ success: false, error: 'Valid identity document and selfie are required.' }, { status: 400 });
    }
    const documentBackUrl = typeof body.documentBackUrl === 'string' ? body.documentBackUrl.trim() : '';
    const documentBackKey = typeof body.documentBackKey === 'string' ? body.documentBackKey.trim() : '';
    const ownUpload = (url: string, key: string) => {
      if (!key.startsWith(`${auth.user.id}/verifications/`) && !key.startsWith(`${auth.user.id}/verification-documents/`)) return false;
      try { return new URL(url).origin === new URL(process.env.INSFORGE_URL!).origin; } catch { return false; }
    };
    if (!ownUpload(documentFrontUrl, documentFrontKey) || !ownUpload(selfieUrl, selfieKey) ||
      (documentBackUrl || documentBackKey ? !documentBackUrl || !documentBackKey || !ownUpload(documentBackUrl, documentBackKey) : false)) {
      return NextResponse.json({ success: false, error: 'Upload verification files through your own account first.' }, { status: 400 });
    }
    const { data: pending, error: pendingError } = await insforgeAdmin.database.from('verification_requests')
      .select('id').eq('user_id', auth.user.id).eq('status', 'PENDING').maybeSingle();
    if (pendingError) throw pendingError;
    if (pending) return NextResponse.json({ success: false, error: 'A verification request is already pending.' }, { status: 409 });

    const { data: created, error } = await insforgeAdmin.database.from('verification_requests').insert([{
      user_id: auth.user.id,
      document_type: documentType,
      document_front_url: documentFrontUrl,
      document_back_url: documentBackUrl || null,
      selfie_url: selfieUrl,
      document_front_key: documentFrontKey,
      document_back_key: documentBackKey || null,
      selfie_key: selfieKey,
      status: 'PENDING',
    }]).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data: mapVerification(created), message: 'Verification submitted for review.' }, { status: 201 });
  } catch (error) {
    console.error('Verification submission failed:', error);
    return NextResponse.json({ success: false, error: 'Verification request could not be submitted.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  try {
    const body = await request.json();
    const id = typeof body.id === 'string' ? body.id : '';
    const status = typeof body.status === 'string' ? body.status.toUpperCase() : '';
    if (!id || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Valid verification ID and status are required.' }, { status: 400 });
    }
    const { data: current, error: currentError } = await insforgeAdmin.database.from('verification_requests')
      .select('*').eq('id', id).eq('status', 'PENDING').maybeSingle();
    if (currentError) throw currentError;
    if (!current) return NextResponse.json({ success: false, error: 'Pending verification not found.' }, { status: 409 });

    if (status === 'APPROVED') {
      const [userResult, profileResult] = await Promise.all([
        insforgeAdmin.database.from('users').update({ is_verified: true }).eq('id', current.user_id),
        insforgeAdmin.database.from('matrimonial_profiles').update({ verification_badge: 'APPROVED', is_identity_verified: true }).eq('user_id', current.user_id),
      ]);
      if (userResult.error || profileResult.error) throw userResult.error ?? profileResult.error;
    }
    const { data: updated, error } = await insforgeAdmin.database.from('verification_requests').update({
      status,
      reviewer_notes: typeof body.reviewerNotes === 'string' ? body.reviewerNotes.trim().slice(0, 1000) : null,
      reviewed_at: new Date().toISOString(),
    }).eq('id', id).eq('status', 'PENDING').select().single();
    if (error) throw error;
    const { error: notificationError } = await insforgeAdmin.database.from('notifications').insert([{
      user_id: current.user_id,
      title: status === 'APPROVED' ? 'Identity verification approved' : 'Identity verification update',
      description: status === 'APPROVED'
        ? 'Your identity verification was approved.'
        : 'Your verification was not approved. Review the administrator notes before resubmitting.',
      type: 'SYSTEM',
      link_url: '/dashboard/verification',
    }]);
    if (notificationError) console.error('Verification notification failed:', notificationError.message);
    return NextResponse.json({ success: true, data: mapVerification(updated) });
  } catch (error) {
    console.error('Verification review failed:', error);
    return NextResponse.json({ success: false, error: 'Verification review could not be completed.' }, { status: 500 });
  }
}
