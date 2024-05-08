import OpenAI from "openai";

export type supabaseResponse = {
  userMessage: OpenAI.ChatCompletionMessage;
  assistantMessage: OpenAI.ChatCompletionMessage;
  encodedMp3Data: string;
};

export enum ConversationPhase {
  Standby = "standby",
  Recognizing = "recognizing",
  Processing = "processing",
  Speaking = "speaking",
}
