import { NextRequest, NextResponse } from 'next/server';
import { rejectCrossSiteMutation } from '@/lib/api-auth';
import { insforgeAdmin } from '@/lib/insforge/server';

export async function POST(request: NextRequest) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  try {
    const body = await request.json();
    const code = String(body.code || '').trim().toUpperCase();

    if (!code) {
      return NextResponse.json(
        { success: false, valid: false, error: 'Please enter a coupon code.', message: 'Please enter a coupon code.' },
        { status: 400 },
      );
    }

    const { data: coupon, error } = await insforgeAdmin.database
      .from('coupons')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (error || !coupon) {
      return NextResponse.json(
        { success: false, valid: false, error: 'Invalid coupon code.', message: 'Invalid coupon code.' },
        { status: 404 },
      );
    }

    if (!coupon.is_active) {
      return NextResponse.json(
        { success: false, valid: false, error: 'This coupon is no longer active.', message: 'This coupon is no longer active.' },
        { status: 400 },
      );
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, valid: false, error: 'This coupon has expired.', message: 'This coupon has expired.' },
        { status: 400 },
      );
    }

    if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: 'This coupon has reached its maximum redemptions.',
          message: 'This coupon has reached its maximum redemptions.',
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
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
    return NextResponse.json(
      { success: false, valid: false, error: 'Coupon validation failed.', message: 'Coupon validation failed.' },
      { status: 500 },
    );
  }
}
