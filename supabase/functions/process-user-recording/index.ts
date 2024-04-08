import { createClient } from "https://esm.sh/@supabase/supabase-js@2.41.1";
import * as base64 from "https://denopkg.com/chiefbiiko/base64/mod.ts";
import OpenAI from "https://deno.land/x/openai@v4.32.1/mod.ts";

const supabase = createClient(
  `${Deno.env.get("SUPA_BASE_URL")}`,
  `${Deno.env.get("SUPA_BASE_ANON_KEY")}`,
);

const openai = new OpenAI({ apiKey: `${Deno.env.get("OPENAI_API_KEY")}` });

Deno.serve(async (request) => {
  // try {
  //   const audioBase64String = await request.text();

  //   // Store the audio file in Supabase Storage
  //   const audioBytes: Uint8Array = base64.toUint8Array(audioBase64String);

  //   const timestamp = +new Date();
  //   const filename = `anon/recording-${timestamp}.mp3`;
  //   const { data: uploadData, error: uploadError } = await supabase.storage
  //     .from("recordings")
  //     .upload(`anon/recording-${timestamp}.mp3`, audioBytes, {
  //       contentType: "audio/mpeg",
  //     });

  //   console.log("UPLOAD DATA: ", uploadData);
  //   console.log("UPLOAD ERROR: ", uploadError);

  //   // Download the audio file from Supabase Storage
  //   const { data: downloadData, error: downloadError } = await supabase.storage
  //     .from("recordings")
  //     .download(filename);

  //   console.log("DOWNLOAD DATA: ", downloadData);

  //   // Transcribe the audio file using OpenAI's Speech-to-Text API
  //   if (downloadData) {
  //     const transcription = await openai.audio.transcriptions.create({
  //       file: downloadData,
  //       model: "whisper-1",
  //     });
  //   }

  //   // console.log(transcription.text);
  //   // console.log("OPENAI CLIENT: ", openai);
  // } catch (error) {
  //   console.log("ERROR: ", error);
  // }

  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    model: "gpt-3.5-turbo",
  });

  console.log(completion.choices[0]);

  return new Response(
    JSON.stringify({ message: `Placeholder audio file` }),
    { headers: { "Content-Type": "application/json" } },
  );
});
