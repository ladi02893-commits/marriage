import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_RECEIVING_ACCOUNTS } from '@/lib/data-store';

export async function GET() {
  try {
    let dbAccounts: any[] = [];
    try {
      dbAccounts = await prisma.receivingAccount.findMany({
        orderBy: { createdAt: 'asc' },
      });
    } catch (err) {
      console.warn('Prisma receiving accounts fetch fallback:', err);
    }

    const data = dbAccounts.length > 0 ? dbAccounts : INITIAL_RECEIVING_ACCOUNTS;

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
      source: dbAccounts.length > 0 ? 'PRISMA_DATABASE' : 'DATA_STORE',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch receiving accounts.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, bankName, accountTitle, accountNumber, iban, branchName, instructions, isActive, isPrimary } = body;

    const created = await prisma.receivingAccount.create({
      data: {
        provider: provider || 'BANK_TRANSFER',
        bankName: bankName || 'Meezan Bank',
        accountTitle: accountTitle || 'Compatible Matrimonials',
        accountNumber: accountNumber || '0101-0101010101',
        iban: iban || null,
        branchName: branchName || null,
        instructions: instructions || null,
        isActive: isActive !== undefined ? isActive : true,
        isPrimary: isPrimary !== undefined ? isPrimary : false,
      },
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Receiving account added to Prisma database.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create receiving account.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'id parameter is required.' }, { status: 400 });
    }

    await prisma.receivingAccount.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Receiving account deleted from Prisma database.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete receiving account.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isActive, isPrimary, provider, bankName, accountTitle, accountNumber, iban, branchName, instructions } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required.' }, { status: 400 });
    }

    const updateData: any = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isPrimary !== undefined) updateData.isPrimary = isPrimary;
    if (provider !== undefined) updateData.provider = provider;
    if (bankName !== undefined) updateData.bankName = bankName;
    if (accountTitle !== undefined) updateData.accountTitle = accountTitle;
    if (accountNumber !== undefined) updateData.accountNumber = accountNumber;
    if (iban !== undefined) updateData.iban = iban;
    if (branchName !== undefined) updateData.branchName = branchName;
    if (instructions !== undefined) updateData.instructions = instructions;

    const updated = await prisma.receivingAccount.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Receiving account updated in Prisma database.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update receiving account.' },
      { status: 500 }
    );
  }
}

