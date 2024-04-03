import {
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} from "@env";
import { createClient } from "@supabase/supabase-js";
// const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabase = createClient(
  // "https://alqybdjzheygzqmzzlpz.supabase.co",
  "http://192.168.4.143:54321",
  SUPABASE_ANON_KEY,
);

export default supabase;
