// import { createClient } from "https://esm.sh/@supabase/supabase-js@2.41.1";
import { encodeBase64 } from "https://deno.land/std@0.223.0/encoding/base64.ts";
import OpenAI from "https://deno.land/x/openai@v4.32.1/mod.ts";

const openai = new OpenAI({ apiKey: `${Deno.env.get("OPENAI_API_KEY")}` });

Deno.serve(async (req) => {
  try {
    // Parse JSON body from the request
    const { speechText, messages }: {
      speechText: string;
      messages: OpenAI.ChatCompletionMessageParam[];
    } = await req.json();

    // Construct the user message
    const userMessage: OpenAI.ChatCompletionMessageParam = {
      role: "user",
      content: speechText,
    };

    // Generate AI completion based on the conversation history
    const completion = await openai.chat.completions.create({
      messages: [...messages, userMessage],
      model: "gpt-3.5-turbo",
    });

    // Extract the assistant's message from the completion
    const assistantMessage = {
      role: "assistant",
      content: completion.choices[0].message.content,
    };

    // Generate speech from the assistant's message
    const mp3Response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: assistantMessage.content!,
    });

    // Encode the MP3 data to base64
    const mp3ArrayBuffer = await mp3Response.arrayBuffer();
    const encodedMp3Data = encodeBase64(mp3ArrayBuffer);

    console.log("SENDING RESPONSE!");

    return new Response(
      JSON.stringify({ userMessage, assistantMessage, encodedMp3Data }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error handling request:", error);

    return new Response(
      JSON.stringify({
        error: "An error occurred while processing your request.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
