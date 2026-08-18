import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_MESSAGES } from '@/lib/data-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    let dbMessages: any[] = [];
    try {
      if (conversationId) {
        dbMessages = await prisma.message.findMany({
          where: { conversationId },
          include: {
            sender: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'asc' },
        });
      }
    } catch (err) {
      console.warn('Prisma messages fallback:', err);
    }

    const fallbackData = conversationId && INITIAL_MESSAGES[conversationId]
      ? INITIAL_MESSAGES[conversationId]
      : Object.values(INITIAL_MESSAGES).flat();

    const data = dbMessages.length > 0 ? dbMessages : fallbackData;

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
      source: dbMessages.length > 0 ? 'PRISMA_DATABASE' : 'DATA_STORE',
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

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        text: text.trim(),
        isRead: false,
      },
    });

    // Update conversation last message
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageText: text.trim().slice(0, 200),
        lastMessageTime: new Date(),
        updatedAt: new Date(),
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      data: message,
      message: 'Message sent and stored in Prisma database.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to send message.' },
      { status: 500 }
    );
  }
}
