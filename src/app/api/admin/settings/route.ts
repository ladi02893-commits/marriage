import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, rejectCrossSiteMutation } from '@/lib/api-auth';
import { insforgeAdmin } from '@/lib/insforge/server';
import { PUBLIC_SETTINGS } from '@/lib/public-config';
import { SystemSettings } from '@/lib/types';

interface DbSystemSettings {
  id: string;
  site_name: string;
  min_age: number;
  require_email_verification: boolean;
  free_tier_monthly_interest_limit: number;
  matching_weights: Record<string, number>;
  updated_at: string;
}

export async function GET() {
  try {
    const [settingsRes, cmsRes] = await Promise.all([
      insforgeAdmin.database
        .from('system_settings')
        .select('*')
        .eq('id', 'default-settings')
        .maybeSingle(),
      insforgeAdmin.database
        .from('cms_contents')
        .select('data')
        .eq('key', 'system_settings_extended')
        .maybeSingle(),
    ]);

    const dbRow = settingsRes.data as unknown as DbSystemSettings | null;
    const extended = (cmsRes.data?.data as Partial<SystemSettings>) || {};

    const merged: SystemSettings = {
      ...PUBLIC_SETTINGS,
      ...extended,
      ...(dbRow ? {
        siteName: dbRow.site_name || PUBLIC_SETTINGS.siteName,
        minAge: Number(dbRow.min_age) || PUBLIC_SETTINGS.minAge,
        requireEmailVerification: Boolean(dbRow.require_email_verification),
        freeTierConnectionsLimit: Number(dbRow.free_tier_monthly_interest_limit) || 3,
        freeTierMonthlyInterestLimit: Number(dbRow.free_tier_monthly_interest_limit) || 3,
        matchingWeights: {
          ...PUBLIC_SETTINGS.matchingWeights,
          ...(typeof dbRow.matching_weights === 'object' && dbRow.matching_weights !== null
            ? dbRow.matching_weights
            : {}),
        },
      } : {}),
    };

    return NextResponse.json({ success: true, data: merged });
  } catch (error) {
    console.error('Failed to load system settings:', error);
    return NextResponse.json({ success: true, data: PUBLIC_SETTINGS });
  }
}

export async function PATCH(request: NextRequest) {
  const mutationRejection = rejectCrossSiteMutation(request);
  if (mutationRejection) return mutationRejection;

  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const body: Partial<SystemSettings> = await request.json();

    const freeLimit = body.freeTierConnectionsLimit !== undefined
      ? Number(body.freeTierConnectionsLimit)
      : body.freeTierMonthlyInterestLimit !== undefined
      ? Number(body.freeTierMonthlyInterestLimit)
      : undefined;

    // 1. Update native columns in system_settings table
    const coreUpdate: Partial<DbSystemSettings> = {};
    if (typeof body.siteName === 'string') coreUpdate.site_name = body.siteName.trim();
    if (body.minAge !== undefined) coreUpdate.min_age = Math.max(18, Number(body.minAge));
    if (body.requireEmailVerification !== undefined) coreUpdate.require_email_verification = Boolean(body.requireEmailVerification);
    if (freeLimit !== undefined) coreUpdate.free_tier_monthly_interest_limit = Math.max(1, freeLimit);
    if (body.matchingWeights && typeof body.matchingWeights === 'object') {
      coreUpdate.matching_weights = body.matchingWeights;
    }

    if (Object.keys(coreUpdate).length > 0) {
      await insforgeAdmin.database
        .from('system_settings')
        .update(coreUpdate)
        .eq('id', 'default-settings');
    }

    // 2. Persist extended settings to cms_contents table so nothing is lost
    const { data: existingCms } = await insforgeAdmin.database
      .from('cms_contents')
      .select('data')
      .eq('key', 'system_settings_extended')
      .maybeSingle();

    const previousExtended = (existingCms?.data as Partial<SystemSettings>) || {};
    const updatedExtended: Partial<SystemSettings> = {
      ...previousExtended,
      ...body,
      ...(freeLimit !== undefined ? { freeTierConnectionsLimit: freeLimit, freeTierMonthlyInterestLimit: freeLimit } : {}),
    };

    await insforgeAdmin.database
      .from('cms_contents')
      .upsert({
        key: 'system_settings_extended',
        data: updatedExtended,
        updated_at: new Date().toISOString(),
      });

    // 3. Return full merged settings
    const merged: SystemSettings = {
      ...PUBLIC_SETTINGS,
      ...updatedExtended,
      ...(coreUpdate.site_name ? { siteName: coreUpdate.site_name } : {}),
      ...(coreUpdate.min_age ? { minAge: coreUpdate.min_age } : {}),
      ...(coreUpdate.require_email_verification !== undefined ? { requireEmailVerification: coreUpdate.require_email_verification } : {}),
      ...(freeLimit !== undefined ? { freeTierConnectionsLimit: freeLimit, freeTierMonthlyInterestLimit: freeLimit } : {}),
      ...(coreUpdate.matching_weights ? { matchingWeights: coreUpdate.matching_weights as SystemSettings['matchingWeights'] } : {}),
    };

    return NextResponse.json({
      success: true,
      data: merged,
      message: 'System settings saved successfully.',
    });
  } catch (error) {
    console.error('Failed to update system settings:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Settings update failed.' },
      { status: 500 },
    );
  }
}
