import { NextRequest, NextResponse } from 'next/server';
import { rejectCrossSiteMutation, requireUser } from '@/lib/api-auth';
import { insforgeAdmin } from '@/lib/insforge/server';

function mapNotification(row: Record<string, any>) {
  return {
    id: row.id, userId: row.user_id, title: row.title, description: row.description,
    type: row.type, isRead: row.is_read, linkUrl: row.link_url, createdAt: row.created_at,
  };
}

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { data, error } = await insforgeAdmin.database.from('notifications').select('*')
    .eq('user_id', auth.user.id).order('created_at', { ascending: false }).limit(200);
  if (error) return NextResponse.json({ success: false, error: 'Notifications could not be loaded.' }, { status: 503 });
  return NextResponse.json({ success: true, data: (data ?? []).map(mapNotification) });
}

export async function PATCH(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const auth = await requireUser();
  if (auth.response) return auth.response;
  try {
    const body = await request.json();
    let query = insforgeAdmin.database.from('notifications').update({ is_read: true }).eq('user_id', auth.user.id);
    if (body.all !== true) {
      if (typeof body.id !== 'string') return NextResponse.json({ success: false, error: 'Notification ID is required.' }, { status: 400 });
      query = query.eq('id', body.id);
    }
    const { error } = await query;
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification update failed:', error);
    return NextResponse.json({ success: false, error: 'Notification could not be updated.' }, { status: 500 });
  }
}
