import { NextRequest, NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge/server';
import { INITIAL_MESSAGES } from '@/lib/data-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    let dbMessages: any[] = [];
    try {
      if (conversationId) {
        const { data, error } = await insforgeAdmin.database
          .from('messages')
          .select('*, sender:users(id, name, avatar_url)')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (!error && data) {
          dbMessages = data.map((msg: any) => ({
            ...msg,
            conversationId: msg.conversation_id || msg.conversationId,
            senderId: msg.sender_id || msg.senderId,
            isRead: msg.is_read ?? msg.isRead ?? false,
            createdAt: msg.created_at || msg.createdAt,
          }));
        }
      }
    } catch (err) {
      console.warn('InsForge messages fallback:', err);
    }

    const fallbackData = conversationId && INITIAL_MESSAGES[conversationId]
      ? INITIAL_MESSAGES[conversationId]
      : Object.values(INITIAL_MESSAGES).flat();

    const data = dbMessages.length > 0 ? dbMessages : fallbackData;

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
      source: dbMessages.length > 0 ? 'INSFORGE_DATABASE' : 'DATA_STORE',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, senderId, text } = body;

    if (!conversationId || !senderId || !text) {
      return NextResponse.json(
        { success: false, error: 'conversationId, senderId, and text are required.' },
        { status: 400 }
      );
    }

    const { data: message, error } = await insforgeAdmin.database
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        sender_id: senderId,
        text: text.trim(),
        is_read: false,
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Update conversation last message
    await insforgeAdmin.database
      .from('conversations')
      .update({
        last_message_text: text.trim().slice(0, 200),
        last_message_time: new Date().toISOString(),
      })
      .eq('id', conversationId);

    return NextResponse.json({
      success: true,
      data: message,
      message: 'Message sent and stored in InsForge database.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to send message.' },
      { status: 500 }
    );
  }
}
