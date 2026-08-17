import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_PAYMENT_PROOFS } from '@/lib/data-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    let dbProofs: any[] = [];
    try {
      const where: any = {};
      if (userId) where.userId = userId;

      dbProofs = await prisma.paymentProof.findMany({
        where,
        orderBy: { submittedAt: 'desc' },
      });
    } catch (err) {
      console.warn('Prisma payment proofs fetch fallback:', err);
    }

    const data = dbProofs.length > 0 ? dbProofs : INITIAL_PAYMENT_PROOFS;

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
      source: dbProofs.length > 0 ? 'PRISMA_DATABASE' : 'DATA_STORE',
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

    const proof = await prisma.paymentProof.create({
      data: {
        userId: userId || 'anonymous',
        userName: userName || 'Member',
        userEmail: userEmail || '',
        userPhone: userPhone || '',
        planSlug: planSlug || 'PREMIUM',
        planName: planName || 'Elite Executive Plan',
        amount: Number(amount) || 15000,
        currency: currency || 'PKR',
        paymentMethod: paymentMethod || 'JAZZCASH',
        transactionId: transactionId || `TRX-${Date.now()}`,
        senderAccountNumber: senderAccountNumber || '',
        screenshotUrl: screenshotUrl || '',
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      data: proof,
      message: 'Payment proof recorded into Prisma database successfully.',
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

    const updated = await prisma.paymentProof.update({
      where: { id },
      data: {
        status,
        rejectionReason: rejectionReason || null,
        reviewedBy: reviewerName || 'Admin Control Room',
        reviewedAt: new Date(),
      },
    });

    // If approved, upgrade the user's tier in Prisma if user exists
    if (status === 'VERIFIED') {
      try {
        const targetTier = updated.planSlug === 'VIP' ? 'PREMIUM_PLUS' : 'PREMIUM';
        await prisma.user.update({
          where: { id: updated.userId },
          data: { subscriptionTier: targetTier as any },
        });

        // Record a PAID Invoice in Prisma
        await prisma.invoice.create({
          data: {
            userId: updated.userId,
            invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
            amount: updated.amount,
            currency: updated.currency,
            status: 'PAID',
            paymentMethod: updated.paymentMethod,
            planName: updated.planName,
          },
        });
      } catch (userUpErr) {
        console.warn('User subscription auto-upgrade error in DB:', userUpErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Payment proof ${status.toLowerCase()} and recorded in Prisma.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update payment proof.' },
      { status: 500 }
    );
  }
}
