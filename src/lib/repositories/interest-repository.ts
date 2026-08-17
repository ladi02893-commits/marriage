import { prisma } from '@/lib/db';
import { InterestStatus } from '@prisma/client';

export class InterestRepository {
  static async sendInterest(senderId: string, senderProfileId: string, receiverId: string, receiverProfileId: string, message?: string) {
    return prisma.interestRequest.create({
      data: {
        senderId,
        senderProfileId,
        receiverId,
        receiverProfileId,
        message,
        status: InterestStatus.PENDING,
      },
    });
  }

  static async updateStatus(interestId: string, status: InterestStatus) {
    return prisma.interestRequest.update({
      where: { id: interestId },
      data: { status },
    });
  }

  static async getUserInterests(userId: string) {
    const [received, sent] = await Promise.all([
      prisma.interestRequest.findMany({
        where: { receiverId: userId },
        include: {
          sender: { select: { id: true, name: true, avatarUrl: true, isVerified: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.interestRequest.findMany({
        where: { senderId: userId },
        include: {
          receiver: { select: { id: true, name: true, avatarUrl: true, isVerified: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { received, sent };
  }
}
