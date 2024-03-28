import { Audio } from "expo-av";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Button, StyleSheet, View } from "react-native";
import supabase from "./src/supabaseClient";

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

    const uri = recording?.getURI();
    console.log("Recording stopped and stored at ", uri);
    console.log("RECORDING DATA: ", recording);

    // try {

    //   const { data, error } = await supabase.functions.invoke("hello", {
    //     body: JSON.stringify({
    //       name: "Joe",
    //     }),
    //   });

    //   console.log("DATA:", data);
    // } catch (error) {
    //   console.log("ERROR: ", error);
    // }

    // if (uri) {
    //   const { sound } = await Audio.Sound.createAsync({ uri });
    //   await sound.playAsync();
    // }

    setRecording(null);
  }

  async function playRecording() {}

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
