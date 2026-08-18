import { NextRequest, NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge/server';
import { INITIAL_CONVERSATIONS } from '@/lib/data-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    let dbConversations: any[] = [];
    try {
      let query = insforgeAdmin.database
        .from('conversations')
        .select('*, participantA:users!participant_a_id(id, name, avatar_url), participantB:users!participant_b_id(id, name, avatar_url), messages(id, text, created_at, sender_id, is_read)');

      if (userId) {
        query = query.or(`participant_a_id.eq.${userId},participant_b_id.eq.${userId}`);
      }

      const { data, error } = await query.order('updated_at', { ascending: false });

      if (!error && data) {
        dbConversations = data;
      }
    } catch (err) {
      console.warn('InsForge conversations fallback:', err);
    }

    const data = dbConversations.length > 0 ? dbConversations : INITIAL_CONVERSATIONS;

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
      source: dbConversations.length > 0 ? 'INSFORGE_DATABASE' : 'DATA_STORE',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { participantAId, participantBId } = body;

    if (!participantAId || !participantBId) {
      return NextResponse.json(
        { success: false, error: 'participantAId and participantBId are required.' },
        { status: 400 }
      );
    }

    // Try to find existing conversation first
    const { data: existing } = await insforgeAdmin.database
      .from('conversations')
      .select('*')
      .or(`and(participant_a_id.eq.${participantAId},participant_b_id.eq.${participantBId}),and(participant_a_id.eq.${participantBId},participant_b_id.eq.${participantAId})`)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true, data: existing, created: false });
    }

    const { data: conversation, error } = await insforgeAdmin.database
      .from('conversations')
      .insert([{
        participant_a_id: participantAId,
        participant_b_id: participantBId,
        last_message_text: 'Conversation started',
        last_message_time: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: conversation,
      created: true,
      message: 'Conversation created in InsForge database.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create conversation.' },
      { status: 500 }
    );
  }
}
