import { NextRequest, NextResponse } from 'next/server';
import { rejectCrossSiteMutation, requireUser } from '@/lib/api-auth';
import { insforgeAdmin } from '@/lib/insforge/server';

const CONVERSATION_SELECT = '*,participantA:users!participant_a_id(id,name,avatar_url),participantB:users!participant_b_id(id,name,avatar_url),messages(id,text,created_at,sender_id,is_read)';

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  try {
    const { data, error } = await insforgeAdmin.database.from('conversations')
      .select(CONVERSATION_SELECT)
      .or(`participant_a_id.eq.${auth.user.id},participant_b_id.eq.${auth.user.id}`)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ success: true, data: data ?? [], total: data?.length ?? 0 });
  } catch (error) {
    console.error('Conversations fetch failed:', error);
    return NextResponse.json({ success: false, error: 'Conversations could not be loaded.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const auth = await requireUser();
  if (auth.response) return auth.response;
  try {
    const body = await request.json();
    const otherUserId = typeof body.participantBId === 'string'
      ? body.participantBId
      : typeof body.userId === 'string' ? body.userId : '';
    if (!otherUserId || otherUserId === auth.user.id) {
      return NextResponse.json({ success: false, error: 'A valid participant is required.' }, { status: 400 });
    }

    const [outgoing, incoming] = await Promise.all([
      insforgeAdmin.database.from('interest_requests').select('id').eq('sender_id', auth.user.id).eq('receiver_id', otherUserId).eq('status', 'ACCEPTED').maybeSingle(),
      insforgeAdmin.database.from('interest_requests').select('id').eq('sender_id', otherUserId).eq('receiver_id', auth.user.id).eq('status', 'ACCEPTED').maybeSingle(),
    ]);
    if (outgoing.error || incoming.error) throw outgoing.error ?? incoming.error;
    if (!outgoing.data && !incoming.data) {
      return NextResponse.json({ success: false, error: 'Messaging is available after an interest is accepted.' }, { status: 403 });
    }

    const [participantAId, participantBId] = [auth.user.id, otherUserId].sort();
    const { data: existing, error: existingError } = await insforgeAdmin.database.from('conversations')
      .select(CONVERSATION_SELECT)
      .eq('participant_a_id', participantAId)
      .eq('participant_b_id', participantBId)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) return NextResponse.json({ success: true, data: existing, created: false });

    const { data: conversation, error } = await insforgeAdmin.database.from('conversations').insert([{
      participant_a_id: participantAId,
      participant_b_id: participantBId,
      last_message_text: null,
      last_message_time: null,
    }]).select(CONVERSATION_SELECT).single();
    if (error) throw error;
    return NextResponse.json({ success: true, data: conversation, created: true }, { status: 201 });
  } catch (error) {
    console.error('Conversation creation failed:', error);
    return NextResponse.json({ success: false, error: 'Conversation could not be created.' }, { status: 500 });
  }
}
