import OpenAI from "openai";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";
import { useVoiceRecognition } from "./hooks/useVoiceRecognition";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

// Why is "export" appended to the api key?
const openai = new OpenAI({
  apiKey: `${process.env.OPENAI_API_KEY!.slice(0, -6)}`,
});

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
    [{ role: "system", content: "You are a helpful assistant." }]
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

    try {
      const speechText = recognizerState.results[0];

      const userMessage: OpenAI.ChatCompletionMessageParam = {
        role: "user",
        content: speechText,
      };

      const completion = await openai.chat.completions.create({
        messages: [...messages, userMessage],
        model: "gpt-3.5-turbo",
      });

      const assistantMessage = completion.choices[0].message;
      logSpacing();
      console.log("STOP RECOGNIZING: GPT MESSAGE:");
      console.log(assistantMessage.content);
      logSpacing();

      // CGPT MUST SPEAK THE RESPONSE!

      const options = {
        method: "POST",
        headers: {
          "xi-api-key": "a607a3d238182db7e2db7ff4af6f9513",
          "Content-Type": "application/json",
        },
        body: `{"text":"${assistantMessage.content}","voice_settings":{"stability":0.5,"similarity_boost":0.5,"use_speaker_boost":true}}`,
      };

      try {
        const response = await fetch(
          "https://api.elevenlabs.io/v1/text-to-speech/m6hNAS1HbQy7yoonXYT0",
          options
        );
        const voiceAudioBlob = await response.blob();

        const reader = new FileReader();
        reader.onload = async (e) => {
          if (e.target && typeof e.target.result === "string") {
            // data:audio/mpeg;base64,....(actual base64 data)...
            const audioData = e.target.result.split(",")[1];

            // Write the audio data to a local file
            const path = await writeAudioToFile(audioData);

            await playFromPath(path);
            // destroyRecognizer();
          }
        };
        reader.readAsDataURL(voiceAudioBlob);
      } catch (error) {
        console.log(error);
      }

      setMessages((messages) => [...messages, userMessage, assistantMessage]);
    } catch (e) {
      console.error(e);
    }
  };

  const writeAudioToFile = async (audioData: string) => {
    const path = FileSystem.documentDirectory + "temp.mp3";
    await FileSystem.writeAsStringAsync(path, audioData, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return path;
  };

  async function playFromPath(path: string) {
    try {
      const soundObject = new Audio.Sound();
      await soundObject.loadAsync({ uri: path });
      await soundObject.playAsync();
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
