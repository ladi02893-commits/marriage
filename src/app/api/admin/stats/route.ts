import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  INITIAL_USERS,
  INITIAL_PROFILES,
  INITIAL_VERIFICATIONS,
  INITIAL_REPORTS,
  INITIAL_PAYMENT_PROOFS,
} from '@/lib/data-store';

export async function GET() {
  try {
    const [
      totalUsers,
      verifiedUsers,
      premiumUsers,
      pendingVerifs,
      openReports,
      pendingPayments,
      verifiedProofs,
      totalProfiles,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isVerified: true } }),
      prisma.user.count({ where: { subscriptionTier: { not: 'FREE' } } }),
      prisma.verificationRequest.count({ where: { status: 'PENDING' } }),
      prisma.abuseReport.count({ where: { status: 'OPEN' } }),
      prisma.paymentProof.count({ where: { status: 'PENDING' } }),
      prisma.paymentProof.findMany({
        where: { status: 'VERIFIED' },
        select: { amount: true },
      }),
      prisma.matrimonialProfile.count(),
    ]);

    const totalRevenue = verifiedProofs.reduce((acc, curr) => acc + curr.amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalProfiles,
        verifiedUsers,
        premiumUsers,
        pendingVerifs,
        openReports,
        pendingPayments,
        totalRevenue,
      },
      source: 'PRISMA_POSTGRES_REALTIME',
      message: 'Live database statistics loaded.',
    });
  } catch (error: any) {
    console.warn('Admin stats DB fallback to INITIAL data:', error?.message);

    // Fallback to INITIAL data store counts when DB is unavailable
    const initialTotalUsers = INITIAL_USERS.length;
    const initialVerifiedUsers = INITIAL_USERS.filter((u) => u.isVerified).length;
    const initialPremiumUsers = INITIAL_USERS.filter((u) => u.subscriptionTier !== 'FREE').length;
    const initialPendingVerifs = INITIAL_VERIFICATIONS.filter((v) => v.status === 'PENDING').length;
    const initialOpenReports = INITIAL_REPORTS.filter((r) => r.status === 'OPEN').length;
    const initialPendingPayments = INITIAL_PAYMENT_PROOFS.filter((p) => p.status === 'PENDING').length;
    const initialRevenue = INITIAL_PAYMENT_PROOFS
      .filter((p) => p.status === 'VERIFIED')
      .reduce((acc, curr) => acc + curr.amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: initialTotalUsers,
        totalProfiles: INITIAL_PROFILES.length,
        verifiedUsers: initialVerifiedUsers,
        premiumUsers: initialPremiumUsers,
        pendingVerifs: initialPendingVerifs,
        openReports: initialOpenReports,
        pendingPayments: initialPendingPayments,
        totalRevenue: initialRevenue,
      },
      source: 'DATA_STORE_FALLBACK',
      message: 'Statistics loaded from initial data store (DB unavailable).',
    });
  }
}

