import OpenAI from "openai";

export const updateMessages = (
  userMessage: OpenAI.ChatCompletionMessage,
  assistantMessage: OpenAI.ChatCompletionMessage,
  setMessages: React.Dispatch<
    React.SetStateAction<OpenAI.Chat.Completions.ChatCompletionMessageParam[]>
  >,
) => {
  setMessages((messages) => [...messages, userMessage, assistantMessage]);
};
