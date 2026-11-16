import { randomUUID } from 'node:crypto';
import { insforgeAdmin } from '@/lib/insforge/server';
import { PUBLIC_BUREAU_PLANS, PUBLIC_BUREAUS } from '@/lib/public-config';
import {
  BureauCreditTransaction,
  BureauCreditTransactionType,
  BureauRechargeRequest,
  BureauSubscriptionPlan,
  MarriageBureau,
} from '@/lib/types';

const BUREAUS_CMS_KEY = 'marriage_bureaus_registry';
const USER_BUREAU_MAP_KEY = 'marriage_bureaus_user_map';
const BUREAU_PLANS_CMS_KEY = 'marriage_bureaus_subscription_plans';
const BUREAU_RECHARGES_CMS_KEY = 'bureau_recharges_registry';
const BUREAU_CREDITS_CMS_KEY = 'bureau_credit_transactions_registry';

export type UserBureauLink = {
  bureauId: string;
  createdByBureau?: boolean;
  customBureauName?: string;
  username?: string;
};

export function calculateBureauCompletion(bureau: Partial<MarriageBureau>): {
  percentage: number;
  missingFields: string[];
} {
  const checks: Array<{ label: string; ok: boolean; weight: number }> = [
    { label: 'Office Name', ok: Boolean(bureau.name && bureau.name.trim().length >= 3), weight: 10 },
    { label: 'Owner Name', ok: Boolean(bureau.ownerName && bureau.ownerName.trim().length >= 2), weight: 10 },
    { label: 'Official Phone', ok: Boolean(bureau.phone && bureau.phone.trim().length >= 7), weight: 10 },
    { label: 'Official Email', ok: Boolean(bureau.email && bureau.email.includes('@')), weight: 10 },
    { label: 'Office Address', ok: Boolean(bureau.address && bureau.address.trim().length >= 5), weight: 10 },
    { label: 'City & Country', ok: Boolean(bureau.city && bureau.country), weight: 10 },
    { label: 'Registration / License No.', ok: Boolean(bureau.registrationNumber && bureau.registrationNumber.trim()), weight: 10 },
    { label: 'Office Description / Bio', ok: Boolean(bureau.description && bureau.description.trim().length >= 20), weight: 10 },
    { label: 'CNIC Number', ok: Boolean(bureau.cnicNumber && bureau.cnicNumber.trim().length >= 10), weight: 10 },
    { label: 'CNIC Front & Back Documents', ok: Boolean(bureau.cnicFrontKey && bureau.cnicBackKey), weight: 10 },
  ];

  let score = 0;
  const missing: string[] = [];

  for (const c of checks) {
    if (c.ok) {
      score += c.weight;
    } else {
      missing.push(c.label);
    }
  }

  return { percentage: Math.min(100, Math.max(10, score)), missingFields: missing };
}

function mergeBureaus(saved: MarriageBureau[]): MarriageBureau[] {
  const byId = new Map<string, MarriageBureau>();
  for (const seed of PUBLIC_BUREAUS) {
    const calc = calculateBureauCompletion(seed);
    byId.set(seed.id, {
      ...seed,
      cnicVerificationStatus: seed.isVerified ? 'VERIFIED' : 'NOT_SUBMITTED',
      profileCompletionStatus: seed.approvalStatus === 'APPROVED' ? 'APPROVED' : 'INCOMPLETE',
      profileCompletionPercentage: calc.percentage,
      creditsTotal: 50,
      creditsUsed: 0,
      creditsRemaining: 50,
    });
  }
  for (const entry of saved) {
    if (entry && typeof entry.id === 'string') {
      const prev = byId.get(entry.id);
      byId.set(entry.id, {
        ...(prev ?? {}),
        ...entry,
      });
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
            cnicNumber: row.cnic_number ?? undefined,
            cnicFrontKey: row.cnic_front_key ?? undefined,
            cnicBackKey: row.cnic_back_key ?? undefined,
            cnicDocKey: row.cnic_doc_key ?? undefined,
            cnicVerificationStatus: row.cnic_verification_status ?? 'NOT_SUBMITTED',
            cnicRejectionReason: row.cnic_rejection_reason ?? undefined,
            cnicVerifiedAt: row.cnic_verified_at ?? undefined,
            profileCompletionPercentage: typeof row.profile_completion_percentage === 'number' ? row.profile_completion_percentage : 40,
            profileCompletionStatus: row.profile_completion_status ?? 'INCOMPLETE',
            profileRejectionReason: row.profile_rejection_reason ?? undefined,
            creditsTotal: typeof row.credits_total === 'number' ? row.credits_total : 0,
            creditsUsed: typeof row.credits_used === 'number' ? row.credits_used : 0,
            creditsRemaining: typeof row.credits_remaining === 'number' ? row.credits_remaining : 0,
            createdAt: row.created_at ?? new Date().toISOString(),
            updatedAt: row.updated_at ?? undefined,
          }))
        : [];

    const combinedMap = new Map<string, MarriageBureau>();
    for (const item of tableRows) combinedMap.set(item.id, item);
    for (const item of cmsList) {
      if (!item?.id) continue;
      const existing = combinedMap.get(item.id);
      if (!existing || new Date(item.updatedAt || item.createdAt || 0).getTime() >= new Date(existing.updatedAt || existing.createdAt || 0).getTime()) {
        combinedMap.set(item.id, {
          ...(existing ?? {}),
          ...item,
        });
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
      cnic_number: b.cnicNumber ?? null,
      cnic_front_key: b.cnicFrontKey ?? null,
      cnic_back_key: b.cnicBackKey ?? null,
      cnic_doc_key: b.cnicDocKey ?? null,
      cnic_verification_status: b.cnicVerificationStatus ?? 'NOT_SUBMITTED',
      cnic_rejection_reason: b.cnicRejectionReason ?? null,
      cnic_verified_at: b.cnicVerifiedAt ?? null,
      profile_completion_percentage: b.profileCompletionPercentage ?? 40,
      profile_completion_status: b.profileCompletionStatus ?? 'INCOMPLETE',
      profile_rejection_reason: b.profileRejectionReason ?? null,
      credits_total: b.creditsTotal ?? 0,
      credits_used: b.creditsUsed ?? 0,
      credits_remaining: b.creditsRemaining ?? 0,
      created_at: b.createdAt || new Date().toISOString(),
      updated_at: b.updatedAt || new Date().toISOString(),
    }));
    await insforgeAdmin.database.from('marriage_bureaus').upsert(rows, { onConflict: 'id' });
  } catch {
    // Graceful fallback when columns or table are being provisioned
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

export async function linkUserToBureau(
  userId: string,
  bureauId: string,
  createdByBureau = false,
  extra?: { customBureauName?: string; username?: string },
): Promise<void> {
  const currentMap = await getUserBureauMap();
  const previous = currentMap[userId];
  const nextMap: Record<string, UserBureauLink> = {
    ...currentMap,
    [userId]: {
      bureauId,
      createdByBureau,
      ...(extra?.customBureauName !== undefined
        ? { customBureauName: extra.customBureauName || undefined }
        : previous?.customBureauName
        ? { customBureauName: previous.customBureauName }
        : {}),
      ...(extra?.username !== undefined
        ? { username: extra.username || undefined }
        : previous?.username
        ? { username: previous.username }
        : {}),
    },
  };
  const { error: cmsError } = await insforgeAdmin.database
    .from('cms_contents')
    .upsert([{ key: USER_BUREAU_MAP_KEY, data: nextMap, updated_at: new Date().toISOString() }], { onConflict: 'key' });
  if (cmsError) throw cmsError;

  if (bureauId) {
    const { error: userUpdateError } = await insforgeAdmin.database
      .from('users')
      .update({ assigned_consultant_id: bureauId })
      .eq('id', userId);
    if (userUpdateError) throw userUpdateError;
  }

  try {
    await Promise.allSettled([
      insforgeAdmin.database.from('users').update({ bureau_id: bureauId || null, created_by_bureau: createdByBureau }).eq('id', userId),
      insforgeAdmin.database.from('matrimonial_profiles').update({ bureau_id: bureauId || null, created_by_bureau: createdByBureau }).eq('user_id', userId),
    ]);
  } catch {
    // Ignore when columns are not yet migrated
  }
}

export async function getBureauPlans(): Promise<BureauSubscriptionPlan[]> {
  try {
    const { data } = await insforgeAdmin.database
      .from('cms_contents')
      .select('data')
      .eq('key', BUREAU_PLANS_CMS_KEY)
      .maybeSingle();
    const raw = data?.data as { items?: BureauSubscriptionPlan[] } | BureauSubscriptionPlan[] | null;
    const saved = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
    const bySlug = new Map<string, BureauSubscriptionPlan>();
    for (const seed of PUBLIC_BUREAU_PLANS) {
      bySlug.set(seed.slug, seed);
    }
    for (const plan of saved) {
      if (plan && plan.slug && bySlug.has(plan.slug)) {
        const base = bySlug.get(plan.slug)!;
        bySlug.set(plan.slug, {
          ...base,
          ...plan,
          pricePKR: Math.max(0, Number(plan.pricePKR ?? base.pricePKR) || base.pricePKR),
        });
      }
    }
    return Array.from(bySlug.values());
  } catch {
    return [...PUBLIC_BUREAU_PLANS];
  }
}

export async function saveBureauPlans(plans: BureauSubscriptionPlan[]): Promise<void> {
  const { error } = await insforgeAdmin.database
    .from('cms_contents')
    .upsert([{ key: BUREAU_PLANS_CMS_KEY, data: { items: plans }, updated_at: new Date().toISOString() }], { onConflict: 'key' });
  if (error) throw error;
}

// -----------------------------------------------------------------------------
// Bureau Recharges Store (Dual Layer: DB table + cms_contents fallback)
// -----------------------------------------------------------------------------
export async function getBureauRecharges(bureauId?: string): Promise<BureauRechargeRequest[]> {
  try {
    const [cmsRes, tableRes] = await Promise.allSettled([
      insforgeAdmin.database
        .from('cms_contents')
        .select('data')
        .eq('key', BUREAU_RECHARGES_CMS_KEY)
        .maybeSingle(),
      insforgeAdmin.database
        .from('bureau_recharges')
        .select('*')
        .order('created_at', { ascending: false }),
    ]);

    const cmsData = cmsRes.status === 'fulfilled' ? (cmsRes.value.data?.data as { items?: BureauRechargeRequest[] } | null) : null;
    const cmsList: BureauRechargeRequest[] = Array.isArray(cmsData?.items) ? cmsData.items : [];

    const tableRows: BureauRechargeRequest[] =
      tableRes.status === 'fulfilled' && !tableRes.value.error && Array.isArray(tableRes.value.data)
        ? (tableRes.value.data as Record<string, any>[]).map((row): BureauRechargeRequest => ({
            id: row.id,
            bureauId: row.bureau_id,
            planSlug: row.plan_slug,
            planName: row.plan_name,
            amountPKR: Number(row.amount) || 0,
            durationDays: Number(row.duration_days) || 30,
            creditsAllocated: Number(row.credits_allocated) || 0,
            paymentMethod: row.payment_method,
            senderName: row.sender_name,
            senderAccount: row.sender_account,
            transactionId: row.transaction_id,
            receiptKey: row.receipt_key,
            notes: row.notes ?? undefined,
            status: row.status ?? 'PENDING',
            rejectionReason: row.rejection_reason ?? undefined,
            reviewedBy: row.reviewed_by ?? undefined,
            reviewedAt: row.reviewed_at ?? undefined,
            createdAt: row.created_at ?? new Date().toISOString(),
          }))
        : [];

    const combinedMap = new Map<string, BureauRechargeRequest>();
    for (const r of tableRows) combinedMap.set(r.id, r);
    for (const r of cmsList) {
      if (!r?.id) continue;
      combinedMap.set(r.id, { ...(combinedMap.get(r.id) ?? {}), ...r });
    }

    let list = Array.from(combinedMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    if (bureauId) {
      list = list.filter((r) => r.bureauId === bureauId);
    }
    return list;
  } catch (error) {
    console.error('Failed to load bureau recharges:', error);
    return [];
  }
}

export async function saveBureauRecharges(recharges: BureauRechargeRequest[]): Promise<void> {
  await insforgeAdmin.database
    .from('cms_contents')
    .upsert([{ key: BUREAU_RECHARGES_CMS_KEY, data: { items: recharges }, updated_at: new Date().toISOString() }], { onConflict: 'key' });
}

export async function recordBureauRecharge(recharge: BureauRechargeRequest): Promise<void> {
  const existing = await getBureauRecharges();
  const next = [recharge, ...existing.filter((r) => r.id !== recharge.id)];
  await saveBureauRecharges(next);

  try {
    await insforgeAdmin.database.from('bureau_recharges').upsert([{
      id: recharge.id,
      bureau_id: recharge.bureauId,
      plan_slug: recharge.planSlug,
      plan_name: recharge.planName,
      amount: recharge.amountPKR,
      duration_days: recharge.durationDays,
      credits_allocated: recharge.creditsAllocated,
      payment_method: recharge.paymentMethod,
      sender_name: recharge.senderName,
      sender_account: recharge.senderAccount,
      transaction_id: recharge.transactionId,
      receipt_key: recharge.receiptKey,
      notes: recharge.notes ?? null,
      status: recharge.status,
      rejection_reason: recharge.rejectionReason ?? null,
      reviewed_by: recharge.reviewedBy ?? null,
      reviewed_at: recharge.reviewedAt ?? null,
      created_at: recharge.createdAt,
    }], { onConflict: 'id' });
  } catch {
    // Best effort SQL sync
  }
}

// -----------------------------------------------------------------------------
// Bureau Credit Transactions (Dual Layer)
// -----------------------------------------------------------------------------
export async function getBureauCreditTransactions(bureauId?: string): Promise<BureauCreditTransaction[]> {
  try {
    const { data } = await insforgeAdmin.database
      .from('cms_contents')
      .select('data')
      .eq('key', BUREAU_CREDITS_CMS_KEY)
      .maybeSingle();
    const raw = data?.data as { items?: BureauCreditTransaction[] } | null;
    let list: BureauCreditTransaction[] = Array.isArray(raw?.items) ? raw.items : [];
    if (bureauId) {
      list = list.filter((t) => t.bureauId === bureauId);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export async function addBureauCreditTransaction(
  bureauId: string,
  amount: number,
  type: BureauCreditTransactionType,
  description: string,
  balanceAfter: number,
): Promise<BureauCreditTransaction> {
  const record: BureauCreditTransaction = {
    id: `bct-${randomUUID()}`,
    bureauId,
    amount,
    type,
    description,
    balanceAfter,
    createdAt: new Date().toISOString(),
  };

  const current = await getBureauCreditTransactions();
  const next = [record, ...current].slice(0, 500);

  await insforgeAdmin.database
    .from('cms_contents')
    .upsert([{ key: BUREAU_CREDITS_CMS_KEY, data: { items: next }, updated_at: new Date().toISOString() }], { onConflict: 'key' });

  try {
    await insforgeAdmin.database.from('bureau_credit_transactions').insert([{
      id: record.id,
      bureau_id: record.bureauId,
      amount: record.amount,
      type: record.type,
      description: record.description,
      balance_after: record.balanceAfter,
      created_at: record.createdAt,
    }]);
  } catch {
    // Best effort SQL sync
  }

  return record;
}
