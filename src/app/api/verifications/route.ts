import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_VERIFICATIONS } from '@/lib/data-store';

export async function GET() {
  try {
    let dbVerifs: any[] = [];
    try {
      dbVerifs = await prisma.verificationRequest.findMany({
        include: { user: true },
        orderBy: { submittedAt: 'desc' },
      });
    } catch (err) {
      console.warn('Prisma verifications fallback:', err);
    }

    const data = dbVerifs.length > 0 ? dbVerifs : INITIAL_VERIFICATIONS;

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
      source: dbVerifs.length > 0 ? 'PRISMA_DATABASE' : 'DATA_STORE',
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

    const created = await prisma.verificationRequest.create({
      data: {
        userId,
        documentType: documentType || 'NATIONAL_ID',
        documentFrontUrl: documentFrontUrl || '',
        documentBackUrl: documentBackUrl || null,
        selfieUrl: selfieUrl || '',
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Verification request recorded in database.',
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

    const updated = await prisma.verificationRequest.update({
      where: { id },
      data: {
        status,
        reviewerNotes: reviewerNotes || null,
        reviewedAt: new Date(),
      },
    });

    if (status === 'APPROVED') {
      try {
        await prisma.user.update({
          where: { id: updated.userId },
          data: { isVerified: true },
        });
      } catch (uErr) {
        console.warn('User badge update notice:', uErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Verification ${status.toLowerCase()} in Prisma database.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update verification.' },
      { status: 500 }
    );
  }
}
