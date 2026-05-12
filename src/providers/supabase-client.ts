import { createClient } from "@refinedev/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_API_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_API_KEY!;

export const supabaseClient: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_KEY,
  {
    db: {
      schema: "public",
    },
    auth: {
      persistSession: true,
    },
  }
);
