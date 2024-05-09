import { Audio } from "expo-av";
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
import ProcessingPhaseButton from "./src/components/phases/ProcessingPhaseButton";
import RecognizingPhaseButton from "./src/components/phases/RecognizingPhaseButton";
import SpeakingPhaseButton from "./src/components/phases/SpeakingPhaseButton";
import StandbyPhaseButton from "./src/components/phases/StandbyPhaseButton";
import { CIRCLE_CONSTANTS, THERAPIST_PERSONA } from "./src/constants";
import { processUserSpeechText } from "./src/services/speechService";
import { COLORS, styles } from "./src/styles/appStyles";
import { ConversationPhase, SupabaseResponse } from "./src/types";
import { checkPermission, storeAndPlayAudio } from "./src/utils/audioUtils";
import { updateMessages } from "./src/utils/messageUtils";
import { startPhase } from "./src/utils/phaseUtils";

Audio.setAudioModeAsync({
  allowsRecordingIOS: true,
  playsInSilentModeIOS: true,
  staysActiveInBackground: false,
});

export default function App() {
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  const [messages, setMessages] = useState<OpenAI.ChatCompletionMessageParam[]>(
    [{ role: "system", content: THERAPIST_PERSONA }]
  );

  const [phase, setPhase] = useState<ConversationPhase>(
    ConversationPhase.Standby
  );

  const [phaseText, setPhaseText] = useState("Press button and start speaking");
  const standbyCircleRadius = useSharedValue<number>(
    CIRCLE_CONSTANTS.STANDBY_RADIUS
  );
  const activeCircleRadius = useSharedValue<number>(
    CIRCLE_CONSTANTS.ACTIVE_RADIUS
  );
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
        duration: CIRCLE_CONSTANTS.STANDBY_SHRINK_DURATION_MS,
      });

      activeCircleRadius.value = withRepeat(
        withTiming(CIRCLE_CONSTANTS.ACTIVE_RADIUS + 10, {
          duration: CIRCLE_CONSTANTS.ACTIVE_PULSE_DURATION_MS,
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
      standbyCircleRadius.value = withTiming(CIRCLE_CONSTANTS.STANDBY_RADIUS);
      activeCircleRadius.value = withTiming(CIRCLE_CONSTANTS.ACTIVE_RADIUS);
    }
  }, [phase]);

  const startSpeaking = async () => {
    try {
      await checkPermission(permissionResponse, requestPermission);
      startRecognizing();
      startPhase(
        ConversationPhase.Recognizing,
        "Press button when finished speaking",
        setPhase,
        setPhaseText
      );
    } catch (error) {
      console.error("Error in startSpeaking: ", error);
    }
  };

  const stopSpeaking = async () => {
    try {
      stopRecognizing();
      startPhase(
        ConversationPhase.Processing,
        "Thinking...",
        setPhase,
        setPhaseText
      );

      const speechText = recognizerState.results[0] || "";
      const {
        userMessage,
        assistantMessage,
        encodedMp3Data,
      }: SupabaseResponse = await processUserSpeechText(speechText, messages);

      updateMessages(userMessage, assistantMessage, setMessages);
      await storeAndPlayAudio(encodedMp3Data, setPhase, setPhaseText);
    } catch (error) {
      console.error("Error in stopSpeaking: ", error);
    }
  };

  const resetConversation = async () => {
    try {
      resetRecognizerState();
      destroyRecognizer();
      setMessages([{ role: "system", content: THERAPIST_PERSONA }]);
    } catch (error) {
      console.error("Error in resetConversation: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.circlesContainer}>
        <AnimatedCircles
          activeCircleFill={activeCircleFill}
          activeCircleRadius={activeCircleRadius}
          standbyCircleRadius={standbyCircleRadius}
        />
      </View>
      <View style={styles.buttonContainer}>
        <View>
          <Text style={{ fontWeight: "500" }}>{phaseText}</Text>
        </View>

        {phase === "standby" && (
          <StandbyPhaseButton
            startSpeaking={startSpeaking}
            resetConversation={resetConversation}
            messages={messages}
            activeCircleFill={activeCircleFill}
          />
        )}

        {phase === "recognizing" && (
          <RecognizingPhaseButton
            stopSpeaking={stopSpeaking}
            activeCircleFill={activeCircleFill}
          />
        )}

        {phase === "processing" && (
          <ProcessingPhaseButton activeCircleFill={activeCircleFill} />
        )}

        {phase === "speaking" && (
          <SpeakingPhaseButton activeCircleFill={activeCircleFill} />
        )}
      </View>
    </View>
  );
}
