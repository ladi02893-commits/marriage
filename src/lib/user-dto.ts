type DatabaseUser = Record<string, unknown> & {
  id: string;
  email: string;
  name: string;
  role: string;
};

export function toSafeUser(user: DatabaseUser) {
  const profile = user.profile as { id?: string; photos?: Array<{ url?: string }> } | null | undefined;
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
    avatarUrl: user.avatar_url ?? null,
    profileId: profile?.id ?? null,
    accountStatus: user.account_status ?? 'ACTIVE',
    totalConnections: user.total_connections ?? 30,
    usedConnections: user.used_connections ?? 0,
    remainingConnections: user.remaining_connections ?? 30,
    assignedConsultantId: user.assigned_consultant_id ?? null,
    createdAt: user.created_at ?? null,
  };
}
