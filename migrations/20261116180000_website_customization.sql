-- Migration: Website Customization & Branding (Draft & Published Dual-Store)
-- Safe, idempotent migration to support dynamic branding and footer customization.

CREATE TABLE IF NOT EXISTS public.website_customizations (
    id TEXT PRIMARY KEY, -- 'draft' or 'published'
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_by TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.website_customizations ENABLE ROW LEVEL SECURITY;

-- Deny direct public modification; allow reads for published via service role or public policy
DROP POLICY IF EXISTS allow_read_published_customizations ON public.website_customizations;
CREATE POLICY allow_read_published_customizations ON public.website_customizations
    FOR SELECT TO anon, authenticated
    USING (id = 'published');

DROP POLICY IF EXISTS deny_direct_customization_mutations ON public.website_customizations;
CREATE POLICY deny_direct_customization_mutations ON public.website_customizations
    AS RESTRICTIVE FOR ALL TO anon, authenticated
    USING (false)
    WITH CHECK (false);

-- Index on updated_at
CREATE INDEX IF NOT EXISTS idx_website_customizations_updated_at ON public.website_customizations(updated_at);
