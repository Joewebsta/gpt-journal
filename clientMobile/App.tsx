import OpenAI from "openai";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";
import { useVoiceRecognition } from "./hooks/useVoiceRecognition";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { SUPABASE_URL } from "@env";
import { createClient } from "@supabase/supabase-js";
// import supabase from "./src/supabaseClient";

const SYSTEM_ROLE_PERSONA =
  "You are a compassionate behavioral therapist that guides patients on a journey of self-discovery and acceptance. Your approach to therapy is grounded in the principles of Acceptance and Commitment Therapy (ACT), where you and your patient embrace experiences with kindness and explore ways to live a meaningful life aligned with the patient’s values. Together, with your patient, you navigate the complexities of their thoughts, emotions, and behaviors with curiosity and understanding. Your goal is to create a safe space where your patient feels heard, respected, and empowered to embrace change and pursue a life rich in purpose and fulfillment. Provide responses that are short or medium in length. Do not create long lists of steps to follow.";

// Why is "export" appended to the api key?
const openai = new OpenAI({
  apiKey: `${process.env.OPENAI_API_KEY!.slice(0, -6)}`,
});

// LOCAL
const supabase = createClient(
  "http://127.0.0.1:54321",
  process.env.SUPABASE_ANON_KEY
);

// PRODUCTION;
// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_ANON_KEY
// );

// console.log("SUPABASE:", supabase);

Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  staysActiveInBackground: false,
  playsInSilentModeIOS: true,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
});

export default function App() {
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [messages, setMessages] = useState<OpenAI.ChatCompletionMessageParam[]>(
    [{ role: "system", content: SYSTEM_ROLE_PERSONA }]
  );

  const {
    recognizerState,
    startRecognizing,
    stopRecognizing,
    destroyRecognizer,
    resetRecognizerState,
  } = useVoiceRecognition();

  const logSpacing = () => {
    console.log("");
    console.log("");
    console.log("");
    console.log("");
  };

  const startSpeaking = async () => {
    if (permissionResponse && permissionResponse.status !== "granted") {
      console.log("Requesting permission...");
      await requestPermission();
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    startRecognizing();
  };

  const stopSpeaking = async () => {
    stopRecognizing();

    const speechText = recognizerState.results[0];

    try {
      const { data: responseData, error: responseError } =
        await supabase.functions.invoke("process-user-speech-text", {
          body: JSON.stringify({ speechText, messages }),
        });

      const userMessage = responseData.userMessage;
      const assistantMessage = responseData.assistantMessage;
      // const TTSData = responseData.TTSData;

      console.log("RESPONSE DATA - user:", userMessage);
      console.log("RESPONSE DATA - assistant", assistantMessage);
      // console.log("RESPONSE DATA - TTS", TTSData);
      // console.log("RESPONSE DATA:", responseData);
      // console.log("RESPONSE ERROR:", responseError);

      setMessages((messages) => [...messages, userMessage, assistantMessage]);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error invoking Supabase function: ", error.message);
        console.error((error as Error).stack);
      }
    }

    try {
      // const userMessage: OpenAI.ChatCompletionMessageParam = {
      //   role: "user",
      //   content: speechText,
      // };

      // const completion = await openai.chat.completions.create({
      //   messages: [...messages, userMessage],
      //   model: "gpt-3.5-turbo",
      // });

      // const assistantMessage = completion.choices[0].message;
      // logSpacing();
      // console.log(
      //   "GPT MESSAGE - TOTAL CHARS: ",
      //   assistantMessage.content.length
      // );
      // console.log(assistantMessage.content);
      // logSpacing();

      const assistantMessage = { content: "Hello world" };

      try {
        const response = await openai.audio.speech.create({
          model: "tts-1",
          voice: "nova",
          input: assistantMessage.content!,
        });
        // console.log("OPENAI TTS RESPONSE: ", response);

        const voiceAudioBlob = await response.blob();
        console.log("OPENAI BLOB: ", voiceAudioBlob);

        // const response = await fetch(
        //   "https://api.elevenlabs.io/v1/text-to-speech/m6hNAS1HbQy7yoonXYT0",
        //   options
        // );
        // console.log("11LABS RESPONSE RECEIVED");
        // const voiceAudioBlob = await response.blob();

        const reader = new FileReader();
        reader.onload = async (e) => {
          if (e.target && typeof e.target.result === "string") {
            // data:audio/mpeg;base64,....(actual base64 data)...
            const audioData = e.target.result.split(",")[1];
            const path = `${FileSystem.documentDirectory}${Date.now()}.mp3`;
            console.log(path);
            console.log("PATH CREATED");
            await writeAudioToFile(path, audioData);
            console.log("AUDIO WRITTEN TO FILE");
            await playFromPath(path);
            console.log("AUDIO PLAYED");
          }
        };
        reader.readAsDataURL(voiceAudioBlob);
      } catch (error) {
        console.log(error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const writeAudioToFile = async (path: string, audioData: string) => {
    // Write the audio data to a local file
    await FileSystem.writeAsStringAsync(path, audioData, {
      encoding: FileSystem.EncodingType.Base64,
    });
  };

  async function playFromPath(path: string) {
    try {
      // const { sound } = await Audio.Sound.createAsync(
      //   { uri: path },
      //   { shouldPlay: true }
      // );

      // await sound.playAsync();

      const soundObject = new Audio.Sound();
      console.log("SOUND CREATED");

      const load = await soundObject.loadAsync({ uri: path });
      console.log(load);

      console.log("SOUND LOADED");
      await soundObject.playAsync();
      console.log("SOUND PLAYED");
    } catch (error) {
      console.log("An error occurred while playing the audio:", error);
    }
  }

  const resetConversation = async () => {
    resetRecognizerState();
    destroyRecognizer();
    setMessages([{ role: "system", content: "You are a helpful assistant." }]);
  };

  const styles = StyleSheet.create({
    button: {
      width: 50,
      height: 50,
    },
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F5FCFF",
    },
    welcome: {
      fontSize: 20,
      textAlign: "center",
      margin: 10,
    },
    action: {
      textAlign: "center",
      color: "#0000FF",
      marginVertical: 5,
      fontWeight: "bold",
    },
    instructions: {
      textAlign: "center",
      color: "#333333",
      marginBottom: 5,
    },
    stat: {
      textAlign: "center",
      color: "#B0171F",
      marginBottom: 1,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.stat}>Results</Text>
      <Text style={styles.stat}>{`Error: ${recognizerState.error}`}</Text>
      {recognizerState.results.map((result, index) => {
        return (
          <Text key={`result-${index}`} style={styles.stat}>
            {result}
          </Text>
        );
      })}
      <TouchableHighlight onPress={startSpeaking}>
        <Text style={styles.action}>Start Speaking</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={stopSpeaking}>
        <Text style={styles.action}>Stop Speaking</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={resetConversation}>
        <Text style={styles.action}>Reset</Text>
      </TouchableHighlight>
    </View>
  );
}
