import {
  IconMicrophone,
  IconPlayerStopFilled,
  IconRefresh,
} from "@tabler/icons-react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import OpenAI from "openai";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Circle, Svg } from "react-native-svg";
import { PERSONA } from "./constants";
import { useVoiceRecognition } from "./hooks/useVoiceRecognition";
import CustomButton from "./src/components/CustomButton";
import SpinningIconLoader from "./src/components/SpinningIconLoader";
import { processUserSpeechText } from "./src/services/speechService";
import { styles, COLORS } from "./src/styles/appStyles";
import { ConversationPhase, supabaseResponse } from "./types";
import { playAudioFromPath, writeAudioToFile } from "./utils/audioUtils";

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
      <View style={{ position: "relative" }}>
        {/* ACTIVE CIRCLE */}
        <Svg
          style={{
            height: 260,
            width: 260,
            position: "relative",
          }}
        >
          <AnimatedCircle
            cx="50%"
            cy="50%"
            fill={activeCircleFill.value}
            r={activeCircleRadius}
          />
        </Svg>
        {/* STANDBY CIRCLE */}
        <Svg
          style={{
            height: 260,
            width: 260,
            position: "absolute",
          }}
        >
          <AnimatedCircle
            cx="50%"
            cy="50%"
            fill={COLORS.SILVER}
            r={standbyCircleRadius}
          />
        </Svg>
      </View>

      <View>
        <Text>{phaseText}</Text>
      </View>

      {phase === "standby" && (
        <View>
          <CustomButton
            onPress={startSpeaking}
            buttonStyle={{
              backgroundColor: activeCircleFill.value,
            }}
          >
            <IconMicrophone color={COLORS.SILVER} size={30} />
          </CustomButton>

          {messages.length > 1 && (
            <CustomButton
              onPress={resetConversation}
              buttonStyle={{
                backgroundColor: COLORS.SILVER,
                position: "absolute",
                top: -74,
                left: 104,
              }}
            >
              <IconRefresh color={COLORS.SLATE} size={30} />
            </CustomButton>
          )}
        </View>
      )}

      {phase === "recognizing" && (
        <CustomButton
          onPress={stopSpeaking}
          buttonStyle={{ backgroundColor: activeCircleFill.value }}
        >
          <IconPlayerStopFilled
            color={COLORS.SILVER}
            fill={COLORS.SILVER}
            size={30}
          />
        </CustomButton>
      )}

      {phase === "processing" && (
        <CustomButton
          onPress={() => {}}
          buttonStyle={{ backgroundColor: activeCircleFill.value }}
        >
          <SpinningIconLoader />
        </CustomButton>
      )}

      {phase === "speaking" && (
        <CustomButton
          onPress={() => {}}
          buttonStyle={{ backgroundColor: activeCircleFill.value }}
        >
          <IconPlayerStopFilled
            color={COLORS.SILVER}
            fill={COLORS.SILVER}
            size={30}
          />
        </CustomButton>
      )}
    </View>
  );
}
