import { createAdminClient } from '@insforge/sdk';

const insforgeAdmin = createAdminClient({
  baseUrl: 'https://w5x7768e.us-east.insforge.app',
  apiKey: 'ik_1df0a9cfebae220d87863047d916492b',
});

async function fixAmna() {
  console.log('🔧 Updating Amna Khan to VIP Royal Matchmaking (PREMIUM_PLUS)...');

  const { data: user, error: uErr } = await insforgeAdmin.database
    .from('users')
    .update({
      subscription_tier: 'PREMIUM_PLUS',
      is_verified: true,
      account_status: 'ACTIVE',
    })
    .eq('email', 'amna.khan@gmail.com')
    .select()
    .single();

  if (uErr) {
    console.error('Error updating user:', uErr);
  } else {
    console.log('✅ User updated successfully in InsForge DB:', user);
  }

  const { data: prof, error: pErr } = await insforgeAdmin.database
    .from('matrimonial_profiles')
    .update({
      is_featured: true,
      is_boosted: true,
    })
    .eq('user_id', 'user-amna')
    .select()
    .single();

  if (pErr) {
    console.warn('Profile update notice:', pErr.message);
  } else {
    console.log('✅ Profile boosted successfully in InsForge DB:', prof?.full_name);
  }
}

fixAmna().catch(console.error);
