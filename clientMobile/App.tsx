// import { Audio } from "expo-av";
// import * as FileSystem from "expo-file-system";
// import { StatusBar } from "expo-status-bar";
// import { useState } from "react";
// import { Button, StyleSheet, View } from "react-native";
// import { createClient } from "@supabase/supabase-js";
// import { SUPABASE_URL } from "@env";
// import supabase from "./src/supabaseClient";
// import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
} from "react-native";

import Voice, {
  SpeechErrorEvent,
  SpeechResultsEvent,
} from "@react-native-voice/voice";

export default function App() {
  const [state, setState] = useState({
    error: "",
    results: [],
  });

  useEffect(() => {
    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      console.log("onSpeechError: ", e);
      setState((s) => ({ ...s, error: JSON.stringify(e.error) }));
    };

    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      if (e.value) {
        // console.log("onSpeechResults: ", e);
        setState((s) => ({ ...s, results: e.value! }));
      }
    };

    // Clean up function
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startRecognizing = async () => {
    setState({
      error: "",
      results: [],
    });

    try {
      await Voice.start("en-US");
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecognizing = async () => {
    try {
      console.log("Results: ", state.results);
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
  };

  const cancelRecognizing = async () => {
    try {
      await Voice.cancel();
    } catch (e) {
      console.error(e);
    }
  };

  const destroyRecognizer = async () => {
    try {
      await Voice.destroy();
    } catch (e) {
      console.error(e);
    }
    setState({
      error: "",
      results: [],
    });
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
      <Text style={styles.welcome}>Welcome to React Native Voice!</Text>
      <Text style={styles.instructions}>
        Press the button and start speaking.
      </Text>
      <Text style={styles.stat}>{`Error: ${state.error}`}</Text>
      <Text style={styles.stat}>Results</Text>
      {state.results.map((result, index) => {
        return (
          <Text key={`result-${index}`} style={styles.stat}>
            {result}
          </Text>
        );
      })}
      <TouchableHighlight onPress={startRecognizing}>
        <Text style={styles.action}>Start Recognizing</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={stopRecognizing}>
        <Text style={styles.action}>Stop Recognizing</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={cancelRecognizing}>
        <Text style={styles.action}>Cancel</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={destroyRecognizer}>
        <Text style={styles.action}>Destroy</Text>
      </TouchableHighlight>
    </View>
  );
}

// export default function App() {
//   const [recording, setRecording] = useState<Audio.Recording | null>(null);
//   const [permissionResponse, requestPermission] = Audio.usePermissions();

//   async function startRecording() {
//     try {
//       if (permissionResponse && permissionResponse.status !== "granted") {
//         console.log("Requesting permission...");
//         await requestPermission();
//       }

//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: true,
//         playsInSilentModeIOS: true,
//       });

//       console.log("Starting recording...");

//       const { recording } = await Audio.Recording.createAsync(
//         Audio.RecordingOptionsPresets.HIGH_QUALITY
//       );

//       setRecording(recording);
//     } catch (err) {
//       console.error("Failed to start recording", err);
//     }
//   }

//   async function stopRecording() {
//     console.log("Stopping recording...");

//     await recording?.stopAndUnloadAsync();
//     await Audio.setAudioModeAsync({
//       allowsRecordingIOS: false,
//     });

//     const recordingUri = recording?.getURI();

//     if (recordingUri) {
//       console.log("Recording URI: ", recordingUri);

//       // await processRecording(recordingUri);
//     }

//     setRecording(null);
//   }

//   async function processRecording(recordingUri: string) {
//     try {
//       const audioBase64String = await FileSystem.readAsStringAsync(
//         recordingUri,
//         {
//           encoding: FileSystem.EncodingType.Base64,
//         }
//       );

//       await invokeSupabaseFunction(audioBase64String);
//     } catch (error) {
//       if (error instanceof Error) {
//         console.error("Error invoking Supabase function: ", error.message);
//         console.error((error as Error).stack);
//       }
//     }
//   }

//   async function invokeSupabaseFunction(audioBase64String: string) {
//     try {
//       const { data: responseData, error: responseError } =
//         await supabase.functions.invoke("process-user-recording", {
//           body: audioBase64String,
//         });

//       console.log("RESPONSE DATA:", responseData);
//       console.log("RESPONSE ERROR:", responseError);
//     } catch (error) {
//       if (error instanceof Error) {
//         console.error("Error invoking Supabase function: ", error.message);
//         console.error((error as Error).stack);
//       }
//     }
//   }

//   return (
//     <View style={styles.container}>
//       <Button
//         title={recording ? "Stop Recording" : "Start Recording"}
//         onPress={recording ? stopRecording : startRecording}
//       ></Button>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });
