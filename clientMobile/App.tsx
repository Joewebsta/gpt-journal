import { Audio } from "expo-av";
import OpenAI from "openai";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
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
import { processUserSpeechText } from "./src/components/services/speechService";
import { COLORS, styles } from "./src/styles/appStyles";
import { ConversationPhase, SupabaseResponse } from "./src/types";
import { checkPermission, storeAndPlayAudio } from "./src/utils/audioUtils";
import { addUserAndAssistantMessages } from "./src/utils/messageUtils";
import { updateConversationPhase } from "./src/utils/phaseUtils";

import { AnimatePresence, MotiView, useAnimationState } from "moti";

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
    if (phase === "standby") {
      // standbyAnimationState.transitionTo("standby");
      // activeAnimationState.transitionTo("standby");
    } else if (phase === "recognizing") {
      // standbyAnimationState.transitionTo("recognizing");
      // activeAnimationState.transitionTo("recognizing");
      // standbyCircleRadius.value = withTiming(0, {
      //   duration: CIRCLE_CONSTANTS.STANDBY_SHRINK_DURATION_MS,
      // });
      // activeCircleRadius.value = withRepeat(
      //   withTiming(CIRCLE_CONSTANTS.ACTIVE_RADIUS + 10, {
      //     duration: CIRCLE_CONSTANTS.ACTIVE_PULSE_DURATION_MS,
      //   }),
      //   0,
      //   true
      // );
    } else if (phase === "processing") {
      // activeAnimationState.transitionTo("processing");
      // activeCircleFill.value = COLORS.LAVENDER;
    } else if (phase === "speaking") {
      // activeCircleFill.value = COLORS.SLATE;
    }

    // else if (phase === "standby" && messages.length > 1) {
    //   // standbyAnimationState.transitionTo("standby");
    //   // cancelAnimation(activeCircleRadius);
    //   // standbyCircleRadius.value = withTiming(CIRCLE_CONSTANTS.STANDBY_RADIUS);
    //   // activeCircleRadius.value = withTiming(CIRCLE_CONSTANTS.ACTIVE_RADIUS);
    // }
  }, [phase]);

  const startSpeaking = async () => {
    try {
      await checkPermission(permissionResponse, requestPermission);
      startRecognizing();
      updateConversationPhase(
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
      updateConversationPhase(
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

      addUserAndAssistantMessages(userMessage, assistantMessage, setMessages);
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

  // const [isLoading, setIsLoading] = useState(true);

  // const [visible, setVisible] = useState(true);

  // const FadeIn = () => (
  //   <MotiView
  //     delay={1000}
  //     from={{ opacity: 0, width: 250, height: 250 }}
  //     // animate={{ opacity: isLoading ? 1 : 0 }}
  //     animate={{ opacity: 1, width: 260, height: 260 }}
  //     transition={{
  //       type: "timing",
  //       duration: 1000,
  //       // repeat: 40,
  //     }}
  //     // exit={{ opacity: 0 }}
  //     style={{
  //       justifyContent: "center",
  //       borderRadius: 150,
  //       backgroundColor: "red",
  //     }}
  //   />
  // );

  // const standbyAnimationState = useAnimationState({
  //   standby: { height: 280, width: 280 },
  //   recognizing: { height: 0, width: 0 },
  // });

  // const activeAnimationState = useAnimationState({
  //   standby: { height: 300, width: 300, backgroundColor: COLORS.SLATE },
  //   recognizing: { height: 310, width: 310, backgroundColor: COLORS.SLATE },
  //   processing: { height: 310, width: 310, backgroundColor: COLORS.LAVENDER },
  // });

  const activeAnimationState1 = useAnimationState({
    from: { height: 300, width: 300 },
    to: { height: 310, width: 310 },
  });

  return (
    <View style={styles.container}>
      <View style={styles.circlesContainer}>
        <View
          style={{
            position: "relative",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* ACTIVE CIRCLE */}

          {phase === "standby" && (
            <View
              style={{
                position: "relative",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MotiView
                from={{
                  width: 300,
                  height: 300,
                }}
                animate={{}}
                transition={{}}
                style={{
                  justifyContent: "center",
                  borderRadius: 160,
                  backgroundColor: COLORS.SLATE,
                  width: 300,
                  height: 300,
                  position: "absolute",
                }}
              />
            </View>
          )}
          <AnimatePresence>
            {phase === "recognizing" && (
              <MotiView
                from={{
                  width: 300,
                  height: 300,
                }}
                animate={{
                  width: 310,
                  height: 310,
                }}
                transition={{
                  type: "timing",
                  duration: 500,
                  loop: true,
                }}
                exit={{
                  width: 300,
                  height: 300,
                }}
                style={{
                  justifyContent: "center",
                  borderRadius: 160,
                  backgroundColor: COLORS.SLATE,
                  width: 300,
                  height: 300,
                  position: "absolute",
                }}
              />
            )}
          </AnimatePresence>
          {phase === "processing" && (
            <MotiView
              from={{
                width: 300,
                height: 300,
                backgroundColor: COLORS.SLATE,
              }}
              animate={{
                width: 310,
                height: 310,
                backgroundColor: COLORS.LAVENDER,
              }}
              transition={{
                width: {
                  type: "timing",
                  duration: 500,
                  loop: true,
                },
                height: {
                  type: "timing",
                  duration: 500,
                  loop: true,
                },
              }}
              style={{
                justifyContent: "center",
                borderRadius: 160,
                backgroundColor: COLORS.SLATE,
                width: 300,
                height: 300,
              }}
            />
          )}
          {phase === "speaking" && (
            <MotiView
              from={{
                width: 300,
                height: 300,
              }}
              animate={{
                width: 310,
                height: 310,
              }}
              transition={{
                width: {
                  type: "timing",
                  duration: 500,
                  loop: true,
                },
                height: {
                  type: "timing",
                  duration: 500,
                  loop: true,
                },
              }}
              style={{
                justifyContent: "center",
                borderRadius: 160,
                backgroundColor: COLORS.LAVENDER,
                width: 300,
                height: 300,
              }}
            />
          )}
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <View>
          <Text style={styles.phaseText}>{phaseText}</Text>
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
