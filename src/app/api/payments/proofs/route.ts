import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_ROLES, rejectCrossSiteMutation, requireAdmin, requireUser } from '@/lib/api-auth';
import { insforgeAdmin } from '@/lib/insforge/server';

function mapProof(proof: Record<string, any>) {
  return {
    ...proof,
    userId: proof.user_id,
    userName: proof.user_name,
    userEmail: proof.user_email,
    userPhone: proof.user_phone,
    planSlug: proof.plan_slug,
    planName: proof.plan_name,
    paymentMethod: proof.payment_method,
    transactionId: proof.transaction_id,
    senderAccountNumber: proof.sender_account_number,
    screenshotUrl: proof.screenshot_url,
    screenshotKey: proof.screenshot_key,
    rejectionReason: proof.rejection_reason,
    reviewedBy: proof.reviewed_by,
    reviewedAt: proof.reviewed_at,
    submittedAt: proof.submitted_at,
  };
}

async function withSignedScreenshot(proof: Record<string, any>) {
  if (!proof.screenshot_key) return mapProof(proof);
  const { data, error } = await insforgeAdmin.storage
    .from('payment-evidence')
    .createSignedUrl(proof.screenshot_key, 15 * 60);
  if (error) throw error;
  return mapProof({ ...proof, screenshot_url: data?.signedUrl ?? null });
}

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  try {
    let query = insforgeAdmin.database.from('payment_proofs').select('*');
    if (!ADMIN_ROLES.has(auth.user.role)) query = query.eq('user_id', auth.user.id);
    const { data, error } = await query.order('submitted_at', { ascending: false });
    if (error) throw error;
    const proofs = await Promise.all((data ?? []).map(withSignedScreenshot));
    return NextResponse.json({ success: true, data: proofs, total: proofs.length });
  } catch (error) {
    console.error('Payment proof fetch failed:', error);
    return NextResponse.json({ success: false, error: 'Payment proofs could not be loaded.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const auth = await requireUser();
  if (auth.response) return auth.response;
  try {
    const body = await request.json();
    const requestedSlug = typeof body.planSlug === 'string' ? body.planSlug.toUpperCase() : '';
    const planSlug = requestedSlug === 'VIP' ? 'PREMIUM_PLUS' : requestedSlug;
    const transactionId = typeof body.transactionId === 'string' ? body.transactionId.trim().slice(0, 100) : '';
    const screenshotUrl = typeof body.screenshotUrl === 'string' ? body.screenshotUrl.trim() : '';
    const screenshotKey = typeof body.screenshotKey === 'string' ? body.screenshotKey.trim().slice(0, 500) : null;
    const paymentMethod = typeof body.paymentMethod === 'string' ? body.paymentMethod.toUpperCase() : '';
    if (!transactionId || !screenshotUrl || !screenshotKey || !['BANK_TRANSFER', 'JAZZCASH', 'EASYPAISA', 'RAAST', 'SADAPAY'].includes(paymentMethod)) {
      return NextResponse.json({ success: false, error: 'Complete payment evidence is required.' }, { status: 400 });
    }
    const storageOrigin = new URL(process.env.INSFORGE_URL!).origin;
    let screenshotOrigin: string;
    try { screenshotOrigin = new URL(screenshotUrl).origin; } catch { screenshotOrigin = ''; }
    if (screenshotOrigin !== storageOrigin || !screenshotKey.startsWith(`${auth.user.id}/payment-proofs/`)) {
      return NextResponse.json({ success: false, error: 'Payment screenshot must be uploaded through this application.' }, { status: 400 });
    }

    const { data: plan, error: planError } = await insforgeAdmin.database.from('subscription_plans')
      .select('slug,name,monthly_price,yearly_price')
      .eq('slug', planSlug)
      .maybeSingle();
    if (planError) throw planError;
    if (!plan || Number(plan.monthly_price) <= 0) {
      return NextResponse.json({ success: false, error: 'Selected plan is not available.' }, { status: 400 });
    }

    const { data: duplicate, error: duplicateError } = await insforgeAdmin.database.from('payment_proofs')
      .select('id').ilike('transaction_id', transactionId).maybeSingle();
    if (duplicateError) throw duplicateError;
    if (duplicate) return NextResponse.json({ success: false, error: 'This transaction ID has already been submitted.' }, { status: 409 });

    const { data: proof, error } = await insforgeAdmin.database.from('payment_proofs').insert([{
      user_id: auth.user.id,
      user_name: auth.user.name,
      user_email: auth.user.email,
      user_phone: auth.user.phone ?? '',
      plan_slug: plan.slug,
      plan_name: plan.name,
      amount: Number(plan.monthly_price),
      currency: 'PKR',
      payment_method: paymentMethod,
      transaction_id: transactionId,
      sender_account_number: typeof body.senderAccountNumber === 'string' ? body.senderAccountNumber.trim().slice(0, 80) : null,
      screenshot_url: screenshotUrl,
      screenshot_key: screenshotKey,
      status: 'PENDING',
    }]).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data: mapProof(proof), message: 'Payment submitted for manual review.' }, { status: 201 });
  } catch (error) {
    console.error('Payment proof submission failed:', error);
    return NextResponse.json({ success: false, error: 'Payment proof could not be submitted.' }, { status: 500 });
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
    if (!id || !['VERIFIED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Valid payment ID and review status are required.' }, { status: 400 });
    }
    if (status === 'VERIFIED') {
      const { data, error } = await insforgeAdmin.database.rpc('approve_payment_proof', {
        proof_id: id,
        admin_user_id: auth.user.id,
      });
      if (error) throw error;
      return NextResponse.json({ success: true, data, message: 'Payment verified and membership activated.' });
    }

    const rejectionReason = typeof body.rejectionReason === 'string' ? body.rejectionReason.trim().slice(0, 500) : '';
    if (!rejectionReason) return NextResponse.json({ success: false, error: 'A rejection reason is required.' }, { status: 400 });
    const { data: rejected, error } = await insforgeAdmin.database.from('payment_proofs').update({
      status: 'REJECTED', rejection_reason: rejectionReason,
      reviewed_by: auth.user.id, reviewed_at: new Date().toISOString(),
    }).eq('id', id).eq('status', 'PENDING').select().maybeSingle();
    if (error) throw error;
    if (!rejected) return NextResponse.json({ success: false, error: 'Pending payment proof not found.' }, { status: 409 });
    return NextResponse.json({ success: true, data: mapProof(rejected), message: 'Payment proof rejected.' });
  } catch (error) {
    console.error('Payment review failed:', error);
    return NextResponse.json({ success: false, error: 'Payment review could not be completed.' }, { status: 500 });
  }
}
