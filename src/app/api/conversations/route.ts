import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_CONVERSATIONS } from '@/lib/data-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    let dbConversations: any[] = [];
    try {
      const where: any = {};
      if (userId) {
        where.OR = [{ participantAId: userId }, { participantBId: userId }];
      }

      dbConversations = await prisma.conversation.findMany({
        where,
        include: {
          participantA: { select: { id: true, name: true, avatarUrl: true } },
          participantB: { select: { id: true, name: true, avatarUrl: true } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { updatedAt: 'desc' },
      });
    } catch (err) {
      console.warn('Prisma conversations fallback:', err);
    }

    const data = dbConversations.length > 0 ? dbConversations : INITIAL_CONVERSATIONS;

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
      source: dbConversations.length > 0 ? 'PRISMA_DATABASE' : 'DATA_STORE',
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
    const existing = await prisma.conversation.findFirst({
      where: {
        OR: [
          { participantAId, participantBId },
          { participantAId: participantBId, participantBId: participantAId },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ success: true, data: existing, created: false });
    }

    const conversation = await prisma.conversation.create({
      data: {
        participantAId,
        participantBId,
        lastMessageText: 'Conversation started',
        lastMessageTime: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: conversation,
      created: true,
      message: 'Conversation created in Prisma database.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create conversation.' },
      { status: 500 }
    );
  }
}
