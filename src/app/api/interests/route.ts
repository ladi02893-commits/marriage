import { NextRequest, NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge/server';
import { INITIAL_INTERESTS } from '@/lib/data-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    let dbInterests: any[] = [];
    try {
      let query = insforgeAdmin.database
        .from('interest_requests')
        .select('*, sender:users!sender_id(name, avatar_url), receiver:users!receiver_id(name, avatar_url)');

      if (userId) {
        query = query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
      }

      const { data: rawInterests, error } = await query.order('created_at', { ascending: false });

      if (!error && rawInterests) {
        dbInterests = rawInterests.map((interest: any) => ({
          ...interest,
          senderId: interest.sender_id || interest.senderId,
          senderProfileId: interest.sender_profile_id || interest.senderProfileId,
          receiverId: interest.receiver_id || interest.receiverId,
          receiverProfileId: interest.receiver_profile_id || interest.receiverProfileId,
          senderName: interest.sender?.name || 'Unknown',
          senderPhoto: interest.sender?.avatar_url || null,
          receiverName: interest.receiver?.name || 'Unknown',
          receiverPhoto: interest.receiver?.avatar_url || null,
        }));
      }
    } catch (err) {
      console.warn('InsForge interest fetch fallback:', err);
    }

    const data = dbInterests.length > 0 ? dbInterests : INITIAL_INTERESTS;

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
      source: dbInterests.length > 0 ? 'INSFORGE_DATABASE' : 'DATA_STORE',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch interest requests.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { senderId, senderProfileId, receiverId, receiverProfileId, message } = body;

    if (!senderId || !receiverId) {
      return NextResponse.json(
        { success: false, error: 'senderId and receiverId are required.' },
        { status: 400 }
      );
    }

    const { data: interest, error } = await insforgeAdmin.database
      .from('interest_requests')
      .insert([{
        sender_id: senderId,
        sender_profile_id: senderProfileId || senderId,
        receiver_id: receiverId,
        receiver_profile_id: receiverProfileId || receiverId,
        message: message || '',
        status: 'PENDING',
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: interest,
      message: 'Interest proposal recorded in InsForge database.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to record interest.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'id and status are required.' },
        { status: 400 }
      );
    }

    const { data: updated, error } = await insforgeAdmin.database
      .from('interest_requests')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Interest status updated in InsForge database.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update interest status.' },
      { status: 500 }
    );
  }
}
