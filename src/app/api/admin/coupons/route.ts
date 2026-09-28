import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, rejectCrossSiteMutation } from '@/lib/api-auth';
import { insforgeAdmin } from '@/lib/insforge/server';
import { Coupon } from '@/lib/types';

interface DbCoupon {
  id: string;
  code: string;
  discount_percent: number | null;
  fixed_discount: number | string | null;
  usage_limit: number;
  times_used: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

function mapDbCoupon(row: DbCoupon): Coupon {
  return {
    id: row.id,
    code: row.code,
    discountPercent: row.discount_percent ?? undefined,
    fixedDiscount: row.fixed_discount !== null ? Number(row.fixed_discount) : undefined,
    usageLimit: row.usage_limit ?? 100,
    timesUsed: row.times_used ?? 0,
    expiresAt: row.expires_at || new Date(Date.now() + 365 * 86400000).toISOString(),
    isActive: Boolean(row.is_active),
  };
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const { data, error } = await insforgeAdmin.database
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const coupons = (data as unknown as DbCoupon[] || []).map(mapDbCoupon);
    return NextResponse.json({ success: true, data: coupons });
  } catch (error) {
    console.error('Failed to fetch coupons:', error);
    return NextResponse.json(
      { success: false, error: 'Coupons could not be loaded.' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const mutationRejection = rejectCrossSiteMutation(request);
  if (mutationRejection) return mutationRejection;

  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const code = String(body.code || '').trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ success: false, error: 'Coupon code is required.' }, { status: 400 });
    }

    const discountPercent = body.discountPercent !== undefined ? Math.min(100, Math.max(1, Number(body.discountPercent))) : null;
    const fixedDiscount = body.fixedDiscount !== undefined ? Math.max(0, Number(body.fixedDiscount)) : null;

    if (discountPercent === null && fixedDiscount === null) {
      return NextResponse.json({ success: false, error: 'Provide a discount percentage or fixed discount.' }, { status: 400 });
    }

    const usageLimit = Math.max(1, Number(body.usageLimit || 100));
    const expiresAt = body.expiresAt ? new Date(body.expiresAt).toISOString() : new Date(Date.now() + 90 * 86400000).toISOString();

    const { data, error } = await insforgeAdmin.database
      .from('coupons')
      .insert([{
        code,
        discount_percent: discountPercent,
        fixed_discount: fixedDiscount,
        usage_limit: usageLimit,
        times_used: 0,
        expires_at: expiresAt,
        is_active: body.isActive !== undefined ? Boolean(body.isActive) : true,
      }])
      .select()
      .single();

    if (error) {
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        return NextResponse.json({ success: false, error: `Coupon code '${code}' already exists.` }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: mapDbCoupon(data as unknown as DbCoupon),
      message: `Coupon '${code}' created successfully.`,
    });
  } catch (error) {
    console.error('Failed to create coupon:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Coupon could not be created.' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const mutationRejection = rejectCrossSiteMutation(request);
  if (mutationRejection) return mutationRejection;

  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Coupon ID is required.' }, { status: 400 });
    }

    const dbPayload: Partial<DbCoupon> = {};
    if (updates.isActive !== undefined) dbPayload.is_active = Boolean(updates.isActive);
    if (updates.usageLimit !== undefined) dbPayload.usage_limit = Math.max(1, Number(updates.usageLimit));
    if (updates.discountPercent !== undefined) dbPayload.discount_percent = Number(updates.discountPercent);
    if (updates.fixedDiscount !== undefined) dbPayload.fixed_discount = Number(updates.fixedDiscount);
    if (updates.expiresAt !== undefined) dbPayload.expires_at = new Date(updates.expiresAt).toISOString();

    const { data, error } = await insforgeAdmin.database
      .from('coupons')
      .update(dbPayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: mapDbCoupon(data as unknown as DbCoupon),
      message: 'Coupon updated successfully.',
    });
  } catch (error) {
    console.error('Failed to update coupon:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Coupon update failed.' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const mutationRejection = rejectCrossSiteMutation(request);
  if (mutationRejection) return mutationRejection;

  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Coupon ID is required.' }, { status: 400 });
    }

    const { error } = await insforgeAdmin.database
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete coupon:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Coupon deletion failed.' },
      { status: 500 },
    );
  }
}
