import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    console.error('Admin stats DB error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load real-time stats.' },
      { status: 500 }
    );
  }
}
