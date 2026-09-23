import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_ROLES, rejectCrossSiteMutation, requireUser } from '@/lib/api-auth';
import { insforgeAdmin } from '@/lib/insforge/server';

const SUPPORT_SELECT = '*,user:users(id,name,email,profile_id_code),messages:ticket_messages(*)';

function mapTicket(row: Record<string, any>) {
  const user = Array.isArray(row.user) ? row.user[0] : row.user;
  return {
    id: row.id,
    ticketCode: `SUP-${String(row.id).replaceAll('-', '').slice(0, 8).toUpperCase()}`,
    userId: row.user_id,
    userName: user?.name ?? 'Member',
    userEmail: user?.email ?? '',
    userProfileIdCode: user?.profile_id_code ?? undefined,
    subject: row.subject,
    category: row.category,
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    messages: (row.messages ?? []).sort((a: ApiRecord, b: ApiRecord) => String(a.created_at).localeCompare(String(b.created_at))).map((message: ApiRecord) => ({
      id: message.id,
      sender: message.sender,
      senderName: message.sender_name,
      text: message.text,
      timestamp: message.created_at,
    })),
  };
}

type ApiRecord = Record<string, any>;

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  let query = insforgeAdmin.database.from('support_tickets').select(SUPPORT_SELECT);
  if (!ADMIN_ROLES.has(auth.user.role)) query = query.eq('user_id', auth.user.id);
  const { data, error } = await query.order('updated_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: 'Support tickets could not be loaded.' }, { status: 503 });
  return NextResponse.json({ success: true, data: (data ?? []).map(mapTicket) });
}

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const auth = await requireUser();
  if (auth.response) return auth.response;
  try {
    const body = await request.json();
    const subject = typeof body.subject === 'string' ? body.subject.trim().slice(0, 180) : '';
    const message = typeof body.message === 'string' ? body.message.trim().slice(0, 4000) : '';
    const category = typeof body.category === 'string' ? body.category.toUpperCase() : 'GENERAL';
    if (subject.length < 3 || message.length < 10) {
      return NextResponse.json({ success: false, error: 'A subject and detailed message are required.' }, { status: 400 });
    }
    const { data: ticket, error } = await insforgeAdmin.database.from('support_tickets').insert([{
      user_id: auth.user.id, subject, category, status: 'OPEN', priority: 'NORMAL',
    }]).select().single();
    if (error || !ticket) throw error ?? new Error('Ticket insert failed.');
    const { error: messageError } = await insforgeAdmin.database.from('ticket_messages').insert([{
      ticket_id: ticket.id, sender: 'USER', sender_name: auth.user.name, text: message,
    }]);
    if (messageError) {
      await insforgeAdmin.database.from('support_tickets').delete().eq('id', ticket.id);
      throw messageError;
    }
    const { data: created, error: readError } = await insforgeAdmin.database.from('support_tickets').select(SUPPORT_SELECT).eq('id', ticket.id).single();
    if (readError) throw readError;
    return NextResponse.json({ success: true, data: mapTicket(created) }, { status: 201 });
  } catch (error) {
    console.error('Support ticket creation failed:', error);
    return NextResponse.json({ success: false, error: 'Support ticket could not be created.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const auth = await requireUser();
  if (auth.response) return auth.response;
  try {
    const body = await request.json();
    const id = typeof body.id === 'string' ? body.id : '';
    const { data: ticket, error: ticketError } = await insforgeAdmin.database.from('support_tickets').select('id,user_id,status').eq('id', id).maybeSingle();
    if (ticketError) throw ticketError;
    if (!ticket) return NextResponse.json({ success: false, error: 'Support ticket not found.' }, { status: 404 });
    const admin = ADMIN_ROLES.has(auth.user.role);
    if (!admin && ticket.user_id !== auth.user.id) return NextResponse.json({ success: false, error: 'You cannot access this ticket.' }, { status: 403 });

    if (typeof body.text === 'string' && body.text.trim()) {
      const { error } = await insforgeAdmin.database.from('ticket_messages').insert([{
        ticket_id: id,
        sender: admin ? 'AGENT' : 'USER',
        sender_name: auth.user.name,
        text: body.text.trim().slice(0, 4000),
      }]);
      if (error) throw error;
      const { error: updateError } = await insforgeAdmin.database.from('support_tickets').update({
        status: admin ? 'WAITING_FOR_USER' : 'IN_PROGRESS',
      }).eq('id', id);
      if (updateError) throw updateError;
    } else if (typeof body.status === 'string') {
      if (!admin || !['OPEN', 'IN_PROGRESS', 'WAITING_FOR_USER', 'RESOLVED', 'CLOSED'].includes(body.status)) {
        return NextResponse.json({ success: false, error: 'Administrator access and a valid status are required.' }, { status: 403 });
      }
      const { error } = await insforgeAdmin.database.from('support_tickets').update({ status: body.status }).eq('id', id);
      if (error) throw error;
    } else {
      return NextResponse.json({ success: false, error: 'Reply text or status is required.' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Support ticket update failed:', error);
    return NextResponse.json({ success: false, error: 'Support ticket could not be updated.' }, { status: 500 });
  }
}
