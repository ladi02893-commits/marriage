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
        plan_slug: planSlug || 'VIP',
        plan_name: planName || 'VIP Royal Package',
        amount: Number(amount) || 10000,
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

    // If approved, upgrade the user's tier & connection credits in InsForge
    if (status === 'VERIFIED' && updated) {
      try {
        const rawSlug = (updated.plan_slug || updated.plan_name || '').toUpperCase();
        let targetTier: 'FREE' | 'BASIC' | 'PREMIUM' | 'VIP' | 'PREMIUM_PLUS' = 'PREMIUM';
        let connectionsToAdd = 0;
        let isPack = false;

        if (rawSlug.includes('PACK_10') || rawSlug.includes('10 CONNECTIONS') || rawSlug.includes('10 CONN') || rawSlug.includes('10_CONN')) {
          connectionsToAdd = 10;
          isPack = true;
        } else if (rawSlug.includes('PACK_30') || rawSlug.includes('30 CONNECTIONS') || rawSlug.includes('30 CONN') || rawSlug.includes('30_CONN')) {
          connectionsToAdd = 30;
          isPack = true;
        } else if (rawSlug.includes('PACK_50') || rawSlug.includes('50 CONNECTIONS') || rawSlug.includes('50 CONN') || rawSlug.includes('50_CONN')) {
          connectionsToAdd = 50;
          isPack = true;
        } else if (rawSlug.includes('PACK_100') || rawSlug.includes('100 CONNECTIONS') || rawSlug.includes('100 CONN') || rawSlug.includes('100_CONN')) {
          connectionsToAdd = 100;
          isPack = true;
        } else if (
          rawSlug.includes('VIP') ||
          rawSlug.includes('ROYAL') ||
          rawSlug.includes('PREMIUM_PLUS') ||
          rawSlug.includes('PLUS') ||
          rawSlug === 'PLAN-VIP'
        ) {
          targetTier = 'VIP';
          connectionsToAdd = 300;
        } else if (
          rawSlug.includes('PREMIUM') ||
          rawSlug.includes('ELITE') ||
          rawSlug.includes('EXECUTIVE') ||
          rawSlug === 'PLAN-PREMIUM'
        ) {
          targetTier = 'PREMIUM';
          connectionsToAdd = 100;
        } else if (rawSlug.includes('BASIC')) {
          targetTier = 'BASIC';
          connectionsToAdd = 30;
        } else {
          // Fallback based on amount
          if (updated.amount >= 10000) {
            targetTier = 'VIP';
            connectionsToAdd = 300;
          } else if (updated.amount >= 5000) {
            targetTier = 'PREMIUM';
            connectionsToAdd = 100;
          } else if (updated.amount >= 2000) {
            targetTier = 'BASIC';
            connectionsToAdd = 30;
          } else {
            connectionsToAdd = 10;
            isPack = true;
          }
        }

        // Fetch existing user to calculate accurate connection balance
        let existingUser: any = null;
        if (updated.user_id) {
          try {
            const { data: u } = await insforgeAdmin.database
              .from('users')
              .select('id, total_connections, remaining_connections, used_connections, subscription_tier')
              .eq('id', updated.user_id)
              .maybeSingle();
            existingUser = u;
          } catch (e) {
            console.warn('Could not fetch existing user by id:', e);
          }
        }
        if (!existingUser && updated.user_email) {
          try {
            const { data: u } = await insforgeAdmin.database
              .from('users')
              .select('id, total_connections, remaining_connections, used_connections, subscription_tier')
              .eq('email', updated.user_email)
              .maybeSingle();
            existingUser = u;
          } catch (e) {
            console.warn('Could not fetch existing user by email:', e);
          }
        }

        const currentTotal = existingUser?.total_connections ?? 0;
        const currentRemaining = existingUser?.remaining_connections ?? 0;
        const currentUsed = existingUser?.used_connections ?? 0;

        const newTotal = isPack ? (currentTotal + connectionsToAdd) : Math.max(currentTotal, connectionsToAdd);
        const newRemaining = isPack ? (currentRemaining + connectionsToAdd) : Math.max(0, newTotal - currentUsed);
        const finalTier = isPack ? (existingUser?.subscription_tier || 'BASIC') : targetTier;

        const userUpdatePayload: any = {
          subscription_tier: finalTier,
          is_verified: true,
          account_status: 'ACTIVE',
          total_connections: newTotal,
          remaining_connections: newRemaining,
        };

        if (finalTier === 'VIP' || finalTier === 'PREMIUM_PLUS') {
          userUpdatePayload.assigned_consultant_id = 'consultant-1';
        }

        // 1. Update user record by ID
        if (updated.user_id) {
          await insforgeAdmin.database
            .from('users')
            .update(userUpdatePayload)
            .eq('id', updated.user_id);
        }

        // 2. Also update by email if present
        if (updated.user_email) {
          await insforgeAdmin.database
            .from('users')
            .update(userUpdatePayload)
            .eq('email', updated.user_email);
        }

        // 3. Mark profile as featured
        if (updated.user_id) {
          await insforgeAdmin.database
            .from('matrimonial_profiles')
            .update({
              is_featured: true,
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
            plan_name: updated.plan_name || (
              finalTier === 'VIP' || finalTier === 'PREMIUM_PLUS'
                ? 'VIP Royal Package (300 Connections)'
                : finalTier === 'PREMIUM'
                ? 'Premium Package (100 Connections)'
                : 'Basic Package (30 Connections)'
            ),
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
