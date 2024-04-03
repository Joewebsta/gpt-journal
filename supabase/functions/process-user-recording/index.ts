import { createClient } from "https://esm.sh/@supabase/supabase-js@2.41.1";
import * as base64 from "https://denopkg.com/chiefbiiko/base64/mod.ts";
import OpenAI from "https://deno.land/x/openai@v4.32.1/mod.ts";

const supabase = createClient(
  `${Deno.env.get("SUPA_BASE_URL")}`,
  `${Deno.env.get("SUPA_BASE_ANON_KEY")}`,
);

// const openai = new OpenAI({ apiKey: '' });

Deno.serve(async (request) => {
  try {
    const audioBase64String = await request.text();

    // Store the audio file in Supabase Storage
    const audioBytes: Uint8Array = base64.toUint8Array(audioBase64String);

    const timestamp = +new Date();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("recordings")
      .upload(`anon/recording-${timestamp}.mp3`, audioBytes, {
        contentType: "audio/mpeg",
      });

    console.log("UPLOAD DATA: ", uploadData);
    console.log("UPLOAD ERROR: ", uploadError);

    // Transcribe the audio file using OpenAI's Speech-to-Text API
    // console.log("CLIENT: ", client);
  } catch (error) {
    console.log("ERROR: ", error);
  }

  return new Response(
    JSON.stringify({ message: `Placeholder audio file` }),
    { headers: { "Content-Type": "application/json" } },
  );
});
