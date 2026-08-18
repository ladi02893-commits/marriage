import { createAdminClient } from '@insforge/sdk';
import bcrypt from 'bcryptjs';

const insforgeUrl = process.env.INSFORGE_URL || process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://w5x7768e.us-east.insforge.app';
const insforgeApiKey = process.env.INSFORGE_API_KEY || 'ik_1df0a9cfebae220d87863047d916492b';

const insforgeAdmin = createAdminClient({
  baseUrl: insforgeUrl,
  apiKey: insforgeApiKey,
});

async function main() {
  console.log('🧹 Purging all fake records from InsForge database...');

  // 1. Clear child tables first to avoid FK constraint issues
  await insforgeAdmin.database.from('ticket_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await insforgeAdmin.database.from('support_tickets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await insforgeAdmin.database.from('abuse_reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await insforgeAdmin.database.from('verification_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await insforgeAdmin.database.from('payment_proofs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await insforgeAdmin.database.from('invoices').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await insforgeAdmin.database.from('user_subscriptions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await insforgeAdmin.database.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await insforgeAdmin.database.from('conversations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await insforgeAdmin.database.from('interest_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await insforgeAdmin.database.from('favorites').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await insforgeAdmin.database.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await insforgeAdmin.database.from('admin_audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Profile child tables
  await insforgeAdmin.database.from('profile_photos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await insforgeAdmin.database.from('education_careers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await insforgeAdmin.database.from('lifestyles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await insforgeAdmin.database.from('family_infos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await insforgeAdmin.database.from('partner_preferences').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await insforgeAdmin.database.from('privacy_settings').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Delete all matrimonial profiles and users
  await insforgeAdmin.database.from('matrimonial_profiles').delete().neq('id', 'placeholder');
  await insforgeAdmin.database.from('users').delete().neq('id', 'placeholder');

  console.log('✨ All old fake data wiped clean from database.');

  // ==========================================
  // INSERT EXACT 3 REAL USERS
  // ==========================================
  console.log('\n👤 Inserting 3 Real System Users...');

  const ladiPassHash = await bcrypt.hash('ladi02893', 10);
  const commonPassHash = await bcrypt.hash('password123', 10);

  const realUsers = [
    {
      id: 'user-ladi',
      email: 'ladi02893@gmail.com',
      password_hash: ladiPassHash,
      name: 'Ladi (Super Admin)',
      role: 'SUPER_ADMIN',
      subscription_tier: 'PREMIUM_PLUS',
      is_verified: true,
      account_status: 'ACTIVE',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 'user-amna',
      email: 'amna.khan@gmail.com',
      password_hash: commonPassHash,
      name: 'Amna Khan',
      role: 'USER',
      subscription_tier: 'PREMIUM',
      is_verified: true,
      account_status: 'ACTIVE',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 'user-boy-1',
      email: 'hamza.malik@gmail.com',
      password_hash: commonPassHash,
      name: 'Dr. Hamza Malik',
      role: 'USER',
      subscription_tier: 'PREMIUM',
      is_verified: true,
      account_status: 'ACTIVE',
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    },
  ];

  for (const u of realUsers) {
    const { error } = await insforgeAdmin.database.from('users').insert([u]);
    if (error) console.error(`Error creating user ${u.email}:`, error.message);
    else console.log(`  ✓ Created user: ${u.name} (${u.email}) [Role: ${u.role}]`);
  }

  // ==========================================
  // INSERT PROFILES & RELATIONS FOR THE 3 USERS
  // ==========================================
  console.log('\n📋 Inserting Detailed Matrimonial Profiles for the 3 Users...');

  // 1. Super Admin Profile
  await insforgeAdmin.database.from('matrimonial_profiles').insert([{
    id: 'profile-ladi',
    user_id: 'user-ladi',
    profile_created_for: 'SELF',
    full_name: 'Ladi (Super Admin)',
    display_name: 'Ladi',
    gender: 'MALE',
    date_of_birth: new Date('1995-05-15').toISOString(),
    marital_status: 'NEVER_MARRIED',
    religion: 'ISLAM',
    sect_or_community: 'Sunni',
    caste_or_sub_clan: 'Syed',
    mother_tongue: 'Urdu',
    country: 'Pakistan',
    state_province: 'Punjab',
    city: 'Lahore',
    bio_headline: 'Super Administrator & Matchmaking Executive Director',
    about_me: 'Official System Administrator for Compatible Matrimonials. Ensuring high standards, security, and verified matchmaking.',
    completion_percentage: 100,
    view_count: 100,
    like_count: 25,
  }]);

  await insforgeAdmin.database.from('profile_photos').insert([{
    profile_id: 'profile-ladi',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    is_primary: true,
    is_approved: true,
    order_num: 1,
  }]);

  await insforgeAdmin.database.from('education_careers').insert([{
    profile_id: 'profile-ladi',
    highest_degree: "Master's in Computer Science",
    institution: 'LUMS Lahore',
    profession: 'Executive Director & Tech Architect',
    annual_income: 'PKR 10 Million',
    currency: 'PKR',
  }]);

  await insforgeAdmin.database.from('lifestyles').insert([{
    profile_id: 'profile-ladi',
    height: "5' 10\"",
    weight: '74 kg',
    diet: 'HALAL_ONLY',
    smoking: 'NO',
    drinking: 'NO',
    mother_tongue: 'Urdu',
    languages_spoken: ['English', 'Urdu', 'Punjabi'],
  }]);

  await insforgeAdmin.database.from('family_infos').insert([{
    profile_id: 'profile-ladi',
    family_type: 'NUCLEAR',
    family_values: 'MODERATE',
    father_occupation: 'Retired Civil Servant',
    mother_occupation: 'Educator & Homemaker',
    brothers_count: 1,
    sisters_count: 1,
    family_location: 'Lahore, Pakistan',
    about_family: 'Respected, educated family with high ethical standards.',
  }]);

  await insforgeAdmin.database.from('partner_preferences').insert([{
    profile_id: 'profile-ladi',
    min_age: 22,
    max_age: 30,
    marital_statuses: ['NEVER_MARRIED'],
    religions: ['ISLAM'],
    expectations_notes: 'Seeking a sincere, educated life partner with good moral values.',
  }]);

  await insforgeAdmin.database.from('privacy_settings').insert([{
    profile_id: 'profile-ladi',
    photo_visibility: 'ALL',
    contact_visibility: 'ONLY_ACCEPTED_INTERESTS',
    show_age: true,
    show_income: true,
  }]);
  console.log('  ✓ Created Super Admin Profile (profile-ladi)');

  // 2. Amna Khan (Bride) Profile
  await insforgeAdmin.database.from('matrimonial_profiles').insert([{
    id: 'profile-amna',
    user_id: 'user-amna',
    profile_created_for: 'SELF',
    full_name: 'Amna Khan',
    display_name: 'Amna K.',
    gender: 'FEMALE',
    date_of_birth: new Date('1999-08-20').toISOString(),
    marital_status: 'NEVER_MARRIED',
    religion: 'ISLAM',
    sect_or_community: 'Sunni',
    caste_or_sub_clan: 'Niazi (Pathan)',
    mother_tongue: 'Urdu',
    country: 'Pakistan',
    state_province: 'Punjab',
    city: 'Lahore',
    bio_headline: 'Clinical Psychologist with a balanced outlook towards religious values and career',
    about_me: 'Alhamdulillah, I am a family-oriented professional who values mutual respect, open communication, and spiritual growth. Working as a psychologist and part-time lecturer.',
    completion_percentage: 96,
    view_count: 320,
    like_count: 45,
  }]);

  await insforgeAdmin.database.from('profile_photos').insert([{
    profile_id: 'profile-amna',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    is_primary: true,
    is_approved: true,
    order_num: 1,
  }]);

  await insforgeAdmin.database.from('education_careers').insert([{
    profile_id: 'profile-amna',
    highest_degree: 'MS in Clinical Psychology',
    institution: 'Kinnaird College / GCU Lahore',
    profession: 'Clinical Psychologist & Lecturer',
    annual_income: 'PKR 2.2 Million',
    currency: 'PKR',
  }]);

  await insforgeAdmin.database.from('lifestyles').insert([{
    profile_id: 'profile-amna',
    height: "5' 6\"",
    weight: '56 kg',
    diet: 'HALAL_ONLY',
    smoking: 'NO',
    drinking: 'NO',
    mother_tongue: 'Urdu',
    languages_spoken: ['English', 'Urdu', 'Pashto'],
  }]);

  await insforgeAdmin.database.from('family_infos').insert([{
    profile_id: 'profile-amna',
    family_type: 'NUCLEAR',
    family_values: 'MODERATE',
    father_occupation: 'Executive Businessman',
    mother_occupation: 'Homemaker',
    brothers_count: 1,
    sisters_count: 2,
    family_location: 'Gulberg, Lahore',
    about_family: 'Warm, educated, and well-settled family with deep ethical values.',
  }]);

  await insforgeAdmin.database.from('partner_preferences').insert([{
    profile_id: 'profile-amna',
    min_age: 26,
    max_age: 34,
    marital_statuses: ['NEVER_MARRIED'],
    religions: ['ISLAM'],
    expectations_notes: 'Seeking a sincere, well-educated, and professionally settled gentleman with kind demeanor.',
  }]);

  await insforgeAdmin.database.from('privacy_settings').insert([{
    profile_id: 'profile-amna',
    photo_visibility: 'ALL',
    contact_visibility: 'ONLY_ACCEPTED_INTERESTS',
    show_age: true,
    show_income: true,
  }]);
  console.log('  ✓ Created Candidate Bride Profile (profile-amna)');

  // 3. Dr. Hamza Malik (Groom) Profile
  await insforgeAdmin.database.from('matrimonial_profiles').insert([{
    id: 'profile-boy-1',
    user_id: 'user-boy-1',
    profile_created_for: 'SELF',
    full_name: 'Dr. Hamza Malik',
    display_name: 'Dr. Hamza M.',
    gender: 'MALE',
    date_of_birth: new Date('1995-10-12').toISOString(),
    marital_status: 'NEVER_MARRIED',
    religion: 'ISLAM',
    sect_or_community: 'Sunni',
    caste_or_sub_clan: 'Malik (Awan)',
    mother_tongue: 'Urdu',
    country: 'Pakistan',
    state_province: 'Punjab',
    city: 'Lahore',
    bio_headline: 'Consultant Cardiologist (FCPS) with strong family values',
    about_me: 'Specialist physician working at a premier hospital in Lahore. Grounded, family-oriented, and looking for an educated life partner.',
    completion_percentage: 98,
    view_count: 410,
    like_count: 58,
  }]);

  await insforgeAdmin.database.from('profile_photos').insert([{
    profile_id: 'profile-boy-1',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800',
    is_primary: true,
    is_approved: true,
    order_num: 1,
  }]);

  await insforgeAdmin.database.from('education_careers').insert([{
    profile_id: 'profile-boy-1',
    highest_degree: 'MBBS, FCPS Cardiology',
    institution: 'King Edward Medical University',
    profession: 'Consultant Cardiologist / Physician',
    annual_income: 'PKR 5.5 Million',
    currency: 'PKR',
  }]);

  await insforgeAdmin.database.from('lifestyles').insert([{
    profile_id: 'profile-boy-1',
    height: "5' 11\"",
    weight: '76 kg',
    diet: 'HALAL_ONLY',
    smoking: 'NO',
    drinking: 'NO',
    mother_tongue: 'Urdu',
    languages_spoken: ['English', 'Urdu', 'Punjabi'],
  }]);

  await insforgeAdmin.database.from('family_infos').insert([{
    profile_id: 'profile-boy-1',
    family_type: 'NUCLEAR',
    family_values: 'MODERATE',
    father_occupation: 'Professor of Medicine',
    mother_occupation: 'Doctor (Gynecologist)',
    brothers_count: 1,
    sisters_count: 1,
    family_location: 'DHA, Lahore',
    about_family: 'Medical family background with high social standing and ethical grounding.',
  }]);

  await insforgeAdmin.database.from('partner_preferences').insert([{
    profile_id: 'profile-boy-1',
    min_age: 23,
    max_age: 29,
    marital_statuses: ['NEVER_MARRIED'],
    religions: ['ISLAM'],
    expectations_notes: 'Seeking a graceful, educated lady from a noble and practicing family.',
  }]);

  await insforgeAdmin.database.from('privacy_settings').insert([{
    profile_id: 'profile-boy-1',
    photo_visibility: 'ALL',
    contact_visibility: 'ONLY_ACCEPTED_INTERESTS',
    show_age: true,
    show_income: true,
  }]);
  console.log('  ✓ Created Candidate Groom Profile (profile-boy-1)');

  // 4. Ensure Plans, Receiving Accounts, and Settings
  console.log('\n💳 Ensuring Subscription Plans, Receiving Accounts, and Settings...');
  const defaultPlans = [
    {
      id: 'plan-free',
      slug: 'FREE',
      name: 'Standard Member',
      description: 'Basic matchmaking profile and search',
      monthly_price: 0,
      yearly_price: 0,
      features: ['View public candidate profiles', 'Send up to 5 interests/month', 'Basic search filters'],
      badge: 'Free Tier',
      max_interests_per_month: 5,
      can_view_contact_directly: false,
      can_message_directly: false,
      is_featured: false,
    },
    {
      id: 'plan-premium',
      slug: 'PREMIUM',
      name: 'Elite Executive',
      description: 'Direct contact details and direct messaging',
      monthly_price: 15000,
      yearly_price: 150000,
      features: ['View verified contact numbers', 'Unlimited Direct Messages', 'Priority profile placement', 'Verified match badge'],
      badge: 'Most Popular',
      max_interests_per_month: 50,
      can_view_contact_directly: true,
      can_message_directly: true,
      is_featured: true,
    },
    {
      id: 'plan-vip',
      slug: 'PREMIUM_PLUS',
      name: 'VIP Royal Matchmaking',
      description: 'Dedicated relationship advisor and highest priority',
      monthly_price: 35000,
      yearly_price: 350000,
      features: ['Dedicated relationship advisor', 'Background verification report', 'Confidential browsing', 'Highest match score boost'],
      badge: 'VIP Elite',
      max_interests_per_month: 100,
      can_view_contact_directly: true,
      can_message_directly: true,
      is_featured: false,
    },
  ];

  for (const plan of defaultPlans) {
    await insforgeAdmin.database.from('subscription_plans').upsert([plan], { onConflict: 'slug' });
  }

  const receivingAccounts = [
    {
      id: 'acc-1',
      provider: 'JAZZCASH',
      bank_name: 'JazzCash Wallet / Merchant',
      account_title: 'Compatible Matrimonials',
      account_number: '0300-1234567',
      instructions: 'Send fee via JazzCash App or Retailer & attach screenshot with Trx ID.',
      is_active: true,
      is_primary: true,
    },
    {
      id: 'acc-2',
      provider: 'EASYPAISA',
      bank_name: 'Easypaisa Mobile Account',
      account_title: 'Compatible Matrimonials',
      account_number: '0345-8899001',
      instructions: 'Transfer fee via Easypaisa App or Telenor franchise and submit payment proof.',
      is_active: true,
      is_primary: true,
    },
    {
      id: 'acc-3',
      provider: 'BANK_TRANSFER',
      bank_name: 'Meezan Bank Limited',
      account_title: 'Compatible Matrimonials Bureau',
      account_number: '0101-0103456789',
      iban: 'PK36MEZN0001010103456789',
      branch_name: 'DHA Phase 5 Branch, Lahore',
      instructions: 'Online Interbank Fund Transfer (IBFT) or ATM deposit.',
      is_active: true,
      is_primary: true,
    },
    {
      id: 'acc-4',
      provider: 'RAAST',
      bank_name: 'Raast Instant ID (State Bank of Pakistan)',
      account_title: 'Compatible Matrimonials',
      account_number: '03001234567',
      instructions: 'Instant zero-fee transfer via any Pakistani banking app using Raast ID.',
      is_active: true,
      is_primary: false,
    },
  ];

  for (const acc of receivingAccounts) {
    await insforgeAdmin.database.from('receiving_accounts').upsert([acc], { onConflict: 'id' });
  }

  await insforgeAdmin.database.from('system_settings').upsert([{
    id: 'default-settings',
    site_name: 'Compatible Matrimonials',
    min_age: 20,
    require_email_verification: true,
    free_tier_monthly_interest_limit: 5,
    matching_weights: {
      ageWeight: 15,
      locationWeight: 15,
      educationWeight: 15,
      professionWeight: 15,
      lifestyleWeight: 15,
      familyWeight: 15,
      maritalWeight: 10,
    },
  }], { onConflict: 'id' });

  console.log('\n🎉 ALL FAKE DATA REMOVED! Only 3 Real Users and Clean Realtime Database Configured!');
}

main().catch((err) => {
  console.error('Error during cleanup:', err);
  process.exit(1);
});
