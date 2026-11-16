-- 20261116120000_bureau_cnic_and_recharge.sql
-- Marriage Bureau Identity Verification (CNIC), Profile Approval, and Package Recharge Workflow

-- 1. Extend marriage_bureaus with CNIC, Profile Completion, and Credits
ALTER TABLE public.marriage_bureaus
  ADD COLUMN IF NOT EXISTS cnic_number TEXT,
  ADD COLUMN IF NOT EXISTS cnic_front_key TEXT,
  ADD COLUMN IF NOT EXISTS cnic_back_key TEXT,
  ADD COLUMN IF NOT EXISTS cnic_doc_key TEXT,
  ADD COLUMN IF NOT EXISTS cnic_verification_status TEXT NOT NULL DEFAULT 'NOT_SUBMITTED',
  ADD COLUMN IF NOT EXISTS cnic_rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS cnic_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER NOT NULL DEFAULT 40,
  ADD COLUMN IF NOT EXISTS profile_completion_status TEXT NOT NULL DEFAULT 'INCOMPLETE',
  ADD COLUMN IF NOT EXISTS profile_rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS credits_total INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credits_used INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credits_remaining INTEGER NOT NULL DEFAULT 0;

-- 2. Constraints for bureau verification and profile completion
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'marriage_bureaus_cnic_status_check'
  ) THEN
    ALTER TABLE public.marriage_bureaus
      ADD CONSTRAINT marriage_bureaus_cnic_status_check
      CHECK (cnic_verification_status IN ('NOT_SUBMITTED', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'marriage_bureaus_profile_status_check'
  ) THEN
    ALTER TABLE public.marriage_bureaus
      ADD CONSTRAINT marriage_bureaus_profile_status_check
      CHECK (profile_completion_status IN ('INCOMPLETE', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'));
  END IF;
END $$;

-- 3. Bureau Package Recharges Table
CREATE TABLE IF NOT EXISTS public.bureau_recharges (
  id TEXT PRIMARY KEY,
  bureau_id TEXT NOT NULL REFERENCES public.marriage_bureaus(id) ON DELETE CASCADE,
  plan_slug TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  duration_days INTEGER NOT NULL DEFAULT 30,
  credits_allocated INTEGER NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_account TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  receipt_key TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  rejection_reason TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bureau_recharges_status_check CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

CREATE INDEX IF NOT EXISTS bureau_recharges_bureau_status_idx ON public.bureau_recharges (bureau_id, status);
CREATE INDEX IF NOT EXISTS bureau_recharges_created_at_idx ON public.bureau_recharges (created_at DESC);

-- 4. Bureau Credit Transactions Table
CREATE TABLE IF NOT EXISTS public.bureau_credit_transactions (
  id TEXT PRIMARY KEY,
  bureau_id TEXT NOT NULL REFERENCES public.marriage_bureaus(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bureau_credits_type_check CHECK (type IN ('PURCHASE', 'USAGE', 'ADMIN_ADJUSTMENT', 'REFUND'))
);

CREATE INDEX IF NOT EXISTS bureau_credits_bureau_idx ON public.bureau_credit_transactions (bureau_id, created_at DESC);

-- 5. Enable Row Level Security
ALTER TABLE public.bureau_recharges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bureau_credit_transactions ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies: Recharges
DROP POLICY IF EXISTS "Admins full access on bureau_recharges" ON public.bureau_recharges;
CREATE POLICY "Admins full access on bureau_recharges"
  ON public.bureau_recharges
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

DROP POLICY IF EXISTS "Bureaus view own recharges" ON public.bureau_recharges;
CREATE POLICY "Bureaus view own recharges"
  ON public.bureau_recharges
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.marriage_bureaus
      WHERE marriage_bureaus.id = bureau_recharges.bureau_id
        AND marriage_bureaus.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Bureaus insert own recharges" ON public.bureau_recharges;
CREATE POLICY "Bureaus insert own recharges"
  ON public.bureau_recharges
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.marriage_bureaus
      WHERE marriage_bureaus.id = bureau_recharges.bureau_id
        AND marriage_bureaus.owner_user_id = auth.uid()
    )
  );

-- 7. RLS Policies: Credit Transactions
DROP POLICY IF EXISTS "Admins full access on bureau_credit_transactions" ON public.bureau_credit_transactions;
CREATE POLICY "Admins full access on bureau_credit_transactions"
  ON public.bureau_credit_transactions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

DROP POLICY IF EXISTS "Bureaus view own credit transactions" ON public.bureau_credit_transactions;
CREATE POLICY "Bureaus view own credit transactions"
  ON public.bureau_credit_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.marriage_bureaus
      WHERE marriage_bureaus.id = bureau_credit_transactions.bureau_id
        AND marriage_bureaus.owner_user_id = auth.uid()
    )
  );
