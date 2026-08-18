import { createAdminClient } from '@insforge/sdk';

const insforgeAdmin = createAdminClient({
  baseUrl: 'https://w5x7768e.us-east.insforge.app',
  apiKey: 'ik_1df0a9cfebae220d87863047d916492b',
});

async function purge() {
  console.log('🔍 Fetching all users in database...');
  const { data: users } = await insforgeAdmin.database.from('users').select('id, email, name');
  console.log('Total users currently:', users?.length);
  
  const keepEmails = ['ladi02893@gmail.com', 'amna.khan@gmail.com', 'hamza.malik@gmail.com'];
  const toDelete = users?.filter(u => !keepEmails.includes(u.email.toLowerCase())) || [];

  console.log(`Found ${toDelete.length} fake users to delete:`, toDelete.map(u => u.email));

  for (const u of toDelete) {
    // 1. Find profile for this user
    const { data: profs } = await insforgeAdmin.database
      .from('matrimonial_profiles')
      .select('id')
      .eq('user_id', u.id);

    if (profs && profs.length > 0) {
      for (const p of profs) {
        await insforgeAdmin.database.from('profile_photos').delete().eq('profile_id', p.id);
        await insforgeAdmin.database.from('education_careers').delete().eq('profile_id', p.id);
        await insforgeAdmin.database.from('lifestyles').delete().eq('profile_id', p.id);
        await insforgeAdmin.database.from('family_infos').delete().eq('profile_id', p.id);
        await insforgeAdmin.database.from('partner_preferences').delete().eq('profile_id', p.id);
        await insforgeAdmin.database.from('privacy_settings').delete().eq('profile_id', p.id);
        await insforgeAdmin.database.from('matrimonial_profiles').delete().eq('id', p.id);
      }
    }

    // Delete any other user child records
    await insforgeAdmin.database.from('verification_requests').delete().eq('user_id', u.id);
    await insforgeAdmin.database.from('abuse_reports').delete().or(`reporter_id.eq.${u.id},reported_user_id.eq.${u.id}`);
    await insforgeAdmin.database.from('payment_proofs').delete().eq('user_id', u.id);
    await insforgeAdmin.database.from('invoices').delete().eq('user_id', u.id);
    await insforgeAdmin.database.from('conversations').delete().or(`participant_a_id.eq.${u.id},participant_b_id.eq.${u.id}`);
    await insforgeAdmin.database.from('interest_requests').delete().or(`sender_id.eq.${u.id},receiver_id.eq.${u.id}`);
    await insforgeAdmin.database.from('favorites').delete().eq('user_id', u.id);
    await insforgeAdmin.database.from('notifications').delete().eq('user_id', u.id);

    // Delete user
    const { error } = await insforgeAdmin.database.from('users').delete().eq('id', u.id);
    if (error) {
      console.error(`Failed to delete user ${u.email}:`, error.message);
    } else {
      console.log(`  ✓ Deleted fake user: ${u.name} (${u.email})`);
    }
  }

  const { data: remainingUsers } = await insforgeAdmin.database.from('users').select('id, email, name, role');
  const { data: remainingProfiles } = await insforgeAdmin.database.from('matrimonial_profiles').select('id, full_name, gender');

  console.log('\n✅ Remaining REAL Users in InsForge Database:');
  remainingUsers?.forEach(u => console.log(`   - [${u.role}] ${u.name} (${u.email})`));

  console.log('\n✅ Remaining REAL Profiles in InsForge Database:');
  remainingProfiles?.forEach(p => console.log(`   - [${p.gender}] ${p.full_name} (${p.id})`));
}

purge().catch(console.error);
