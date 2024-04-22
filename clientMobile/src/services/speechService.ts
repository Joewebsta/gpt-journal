import supabase from "../clients/supabaseClient";
import OpenAI from "openai";

export const processUserSpeechText = async (
  speechText: string,
  messages: OpenAI.ChatCompletionMessageParam,
) => {
  try {
    const { data: responseData, error: responseError } = await supabase
      .functions.invoke("process-user-speech-text", {
        body: JSON.stringify({ speechText, messages }),
      });

    return responseData;
  } catch (error) {
    console.log(error);
  }
};
