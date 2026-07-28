// Supabase public configuration.
// URL and publishable (anon) key are PUBLIC values by design — they ship to
// every browser and are safe to hardcode as fallbacks. Row Level Security
// protects all data. Env vars take precedence when set (e.g., in Vercel).
//
// SECRET values (SUPABASE_SERVICE_ROLE_KEY / sb_secret_*) must NEVER be
// added here — they live only in server env vars.

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://radejtldjxmqeevzlipc.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_FZV-6RvClRXSPdPZ3VO3Pg_ZnjWYH46';
