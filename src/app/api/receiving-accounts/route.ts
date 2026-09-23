import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_ROLES, rejectCrossSiteMutation, requireAdmin } from '@/lib/api-auth';
import { getCurrentUserFromCookies } from '@/lib/auth';
import { insforgeAdmin } from '@/lib/insforge/server';

function mapAccount(account: Record<string, any>) {
  return {
    ...account,
    bankName: account.bank_name,
    accountTitle: account.account_title,
    accountNumber: account.account_number,
    branchName: account.branch_name,
    isActive: account.is_active,
    isPrimary: account.is_primary,
    createdAt: account.created_at,
  };
}

export async function GET() {
  try {
    const user = await getCurrentUserFromCookies();
    let query = insforgeAdmin.database.from('receiving_accounts').select('*');
    if (!user || !ADMIN_ROLES.has(user.role)) query = query.eq('is_active', true);
    const { data, error } = await query.order('is_primary', { ascending: false }).order('created_at', { ascending: true });
    if (error) throw error;
    return NextResponse.json({ success: true, data: (data ?? []).map(mapAccount), total: data?.length ?? 0 });
  } catch (error) {
    console.error('Receiving accounts fetch failed:', error);
    return NextResponse.json({ success: false, error: 'Payment accounts could not be loaded.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  try {
    const body = await request.json();
    const provider = typeof body.provider === 'string' ? body.provider.toUpperCase() : '';
    const bankName = typeof body.bankName === 'string' ? body.bankName.trim().slice(0, 120) : '';
    const accountTitle = typeof body.accountTitle === 'string' ? body.accountTitle.trim().slice(0, 120) : '';
    const accountNumber = typeof body.accountNumber === 'string' ? body.accountNumber.trim().slice(0, 80) : '';
    if (!['BANK_TRANSFER', 'JAZZCASH', 'EASYPAISA', 'RAAST', 'SADAPAY'].includes(provider) || !bankName || !accountTitle || !accountNumber) {
      return NextResponse.json({ success: false, error: 'Complete receiving account details are required.' }, { status: 400 });
    }
    const { data, error } = await insforgeAdmin.database.from('receiving_accounts').insert([{
      provider, bank_name: bankName, account_title: accountTitle, account_number: accountNumber,
      iban: typeof body.iban === 'string' ? body.iban.trim().slice(0, 60) || null : null,
      branch_name: typeof body.branchName === 'string' ? body.branchName.trim().slice(0, 120) || null : null,
      instructions: typeof body.instructions === 'string' ? body.instructions.trim().slice(0, 1000) || null : null,
      is_active: body.isActive !== false,
      is_primary: body.isPrimary === true,
    }]).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data: mapAccount(data) }, { status: 201 });
  } catch (error) {
    console.error('Receiving account creation failed:', error);
    return NextResponse.json({ success: false, error: 'Receiving account could not be created.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  try {
    const body = await request.json();
    if (typeof body.id !== 'string') return NextResponse.json({ success: false, error: 'Account ID is required.' }, { status: 400 });
    const update: Record<string, unknown> = {};
    const stringFields: Record<string, string> = {
      provider: 'provider', bankName: 'bank_name', accountTitle: 'account_title', accountNumber: 'account_number',
      iban: 'iban', branchName: 'branch_name', instructions: 'instructions',
    };
    for (const [clientKey, dbKey] of Object.entries(stringFields)) {
      if (typeof body[clientKey] === 'string') update[dbKey] = body[clientKey].trim().slice(0, dbKey === 'instructions' ? 1000 : 120);
    }
    if (typeof body.isActive === 'boolean') update.is_active = body.isActive;
    if (typeof body.isPrimary === 'boolean') update.is_primary = body.isPrimary;
    const { data, error } = await insforgeAdmin.database.from('receiving_accounts').update(update).eq('id', body.id).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data: mapAccount(data) });
  } catch (error) {
    console.error('Receiving account update failed:', error);
    return NextResponse.json({ success: false, error: 'Receiving account could not be updated.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'Account ID is required.' }, { status: 400 });
  const { error } = await insforgeAdmin.database.from('receiving_accounts').delete().eq('id', id);
  if (error) return NextResponse.json({ success: false, error: 'Receiving account could not be deleted.' }, { status: 500 });
  return NextResponse.json({ success: true });
}
