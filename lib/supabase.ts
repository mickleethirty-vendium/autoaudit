import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { mustGetEnv } from "./env";

// Browser-safe public client.
// Used for client-side auth flows and browser reads that should share the same
// cookie/session model as the rest of the app.
export const supabasePublic = createBrowserClient(
  mustGetEnv("NEXT_PUBLIC_SUPABASE_URL"),
  mustGetEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
);

// Server-side admin client.
// Uses the service role key and must never be exposed to the browser.
export const supabaseAdmin = createClient(
  mustGetEnv("NEXT_PUBLIC_SUPABASE_URL"),
  mustGetEnv("SUPABASE_SERVICE_ROLE_KEY"),
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Optional helper for server-side user-bound operations when you already have
// a bearer access token from the signed-in user.
export function createSupabaseUserClient(accessToken: string) {
  return createClient(
    mustGetEnv("NEXT_PUBLIC_SUPABASE_URL"),
    mustGetEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}