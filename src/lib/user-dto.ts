type DatabaseUser = Record<string, unknown> & {
  id: string;
  email: string;
  name: string;
  role: string;
};

export function toSafeUser(user: DatabaseUser) {
  const rawProfile = (Array.isArray(user.profile) ? user.profile[0] : user.profile) as
    | {
        id?: string;
        approval_status?: string;
        photos?: Array<{ url?: string; is_primary?: boolean; is_approved?: boolean }>;
      }
    | null
    | undefined;
  const primaryPhoto =
    rawProfile?.photos?.find((p) => p.is_primary && p.is_approved)?.url ??
    rawProfile?.photos?.find((p) => p.is_approved)?.url ??
    rawProfile?.photos?.find((p) => p.is_primary)?.url ??
    rawProfile?.photos?.[0]?.url ??
    null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone ?? '',
    whatsappNumber: user.whatsapp_number ?? '',
    profileIdCode: user.profile_id_code ?? null,
    role: user.role,
    subscriptionTier: user.subscription_tier ?? 'FREE',
    isVerified: user.is_verified ?? false,
    isWhatsappVerified: user.is_whatsapp_verified ?? false,
    isEmailVerified: user.is_email_verified ?? false,
    avatarUrl: (user.avatar_url as string | null) ?? primaryPhoto,
    profileId: rawProfile?.id ?? null,
    profileApprovalStatus: rawProfile?.approval_status ?? undefined,
    accountStatus: user.account_status ?? 'ACTIVE',
    totalConnections: user.total_connections ?? 3,
    usedConnections: user.used_connections ?? 0,
    remainingConnections: user.remaining_connections ?? 3,
    assignedConsultantId: user.assigned_consultant_id ?? null,
    bureauId: (user.bureau_id as string | null) ?? (user.assigned_consultant_id as string | null) ?? null,
    createdAt: user.created_at ?? null,
    lastActive: (user.last_login_at as string | null) ?? (user.updated_at as string | null) ?? (user.created_at as string | null) ?? '',
  };
}
