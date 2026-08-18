import { NextRequest, NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge/server';
import { INITIAL_REPORTS } from '@/lib/data-store';

export async function GET() {
  try {
    let dbReports: any[] = [];
    try {
      const { data, error } = await insforgeAdmin.database
        .from('abuse_reports')
        .select('*, reporter:users!reporter_id(id, name, email), reportedUser:users!reported_user_id(id, name, email)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbReports = data.map((r: any) => ({
          ...r,
          reporterId: r.reporter_id || r.reporterId,
          reportedUserId: r.reported_user_id || r.reportedUserId,
          reportedUserName: r.reportedUser?.name || 'Reported User',
          reportedUserEmail: r.reportedUser?.email || '',
          reporterName: r.reporter?.name || 'Reporter',
          reporterEmail: r.reporter?.email || '',
          evidenceUrl: r.evidence_url || r.evidenceUrl,
          adminActionTaken: r.admin_action_taken || r.adminActionTaken,
          createdAt: r.created_at || r.createdAt,
        }));
      }
    } catch (err) {
      console.warn('InsForge reports fallback:', err);
    }

    const data = dbReports.length > 0 ? dbReports : INITIAL_REPORTS;

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
      source: dbReports.length > 0 ? 'INSFORGE_DATABASE' : 'DATA_STORE',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch abuse reports.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reporterId, reportedUserId, category, description, evidenceUrl } = body;

    const { data: created, error } = await insforgeAdmin.database
      .from('abuse_reports')
      .insert([{
        reporter_id: reporterId,
        reported_user_id: reportedUserId,
        category: category || 'FAKE_PROFILE',
        description: description || '',
        evidence_url: evidenceUrl || null,
        status: 'OPEN',
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Abuse report logged in InsForge database.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to submit abuse report.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, adminActionTaken } = body;

    const { data: updated, error } = await insforgeAdmin.database
      .from('abuse_reports')
      .update({
        status,
        admin_action_taken: adminActionTaken || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Report status updated to ${status} in InsForge database.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update abuse report.' },
      { status: 500 }
    );
  }
}
