-- InsForge Initial Database Schema Migration for TRUEPAIR Matrimonial Bureau

-- 1. Helper function for updated_at if not present
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 2. CORE USERS & MATRIMONIAL PROFILES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'USER',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT NOT NULL DEFAULT 'FREE',
  account_status TEXT NOT NULL DEFAULT 'ACTIVE',
  avatar_url TEXT,
  phone TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.matrimonial_profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  profile_created_for TEXT NOT NULL DEFAULT 'SELF',
  full_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  gender TEXT NOT NULL,
  date_of_birth TIMESTAMPTZ NOT NULL,
  marital_status TEXT NOT NULL,
  religion TEXT NOT NULL,
  sect_or_community TEXT,
  caste_or_sub_clan TEXT,
  mother_tongue TEXT NOT NULL,
  country TEXT NOT NULL,
  state_province TEXT,
  city TEXT NOT NULL,
  bio_headline TEXT NOT NULL DEFAULT '',
  about_me TEXT NOT NULL DEFAULT '',
  completion_percentage INTEGER NOT NULL DEFAULT 30,
  view_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profile_photos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_id TEXT NOT NULL REFERENCES public.matrimonial_profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  order_num INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.education_careers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_id TEXT UNIQUE NOT NULL REFERENCES public.matrimonial_profiles(id) ON DELETE CASCADE,
  highest_degree TEXT NOT NULL,
  field_of_study TEXT,
  institution TEXT,
  profession TEXT NOT NULL,
  job_title TEXT,
  company_name TEXT,
  annual_income TEXT,
  currency TEXT NOT NULL DEFAULT 'USD'
);

CREATE TABLE IF NOT EXISTS public.lifestyles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_id TEXT UNIQUE NOT NULL REFERENCES public.matrimonial_profiles(id) ON DELETE CASCADE,
  height TEXT NOT NULL,
  weight TEXT,
  body_type TEXT,
  complexion TEXT,
  diet TEXT NOT NULL DEFAULT 'HALAL_ONLY',
  smoking TEXT NOT NULL DEFAULT 'NO',
  drinking TEXT NOT NULL DEFAULT 'NO',
  mother_tongue TEXT NOT NULL DEFAULT 'Urdu',
  languages_spoken TEXT[] NOT NULL DEFAULT ARRAY['English'::text]
);

CREATE TABLE IF NOT EXISTS public.family_infos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_id TEXT UNIQUE NOT NULL REFERENCES public.matrimonial_profiles(id) ON DELETE CASCADE,
  family_type TEXT NOT NULL DEFAULT 'NUCLEAR',
  family_values TEXT NOT NULL DEFAULT 'MODERATE',
  family_status TEXT,
  father_occupation TEXT,
  mother_occupation TEXT,
  brothers_count INTEGER NOT NULL DEFAULT 0,
  sisters_count INTEGER NOT NULL DEFAULT 0,
  brothers_married INTEGER NOT NULL DEFAULT 0,
  sisters_married INTEGER NOT NULL DEFAULT 0,
  family_location TEXT,
  about_family TEXT
);

CREATE TABLE IF NOT EXISTS public.partner_preferences (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_id TEXT UNIQUE NOT NULL REFERENCES public.matrimonial_profiles(id) ON DELETE CASCADE,
  min_age INTEGER NOT NULL DEFAULT 20,
  max_age INTEGER NOT NULL DEFAULT 38,
  min_height TEXT,
  max_height TEXT,
  marital_statuses TEXT[] DEFAULT ARRAY[]::TEXT[],
  religions TEXT[] DEFAULT ARRAY[]::TEXT[],
  mother_tongues TEXT[] DEFAULT ARRAY[]::TEXT[],
  countries TEXT[] DEFAULT ARRAY[]::TEXT[],
  education_levels TEXT[] DEFAULT ARRAY[]::TEXT[],
  professions TEXT[] DEFAULT ARRAY[]::TEXT[],
  diets TEXT[] DEFAULT ARRAY[]::TEXT[],
  expectations_notes TEXT
);

CREATE TABLE IF NOT EXISTS public.privacy_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_id TEXT UNIQUE NOT NULL REFERENCES public.matrimonial_profiles(id) ON DELETE CASCADE,
  photo_visibility TEXT NOT NULL DEFAULT 'ALL',
  contact_visibility TEXT NOT NULL DEFAULT 'ONLY_ACCEPTED_INTERESTS',
  show_age BOOLEAN NOT NULL DEFAULT true,
  show_income BOOLEAN NOT NULL DEFAULT true,
  show_last_seen BOOLEAN NOT NULL DEFAULT true,
  search_engine_index BOOLEAN NOT NULL DEFAULT false,
  hide_profile_temporarily BOOLEAN NOT NULL DEFAULT false
);

-- ============================================================================
-- 3. INTERACTIONS, CHAT & NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.interest_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  sender_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sender_profile_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_profile_id TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.favorites (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_profile_id TEXT NOT NULL REFERENCES public.matrimonial_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT favorites_user_target_unique UNIQUE (user_id, target_profile_id)
);

CREATE TABLE IF NOT EXISTS public.conversations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  participant_a_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  participant_b_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  last_message_text TEXT,
  last_message_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT conversations_participants_unique UNIQUE (participant_a_id, participant_b_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conversation_id TEXT NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'GENERAL',
  is_read BOOLEAN NOT NULL DEFAULT false,
  link_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. SUBSCRIPTIONS, BILLING & PAYMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  monthly_price NUMERIC(10,2) NOT NULL,
  yearly_price NUMERIC(10,2) NOT NULL,
  features TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  badge TEXT,
  max_interests_per_month INTEGER NOT NULL DEFAULT 15,
  can_view_contact_directly BOOLEAN NOT NULL DEFAULT false,
  can_message_directly BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'PAID',
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payment_method TEXT NOT NULL DEFAULT 'Credit Card (•••• 4242)',
  plan_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payment_proofs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  plan_slug TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PKR',
  payment_method TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  sender_account_number TEXT,
  screenshot_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  rejection_reason TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.receiving_accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  provider TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_title TEXT NOT NULL,
  account_number TEXT NOT NULL,
  iban TEXT,
  branch_name TEXT,
  instructions TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. VERIFICATIONS, REPORTS, TICKETS & CMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.verification_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_front_url TEXT NOT NULL,
  document_back_url TEXT,
  selfie_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  reviewer_notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.abuse_reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  reporter_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reported_user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_url TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN',
  admin_action_taken TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'GENERAL',
  status TEXT NOT NULL DEFAULT 'OPEN',
  priority TEXT NOT NULL DEFAULT 'NORMAL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ticket_id TEXT NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender TEXT NOT NULL DEFAULT 'USER',
  sender_name TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER,
  fixed_discount NUMERIC(10,2),
  usage_limit INTEGER NOT NULL DEFAULT 100,
  times_used INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cms_contents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  admin_id TEXT NOT NULL,
  admin_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details TEXT NOT NULL,
  ip_address TEXT NOT NULL DEFAULT '127.0.0.1',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.system_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  site_name TEXT NOT NULL DEFAULT 'TRUEPAIR Marriage Bureau',
  min_age INTEGER NOT NULL DEFAULT 20,
  require_email_verification BOOLEAN NOT NULL DEFAULT true,
  free_tier_monthly_interest_limit INTEGER NOT NULL DEFAULT 5,
  matching_weights JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. TRIGGERS FOR UPDATED_AT
-- ============================================================================

DROP TRIGGER IF EXISTS users_updated_at ON public.users;
CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS matrimonial_profiles_updated_at ON public.matrimonial_profiles;
CREATE TRIGGER matrimonial_profiles_updated_at BEFORE UPDATE ON public.matrimonial_profiles FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS interest_requests_updated_at ON public.interest_requests;
CREATE TRIGGER interest_requests_updated_at BEFORE UPDATE ON public.interest_requests FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS conversations_updated_at ON public.conversations;
CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS receiving_accounts_updated_at ON public.receiving_accounts;
CREATE TRIGGER receiving_accounts_updated_at BEFORE UPDATE ON public.receiving_accounts FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS cms_contents_updated_at ON public.cms_contents;
CREATE TRIGGER cms_contents_updated_at BEFORE UPDATE ON public.cms_contents FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS system_settings_updated_at ON public.system_settings;
CREATE TRIGGER system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) & PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matrimonial_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifestyles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_infos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interest_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receiving_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abuse_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Allow unrestricted read/write for application operations
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "allow_all_%I" ON public.%I', tbl, tbl);
    EXECUTE format('CREATE POLICY "allow_all_%I" ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)', tbl, tbl);
  END LOOP;
END
$$;
