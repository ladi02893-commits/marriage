import { NextResponse } from 'next/server';
import { getCurrentUserFromCookies } from '@/lib/auth';
import { toSafeUser } from '@/lib/user-dto';
import { toProfileDto } from '@/lib/profile-dto';

export async function GET() {
  const user = await getCurrentUserFromCookies();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null, profile: null }, { status: 401 });
  }
  const profile = Array.isArray(user.profile) ? user.profile[0] : user.profile;
  return NextResponse.json({
    authenticated: true,
    user: toSafeUser(user),
    profile: profile ? await toProfileDto({ ...profile, user }, true, true) : null,
  });
}
