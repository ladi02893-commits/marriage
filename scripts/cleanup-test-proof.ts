import { createAdminClient } from '@insforge/sdk';

const insforgeAdmin = createAdminClient({
  baseUrl: 'https://w5x7768e.us-east.insforge.app',
  apiKey: 'ik_1df0a9cfebae220d87863047d916492b',
});

async function cleanup() {
  await insforgeAdmin.database
    .from('payment_proofs')
    .delete()
    .eq('user_id', 'user-boy-1');

  await insforgeAdmin.database
    .from('invoices')
    .delete()
    .eq('user_id', 'user-boy-1');

  // Set groom back to fresh test state or PREMIUM
  await insforgeAdmin.database
    .from('users')
    .update({ subscription_tier: 'FREE' })
    .eq('id', 'user-boy-1');

  console.log('✅ Cleaned up temporary test proof and reset groom to FREE tier for user testing.');
}

cleanup().catch(console.error);
