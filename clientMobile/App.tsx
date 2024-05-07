import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import OpenAI from "openai";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import {
  cancelAnimation,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { PERSONA } from "./constants";
import { useVoiceRecognition } from "./hooks/useVoiceRecognition";
import AnimatedCircles from "./src/components/AnimatedCircles";
import ProcessingPhase from "./src/components/phases/ProcessingPhase";
import RecognizingPhase from "./src/components/phases/RecognizingPhase";
import SpeakingPhase from "./src/components/phases/SpeakingPhase";
import StandbyPhase from "./src/components/phases/StandbyPhase";
import { processUserSpeechText } from "./src/services/speechService";
import { COLORS, styles } from "./src/styles/appStyles";
import { ConversationPhase, supabaseResponse } from "./types";
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
  const [phase, setPhase] = useState<ConversationPhase>(
    ConversationPhase.Standby
  );

  const [phaseText, setPhaseText] = useState("Press button and start speaking");
  const standbyCircleRadius = useSharedValue<number>(110);
  const activeCircleRadius = useSharedValue<number>(120);
  const activeCircleFill = useSharedValue<string>(COLORS.SLATE);

  const {
    recognizerState,
    startRecognizing,
    stopRecognizing,
    destroyRecognizer,
    resetRecognizerState,
  } = useVoiceRecognition();

  useEffect(() => {
    if (phase === "recognizing") {
      // Standby circle decreases until hidden
      standbyCircleRadius.value = withTiming(0, { duration: 200 });
      // Outer circle grows/shrinks continuously
      activeCircleRadius.value = withDelay(
        200,
        withRepeat(withTiming(130, { duration: 1500 }), 0, true)
      );
    } else if (phase === "processing") {
      // Outer circle changes to lavender
      activeCircleFill.value = COLORS.LAVENDER;
    } else if (phase === "speaking") {
      // Outer circle changes to slate
      activeCircleFill.value = COLORS.SLATE;
    } else if (phase === "standby" && messages.length > 1) {
      // Outer circle animation canceled
      cancelAnimation(activeCircleRadius);
      // Standby circle resets to original size (110)
      standbyCircleRadius.value = withTiming(110);
      // Outer circle resets to original size (120)
      activeCircleRadius.value = withTiming(120);
    }
  }, [phase]);

  const startSpeaking = async () => {
    if (permissionResponse && permissionResponse.status !== "granted") {
      console.log("Requesting permission...");
      await requestPermission();
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    setPhase(ConversationPhase.Recognizing);
    setPhaseText("Press button when finished speaking");
    startRecognizing();
  };

  const stopSpeaking = async () => {
    setPhase(ConversationPhase.Processing);
    setPhaseText("Thinking...");
    stopRecognizing();

    const speechText = recognizerState.results[0] || "";
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
        console.error(error);
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
      <AnimatedCircles
        activeCircleFill={activeCircleFill}
        activeCircleRadius={activeCircleRadius}
        standbyCircleRadius={standbyCircleRadius}
      />

      <View>
        <Text>{phaseText}</Text>
      </View>

      {phase === "standby" && (
        <StandbyPhase
          startSpeaking={startSpeaking}
          resetConversation={resetConversation}
          messages={messages}
          activeCircleFill={activeCircleFill}
        />
      )}

      {phase === "recognizing" && (
        <RecognizingPhase
          stopSpeaking={stopSpeaking}
          activeCircleFill={activeCircleFill}
        />
      )}

      {phase === "processing" && (
        <ProcessingPhase activeCircleFill={activeCircleFill} />
      )}

      {phase === "speaking" && (
        <SpeakingPhase activeCircleFill={activeCircleFill} />
      )}
    </View>
  );
}
