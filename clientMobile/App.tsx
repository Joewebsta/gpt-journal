import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Button, StyleSheet, View } from "react-native";
// import { createClient } from "@supabase/supabase-js";
// import { SUPABASE_URL } from "@env";
// import supabase from "./src/supabaseClient";
// import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

export default function App() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  async function startRecording() {
    try {
      if (permissionResponse && permissionResponse.status !== "granted") {
        console.log("Requesting permission...");
        await requestPermission();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording...");

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    console.log("Stopping recording...");

    await recording?.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    const recordingUri = recording?.getURI();

    if (recordingUri) {
      console.log("Recording URI: ", recordingUri);

      // await processRecording(recordingUri);
    }

    setRecording(null);
  }

  async function processRecording(recordingUri: string) {
    try {
      const audioBase64String = await FileSystem.readAsStringAsync(
        recordingUri,
        {
          encoding: FileSystem.EncodingType.Base64,
        }
      );

      await invokeSupabaseFunction(audioBase64String);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error invoking Supabase function: ", error.message);
        console.error((error as Error).stack);
      }
    }
  }

  async function invokeSupabaseFunction(audioBase64String: string) {
    try {
      const { data: responseData, error: responseError } =
        await supabase.functions.invoke("process-user-recording", {
          body: audioBase64String,
        });

      console.log("RESPONSE DATA:", responseData);
      console.log("RESPONSE ERROR:", responseError);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error invoking Supabase function: ", error.message);
        console.error((error as Error).stack);
      }
    }
  }

  return (
    <View style={styles.container}>
      <Button
        title={recording ? "Stop Recording" : "Start Recording"}
        onPress={recording ? stopRecording : startRecording}
      ></Button>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
