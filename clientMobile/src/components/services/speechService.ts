import supabase from "../../clients/supabaseClient";
import OpenAI from "openai";

export const processUserSpeechText = async (
  speechText: string,
  messages: OpenAI.ChatCompletionMessageParam[],
) => {
  try {
    const { data: responseData, error: responseError } = await supabase
      .functions.invoke("process-user-speech-text", {
        body: JSON.stringify({ speechText, messages }),
      });

    if (responseError) {
      throw new Error(
        `Failed to process user speech text: ${responseError.message}`,
      );
    }

    return responseData;
  } catch (error) {
    console.error(
      `An error occurred while processing the user's speech text: ${error}`,
    );
    throw error;
  }
};
