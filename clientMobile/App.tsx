import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import OpenAI from "openai";
import React, { useState } from "react";
import { Text, TouchableHighlight, View } from "react-native";
import { PERSONA } from "./constants";
import { useVoiceRecognition } from "./hooks/useVoiceRecognition";
import { processUserSpeechText } from "./src/services/speechService";
import { styles } from "./src/styles/appStyles";
import { supabaseResponse } from "./types";
import { playAudioFromPath, writeAudioToFile } from "./utils/audioUtils";

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

    startRecognizing();
  };

  const stopSpeaking = async () => {
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
      await playAudioFromPath(path);
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
    setMessages([{ role: "system", content: "You are a helpful assistant." }]);
  };

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
