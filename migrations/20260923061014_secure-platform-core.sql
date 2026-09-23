ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS profile_id_code TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
  ADD COLUMN IF NOT EXISTS is_whatsapp_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS total_connections INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS used_connections INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS remaining_connections INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS assigned_consultant_id TEXT,
  ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 0;

WITH numbered AS (
  SELECT id, row_number() OVER (ORDER BY created_at, id) AS sequence_number
  FROM public.users WHERE profile_id_code IS NULL
)
UPDATE public.users AS users
SET profile_id_code = 'TP-' || lpad(numbered.sequence_number::text, 6, '0')
FROM numbered WHERE users.id = numbered.id;

ALTER TABLE public.users ALTER COLUMN profile_id_code SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_profile_id_code_unique ON public.users (profile_id_code);
ALTER TABLE public.users ADD CONSTRAINT users_connection_counts_valid CHECK (
  total_connections >= 0 AND used_connections >= 0 AND remaining_connections >= 0 AND
  used_connections <= total_connections AND remaining_connections = total_connections - used_connections
);

ALTER TABLE public.matrimonial_profiles
  ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_boosted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_badge TEXT NOT NULL DEFAULT 'UNVERIFIED',
  ADD COLUMN IF NOT EXISTS is_identity_verified BOOLEAN NOT NULL DEFAULT false;
UPDATE public.matrimonial_profiles SET approval_status = 'APPROVED';

ALTER TABLE public.profile_photos ADD COLUMN IF NOT EXISTS storage_key TEXT;
ALTER TABLE public.payment_proofs ADD COLUMN IF NOT EXISTS screenshot_key TEXT;
ALTER TABLE public.verification_requests
  ADD COLUMN IF NOT EXISTS document_front_key TEXT,
  ADD COLUMN IF NOT EXISTS document_back_key TEXT,
  ADD COLUMN IF NOT EXISTS selfie_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS payment_proofs_transaction_id_unique ON public.payment_proofs (lower(transaction_id));
ALTER TABLE public.payment_proofs ADD CONSTRAINT payment_proofs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.interest_requests ADD CONSTRAINT interest_requests_distinct_users CHECK (sender_id <> receiver_id);
ALTER TABLE public.conversations ADD CONSTRAINT conversations_distinct_participants CHECK (participant_a_id <> participant_b_id);

CREATE INDEX IF NOT EXISTS matrimonial_profiles_approval_idx ON public.matrimonial_profiles (approval_status, created_at DESC);
CREATE INDEX IF NOT EXISTS interest_requests_sender_idx ON public.interest_requests (sender_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS interest_requests_receiver_idx ON public.interest_requests (receiver_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS conversations_participant_a_idx ON public.conversations (participant_a_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS conversations_participant_b_idx ON public.conversations (participant_b_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS messages_conversation_idx ON public.messages (conversation_id, created_at);
CREATE INDEX IF NOT EXISTS invoices_user_idx ON public.invoices (user_id, date DESC);
CREATE INDEX IF NOT EXISTS payment_proofs_user_idx ON public.payment_proofs (user_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS verification_requests_user_idx ON public.verification_requests (user_id, submitted_at DESC);

INSERT INTO public.subscription_plans (
  id, slug, name, description, monthly_price, yearly_price, features,
  max_interests_per_month, can_view_contact_directly, can_message_directly, is_featured
) VALUES (
  'plan-basic', 'BASIC', 'Essential Match', 'Essential matrimonial membership', 2000, 2000,
  ARRAY['30 connection credits'], 30, false, false, false
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description,
  monthly_price = EXCLUDED.monthly_price, yearly_price = EXCLUDED.yearly_price,
  features = EXCLUDED.features, max_interests_per_month = EXCLUDED.max_interests_per_month;
UPDATE public.subscription_plans SET monthly_price = 5000, yearly_price = 5000, max_interests_per_month = 100 WHERE slug = 'PREMIUM';
UPDATE public.subscription_plans SET monthly_price = 10000, yearly_price = 10000, max_interests_per_month = 300 WHERE slug = 'PREMIUM_PLUS';
