import { NextRequest, NextResponse } from 'next/server';
import { rejectCrossSiteMutation, requireUser } from '@/lib/api-auth';
import { insforgeAdmin } from '@/lib/insforge/server';

async function getOwnedConversation(conversationId: string, userId: string) {
  const { data, error } = await insforgeAdmin.database.from('conversations')
    .select('id,participant_a_id,participant_b_id')
    .eq('id', conversationId)
    .maybeSingle();
  if (error) throw error;
  return data && (data.participant_a_id === userId || data.participant_b_id === userId) ? data : null;
}

export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const conversationId = request.nextUrl.searchParams.get('conversationId') ?? '';
  if (!conversationId) return NextResponse.json({ success: false, error: 'Conversation ID is required.' }, { status: 400 });
  try {
    if (!(await getOwnedConversation(conversationId, auth.user.id))) {
      return NextResponse.json({ success: false, error: 'Conversation not found.' }, { status: 404 });
    }
    const { data, error } = await insforgeAdmin.database.from('messages')
      .select('*,sender:users(id,name,avatar_url)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    const messages = (data ?? []).map((message) => ({
      ...message,
      conversationId: message.conversation_id,
      senderId: message.sender_id,
      isRead: message.is_read,
      createdAt: message.created_at,
    }));
    return NextResponse.json({ success: true, data: messages, total: messages.length });
  } catch (error) {
    console.error('Messages fetch failed:', error);
    return NextResponse.json({ success: false, error: 'Messages could not be loaded.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const auth = await requireUser();
  if (auth.response) return auth.response;
  try {
    const body = await request.json();
    const conversationId = typeof body.conversationId === 'string' ? body.conversationId : '';
    const messageText = typeof body.text === 'string' ? body.text.trim().slice(0, 4000) : '';
    if (!conversationId || !messageText) {
      return NextResponse.json({ success: false, error: 'Conversation and message text are required.' }, { status: 400 });
    }
    if (!(await getOwnedConversation(conversationId, auth.user.id))) {
      return NextResponse.json({ success: false, error: 'Conversation not found.' }, { status: 404 });
    }
    const { data: message, error } = await insforgeAdmin.database.from('messages').insert([{
      conversation_id: conversationId,
      sender_id: auth.user.id,
      text: messageText,
      is_read: false,
    }]).select().single();
    if (error) throw error;
    const { error: updateError } = await insforgeAdmin.database.from('conversations').update({
      last_message_text: messageText.slice(0, 200),
      last_message_time: new Date().toISOString(),
    }).eq('id', conversationId);
    if (updateError) throw updateError;
    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    console.error('Message send failed:', error);
    return NextResponse.json({ success: false, error: 'Message could not be sent.' }, { status: 500 });
  }
}
