import { insforgeAdmin } from '@/lib/insforge/server';
import { PUBLIC_BUREAUS } from '@/lib/public-config';
import { MarriageBureau } from '@/lib/types';

const BUREAUS_CMS_KEY = 'marriage_bureaus_registry';
const USER_BUREAU_MAP_KEY = 'marriage_bureaus_user_map';

export type UserBureauLink = {
  bureauId: string;
  createdByBureau?: boolean;
};

function mergeBureaus(saved: MarriageBureau[]): MarriageBureau[] {
  const byId = new Map<string, MarriageBureau>();
  for (const seed of PUBLIC_BUREAUS) {
    byId.set(seed.id, seed);
  }
  for (const entry of saved) {
    if (entry && typeof entry.id === 'string') {
      byId.set(entry.id, entry);
    }
  }
  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
  );
}

export async function getBureausRegistry(): Promise<MarriageBureau[]> {
  try {
    const [cmsRes, tableRes] = await Promise.allSettled([
      insforgeAdmin.database
        .from('cms_contents')
        .select('data')
        .eq('key', BUREAUS_CMS_KEY)
        .maybeSingle(),
      insforgeAdmin.database
        .from('marriage_bureaus')
        .select('*')
        .order('created_at', { ascending: false }),
    ]);

    const cmsData = cmsRes.status === 'fulfilled' ? (cmsRes.value.data?.data as MarriageBureau[] | { items?: MarriageBureau[] } | null) : null;
    const cmsList = Array.isArray(cmsData) ? cmsData : Array.isArray(cmsData?.items) ? cmsData.items : [];

    const tableRows =
      tableRes.status === 'fulfilled' && !tableRes.value.error && Array.isArray(tableRes.value.data)
        ? (tableRes.value.data as Record<string, any>[]).map((row): MarriageBureau => ({
            id: row.id,
            bureauCode: row.bureau_code,
            ownerUserId: row.owner_user_id ?? undefined,
            name: row.name,
            ownerName: row.owner_name,
            email: row.email,
            phone: row.phone,
            whatsappNumber: row.whatsapp_number ?? undefined,
            country: row.country,
            stateProvince: row.state_province ?? undefined,
            city: row.city,
            serviceCities: Array.isArray(row.service_cities) ? row.service_cities : [],
            address: row.address,
            registrationNumber: row.registration_number ?? undefined,
            description: row.description ?? undefined,
            specializations: Array.isArray(row.specializations) ? row.specializations : [],
            rishtaScope: row.rishta_scope === 'BUREAU_PRIORITY' ? 'BUREAU_PRIORITY' : 'ALL_PLATFORM',
            approvalStatus: row.approval_status ?? 'PENDING',
            reviewerNotes: row.reviewer_notes ?? undefined,
            isVerified: Boolean(row.is_verified),
            createdAt: row.created_at ?? new Date().toISOString(),
            updatedAt: row.updated_at ?? undefined,
          }))
        : [];

    // Combine CMS and table entries, preferring more recently updated records
    const combinedMap = new Map<string, MarriageBureau>();
    for (const item of tableRows) combinedMap.set(item.id, item);
    for (const item of cmsList) {
      if (!item?.id) continue;
      const existing = combinedMap.get(item.id);
      if (!existing || new Date(item.updatedAt || item.createdAt || 0).getTime() >= new Date(existing.updatedAt || existing.createdAt || 0).getTime()) {
        combinedMap.set(item.id, item);
      }
    }

    return mergeBureaus(Array.from(combinedMap.values()));
  } catch (error) {
    console.error('Failed to load marriage bureaus registry:', error);
    return [...PUBLIC_BUREAUS];
  }
}

export async function saveBureausRegistry(bureaus: MarriageBureau[]): Promise<void> {
  const { error: cmsError } = await insforgeAdmin.database
    .from('cms_contents')
    .upsert([{ key: BUREAUS_CMS_KEY, data: { items: bureaus }, updated_at: new Date().toISOString() }], { onConflict: 'key' });
  if (cmsError) throw cmsError;

  // Best-effort sync to SQL table if the migration has been applied
  try {
    const rows = bureaus.map((b) => ({
      id: b.id,
      bureau_code: b.bureauCode,
      owner_user_id: b.ownerUserId ?? null,
      name: b.name,
      owner_name: b.ownerName,
      email: b.email,
      phone: b.phone,
      whatsapp_number: b.whatsappNumber ?? null,
      country: b.country,
      state_province: b.stateProvince ?? null,
      city: b.city,
      service_cities: b.serviceCities ?? [],
      address: b.address,
      registration_number: b.registrationNumber ?? null,
      description: b.description ?? null,
      specializations: b.specializations ?? [],
      rishta_scope: b.rishtaScope ?? 'ALL_PLATFORM',
      approval_status: b.approvalStatus,
      reviewer_notes: b.reviewerNotes ?? null,
      is_verified: Boolean(b.isVerified),
      created_at: b.createdAt || new Date().toISOString(),
      updated_at: b.updatedAt || new Date().toISOString(),
    }));
    await insforgeAdmin.database.from('marriage_bureaus').upsert(rows, { onConflict: 'id' });
  } catch {
    // Table may not be migrated yet; cms_contents already holds authoritative state.
  }
}

export async function getUserBureauMap(): Promise<Record<string, UserBureauLink>> {
  try {
    const { data } = await insforgeAdmin.database
      .from('cms_contents')
      .select('data')
      .eq('key', USER_BUREAU_MAP_KEY)
      .maybeSingle();
    if (!data?.data || typeof data.data !== 'object') return {};
    return data.data as Record<string, UserBureauLink>;
  } catch {
    return {};
  }
}

export async function linkUserToBureau(userId: string, bureauId: string, createdByBureau = false): Promise<void> {
  const currentMap = await getUserBureauMap();
  const nextMap: Record<string, UserBureauLink> = {
    ...currentMap,
    [userId]: { bureauId, createdByBureau },
  };
  const { error: cmsError } = await insforgeAdmin.database
    .from('cms_contents')
    .upsert([{ key: USER_BUREAU_MAP_KEY, data: nextMap, updated_at: new Date().toISOString() }], { onConflict: 'key' });
  if (cmsError) throw cmsError;

  // Keep existing users.assigned_consultant_id column synchronized
  const { error: userUpdateError } = await insforgeAdmin.database
    .from('users')
    .update({ assigned_consultant_id: bureauId })
    .eq('id', userId);
  if (userUpdateError) throw userUpdateError;

  // Best-effort sync to dedicated columns if migration has been run
  try {
    await Promise.allSettled([
      insforgeAdmin.database.from('users').update({ bureau_id: bureauId, created_by_bureau: createdByBureau }).eq('id', userId),
      insforgeAdmin.database.from('matrimonial_profiles').update({ bureau_id: bureauId, created_by_bureau: createdByBureau }).eq('user_id', userId),
    ]);
  } catch {
    // Ignore when columns are not yet migrated
  }
}
