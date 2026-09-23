CREATE OR REPLACE FUNCTION public.approve_payment_proof(proof_id TEXT, admin_user_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  proof public.payment_proofs%ROWTYPE;
  member public.users%ROWTYPE;
  selected_plan public.subscription_plans%ROWTYPE;
  normalized_slug TEXT;
  connection_limit INTEGER;
  invoice_code TEXT;
BEGIN
  SELECT * INTO proof FROM public.payment_proofs WHERE id = proof_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Payment proof not found'; END IF;
  IF proof.status <> 'PENDING' THEN RAISE EXCEPTION 'Payment proof has already been reviewed'; END IF;

  normalized_slug := CASE upper(proof.plan_slug) WHEN 'VIP' THEN 'PREMIUM_PLUS' ELSE upper(proof.plan_slug) END;
  SELECT * INTO selected_plan FROM public.subscription_plans WHERE upper(slug) = normalized_slug;
  IF NOT FOUND OR selected_plan.monthly_price <= 0 THEN RAISE EXCEPTION 'Unknown or non-payable plan'; END IF;
  IF proof.currency <> 'PKR' OR proof.amount NOT IN (selected_plan.monthly_price, selected_plan.yearly_price) THEN
    RAISE EXCEPTION 'Payment amount does not match the selected plan';
  END IF;

  SELECT * INTO member FROM public.users WHERE id = proof.user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Payment user not found'; END IF;
  connection_limit := GREATEST(selected_plan.max_interests_per_month, member.used_connections);

  UPDATE public.payment_proofs SET
    status = 'VERIFIED', rejection_reason = NULL,
    reviewed_by = admin_user_id, reviewed_at = NOW()
  WHERE id = proof.id;

  UPDATE public.users SET
    subscription_tier = selected_plan.slug,
    total_connections = connection_limit,
    remaining_connections = connection_limit - used_connections
  WHERE id = member.id;

  UPDATE public.user_subscriptions SET status = 'EXPIRED', updated_at = NOW()
  WHERE user_id = member.id AND status = 'ACTIVE';
  INSERT INTO public.user_subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
  VALUES (
    member.id, selected_plan.id, 'ACTIVE', NOW(),
    CASE WHEN proof.amount = selected_plan.yearly_price THEN NOW() + INTERVAL '1 year' ELSE NOW() + INTERVAL '1 month' END
  );

  invoice_code := 'INV-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
  INSERT INTO public.invoices (user_id, invoice_number, amount, currency, status, payment_method, plan_name)
  VALUES (member.id, invoice_code, proof.amount, proof.currency, 'PAID', proof.payment_method, selected_plan.name);
  INSERT INTO public.notifications (user_id, title, description, type, link_url)
  VALUES (member.id, 'Payment approved', 'Your payment was verified and your membership is now active.', 'PAYMENT_APPROVED', '/dashboard/subscription');

  RETURN jsonb_build_object('proofId', proof.id, 'userId', member.id, 'planSlug', selected_plan.slug, 'invoiceNumber', invoice_code);
END;
$$;
