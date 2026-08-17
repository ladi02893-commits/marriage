import { NextResponse } from 'next/server';
import {
  INITIAL_USERS,
  INITIAL_PROFILES,
  INITIAL_VERIFICATIONS,
  INITIAL_REPORTS,
  INITIAL_PAYMENT_PROOFS,
} from '@/lib/data-store';

export async function GET() {
  try {
    const totalUsers = INITIAL_USERS.length;
    const verifiedUsers = INITIAL_USERS.filter((u) => u.isVerified).length;
    const premiumUsers = INITIAL_USERS.filter((u) => u.subscriptionTier !== 'FREE').length;
    const pendingVerifs = INITIAL_VERIFICATIONS.filter((v) => v.status === 'PENDING').length;
    const openReports = INITIAL_REPORTS.filter((r) => r.status === 'OPEN').length;

    // Real verified monthly recurring revenue calculated from approved payment transactions
    const totalRevenue = INITIAL_PAYMENT_PROOFS
      .filter((p) => p.status === 'VERIFIED')
      .reduce((acc, curr) => acc + curr.amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        verifiedUsers,
        premiumUsers,
        pendingVerifs,
        openReports,
        totalRevenue,
      },
      message: 'Admin statistics loaded.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to load stats.' },
      { status: 500 }
    );
  }
}
