import { NextRequest, NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge/server';
import { INITIAL_VERIFICATIONS } from '@/lib/data-store';

export async function GET() {
  try {
    let dbVerifs: any[] = [];
    try {
      const { data, error } = await insforgeAdmin.database
        .from('verification_requests')
        .select('*, user:users(id, name, email, avatar_url, role)')
        .order('submitted_at', { ascending: false });

      if (!error && data) {
        dbVerifs = data.map((v: any) => ({
          ...v,
          userId: v.user_id || v.userId,
          documentType: v.document_type || v.documentType,
          documentFrontUrl: v.document_front_url || v.documentFrontUrl,
          documentBackUrl: v.document_back_url || v.documentBackUrl,
          selfieUrl: v.selfie_url || v.selfieUrl,
          reviewerNotes: v.reviewer_notes || v.reviewerNotes,
          submittedAt: v.submitted_at || v.submittedAt,
          reviewedAt: v.reviewed_at || v.reviewedAt,
        }));
      }
    } catch (err) {
      console.warn('InsForge verifications fallback:', err);
    }

    const data = dbVerifs.length > 0 ? dbVerifs : INITIAL_VERIFICATIONS;

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
      source: dbVerifs.length > 0 ? 'INSFORGE_DATABASE' : 'DATA_STORE',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch verifications.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, documentType, documentFrontUrl, documentBackUrl, selfieUrl } = body;

    const { data: created, error } = await insforgeAdmin.database
      .from('verification_requests')
      .insert([{
        user_id: userId,
        document_type: documentType || 'NATIONAL_ID',
        document_front_url: documentFrontUrl || '',
        document_back_url: documentBackUrl || null,
        selfie_url: selfieUrl || '',
        status: 'PENDING',
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Verification request recorded in InsForge database.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create verification request.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, reviewerNotes } = body;

    const { data: updated, error } = await insforgeAdmin.database
      .from('verification_requests')
      .update({
        status,
        reviewer_notes: reviewerNotes || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) {
      return NextResponse.json({ success: false, error: error?.message || 'Failed to update verification' }, { status: 500 });
    }

    if (status === 'APPROVED') {
      try {
        await insforgeAdmin.database
          .from('users')
          .update({ is_verified: true })
          .eq('id', updated.user_id);
      } catch (uErr) {
        console.warn('User badge update notice:', uErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Verification ${status.toLowerCase()} in InsForge database.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update verification.' },
      { status: 500 }
    );
  }
}
