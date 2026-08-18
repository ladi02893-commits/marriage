import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_REPORTS } from '@/lib/data-store';

export async function GET() {
  try {
    let dbReports: any[] = [];
    try {
      dbReports = await prisma.abuseReport.findMany({
        include: {
          reporter: { select: { id: true, name: true, email: true } },
          reportedUser: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      console.warn('Prisma reports fallback:', err);
    }

    const data = dbReports.length > 0 ? dbReports : INITIAL_REPORTS;

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
      source: dbReports.length > 0 ? 'PRISMA_DATABASE' : 'DATA_STORE',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch abuse reports.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reporterId, reportedUserId, category, description, evidenceUrl } = body;

    const created = await prisma.abuseReport.create({
      data: {
        reporterId,
        reportedUserId,
        category: category || 'FAKE_PROFILE',
        description: description || '',
        evidenceUrl: evidenceUrl || null,
        status: 'OPEN',
      },
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Abuse report logged in Prisma database.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to submit abuse report.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, adminActionTaken } = body;

    const updated = await prisma.abuseReport.update({
      where: { id },
      data: {
        status,
        adminActionTaken: adminActionTaken || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Report status updated to ${status} in Prisma database.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update abuse report.' },
      { status: 500 }
    );
  }
}
