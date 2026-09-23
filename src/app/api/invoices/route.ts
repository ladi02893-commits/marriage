import { NextResponse } from 'next/server';
import { ADMIN_ROLES, requireUser } from '@/lib/api-auth';
import { insforgeAdmin } from '@/lib/insforge/server';

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  try {
    let query = insforgeAdmin.database.from('invoices').select('*');
    if (!ADMIN_ROLES.has(auth.user.role)) query = query.eq('user_id', auth.user.id);
    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;
    const invoices = (data ?? []).map((invoice) => ({
      ...invoice,
      userId: invoice.user_id,
      invoiceNumber: invoice.invoice_number,
      paymentMethod: invoice.payment_method,
      planName: invoice.plan_name,
    }));
    return NextResponse.json({ success: true, data: invoices, total: invoices.length });
  } catch (error) {
    console.error('Invoice fetch failed:', error);
    return NextResponse.json({ success: false, error: 'Invoices could not be loaded.' }, { status: 503 });
  }
}

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Invoices are generated only after a verified payment.' },
    { status: 405, headers: { Allow: 'GET' } },
  );
}
