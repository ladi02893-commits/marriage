import { NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge/server';
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
      totalUsersRes,
      verifiedUsersRes,
      premiumUsersRes,
      pendingVerifsRes,
      openReportsRes,
      pendingPaymentsRes,
      verifiedProofsRes,
      totalProfilesRes,
    ] = await Promise.all([
      insforgeAdmin.database.from('users').select('id', { count: 'exact', head: true }),
      insforgeAdmin.database.from('users').select('id', { count: 'exact', head: true }).eq('is_verified', true),
      insforgeAdmin.database.from('users').select('id', { count: 'exact', head: true }).neq('subscription_tier', 'FREE'),
      insforgeAdmin.database.from('verification_requests').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
      insforgeAdmin.database.from('abuse_reports').select('id', { count: 'exact', head: true }).eq('status', 'OPEN'),
      insforgeAdmin.database.from('payment_proofs').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
      insforgeAdmin.database.from('payment_proofs').select('amount').eq('status', 'VERIFIED'),
      insforgeAdmin.database.from('matrimonial_profiles').select('id', { count: 'exact', head: true }),
    ]);

    const totalUsers = totalUsersRes.count ?? 0;
    const verifiedUsers = verifiedUsersRes.count ?? 0;
    const premiumUsers = premiumUsersRes.count ?? 0;
    const pendingVerifs = pendingVerifsRes.count ?? 0;
    const openReports = openReportsRes.count ?? 0;
    const pendingPayments = pendingPaymentsRes.count ?? 0;
    const totalProfiles = totalProfilesRes.count ?? 0;
    const verifiedProofs = verifiedProofsRes.data || [];

    const totalRevenue = verifiedProofs.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);

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
      source: 'INSFORGE_POSTGRES_REALTIME',
      message: 'Live InsForge database statistics loaded.',
    });
  } catch (error: any) {
    console.warn('Admin stats DB fallback to INITIAL data:', error?.message);

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
