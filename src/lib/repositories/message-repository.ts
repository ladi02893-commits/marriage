import { prisma } from '@/lib/db';

export class MessageRepository {
  static async getConversationsForUser(userId: string) {
    return prisma.conversation.findMany({
      where: {
        OR: [{ participantAId: userId }, { participantBId: userId }],
      },
      include: {
        participantA: { select: { id: true, name: true, avatarUrl: true, isVerified: true } },
        participantB: { select: { id: true, name: true, avatarUrl: true, isVerified: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  static async getMessagesByConversationId(conversationId: string) {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }

  static async sendMessage(conversationId: string, senderId: string, text: string) {
    const [message] = await Promise.all([
      prisma.message.create({
        data: {
          conversationId,
          senderId,
          text,
        },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageText: text,
          lastMessageTime: new Date(),
        },
      }),
    ]);

    return message;
  }
}
