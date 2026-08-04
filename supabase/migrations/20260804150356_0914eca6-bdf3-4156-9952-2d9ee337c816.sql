
GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role, postgres;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO anon, authenticated, service_role, postgres;
