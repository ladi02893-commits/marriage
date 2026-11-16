import { NextResponse } from 'next/server';
import { getCurrentUserFromCookies } from '@/lib/auth';
import { getBureausRegistry, getUserBureauMap } from '@/lib/bureau-store';
import { toSafeUser } from '@/lib/user-dto';
import { toProfileDto } from '@/lib/profile-dto';

export async function GET() {
  const user = await getCurrentUserFromCookies();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null, profile: null }, { status: 401 });
  }
  const [bureaus, userBureauMap] = await Promise.all([
    getBureausRegistry(),
    getUserBureauMap(),
  ]);
  const mapEntry = userBureauMap[user.id];
  const rawUser = user as Record<string, unknown>;
  const resolvedBureauId = (rawUser.bureau_id as string | null) ?? mapEntry?.bureauId ?? (user.assigned_consultant_id as string | null) ?? null;
  const bureau = bureaus.find((b) => b.id === resolvedBureauId || b.ownerUserId === user.id);

  const safeUser = {
    ...toSafeUser(user),
    bureauId: bureau?.id ?? resolvedBureauId,
    bureauName: bureau?.name ?? null,
  };
  const profile = Array.isArray(user.profile) ? user.profile[0] : user.profile;
  return NextResponse.json({
    authenticated: true,
    user: safeUser,
    profile: profile
      ? await toProfileDto({ ...profile, user }, true, true, {
          id: bureau?.id ?? resolvedBureauId,
          name: bureau?.name ?? null,
          bureauCode: bureau?.bureauCode ?? null,
          createdByBureau: mapEntry?.createdByBureau,
        })
      : null,
  });
}
