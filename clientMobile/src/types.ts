import OpenAI from "openai";

export type SupabaseResponse = {
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
