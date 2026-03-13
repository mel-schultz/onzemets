// src/lib/supabase.ts
// Clientes Supabase para uso no browser (anon) e no servidor (service role).

import { createClient } from "@supabase/supabase-js";

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Cliente público (browser) — usa a anon key. */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** Cliente administrativo (server-only) — usa a service role key.
 *  NUNCA exponha este cliente no lado do cliente. */
export function createServerClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}
