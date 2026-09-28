import { NextRequest, NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = String(body.code || '').trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ valid: false, message: 'Please enter a coupon code.' }, { status: 400 });
    }

    const { data: coupon, error } = await insforgeAdmin.database
      .from('coupons')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (error || !coupon) {
      return NextResponse.json({ valid: false, message: 'Invalid coupon code.' }, { status: 404 });
    }

    if (!coupon.is_active) {
      return NextResponse.json({ valid: false, message: 'This coupon is no longer active.' }, { status: 400 });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, message: 'This coupon has expired.' }, { status: 400 });
    }

    if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
      return NextResponse.json({ valid: false, message: 'This coupon has reached its maximum redemptions.' }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountPercent: coupon.discount_percent ?? undefined,
      fixedDiscount: coupon.fixed_discount ? Number(coupon.fixed_discount) : undefined,
      message: coupon.discount_percent
        ? `${coupon.discount_percent}% discount voucher applied!`
        : `PKR ${coupon.fixed_discount} discount voucher applied!`,
    });
  } catch (error) {
    console.error('Coupon validation failed:', error);
    return NextResponse.json({ valid: false, message: 'Coupon validation failed.' }, { status: 500 });
  }
}
