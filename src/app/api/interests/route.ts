import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_INTERESTS } from '@/lib/data-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    let dbInterests: any[] = [];
    try {
      const where: any = {};
      if (userId) {
        where.OR = [{ senderId: userId }, { receiverId: userId }];
      }

      dbInterests = await prisma.interestRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      console.warn('Prisma interest fetch fallback:', err);
    }

    const data = dbInterests.length > 0 ? dbInterests : INITIAL_INTERESTS;

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
      source: dbInterests.length > 0 ? 'PRISMA_DATABASE' : 'DATA_STORE',
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

    const interest = await prisma.interestRequest.create({
      data: {
        senderId,
        senderProfileId: senderProfileId || senderId,
        receiverId,
        receiverProfileId: receiverProfileId || receiverId,
        message: message || '',
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      data: interest,
      message: 'Interest proposal recorded in Prisma database.',
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

    const updated = await prisma.interestRequest.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Interest status updated in Prisma database.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update interest status.' },
      { status: 500 }
    );
  }
}
