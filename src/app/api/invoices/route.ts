import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_INVOICES } from '@/lib/data-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    let dbInvoices: any[] = [];
    try {
      const where: any = {};
      if (userId) where.userId = userId;

      dbInvoices = await prisma.invoice.findMany({
        where,
        orderBy: { date: 'desc' },
      });
    } catch (err) {
      console.warn('Prisma invoices fetch fallback:', err);
    }

    const data = dbInvoices.length > 0 ? dbInvoices : INITIAL_INVOICES;

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
      source: dbInvoices.length > 0 ? 'PRISMA_DATABASE' : 'DATA_STORE',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, invoiceNumber, amount, currency, status, paymentMethod, planName } = body;

    const invoice = await prisma.invoice.create({
      data: {
        userId: userId || 'anonymous',
        invoiceNumber: invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
        amount: Number(amount) || 0,
        currency: currency || 'PKR',
        status: status || 'PAID',
        paymentMethod: paymentMethod || 'Instant Card Gateway',
        planName: planName || 'Elite Executive Plan',
      },
    });

    return NextResponse.json({
      success: true,
      data: invoice,
      message: 'Invoice created successfully in Prisma database.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to record invoice in database.' },
      { status: 500 }
    );
  }
}
