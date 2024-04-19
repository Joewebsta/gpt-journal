import { createClient } from "https://esm.sh/@supabase/supabase-js@2.41.1";
import * as base64 from "https://denopkg.com/chiefbiiko/base64/mod.ts";
import OpenAI from "https://deno.land/x/openai@v4.32.1/mod.ts";

const supabase = createClient(
  `${Deno.env.get("SUPA_BASE_URL")}`,
  `${Deno.env.get("SUPA_BASE_ANON_KEY")}`,
);

const openai = new OpenAI({ apiKey: `${Deno.env.get("OPENAI_API_KEY")}` });

Deno.serve(async (request) => {
  try {
    const speechText = await request.text();
    console.log("SPEECH TEXT: ", speechText);
  } catch (error) {
    console.log(error);
  }

  return new Response(
    JSON.stringify({ message: `Placeholder audio file` }),
    { headers: { "Content-Type": "application/json" } },
  );
});
