import { NextRequest, NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge/server';
import { INITIAL_RECEIVING_ACCOUNTS } from '@/lib/data-store';

export async function GET() {
  try {
    let dbAccounts: any[] = [];
    try {
      const { data, error } = await insforgeAdmin.database
        .from('receiving_accounts')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data) {
        dbAccounts = data.map((acc: any) => ({
          ...acc,
          bankName: acc.bank_name || acc.bankName,
          accountTitle: acc.account_title || acc.accountTitle,
          accountNumber: acc.account_number || acc.accountNumber,
          branchName: acc.branch_name || acc.branchName,
          isActive: acc.is_active ?? acc.isActive ?? true,
          isPrimary: acc.is_primary ?? acc.isPrimary ?? false,
          createdAt: acc.created_at || acc.createdAt,
        }));
      }
    } catch (err) {
      console.warn('InsForge receiving accounts fetch fallback:', err);
    }

    const data = dbAccounts.length > 0 ? dbAccounts : INITIAL_RECEIVING_ACCOUNTS;

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
      source: dbAccounts.length > 0 ? 'INSFORGE_DATABASE' : 'DATA_STORE',
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

    const { data: created, error } = await insforgeAdmin.database
      .from('receiving_accounts')
      .insert([{
        provider: provider || 'BANK_TRANSFER',
        bank_name: bankName || 'Meezan Bank',
        account_title: accountTitle || 'Compatible Matrimonials',
        account_number: accountNumber || '0101-0101010101',
        iban: iban || null,
        branch_name: branchName || null,
        instructions: instructions || null,
        is_active: isActive !== undefined ? isActive : true,
        is_primary: isPrimary !== undefined ? isPrimary : false,
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Receiving account added to InsForge database.',
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

    const { error } = await insforgeAdmin.database
      .from('receiving_accounts')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Receiving account deleted from InsForge database.',
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
    if (isActive !== undefined) updateData.is_active = isActive;
    if (isPrimary !== undefined) updateData.is_primary = isPrimary;
    if (provider !== undefined) updateData.provider = provider;
    if (bankName !== undefined) updateData.bank_name = bankName;
    if (accountTitle !== undefined) updateData.account_title = accountTitle;
    if (accountNumber !== undefined) updateData.account_number = accountNumber;
    if (iban !== undefined) updateData.iban = iban;
    if (branchName !== undefined) updateData.branch_name = branchName;
    if (instructions !== undefined) updateData.instructions = instructions;

    const { data: updated, error } = await insforgeAdmin.database
      .from('receiving_accounts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Receiving account updated in InsForge database.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update receiving account.' },
      { status: 500 }
    );
  }
}
