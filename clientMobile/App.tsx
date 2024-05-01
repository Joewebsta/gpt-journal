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
import { Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { Circle, Svg } from "react-native-svg";
import { PERSONA } from "./constants";
import { useVoiceRecognition } from "./hooks/useVoiceRecognition";
import CustomButton from "./src/components/CustomButton";
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

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function App() {
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [messages, setMessages] = useState<OpenAI.ChatCompletionMessageParam[]>(
    [{ role: "system", content: PERSONA }]
  );
  const [phase, setPhase] = useState<ConversationPhase>("standby");
  const [phaseText, setPhaseText] = useState("Press button and start speaking");

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

    setPhase("recognizing");
    setPhaseText("Press button when finished speaking");
    startRecognizing();
  };

  const stopSpeaking = async () => {
    setPhase("processing");
    setPhaseText("Thinking...");
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
      await playAudioFromPath(path, setPhase, setPhaseText);
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

    setMessages([{ role: "system", content: PERSONA }]);
  };

  return (
    <View style={styles.container}>
      <View style={{ position: "relative" }}>
        <Svg
          style={{
            height: 250,
            width: 250,
            position: "relative",
          }}
        >
          <AnimatedCircle
            cx="50%"
            cy="50%"
            r={120}
            // animatedProps={animatedProps}
          />
        </Svg>
        <Svg
          style={{
            height: 250,
            width: 250,
            position: "absolute",
          }}
        >
          <AnimatedCircle
            cx="50%"
            cy="50%"
            r={110}
            fill="white"
            // animatedProps={animatedProps}
          />
        </Svg>
      </View>

      {/* <Text>Results</Text>
      <Text>{`Error: ${recognizerState.error}`}</Text>
      <Text>{phase}</Text>
      {recognizerState.results.map((result, index) => {
        return <Text key={`result-${index}`}>{result}</Text>;
      })} */}

      <View>
        <Text>{phaseText}</Text>
      </View>

      {phase === "standby" && (
        <View>
          <CustomButton onPress={startSpeaking}>
            <IconMicrophone color="#F8F8FA" />
          </CustomButton>

          {messages.length > 1 && (
            <CustomButton
              onPress={resetConversation}
              buttonStyle={{
                backgroundColor: "#F8F8FA",
                position: "absolute",
                top: -74,
                left: 104,
              }}
            >
              <IconRefresh color="#6F7291" />
            </CustomButton>
          )}
        </View>
      )}

      {phase === "recognizing" && (
        <CustomButton onPress={stopSpeaking}>
          <IconPlayerStopFilled color="#F8F8FA" fill="#F8F8FA" />
        </CustomButton>
      )}

      {phase === "processing" && (
        <CustomButton onPress={() => {}}>
          <IconLoader color="#F8F8FA" />
        </CustomButton>
      )}

      {phase === "speaking" && (
        <CustomButton onPress={() => {}}>
          <IconPlayerStopFilled color="#F8F8FA" fill="#F8F8FA" />
        </CustomButton>
      )}
    </View>
  );
}
