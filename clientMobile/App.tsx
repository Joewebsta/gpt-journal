import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import OpenAI from "openai";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import {
  cancelAnimation,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useVoiceRecognition } from "./hooks/useVoiceRecognition";
import AnimatedCircles from "./src/components/AnimatedCircles";
import ProcessingPhase from "./src/components/phases/ProcessingPhase";
import RecognizingPhase from "./src/components/phases/RecognizingPhase";
import SpeakingPhase from "./src/components/phases/SpeakingPhase";
import StandbyPhase from "./src/components/phases/StandbyPhase";
import {
  PERSONA,
  ACTIVE_CIRCLE_RADIUS,
  STANDBY_CIRCLE_RADIUS,
  ACTIVE_CIRCLE_PULSE_DURATION,
  STANDBY_CIRCLE_SHRINK_DURATION,
} from "./src/constants";
import { processUserSpeechText } from "./src/services/speechService";
import { COLORS, styles } from "./src/styles/appStyles";
import { ConversationPhase, supabaseResponse } from "./src/types";
import {
  checkPermission,
  playAudioFromPath,
  writeAudioToFile,
} from "./src/utils/audioUtils";
import { startRecognizingPhase } from "./src/utils/phaseUtils";

Audio.setAudioModeAsync({
  allowsRecordingIOS: true,
  playsInSilentModeIOS: true,
  staysActiveInBackground: false,
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
  const standbyCircleRadius = useSharedValue<number>(STANDBY_CIRCLE_RADIUS);
  const activeCircleRadius = useSharedValue<number>(ACTIVE_CIRCLE_RADIUS);
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
      standbyCircleRadius.value = withTiming(0, {
        duration: STANDBY_CIRCLE_SHRINK_DURATION,
      });

      activeCircleRadius.value = withRepeat(
        withTiming(ACTIVE_CIRCLE_RADIUS + 10, {
          duration: ACTIVE_CIRCLE_PULSE_DURATION,
        }),
        0,
        true
      );
    } else if (phase === "processing") {
      activeCircleFill.value = COLORS.LAVENDER;
    } else if (phase === "speaking") {
      activeCircleFill.value = COLORS.SLATE;
    } else if (phase === "standby" && messages.length > 1) {
      cancelAnimation(activeCircleRadius);
      standbyCircleRadius.value = withTiming(STANDBY_CIRCLE_RADIUS);
      activeCircleRadius.value = withTiming(ACTIVE_CIRCLE_RADIUS);
    }
  }, [phase]);

  const startSpeaking = async () => {
    try {
      await checkPermission(permissionResponse, requestPermission);
      startRecognizing();
      startRecognizingPhase(setPhase, setPhaseText);
    } catch (error) {
      console.error("Error in startSpeaking: ", error);
    }
  };

  const stopSpeaking = async () => {
    try {
      setPhase(ConversationPhase.Processing);
      setPhaseText("Thinking...");
      stopRecognizing();

      const speechText = recognizerState.results[0] || "";
      const path = `${FileSystem.documentDirectory}${Date.now()}.mp3`;

      const {
        userMessage,
        assistantMessage,
        encodedMp3Data,
      }: supabaseResponse = await processUserSpeechText(speechText, messages);

      setMessages((messages) => [...messages, userMessage, assistantMessage]);

      await writeAudioToFile(path, encodedMp3Data);
      await playAudioFromPath(path, setPhase, setPhaseText);
    } catch (error) {
      console.error("Error in stopSpeaking: ", error);
    }
  };

  const resetConversation = async () => {
    try {
      resetRecognizerState();
      destroyRecognizer();
      setMessages([{ role: "system", content: PERSONA }]);
    } catch (error) {
      console.error("Error in resetConversation: ", error);
    }
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
