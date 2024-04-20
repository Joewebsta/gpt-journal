// import { createClient } from "https://esm.sh/@supabase/supabase-js@2.41.1";
import { encodeBase64 } from "https://deno.land/std@0.223.0/encoding/base64.ts";
import OpenAI from "https://deno.land/x/openai@v4.32.1/mod.ts";

const openai = new OpenAI({ apiKey: `${Deno.env.get("OPENAI_API_KEY")}` });

Deno.serve(async (req) => {
  const { speechText, messages } = await req.json();

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

    const mp3Response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: assistantMessage.content!,
    });

    const mp3ArrayBuffer = await mp3Response.arrayBuffer();
    const encodedMp3Data = encodeBase64(mp3ArrayBuffer);

    console.log("SENDING RESPONSE!");

    return new Response(
      JSON.stringify({ userMessage, assistantMessage, encodedMp3Data }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.log(error);
  }

  return new Response(
    JSON.stringify(speechText),
    { headers: { "Content-Type": "application/json" } },
  );
});
