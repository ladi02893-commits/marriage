import { NextRequest, NextResponse } from 'next/server';
import { rejectCrossSiteMutation, requireAdmin, requireUser } from '@/lib/api-auth';
import { insforgeAdmin } from '@/lib/insforge/server';

function mapReport(report: Record<string, any>) {
  return {
    ...report,
    reporterId: report.reporter_id,
    reportedUserId: report.reported_user_id,
    reportedUserName: report.reportedUser?.name ?? 'Reported user',
    reportedUserEmail: report.reportedUser?.email ?? '',
    reporterName: report.reporter?.name ?? 'Reporter',
    reporterEmail: report.reporter?.email ?? '',
    evidenceUrl: report.evidence_url,
    adminActionTaken: report.admin_action_taken,
    createdAt: report.created_at,
  };
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  try {
    const { data, error } = await insforgeAdmin.database.from('abuse_reports')
      .select('*,reporter:users!reporter_id(id,name,email),reportedUser:users!reported_user_id(id,name,email)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ success: true, data: (data ?? []).map(mapReport), total: data?.length ?? 0 });
  } catch (error) {
    console.error('Reports fetch failed:', error);
    return NextResponse.json({ success: false, error: 'Reports could not be loaded.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const auth = await requireUser();
  if (auth.response) return auth.response;
  try {
    const body = await request.json();
    const reportedUserId = typeof body.reportedUserId === 'string' ? body.reportedUserId : '';
    const category = typeof body.category === 'string' ? body.category.toUpperCase() : '';
    const description = typeof body.description === 'string' ? body.description.trim().slice(0, 2000) : '';
    const categories = ['FAKE_PROFILE', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'SPAM', 'SCAM', 'OTHER'];
    if (!reportedUserId || reportedUserId === auth.user.id || !categories.includes(category) || description.length < 10) {
      return NextResponse.json({ success: false, error: 'A valid report target, category, and description are required.' }, { status: 400 });
    }
    const { data: target, error: targetError } = await insforgeAdmin.database.from('users').select('id').eq('id', reportedUserId).maybeSingle();
    if (targetError) throw targetError;
    if (!target) return NextResponse.json({ success: false, error: 'Reported user not found.' }, { status: 404 });
    const { data: created, error } = await insforgeAdmin.database.from('abuse_reports').insert([{
      reporter_id: auth.user.id,
      reported_user_id: reportedUserId,
      category,
      description,
      evidence_url: typeof body.evidenceUrl === 'string' ? body.evidenceUrl.trim().slice(0, 500) || null : null,
      status: 'OPEN',
    }]).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data: mapReport(created), message: 'Report submitted for review.' }, { status: 201 });
  } catch (error) {
    console.error('Report submission failed:', error);
    return NextResponse.json({ success: false, error: 'Report could not be submitted.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  try {
    const body = await request.json();
    const status = typeof body.status === 'string' ? body.status.toUpperCase() : '';
    if (typeof body.id !== 'string' || !['OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Valid report ID and status are required.' }, { status: 400 });
    }
    const { data, error } = await insforgeAdmin.database.from('abuse_reports').update({
      status,
      admin_action_taken: typeof body.adminActionTaken === 'string' ? body.adminActionTaken.trim().slice(0, 1000) : null,
    }).eq('id', body.id).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data: mapReport(data) });
  } catch (error) {
    console.error('Report review failed:', error);
    return NextResponse.json({ success: false, error: 'Report could not be updated.' }, { status: 500 });
  }
}
