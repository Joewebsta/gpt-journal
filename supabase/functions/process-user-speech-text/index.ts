// import { createClient } from "https://esm.sh/@supabase/supabase-js@2.41.1";
import OpenAI from "https://deno.land/x/openai@v4.32.1/mod.ts";

const openai = new OpenAI({ apiKey: `${Deno.env.get("OPENAI_API_KEY")}` });

Deno.serve(async (req) => {
  const { speechText, messages } = await req.json();

  // console.log("OPENAI API KEY: ", Deno.env.get("OPENAI_API_KEY"));
  // console.log("OPENAI API KEY: ", openai);

  try {
    const userMessage: OpenAI.ChatCompletionMessageParam = {
      role: "user",
      content: speechText,
    };

    const completion = await openai.chat.completions.create({
      messages: [...messages, userMessage],
      model: "gpt-3.5-turbo",
    });

    const assistantMessage = completion.choices[0].message;

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: assistantMessage.content!,
    });

    console.log("TTS RESPONSE: ", JSON.stringify(mp3));
    console.log("TTS TYPE: ", typeof mp3);

    return new Response(
      JSON.stringify({ userMessage, assistantMessage }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.log(error);
  }

  // console.log("SPEECH TEXT", speechText);
  // console.log("SUPA BASE URL:", Deno.env.get("SUPABASE_URL"));
  // console.log("SUPA BASE ANON KEY", Deno.env.get("SUPABASE_ANON_KEY"));

  return new Response(
    JSON.stringify(speechText),
    { headers: { "Content-Type": "application/json" } },
  );
});
