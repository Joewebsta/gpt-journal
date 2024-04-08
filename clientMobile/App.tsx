import { Audio } from "expo-av";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Button, StyleSheet, View } from "react-native";
import * as FileSystem from "expo-file-system";
// import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@env";
import supabase from "./src/supabaseClient";
import RNFS from "react-native-fs";
import { initWhisper } from "whisper.rn";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    // const whisperContext = await initWhisper({
    //   // filePath: 'file://.../ggml-tiny.en.bin',
    // filePath: "./assets/models/ggml-tiny.en.bin",
    // });

    // console.log("Whisper context: ", whisperContext);

    if (recordingUri) {
      console.log("Recording URI: ", recordingUri);

      // const file = openai.files.createUploadable(recordingUri);

      // const transcription = await openai.audio.transcriptions.create({
      //   file,
      //   model: "whisper-1",
      // });

      const form = new FormData();
      const fileContent = await RNFS.readFile(recordingUri);
      console.log("FILE CONTENT: ", fileContent);

      // form.append("file", fileContent);
      // form.append("model", "whisper-1");
      // form.append("response_format", "text");

      // const response = fetch("https://api.openai.com/v1/audio/transcriptions", {
      //   method: "POST",
      //   headers: {
      //     Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      //   },
      //   body: form,
      // });

      // console.log("RESPONSE: ", response);

      //  curl https://api.openai.com/v1/audio/transcriptions \
      // -H "Authorization: Bearer $OPENAI_API_KEY" \
      // -H "Content-Type: multipart/form-data" \
      // -F file="@/path/to/file/audio.mp3" \
      // -F model="whisper-1"

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
