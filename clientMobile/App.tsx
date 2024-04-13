import { Audio } from "expo-av";
// import * as FileSystem from "expo-file-system";
// import { StatusBar } from "expo-status-bar";
// import { useState } from "react";
// import { Button, StyleSheet, View } from "react-native";
// import { createClient } from "@supabase/supabase-js";
// import { SUPABASE_URL } from "@env";
// import supabase from "./src/supabaseClient";
import OpenAI from "openai";

// Why is "export" appended to the api key?
const openai = new OpenAI({
  apiKey: `${process.env.OPENAI_API_KEY!.slice(0, -6)}`,
});

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
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  // CHANGE STATE NAME
  const [state, setState] = useState({
    error: "",
    results: [],
  });
  const [messages, setMessages] = useState<OpenAI.ChatCompletionMessageParam[]>(
    [{ role: "system", content: "You are a helpful assistant." }]
  );

  const logSpacing = () => {
    console.log("");
    console.log("");
    console.log("");
    console.log("");
  };

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
    logSpacing();
    console.log("MESSAGES STATE: ", messages);

    logSpacing();

    // if (permissionResponse && permissionResponse.status !== "granted") {
    //   console.log("Requesting permission...");
    //   await requestPermission();
    // }

    setState({
      error: "",
      results: [],
    });

    try {
      // console.log("MESSAGES: ", messages);
      await Voice.start("en-US");
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecognizing = async () => {
    try {
      const speechText = state.results[0];

      const userMessage: OpenAI.ChatCompletionMessageParam = {
        role: "user",
        content: speechText,
      };

      const completion = await openai.chat.completions.create({
        messages: [...messages, userMessage],
        model: "gpt-3.5-turbo",
      });

      const assistantMessage = completion.choices[0].message;

      // CGPT MUST SPEAK THE RESPONSE!
      logSpacing();
      console.log("STOP RECOGNIZING: GPT MESSAGE:");
      console.log(assistantMessage.content);
      logSpacing();

      await Voice.stop();
      setMessages((messages) => [...messages, userMessage, assistantMessage]);
    } catch (e) {
      console.error(e);
    }
  };

  const reset = async () => {
    try {
      await Voice.destroy();
    } catch (e) {
      console.error(e);
    }

    setState({ error: "", results: [] });
    setMessages([{ role: "system", content: "You are a helpful assistant." }]);
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
      <Text style={styles.stat}>Results</Text>
      <Text style={styles.stat}>{`Error: ${state.error}`}</Text>
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
      <TouchableHighlight onPress={reset}>
        <Text style={styles.action}>Reset</Text>
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
