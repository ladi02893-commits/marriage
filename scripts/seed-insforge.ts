import { createAdminClient } from '@insforge/sdk';
import {
  INITIAL_USERS,
  INITIAL_PROFILES,
  INITIAL_PLANS,
  INITIAL_RECEIVING_ACCOUNTS,
  INITIAL_SETTINGS,
} from '../src/lib/data-store';
import bcrypt from 'bcryptjs';

const insforgeUrl = process.env.INSFORGE_URL || process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://w5x7768e.us-east.insforge.app';
const insforgeApiKey = process.env.INSFORGE_API_KEY || 'ik_1df0a9cfebae220d87863047d916492b';

const insforgeAdmin = createAdminClient({
  baseUrl: insforgeUrl,
  apiKey: insforgeApiKey,
});

async function main() {
  console.log('🌱 Starting InsForge Pakistani Matrimonial Database Seeding...');

  // 1. Seed Users
  console.log('Inserting users...');
  for (const user of INITIAL_USERS as any[]) {
    const password = user.email === 'ladi02893@gmail.com' ? 'ladi02893' : 'password123';
    const passwordHash = await bcrypt.hash(password, 10);

    const { error: userError } = await insforgeAdmin.database
      .from('users')
      .upsert([{
        id: user.id,
        email: user.email.toLowerCase(),
        password_hash: passwordHash,
        name: user.name,
        role: user.role,
        is_verified: user.isVerified,
        subscription_tier: user.subscriptionTier,
        account_status: user.accountStatus,
        avatar_url: user.avatarUrl,
        created_at: user.createdAt,
      }], { onConflict: 'email' });

    if (userError) {
      console.warn(`User insert notice (${user.email}):`, userError.message);
    }
  }

  // 2. Seed Matrimonial Profiles
  console.log('Inserting profiles & nested relations...');
  for (const p of INITIAL_PROFILES as any[]) {
    const { error: profileError } = await insforgeAdmin.database
      .from('matrimonial_profiles')
      .upsert([{
        id: p.id,
        user_id: p.userId,
        profile_created_for: (p as any).profileCreatedFor || 'SELF',
        full_name: p.fullName,
        display_name: p.displayName || p.fullName.split(' ')[0],
        gender: p.gender,
        date_of_birth: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString() : new Date('1998-01-01').toISOString(),
        marital_status: p.maritalStatus || 'NEVER_MARRIED',
        religion: p.religion || 'ISLAM',
        sect_or_community: p.sectOrCommunity || 'Sunni',
        caste_or_sub_clan: p.caste || p.subClan || null,
        mother_tongue: p.motherTongue || 'Urdu',
        country: p.country || 'Pakistan',
        state_province: p.state || p.province || 'Punjab',
        city: p.city || 'Lahore',
        bio_headline: p.bioHeadline || '',
        about_me: p.aboutMe || '',
        completion_percentage: p.completionPercentage || 85,
        view_count: p.viewCount || 10,
        like_count: p.likeCount || 3,
        created_at: p.createdAt || new Date().toISOString(),
      }], { onConflict: 'id' });

    if (profileError) {
      console.warn(`Profile insert notice (${p.id}):`, profileError.message);
    }

    // Child relations
    if (p.photos && p.photos.length > 0) {
      await insforgeAdmin.database.from('profile_photos').delete().eq('profile_id', p.id);
      await insforgeAdmin.database.from('profile_photos').insert(
        p.photos.map((ph: any, idx: number) => ({
          profile_id: p.id,
          url: ph.url,
          is_primary: ph.isPrimary ?? idx === 0,
          is_approved: ph.isApproved ?? true,
          order_num: ph.order ?? idx + 1,
        }))
      );
    }

    if (p.educationCareer) {
      await insforgeAdmin.database.from('education_careers').upsert([{
        profile_id: p.id,
        highest_degree: p.educationCareer.highestDegree || "Bachelor's",
        field_of_study: p.educationCareer.fieldOfStudy || null,
        institution: p.educationCareer.institution || null,
        profession: p.educationCareer.profession || 'Professional',
        job_title: p.educationCareer.jobTitle || null,
        company_name: p.educationCareer.company || null,
        annual_income: p.educationCareer.annualIncome?.toString() || null,
        currency: 'PKR',
      }], { onConflict: 'profile_id' });
    }

    if (p.lifestyle) {
      await insforgeAdmin.database.from('lifestyles').upsert([{
        profile_id: p.id,
        height: p.lifestyle.height || "5' 8\"",
        weight: p.lifestyle.weight || null,
        body_type: p.lifestyle.bodyType || 'AVERAGE',
        diet: p.lifestyle.diet || 'HALAL_ONLY',
        smoking: p.lifestyle.smoking || 'NO',
        drinking: p.lifestyle.drinking || 'NO',
        mother_tongue: p.lifestyle.motherTongue || 'Urdu',
        languages_spoken: p.lifestyle.languagesSpoken || ['English', 'Urdu'],
      }], { onConflict: 'profile_id' });
    }

    if (p.familyInfo) {
      await insforgeAdmin.database.from('family_infos').upsert([{
        profile_id: p.id,
        family_type: p.familyInfo.familyType || 'NUCLEAR',
        family_values: p.familyInfo.familyValues || 'MODERATE',
        family_status: p.familyInfo.livingStatus || null,
        father_occupation: p.familyInfo.fatherOccupation || null,
        mother_occupation: p.familyInfo.motherOccupation || null,
        brothers_count: p.familyInfo.brothersCount || 0,
        sisters_count: p.familyInfo.sistersCount || 0,
        family_location: p.familyInfo.familyLocation || null,
        about_family: p.familyInfo.aboutFamily || null,
      }], { onConflict: 'profile_id' });
    }

    if (p.partnerPreferences) {
      await insforgeAdmin.database.from('partner_preferences').upsert([{
        profile_id: p.id,
        min_age: p.partnerPreferences.ageRange?.min || 20,
        max_age: p.partnerPreferences.ageRange?.max || 38,
        marital_statuses: p.partnerPreferences.maritalStatus || [],
        religions: p.partnerPreferences.religions || ['ISLAM'],
        expectations_notes: p.partnerPreferences.expectationsNotes || 'Seeking a compatible, sincere partner.',
      }], { onConflict: 'profile_id' });
    }

    if (p.privacy) {
      await insforgeAdmin.database.from('privacy_settings').upsert([{
        profile_id: p.id,
        photo_visibility: p.privacy.photoVisibility || 'ALL',
        contact_visibility: p.privacy.contactVisibility || 'ONLY_ACCEPTED_INTERESTS',
        show_age: p.privacy.showAge ?? true,
        show_income: p.privacy.showIncome ?? true,
        show_last_seen: p.privacy.showLastSeen ?? true,
      }], { onConflict: 'profile_id' });
    }
  }

  // 3. Seed Subscription Plans
  console.log('Inserting subscription plans...');
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

  // 4. Seed Receiving Accounts
  console.log('Inserting receiving accounts...');
  for (const acc of INITIAL_RECEIVING_ACCOUNTS) {
    await insforgeAdmin.database.from('receiving_accounts').upsert([{
      id: acc.id,
      provider: acc.provider,
      bank_name: acc.bankName,
      account_title: acc.accountTitle,
      account_number: acc.accountNumber,
      iban: acc.iban || null,
      branch_name: acc.branchName || null,
      instructions: acc.instructions || null,
      is_active: acc.isActive ?? true,
      is_primary: acc.isPrimary ?? false,
    }], { onConflict: 'id' });
  }

  // 5. Seed System Settings
  console.log('Inserting system settings...');
  await insforgeAdmin.database.from('system_settings').upsert([{
    id: 'default-settings',
    site_name: INITIAL_SETTINGS.siteName || 'TRUEPAIR Marriage Bureau',
    min_age: INITIAL_SETTINGS.minAge || 20,
    require_email_verification: INITIAL_SETTINGS.requireEmailVerification ?? true,
    free_tier_monthly_interest_limit: INITIAL_SETTINGS.freeTierMonthlyInterestLimit || 5,
    matching_weights: INITIAL_SETTINGS.matchingWeights || {},
  }], { onConflict: 'id' });

  console.log('✅ InsForge Pakistani Matrimonial Database Seeding Completed Successfully!');
}

main().catch((err) => {
  console.error('Seeding fatal error:', err);
  process.exit(1);
});
