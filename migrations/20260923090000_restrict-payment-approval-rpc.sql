REVOKE ALL ON FUNCTION public.approve_payment_proof(TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.approve_payment_proof(TEXT, TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.approve_payment_proof(TEXT, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.approve_payment_proof(TEXT, TEXT) TO project_admin;
