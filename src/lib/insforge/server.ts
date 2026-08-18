import { createAdminClient } from '@insforge/sdk';
import { createServerClient } from '@insforge/sdk/ssr';
import { cookies } from 'next/headers';

const insforgeUrl = process.env.INSFORGE_URL || process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://w5x7768e.us-east.insforge.app';
const insforgeApiKey = process.env.INSFORGE_API_KEY || 'ik_1df0a9cfebae220d87863047d916492b';

export const insforgeAdmin = createAdminClient({
  baseUrl: insforgeUrl,
  apiKey: insforgeApiKey,
});

export async function createInsForgeServerClient() {
  const cookieStore = await cookies();
  return createServerClient({
    baseUrl: insforgeUrl,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || 'anon_874cff9f1507a074e9f85ab6341013caf22492f4068df03125d05998c8d6faab',
    cookies: cookieStore,
  });
}
