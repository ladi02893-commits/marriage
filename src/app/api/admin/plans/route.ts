import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, rejectCrossSiteMutation } from '@/lib/api-auth';
import { insforgeAdmin } from '@/lib/insforge/server';
import { PUBLIC_PLANS } from '@/lib/public-config';
import { SubscriptionPlan } from '@/lib/types';

interface DbPlan {
  id: string;
  slug: string;
  name: string;
  description: string;
  monthly_price: number | string;
  yearly_price: number | string;
  features: string[];
  badge: string | null;
  max_interests_per_month: number;
  can_view_contact_directly: boolean;
  can_message_directly: boolean;
  is_featured: boolean;
  created_at: string;
}

function mapDbPlanToSubscriptionPlan(row: DbPlan): SubscriptionPlan {
  const monthlyPrice = Number(row.monthly_price) || 0;
  const yearlyPrice = Number(row.yearly_price) || monthlyPrice;
  const connectionsLimit = Number(row.max_interests_per_month) || 0;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description || '',
    price: monthlyPrice,
    monthlyPrice,
    yearlyPrice,
    currency: 'PKR',
    connectionsLimit,
    badge: row.badge || undefined,
    features: Array.isArray(row.features) ? row.features : [],
    limits: {
      connectionsCount: connectionsLimit,
      directContactAccess: Boolean(row.can_view_contact_directly),
      canChat: Boolean(row.can_message_directly),
      isFeatured: Boolean(row.is_featured),
    },
    popular: Boolean(row.is_featured) || row.badge?.toLowerCase().includes('popular'),
    isPopular: Boolean(row.is_featured),
    isActive: true,
  };
}

export async function GET() {
  try {
    const { data, error } = await insforgeAdmin.database
      .from('subscription_plans')
      .select('*')
      .order('monthly_price', { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, data: PUBLIC_PLANS });
    }

    const plans = (data as unknown as DbPlan[]).map(mapDbPlanToSubscriptionPlan);
    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    console.error('Failed to fetch subscription plans:', error);
    return NextResponse.json({ success: true, data: PUBLIC_PLANS });
  }
}

export async function PATCH(request: NextRequest) {
  const mutationRejection = rejectCrossSiteMutation(request);
  if (mutationRejection) return mutationRejection;

  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const { id, slug, ...updates } = body;

    if (!id && !slug) {
      return NextResponse.json({ success: false, error: 'Plan id or slug is required.' }, { status: 400 });
    }

    const dbPayload: Partial<DbPlan> = {};
    if (typeof updates.name === 'string') dbPayload.name = updates.name.trim();
    if (typeof updates.description === 'string') dbPayload.description = updates.description.trim();
    if (updates.monthlyPrice !== undefined) dbPayload.monthly_price = Number(updates.monthlyPrice);
    else if (updates.price !== undefined) dbPayload.monthly_price = Number(updates.price);
    if (updates.yearlyPrice !== undefined) dbPayload.yearly_price = Number(updates.yearlyPrice);
    if (updates.connectionsLimit !== undefined) dbPayload.max_interests_per_month = Number(updates.connectionsLimit);
    else if (updates.connectionLimit !== undefined) dbPayload.max_interests_per_month = Number(updates.connectionLimit);
    if (Array.isArray(updates.features)) dbPayload.features = updates.features.map(String);
    if (updates.badge !== undefined) dbPayload.badge = updates.badge ? String(updates.badge).trim() : null;
    if (updates.limits?.directContactAccess !== undefined) {
      dbPayload.can_view_contact_directly = Boolean(updates.limits.directContactAccess);
    }
    if (updates.limits?.canChat !== undefined) {
      dbPayload.can_message_directly = Boolean(updates.limits.canChat);
    }
    if (updates.isFeatured !== undefined || updates.popular !== undefined) {
      dbPayload.is_featured = Boolean(updates.isFeatured ?? updates.popular);
    }

    let query = insforgeAdmin.database.from('subscription_plans').update(dbPayload);
    if (id) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', slug);
    }

    const { data, error } = await query.select().single();
    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: mapDbPlanToSubscriptionPlan(data as unknown as DbPlan),
      message: 'Plan updated successfully.',
    });
  } catch (error) {
    console.error('Failed to update plan:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Plan could not be updated.' },
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
    const slug = String(body.slug || body.name || `PLAN_${Date.now()}`).toUpperCase().replace(/\s+/g, '_');

    const dbPayload = {
      slug,
      name: String(body.name || 'Custom Plan').trim(),
      description: String(body.description || '').trim(),
      monthly_price: Number(body.monthlyPrice ?? body.price ?? 0),
      yearly_price: Number(body.yearlyPrice ?? body.monthlyPrice ?? body.price ?? 0),
      features: Array.isArray(body.features) ? body.features.map(String) : [],
      badge: body.badge ? String(body.badge).trim() : null,
      max_interests_per_month: Number(body.connectionsLimit ?? body.limits?.connectionsCount ?? 30),
      can_view_contact_directly: Boolean(body.limits?.directContactAccess ?? false),
      can_message_directly: Boolean(body.limits?.canChat ?? true),
      is_featured: Boolean(body.isFeatured ?? body.popular ?? false),
    };

    const { data, error } = await insforgeAdmin.database
      .from('subscription_plans')
      .insert([dbPayload])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: mapDbPlanToSubscriptionPlan(data as unknown as DbPlan),
      message: 'Plan created successfully.',
    });
  } catch (error) {
    console.error('Failed to create plan:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Plan could not be created.' },
      { status: 500 },
    );
  }
}
