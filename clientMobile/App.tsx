import {
  IconLoader,
  IconMicrophone,
  IconPlayerStopFilled,
  IconRefresh,
} from "@tabler/icons-react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import OpenAI from "openai";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { PERSONA } from "./constants";
import { useVoiceRecognition } from "./hooks/useVoiceRecognition";
import { processUserSpeechText } from "./src/services/speechService";
import { styles } from "./src/styles/appStyles";
import { supabaseResponse } from "./types";
import { playAudioFromPath, writeAudioToFile } from "./utils/audioUtils";

export type ConversationPhase =
  | "standby"
  | "recognizing"
  | "processing"
  | "speaking";

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
    [{ role: "system", content: PERSONA }]
  );
  const [phase, setPhase] = useState<ConversationPhase>("standby");

  const {
    recognizerState,
    startRecognizing,
    stopRecognizing,
    destroyRecognizer,
    resetRecognizerState,
  } = useVoiceRecognition();

  const startSpeaking = async () => {
    if (permissionResponse && permissionResponse.status !== "granted") {
      console.log("Requesting permission...");
      await requestPermission();
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // Phase: Standby -> Recognizing
    setPhase("recognizing");
    startRecognizing();
  };

  const stopSpeaking = async () => {
    // Phase: Recognizing -> Thinking
    setPhase("processing");
    stopRecognizing();

    const speechText = recognizerState.results[0];
    const path = `${FileSystem.documentDirectory}${Date.now()}.mp3`;

    try {
      const {
        userMessage,
        assistantMessage,
        encodedMp3Data,
      }: supabaseResponse = await processUserSpeechText(speechText, messages);

      setMessages((messages) => [...messages, userMessage, assistantMessage]);

      await writeAudioToFile(path, encodedMp3Data);
      // Phase: Thinking -> Speaking
      await playAudioFromPath(path, setPhase);

      // Phase: Speaking -> Standby
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error invoking Supabase function: ", error.message);
        console.error((error as Error).stack);
      }
    }
  };

  const resetConversation = async () => {
    resetRecognizerState();
    destroyRecognizer();
    // Phase: Standby
    setMessages([{ role: "system", content: "You are a helpful assistant." }]);
  };

  return (
    <View style={styles.container}>
      {/* <Text>Results</Text>
        <Text>{`Error: ${recognizerState.error}`}</Text>
        <Text>{phase}</Text>
        {recognizerState.results.map((result, index) => {
          return <Text key={`result-${index}`}>{result}</Text>;
        })} */}

      <View>
        {phase === "standby" && <Text>Press button and start speaking</Text>}
        {phase === "recognizing" && (
          <Text>Press button when finished speaking</Text>
        )}
        {phase === "processing" && <Text>Thinking...</Text>}
        {phase === "speaking" && <Text>Press button to interrupt</Text>}
      </View>

      {phase === "standby" && (
        <View>
          <Pressable style={styles.button} onPress={startSpeaking}>
            <Text style={{ marginTop: 8 }}>
              <IconMicrophone color="black" />
            </Text>
          </Pressable>

          {recognizerState.results.length > 0 && (
            <Pressable
              style={[
                styles.button,
                { backgroundColor: "white", position: "absolute", left: 104 },
              ]}
              onPress={resetConversation}
            >
              <Text style={{ marginTop: 8 }}>
                <IconRefresh color="black" />
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {phase === "recognizing" && (
        <Pressable style={styles.button} onPress={stopSpeaking}>
          <Text style={{ marginTop: 8 }}>
            <IconPlayerStopFilled color="black" fill="black" />
          </Text>
        </Pressable>
      )}

      {phase === "processing" && (
        <Pressable style={styles.button} onPress={() => {}}>
          <Text style={{ marginTop: 8 }}>
            <IconLoader color="black" />
          </Text>
        </Pressable>
      )}

      {phase === "speaking" && (
        <Pressable style={styles.button} onPress={() => {}}>
          <Text style={{ marginTop: 8 }}>
            <IconPlayerStopFilled color="black" fill="black" />
          </Text>
        </Pressable>
      )}
    </View>
  );
}
