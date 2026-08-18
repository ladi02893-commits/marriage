import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_USERS } from '@/lib/data-store';

export async function GET(req: NextRequest) {
  try {
    let dbUsers: any[] = [];
    try {
      dbUsers = await prisma.user.findMany({
        include: {
          profile: {
            include: { photos: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (dbErr) {
      console.warn('Prisma DB query fallback to initial users:', dbErr);
    }

    const data = dbUsers.length > 0 ? dbUsers : INITIAL_USERS;

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
      source: dbUsers.length > 0 ? 'PRISMA_DATABASE' : 'DATA_STORE',
      message: 'Users retrieved successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isVerified, accountStatus, subscriptionTier } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    const updateData: any = {};
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (accountStatus !== undefined) updateData.accountStatus = accountStatus;
    if (subscriptionTier !== undefined) updateData.subscriptionTier = subscriptionTier;

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'User updated successfully in Prisma database.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update user.' },
      { status: 500 }
    );
  }
}
