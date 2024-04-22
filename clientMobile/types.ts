import OpenAI from "openai";

export type supabaseResponse = {
  userMessage: OpenAI.ChatCompletionMessage;
  assistantMessage: OpenAI.ChatCompletionMessage;
  encodedMp3Data: string;
};
