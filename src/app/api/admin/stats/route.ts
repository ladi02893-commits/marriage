import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { insforgeAdmin } from '@/lib/insforge/server';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  try {
    const results = await Promise.all([
      insforgeAdmin.database.from('users').select('id', { count: 'exact', head: true }),
      insforgeAdmin.database.from('users').select('id', { count: 'exact', head: true }).eq('is_verified', true),
      insforgeAdmin.database.from('users').select('id', { count: 'exact', head: true }).neq('subscription_tier', 'FREE'),
      insforgeAdmin.database.from('verification_requests').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
      insforgeAdmin.database.from('abuse_reports').select('id', { count: 'exact', head: true }).eq('status', 'OPEN'),
      insforgeAdmin.database.from('payment_proofs').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
      insforgeAdmin.database.from('payment_proofs').select('amount').eq('status', 'VERIFIED'),
      insforgeAdmin.database.from('matrimonial_profiles').select('id', { count: 'exact', head: true }),
    ]);
    const firstError = results.find((result) => result.error)?.error;
    if (firstError) throw firstError;
    return NextResponse.json({
      success: true,
      data: {
        totalUsers: results[0].count ?? 0,
        verifiedUsers: results[1].count ?? 0,
        premiumUsers: results[2].count ?? 0,
        pendingVerifs: results[3].count ?? 0,
        openReports: results[4].count ?? 0,
        pendingPayments: results[5].count ?? 0,
        totalRevenue: (results[6].data ?? []).reduce((sum, row) => sum + Number(row.amount ?? 0), 0),
        totalProfiles: results[7].count ?? 0,
      },
    });
  } catch (error) {
    console.error('Admin stats failed:', error);
    return NextResponse.json({ success: false, error: 'Statistics could not be loaded.' }, { status: 503 });
  }
}
