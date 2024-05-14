import { createClient } from "@supabase/supabase-js";

// LOCAL
// const supabase = createClient(
//   "http://127.0.0.1:54321",
//   process.env.SUPABASE_ANON_KEY || "",
// );

// PRODUCTION;
const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_ANON_KEY || "", // Provide a default value for SUPABASE_ANON_KEY
);

export default supabase;
