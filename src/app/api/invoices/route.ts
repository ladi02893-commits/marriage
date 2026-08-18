import { NextRequest, NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge/server';
import { INITIAL_INVOICES } from '@/lib/data-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    let dbInvoices: any[] = [];
    try {
      let query = insforgeAdmin.database.from('invoices').select('*');
      if (userId) query = query.eq('user_id', userId);

      const { data, error } = await query.order('date', { ascending: false });

      if (!error && data) {
        dbInvoices = data.map((inv: any) => ({
          ...inv,
          userId: inv.user_id || inv.userId,
          invoiceNumber: inv.invoice_number || inv.invoiceNumber,
          paymentMethod: inv.payment_method || inv.paymentMethod,
          planName: inv.plan_name || inv.planName,
        }));
      }
    } catch (err) {
      console.warn('InsForge invoices fetch fallback:', err);
    }

    const data = dbInvoices.length > 0 ? dbInvoices : INITIAL_INVOICES;

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
      source: dbInvoices.length > 0 ? 'INSFORGE_DATABASE' : 'DATA_STORE',
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

    const { data: invoice, error } = await insforgeAdmin.database
      .from('invoices')
      .insert([{
        user_id: userId || 'user-ladi',
        invoice_number: invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
        amount: Number(amount) || 0,
        currency: currency || 'PKR',
        status: status || 'PAID',
        payment_method: paymentMethod || 'Instant Card Gateway',
        plan_name: planName || 'Elite Executive Plan',
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: invoice,
      message: 'Invoice created successfully in InsForge database.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to record invoice in database.' },
      { status: 500 }
    );
  }
}
