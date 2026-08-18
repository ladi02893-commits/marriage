import { NextRequest, NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge/server';
import { INITIAL_PAYMENT_PROOFS } from '@/lib/data-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    let dbProofs: any[] = [];
    try {
      let query = insforgeAdmin.database.from('payment_proofs').select('*');
      if (userId) query = query.eq('user_id', userId);

      const { data, error } = await query.order('submitted_at', { ascending: false });

      if (!error && data) {
        dbProofs = data.map((p: any) => ({
          ...p,
          userId: p.user_id || p.userId,
          userName: p.user_name || p.userName,
          userEmail: p.user_email || p.userEmail,
          userPhone: p.user_phone || p.userPhone,
          planSlug: p.plan_slug || p.planSlug,
          planName: p.plan_name || p.planName,
          paymentMethod: p.payment_method || p.paymentMethod,
          transactionId: p.transaction_id || p.transactionId,
          senderAccountNumber: p.sender_account_number || p.senderAccountNumber,
          screenshotUrl: p.screenshot_url || p.screenshotUrl,
          rejectionReason: p.rejection_reason || p.rejectionReason,
          reviewedBy: p.reviewed_by || p.reviewedBy,
          reviewedAt: p.reviewed_at || p.reviewedAt,
          submittedAt: p.submitted_at || p.submittedAt,
        }));
      }
    } catch (err) {
      console.warn('InsForge payment proofs fetch fallback:', err);
    }

    const data = dbProofs.length > 0 ? dbProofs : INITIAL_PAYMENT_PROOFS;

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
      source: dbProofs.length > 0 ? 'INSFORGE_DATABASE' : 'DATA_STORE',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment proofs.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      userName,
      userEmail,
      userPhone,
      planSlug,
      planName,
      amount,
      currency,
      paymentMethod,
      transactionId,
      senderAccountNumber,
      screenshotUrl,
    } = body;

    const { data: proof, error } = await insforgeAdmin.database
      .from('payment_proofs')
      .insert([{
        user_id: userId || 'user-ladi',
        user_name: userName || 'Member',
        user_email: userEmail || '',
        user_phone: userPhone || '',
        plan_slug: planSlug || 'PREMIUM',
        plan_name: planName || 'Elite Executive Plan',
        amount: Number(amount) || 15000,
        currency: currency || 'PKR',
        payment_method: paymentMethod || 'JAZZCASH',
        transaction_id: transactionId || `TRX-${Date.now()}`,
        sender_account_number: senderAccountNumber || '',
        screenshot_url: screenshotUrl || '',
        status: 'PENDING',
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: proof,
      message: 'Payment proof recorded into InsForge database successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to submit payment proof to database.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, rejectionReason, reviewerName } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'id and status are required.' },
        { status: 400 }
      );
    }

    const { data: updated, error } = await insforgeAdmin.database
      .from('payment_proofs')
      .update({
        status,
        rejection_reason: rejectionReason || null,
        reviewed_by: reviewerName || 'Admin Control Room',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // If approved, upgrade the user's tier in InsForge if user exists
    if (status === 'VERIFIED' && updated) {
      try {
        const rawSlug = (updated.plan_slug || updated.plan_name || '').toUpperCase();
        let targetTier: 'FREE' | 'PREMIUM' | 'PREMIUM_PLUS' = 'PREMIUM';
        if (
          rawSlug.includes('VIP') ||
          rawSlug.includes('ROYAL') ||
          rawSlug.includes('PREMIUM_PLUS') ||
          rawSlug.includes('PLUS') ||
          rawSlug === 'PLAN-VIP'
        ) {
          targetTier = 'PREMIUM_PLUS';
        } else if (
          rawSlug.includes('PREMIUM') ||
          rawSlug.includes('ELITE') ||
          rawSlug.includes('EXECUTIVE') ||
          rawSlug === 'PLAN-PREMIUM'
        ) {
          targetTier = 'PREMIUM';
        }

        // 1. Update user record
        if (updated.user_id) {
          await insforgeAdmin.database
            .from('users')
            .update({ 
              subscription_tier: targetTier,
              is_verified: true,
              account_status: 'ACTIVE'
            })
            .eq('id', updated.user_id);
        }

        // 2. Also try matching by email if user_email is present
        if (updated.user_email) {
          await insforgeAdmin.database
            .from('users')
            .update({ 
              subscription_tier: targetTier,
              is_verified: true,
              account_status: 'ACTIVE'
            })
            .eq('email', updated.user_email);
        }

        // 3. Mark profile as featured & boosted for VIP
        if (updated.user_id) {
          await insforgeAdmin.database
            .from('matrimonial_profiles')
            .update({
              is_featured: true,
              is_boosted: targetTier === 'PREMIUM_PLUS',
            })
            .eq('user_id', updated.user_id);
        }

        // 4. Record a PAID Invoice in InsForge
        await insforgeAdmin.database
          .from('invoices')
          .insert([{
            user_id: updated.user_id || 'user-ladi',
            invoice_number: `INV-${Date.now().toString().slice(-6)}`,
            amount: updated.amount,
            currency: updated.currency || 'PKR',
            status: 'PAID',
            payment_method: updated.payment_method || 'BANK_TRANSFER',
            plan_name: updated.plan_name || (targetTier === 'PREMIUM_PLUS' ? 'VIP Royal Matchmaking' : 'Elite Executive'),
          }]);
      } catch (userUpErr) {
        console.warn('User subscription auto-upgrade error in DB:', userUpErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Payment proof ${status.toLowerCase()} and recorded in InsForge.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update payment proof.' },
      { status: 500 }
    );
  }
}
