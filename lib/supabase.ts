import { createClient } from "@supabase/supabase-js";
import { mustGetEnv } from "./env";

// Client-side / public read-only client.
// NOTE: For MVP we keep RLS OFF on the reports table (see supabase/schema.sql).
export const supabasePublic = createClient(
  mustGetEnv("NEXT_PUBLIC_SUPABASE_URL"),
  mustGetEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
);

// Server-side admin client used only in API routes.
// Uses the SERVICE ROLE key (never expose this to the browser).
export const supabaseAdmin = createClient(
  mustGetEnv("NEXT_PUBLIC_SUPABASE_URL"),
  mustGetEnv("SUPABASE_SERVICE_ROLE_KEY"),
);
