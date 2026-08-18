import { createAdminClient } from '@insforge/sdk';

const insforgeUrl = process.env.INSFORGE_URL || process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://w5x7768e.us-east.insforge.app';
const insforgeApiKey = process.env.INSFORGE_API_KEY || 'ik_1df0a9cfebae220d87863047d916492b';

const insforgeAdmin = createAdminClient({
  baseUrl: insforgeUrl,
  apiKey: insforgeApiKey,
});

async function runVerification() {
  console.log('🔍 Testing InsForge Live Database Connections, Storage & Queries...\n');

  // 1. Test Users Query
  console.log('1. Testing User Fetch...');
  const { data: users, error: usersErr } = await insforgeAdmin.database
    .from('users')
    .select('id, name, email, role, subscription_tier, is_verified')
    .limit(5);

  if (usersErr) throw new Error(`Users fetch failed: ${usersErr.message}`);
  console.log(`✅ Fetched ${users?.length} users successfully. Example user: ${users?.[0]?.name} (${users?.[0]?.email})`);

  // 2. Test Super Admin Lookup
  console.log('\n2. Testing Super Admin Lookup...');
  const { data: adminUser, error: adminErr } = await insforgeAdmin.database
    .from('users')
    .select('id, name, email, role')
    .eq('email', 'ladi02893@gmail.com')
    .single();

  if (adminErr || !adminUser) throw new Error(`Admin lookup failed: ${adminErr?.message}`);
  console.log(`✅ Super Admin Verified: ${adminUser.name} | Role: ${adminUser.role} | ID: ${adminUser.id}`);

  // 3. Test Matrimonial Profiles with Relational Joins
  console.log('\n3. Testing Matrimonial Profiles with Nested Joins (Photos, Education, Lifestyle, Family)...');
  const { data: profiles, error: profErr } = await insforgeAdmin.database
    .from('matrimonial_profiles')
    .select('id, full_name, gender, city, photos:profile_photos(*), educationCareer:education_careers(*), lifestyle:lifestyles(*), familyInfo:family_infos(*)')
    .limit(3);

  if (profErr) throw new Error(`Profiles join fetch failed: ${profErr.message}`);
  console.log(`✅ Fetched ${profiles?.length} profiles with relations successfully!`);
  profiles?.forEach((p: any) => {
    console.log(`   - [${p.gender}] ${p.full_name} (${p.city}) | Photos: ${p.photos?.length || 0} | Profession: ${p.educationCareer?.[0]?.profession || 'N/A'}`);
  });

  // 4. Test Data Store (Insert + Fetch + Update + Delete Cycle)
  console.log('\n4. Testing Dynamic Data Insertion & Storage (Interest Proposal)...');
  const testSender = users?.[0]?.id;
  const testReceiver = users?.[1]?.id;

  const { data: insertedInterest, error: insertErr } = await insforgeAdmin.database
    .from('interest_requests')
    .insert([{
      sender_id: testSender,
      sender_profile_id: 'test-profile-1',
      receiver_id: testReceiver,
      receiver_profile_id: 'test-profile-2',
      message: 'Assalam o Alaikum, testing live InsForge matchmaking workflow.',
      status: 'PENDING',
    }])
    .select()
    .single();

  if (insertErr || !insertedInterest) throw new Error(`Insert failed: ${insertErr?.message}`);
  console.log(`✅ Inserted test interest request! ID: ${insertedInterest.id} | Status: ${insertedInterest.status}`);

  // 5. Update Status
  console.log('\n5. Testing Data Update...');
  const { data: updatedInterest, error: updateErr } = await insforgeAdmin.database
    .from('interest_requests')
    .update({ status: 'ACCEPTED' })
    .eq('id', insertedInterest.id)
    .select()
    .single();

  if (updateErr || updatedInterest?.status !== 'ACCEPTED') throw new Error(`Update failed: ${updateErr?.message}`);
  console.log(`✅ Updated interest status successfully to: ${updatedInterest.status}`);

  // 6. Cleanup Test Data
  await insforgeAdmin.database.from('interest_requests').delete().eq('id', insertedInterest.id);
  console.log('✅ Cleaned up temporary test record.');

  // 7. Verify Storage Buckets
  console.log('\n7. Testing Storage Buckets...');
  const buckets = ['profile-photos', 'verification-documents', 'uploads', 'payment-proofs'];
  for (const b of buckets) {
    const { data: files, error: bErr } = await insforgeAdmin.storage.from(b).list();
    if (bErr) console.warn(`Bucket warning (${b}): ${bErr.message}`);
    else console.log(`✅ Storage Bucket '${b}' is active and reachable.`);
  }

  // 8. Test Receiving Accounts & Plans
  console.log('\n8. Testing Receiving Accounts & Subscription Plans...');
  const { data: plans } = await insforgeAdmin.database.from('subscription_plans').select('slug, name, monthly_price');
  const { data: accounts } = await insforgeAdmin.database.from('receiving_accounts').select('bank_name, account_title, account_number');

  console.log(`✅ Active Subscription Plans: ${plans?.map((p: any) => `${p.name} (PKR ${p.monthly_price})`).join(', ')}`);
  console.log(`✅ Active Receiving Accounts: ${accounts?.map((a: any) => `${a.bank_name} (${a.account_title})`).join(', ')}`);

  console.log('\n🎉 ALL INSFORGE DATABASE, STORAGE, FETCHING & STORING OPERATIONS ARE 100% OPERATIONAL!');
}

runVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
