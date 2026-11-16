import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_ROLES, rejectCrossSiteMutation, requireUser } from '@/lib/api-auth';
import { insforgeAdmin } from '@/lib/insforge/server';

async function getAuthorizedConversation(conversationId: string, userId: string, allowAdmin = false) {
  const { data, error } = await insforgeAdmin.database.from('conversations')
    .select('id,participant_a_id,participant_b_id')
    .eq('id', conversationId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  if (allowAdmin || data.participant_a_id === userId || data.participant_b_id === userId) return data;
  return null;
}

function mapMessage(message: Record<string, any>) {
  return {
    ...message,
    conversationId: message.conversation_id,
    senderId: message.sender_id,
    isRead: message.is_read,
    createdAt: message.created_at,
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const conversationId = request.nextUrl.searchParams.get('conversationId') ?? '';
  if (!conversationId) return NextResponse.json({ success: false, error: 'Conversation ID is required.' }, { status: 400 });
  try {
    const conversation = await getAuthorizedConversation(conversationId, auth.user.id, ADMIN_ROLES.has(auth.user.role));
    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found.' }, { status: 404 });
    }
    const isParticipant = conversation.participant_a_id === auth.user.id || conversation.participant_b_id === auth.user.id;
    if (isParticipant) {
      await insforgeAdmin.database.from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', auth.user.id)
        .eq('is_read', false);
    }
    const { data, error } = await insforgeAdmin.database.from('messages')
      .select('*,sender:users(id,name,avatar_url)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    const messages = (data ?? []).map(mapMessage);
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
    const conversation = await getAuthorizedConversation(conversationId, auth.user.id, false);
    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found.' }, { status: 404 });
    }
    const { data: message, error } = await insforgeAdmin.database.from('messages').insert([{
      conversation_id: conversationId,
      sender_id: auth.user.id,
      text: messageText,
      is_read: false,
    }]).select('*,sender:users(id,name,avatar_url)').single();
    if (error) throw error;
    const { error: updateError } = await insforgeAdmin.database.from('conversations').update({
      last_message_text: messageText.slice(0, 200),
      last_message_time: new Date().toISOString(),
    }).eq('id', conversationId);
    if (updateError) throw updateError;
    const recipientId = conversation.participant_a_id === auth.user.id ? conversation.participant_b_id : conversation.participant_a_id;
    const { error: notifError } = await insforgeAdmin.database.from('notifications').insert([{
      user_id: recipientId,
      title: `New message from ${auth.user.name}`,
      description: messageText.slice(0, 120),
      type: 'MESSAGE',
      link_url: `/dashboard/messages?conversationId=${encodeURIComponent(conversationId)}`,
    }]);
    if (notifError) console.error('Message notification failed:', notifError.message);
    return NextResponse.json({ success: true, data: mapMessage(message) }, { status: 201 });
  } catch (error) {
    console.error('Message send failed:', error);
    return NextResponse.json({ success: false, error: 'Message could not be sent.' }, { status: 500 });
  }
}
