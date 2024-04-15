import OpenAI from "openai";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";
import { useVoiceRecognition } from "./hooks/useVoiceRecognition";

// Why is "export" appended to the api key?
const openai = new OpenAI({
  apiKey: `${process.env.OPENAI_API_KEY!.slice(0, -6)}`,
});

export default function App() {
  const [messages, setMessages] = useState<OpenAI.ChatCompletionMessageParam[]>(
    [{ role: "system", content: "You are a helpful assistant." }]
  );

  const {
    recognizerState,
    startRecognizing,
    stopRecognizing,
    destroyRecognizerState,
    resetRecognizerState,
  } = useVoiceRecognition();

  const startSpeaking = () => {
    startRecognizing();
  };

  const stopSpeaking = async () => {
    stopRecognizing();

    try {
      const speechText = recognizerState.results[0];

      const userMessage: OpenAI.ChatCompletionMessageParam = {
        role: "user",
        content: speechText,
      };

      const completion = await openai.chat.completions.create({
        messages: [...messages, userMessage],
        model: "gpt-3.5-turbo",
      });

      const assistantMessage = completion.choices[0].message;

      setMessages((messages) => [...messages, userMessage, assistantMessage]);
    } catch (e) {
      console.error(e);
    }
  };

  const resetConversation = async () => {
    resetRecognizerState();
    destroyRecognizerState();
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
      <Text style={styles.stat}>{`Error: ${recognizerState.error}`}</Text>
      {recognizerState.results.map((result, index) => {
        return (
          <Text key={`result-${index}`} style={styles.stat}>
            {result}
          </Text>
        );
      })}
      <TouchableHighlight onPress={startSpeaking}>
        <Text style={styles.action}>Start Speaking</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={stopSpeaking}>
        <Text style={styles.action}>Stop Speaking</Text>
      </TouchableHighlight>
      <TouchableHighlight onPress={resetConversation}>
        <Text style={styles.action}>Reset</Text>
      </TouchableHighlight>
    </View>
  );
}
